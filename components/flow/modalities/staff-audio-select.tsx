"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { brand } from "@/lib/tokens";
import { NotationView } from "@/components/notation/notation-view";
import type { NotationData } from "@/lib/notation/types";
import type { AudioConfig } from "@/lib/audio/audio-config-types";
import { playAudioConfig } from "@/lib/audio/flow-audio-pipeline";
import { PlaybackEngine } from "@/lib/audio/playback";
import * as Tone from "tone";

interface StaffAudioSelectProps {
  notationData: NotationData;
  audioConfig: AudioConfig;
  options: { id: string; label: string }[];
  correctAnswer: string;
  prompt?: string;
  onAnswer: (correct: boolean) => void;
}

export function StaffAudioSelect({
  notationData,
  audioConfig,
  options,
  correctAnswer,
  prompt,
  onAnswer,
}: StaffAudioSelectProps) {
  const [playing, setPlaying] = useState(false);
  const [playbackDone, setPlaybackDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | undefined>(
    undefined,
  );
  const hasAutoPlayed = useRef(false);
  const engineRef = useRef<PlaybackEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const playStartRef = useRef<number>(0);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new PlaybackEngine();
    }
    return engineRef.current;
  }, []);

  // Compute note start times for highlighting sync
  const noteStartTimesMs = useRef<number[]>([]);
  useEffect(() => {
    if (audioConfig.notes && audioConfig.notes.length > 0) {
      noteStartTimesMs.current = audioConfig.notes.map((n) => n.start * 1000);
    } else {
      // Estimate from notation data if no explicit note events
      const tempo = audioConfig.tempo ?? 120;
      const msPerBeat = (60 / tempo) * 1000;
      const times: number[] = [];
      let beatOffset = 0;
      for (const measure of notationData.measures) {
        for (const note of measure.notes) {
          times.push(beatOffset * msPerBeat);
          beatOffset += durationToBeats(note.duration);
        }
      }
      noteStartTimesMs.current = times;
    }
  }, [audioConfig, notationData]);

  const stopHighlighting = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setActiveNoteIndex(undefined);
  }, []);

  const startHighlighting = useCallback(() => {
    playStartRef.current = performance.now();
    const times = noteStartTimesMs.current;
    if (times.length === 0) return;

    const animate = () => {
      const elapsed = performance.now() - playStartRef.current;
      let idx = -1;
      for (let i = times.length - 1; i >= 0; i--) {
        if (elapsed >= times[i]!) {
          idx = i;
          break;
        }
      }
      setActiveNoteIndex(idx >= 0 ? idx : undefined);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const handlePlay = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    setActiveNoteIndex(undefined);

    try {
      await Tone.start();
      startHighlighting();
      await playAudioConfig(getEngine(), audioConfig);
    } catch (err) {
      console.warn("Audio playback failed:", err);
    }

    stopHighlighting();
    setPlaying(false);
    setPlaybackDone(true);
  }, [playing, audioConfig, getEngine, startHighlighting, stopHighlighting]);

  // Auto-play on mount
  useEffect(() => {
    if (hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    const timer = setTimeout(() => handlePlay(), 400);
    return () => clearTimeout(timer);
  }, [handlePlay]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleSelect = (id: string) => {
    if (submitted) return;
    setSelected(id);
    setSubmitted(true);
    const correct = id === correctAnswer;
    setTimeout(() => onAnswer(correct), correct ? 800 : 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Notation with playback highlighting */}
      <div className="w-full max-w-[400px] self-center">
        <NotationView data={notationData} playbackPosition={activeNoteIndex} />
      </div>

      {/* Playback controls */}
      <div className="flex justify-center">
        <button
          onClick={handlePlay}
          disabled={playing}
          className="flex min-h-[48px] items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
          style={{
            backgroundColor: playing ? brand.violet + "30" : brand.graphite,
            border: `1.5px solid ${playing ? brand.violet : brand.steel}`,
            color: playing ? brand.violet : brand.ivory,
            cursor: playing ? "default" : "pointer",
          }}
        >
          {playing ? (
            <>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block h-3 w-0.5 animate-pulse rounded-full"
                  style={{
                    backgroundColor: brand.violet,
                    animationDelay: "0ms",
                  }}
                />
                <span
                  className="inline-block h-4 w-0.5 animate-pulse rounded-full"
                  style={{
                    backgroundColor: brand.violet,
                    animationDelay: "150ms",
                  }}
                />
                <span
                  className="inline-block h-2 w-0.5 animate-pulse rounded-full"
                  style={{
                    backgroundColor: brand.violet,
                    animationDelay: "300ms",
                  }}
                />
                <span
                  className="inline-block h-3.5 w-0.5 animate-pulse rounded-full"
                  style={{
                    backgroundColor: brand.violet,
                    animationDelay: "75ms",
                  }}
                />
              </span>
              Playing...
            </>
          ) : (
            <>
              <PlayIcon />
              {playbackDone ? "Replay" : "Play"}
            </>
          )}
        </button>
      </div>

      {/* Prompt */}
      {prompt && playbackDone && (
        <p
          className="text-center text-sm font-medium"
          style={{ color: brand.silver }}
        >
          {prompt}
        </p>
      )}

      {/* Options — visible after first playback */}
      {playbackDone && (
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => {
            const isSelected = selected === option.id;
            const isCorrect = submitted && option.id === correctAnswer;
            const isWrong = submitted && isSelected && !isCorrect;

            let bg: string = brand.graphite;
            let border: string = brand.steel;
            let textColor: string = brand.silver;

            if (isCorrect) {
              bg = brand.correct + "20";
              border = brand.correct;
              textColor = brand.correct;
            } else if (isWrong) {
              bg = brand.incorrect + "20";
              border = brand.incorrect;
              textColor = brand.incorrect;
            } else if (isSelected) {
              bg = brand.violet + "20";
              border = brand.violet;
              textColor = brand.violet;
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={submitted}
                className="rounded-xl px-4 py-3 text-sm font-semibold transition-all"
                style={{
                  backgroundColor: bg,
                  border: `1.5px solid ${border}`,
                  color: textColor,
                  cursor: submitted ? "default" : "pointer",
                  minHeight: 48,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

const BEAT_MAP: Record<string, number> = {
  w: 4,
  h: 2,
  q: 1,
  "8": 0.5,
  "16": 0.25,
  "32": 0.125,
};

function durationToBeats(duration: string): number {
  return BEAT_MAP[duration] ?? 1;
}
