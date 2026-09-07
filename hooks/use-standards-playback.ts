"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { ensureAudio } from "@/lib/audio/solmisa-piano";
import type { ParsedStandard, MidiNoteEvent } from "@/types/standards-lab";

const SALAMANDER_BASE_URL = "https://tonejs.github.io/audio/salamander/";
/** Give the sample download a bounded time to fail rather than hanging. */
const SAMPLE_LOAD_TIMEOUT_MS = 15_000;
const SAMPLE_URLS: Record<string, string> = {
  A0: "A0.mp3",
  C1: "C1.mp3",
  "D#1": "Ds1.mp3",
  "F#1": "Fs1.mp3",
  A1: "A1.mp3",
  C2: "C2.mp3",
  "D#2": "Ds2.mp3",
  "F#2": "Fs2.mp3",
  A2: "A2.mp3",
  C3: "C3.mp3",
  "D#3": "Ds3.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
  "D#5": "Ds5.mp3",
  "F#5": "Fs5.mp3",
  A5: "A5.mp3",
  C6: "C6.mp3",
  "D#6": "Ds6.mp3",
  "F#6": "Fs6.mp3",
  A6: "A6.mp3",
  C7: "C7.mp3",
  "D#7": "Ds7.mp3",
  "F#7": "Fs7.mp3",
  A7: "A7.mp3",
  C8: "C8.mp3",
};

interface PlaybackPosition {
  time: number;
  bar: number;
  melodyMidi: number | null;
  harmonyMidis: number[];
}

export function useStandardsPlayback(parsed: ParsedStandard | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  // True while the piano samples download, which takes seconds on first play.
  const [isLoading, setIsLoading] = useState(false);
  // Set when the samples could not be fetched, so the dock can say so.
  const [audioError, setAudioError] = useState<string | null>(null);
  const [position, setPosition] = useState<PlaybackPosition>({
    time: 0,
    bar: 1,
    melodyMidi: null,
    harmonyMidis: [],
  });
  const [tempoRatio, setTempoRatioState] = useState(1);
  const [melodyMuted, setMelodyMutedState] = useState(false);
  const [harmonyMuted, setHarmonyMutedState] = useState(false);

  const [continuousTime, setContinuousTime] = useState(0);
  const rafRef = useRef<number | null>(null);

  const melodySamplerRef = useRef<Tone.Sampler | null>(null);
  const harmonySamplerRef = useRef<Tone.Sampler | null>(null);
  const harmonyLoadedRef = useRef(false);
  const tempoRatioRef = useRef(1);
  const melodyMutedRef = useRef(false);
  const harmonyMutedRef = useRef(false);
  const baseBpmRef = useRef(120);

  // Smooth scrubber: update continuousTime via rAF while playing
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const tick = () => {
      setContinuousTime(Tone.getTransport().seconds);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  const initHarmonySampler = useCallback(async (): Promise<Tone.Sampler> => {
    if (harmonySamplerRef.current && harmonyLoadedRef.current) {
      return harmonySamplerRef.current;
    }

    return new Promise<Tone.Sampler>((resolve, reject) => {
      // Tone defaults onerror to a no-op, so without an explicit reject and a
      // timeout this promise could never settle: a failed sample download left
      // play() awaiting forever and the button stuck on "Loading piano".
      let settled = false;
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error("Piano samples timed out"));
      }, SAMPLE_LOAD_TIMEOUT_MS);

      const sampler = new Tone.Sampler({
        urls: SAMPLE_URLS,
        baseUrl: SALAMANDER_BASE_URL,
        release: 1.2,
        volume: -8,
        onload: () => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          harmonyLoadedRef.current = true;
          resolve(sampler);
        },
        onerror: (err) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          harmonySamplerRef.current = null;
          harmonyLoadedRef.current = false;
          reject(
            err instanceof Error ? err : new Error("Piano samples failed"),
          );
        },
      }).toDestination();

      harmonySamplerRef.current = sampler;
    });
  }, []);

  const scheduleNotes = useCallback(
    (
      notes: MidiNoteEvent[],
      sampler: Tone.Sampler,
      mutedRef: React.RefObject<boolean>,
    ) => {
      const transport = Tone.getTransport();

      for (const note of notes) {
        transport.schedule((time) => {
          if (!mutedRef.current) {
            sampler.triggerAttackRelease(
              note.name,
              note.duration,
              time,
              note.velocity,
            );
          }

          Tone.Draw.schedule(() => {
            setPosition((prev) => ({
              ...prev,
              time: note.time,
              bar: note.bar,
              melodyMidi: note.midi,
            }));
          }, time);
        }, note.time);
      }
    },
    [],
  );

  const play = useCallback(async () => {
    if (!parsed) return;

    const transport = Tone.getTransport();

    if (isPaused) {
      transport.start();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    setIsLoading(true);
    let melodySampler: Tone.Sampler;
    try {
      [melodySampler] = await Promise.all([
        ensureAudio(),
        initHarmonySampler(),
      ]);
    } catch {
      // Surface it. Failing silently here left the user clicking a dead Play
      // button with no indication that the samples never arrived.
      setIsLoading(false);
      setAudioError(
        "Piano samples could not be loaded. Check your connection and try again.",
      );
      return;
    }
    setIsLoading(false);
    setAudioError(null);
    melodySamplerRef.current = melodySampler;

    const firstTempo = parsed.tempoEvents[0];
    const baseBpm = firstTempo !== undefined ? firstTempo.bpm : 120;
    baseBpmRef.current = baseBpm;

    transport.cancel();
    // Set BPM to 60 * tempoRatio so that transport beats = real seconds.
    // note.time values from MIDI are in real seconds, so scheduling at
    // note.time beats with 60 BPM means 1 beat = 1 second = correct timing.
    // tempoRatio scales playback speed (0.5 = half speed, 2.0 = double).
    transport.bpm.value = 60 * tempoRatioRef.current;
    transport.position = 0;

    scheduleNotes(parsed.tracks.melody, melodySampler, melodyMutedRef);

    if (harmonySamplerRef.current) {
      scheduleNotes(
        parsed.tracks.harmony,
        harmonySamplerRef.current,
        harmonyMutedRef,
      );
    }

    transport.schedule(() => {
      transport.stop();
      transport.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setPosition({ time: 0, bar: 1, melodyMidi: null, harmonyMidis: [] });
    }, parsed.durationSeconds);

    transport.start();
    setIsPlaying(true);
    setIsPaused(false);
  }, [parsed, isPaused, initHarmonySampler, scheduleNotes]);

  const pause = useCallback(() => {
    Tone.getTransport().pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const stop = useCallback(() => {
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setPosition({ time: 0, bar: 1, melodyMidi: null, harmonyMidis: [] });
  }, []);

  const setTempoRatio = useCallback((ratio: number) => {
    const clamped = Math.max(0.5, Math.min(2, ratio));
    tempoRatioRef.current = clamped;
    setTempoRatioState(clamped);
    Tone.getTransport().bpm.value = 60 * clamped;
  }, []);

  const setMelodyMuted = useCallback((muted: boolean) => {
    melodyMutedRef.current = muted;
    setMelodyMutedState(muted);
  }, []);

  const setHarmonyMuted = useCallback((muted: boolean) => {
    harmonyMutedRef.current = muted;
    setHarmonyMutedState(muted);
  }, []);

  // Switching tunes must silence the previous one. Without this the old audio
  // keeps playing against the new score, and resuming replays the old tune.
  useEffect(() => {
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    transport.position = 0;
    setIsPlaying(false);
    setIsPaused(false);
    setContinuousTime(0);
    setPosition({ time: 0, bar: 1, melodyMidi: null, harmonyMidis: [] });
  }, [parsed]);

  useEffect(() => {
    return () => {
      const transport = Tone.getTransport();
      transport.stop();
      transport.cancel();
      if (harmonySamplerRef.current) {
        harmonySamplerRef.current.dispose();
        harmonySamplerRef.current = null;
        harmonyLoadedRef.current = false;
      }
    };
  }, []);

  return {
    play,
    pause,
    stop,
    isPlaying,
    isPaused,
    isLoading,
    audioError,
    position,
    tempoRatio,
    melodyMuted,
    harmonyMuted,
    setTempoRatio,
    setMelodyMuted,
    setHarmonyMuted,
    baseBpm: baseBpmRef.current,
    continuousTime,
  };
}
