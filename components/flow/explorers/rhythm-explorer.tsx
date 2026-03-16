"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as Tone from "tone";
import Link from "next/link";
import { brand } from "@/lib/tokens";
import { ensureAudio } from "@/lib/audio/solmisa-piano";

interface NoteValue {
  name: string;
  beats: number;
  label: string;
}

const NOTE_VALUES: NoteValue[] = [
  { name: "whole", beats: 4, label: "Whole (4)" },
  { name: "dotted-half", beats: 3, label: "Dotted Half (3)" },
  { name: "half", beats: 2, label: "Half (2)" },
  { name: "dotted-quarter", beats: 1.5, label: "Dotted Qtr (1.5)" },
  { name: "quarter", beats: 1, label: "Quarter (1)" },
  { name: "eighth", beats: 0.5, label: "Eighth (0.5)" },
  { name: "sixteenth", beats: 0.25, label: "16th (0.25)" },
];

const BPM = 100;
const BEAT_DURATION = 60 / BPM;
const MELODY_MIDI = 69; // A4 = 440 Hz

export function RhythmExplorer() {
  const [timeSig, setTimeSig] = useState<4 | 3>(4);
  const [bar, setBar] = useState<NoteValue[]>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  const clickRef = useRef<Tone.MembraneSynth | null>(null);
  const playingRef = useRef(false);

  const totalBeats = bar.reduce((sum, n) => sum + n.beats, 0);
  const barFull = totalBeats >= timeSig;

  const initClick = useCallback(async () => {
    if (clickRef.current) return;
    await Tone.start();
    clickRef.current = new Tone.MembraneSynth({
      volume: -14,
    }).toDestination();
  }, []);

  const addNote = useCallback(
    (note: NoteValue) => {
      if (totalBeats + note.beats > timeSig) return;
      setBar((prev) => [...prev, note]);
    },
    [totalBeats, timeSig],
  );

  const playBar = useCallback(async () => {
    if (bar.length === 0 || playingRef.current) return;
    setAudioLoading(true);
    const [s] = await Promise.all([ensureAudio(), initClick()]);
    setAudioLoading(false);
    playingRef.current = true;

    const now = Tone.now();
    let offset = 0;

    // Click track
    for (let beat = 0; beat < timeSig; beat++) {
      const t = now + beat * BEAT_DURATION;
      clickRef.current?.triggerAttackRelease(
        beat === 0 ? "C2" : "C3",
        "32n",
        t,
        beat === 0 ? 0.8 : 0.4,
      );
    }

    // Notes
    bar.forEach((note, idx) => {
      const t = now + offset * BEAT_DURATION;
      const dur = note.beats * BEAT_DURATION;
      s.triggerAttackRelease(MELODY_MIDI, dur * 0.8, t);

      setTimeout(() => setPlayingIndex(idx), offset * BEAT_DURATION * 1000);
      offset += note.beats;
    });

    setTimeout(
      () => {
        setPlayingIndex(null);
        playingRef.current = false;
      },
      timeSig * BEAT_DURATION * 1000 + 100,
    );
  }, [bar, timeSig, initClick]);

  const playNoteValue = useCallback(async (note: NoteValue) => {
    setAudioLoading(true);
    const s = await ensureAudio();
    setAudioLoading(false);
    const dur = note.beats * BEAT_DURATION;
    s.triggerAttackRelease(MELODY_MIDI, dur * 0.8);
  }, []);

  useEffect(() => {
    return () => {
      clickRef.current?.dispose();
    };
  }, []);

  return (
    <div
      className="min-h-screen px-4 py-6"
      style={{ backgroundColor: brand.night, color: brand.ivory }}
    >
      <Link
        href="/flow"
        className="mb-6 inline-block text-sm"
        style={{ color: brand.silver }}
      >
        Back to Flow
      </Link>

      <h1 className="mb-2 text-2xl font-bold" style={{ color: brand.ivory }}>
        Rhythm Explorer
      </h1>
      <p className="mb-4 text-sm" style={{ color: brand.silver }}>
        Tap a note value to hear its duration. Build a bar by adding notes, then
        play it back with a click track.
      </p>

      {audioLoading && (
        <span
          style={{
            fontSize: 11,
            color: "#a09bb3",
            fontFamily: "'IBM Plex Mono',monospace",
          }}
        >
          Loading piano...
        </span>
      )}

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => {
            setTimeSig(4);
            setBar([]);
          }}
          className="rounded-lg px-5 py-2.5 text-sm font-medium transition-all"
          style={{
            backgroundColor: timeSig === 4 ? brand.violet : brand.graphite,
            color: timeSig === 4 ? brand.night : brand.ivory,
          }}
        >
          4/4
        </button>
        <button
          onClick={() => {
            setTimeSig(3);
            setBar([]);
          }}
          className="rounded-lg px-5 py-2.5 text-sm font-medium transition-all"
          style={{
            backgroundColor: timeSig === 3 ? brand.violet : brand.graphite,
            color: timeSig === 3 ? brand.night : brand.ivory,
          }}
        >
          3/4
        </button>
      </div>

      <h2 className="mb-3 text-sm font-medium" style={{ color: brand.silver }}>
        Note Values
      </h2>
      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {NOTE_VALUES.map((note) => {
          const wouldOverflow = totalBeats + note.beats > timeSig;

          return (
            <button
              key={note.name}
              onClick={() => {
                playNoteValue(note);
                if (!wouldOverflow) addNote(note);
              }}
              className="rounded-lg p-3 text-sm font-medium transition-all"
              style={{
                backgroundColor: brand.slate,
                border: `1px solid ${brand.steel}`,
                color: wouldOverflow ? brand.ash : brand.ivory,
                opacity: wouldOverflow ? 0.5 : 1,
                minHeight: 44,
              }}
            >
              {note.label}
            </button>
          );
        })}
      </div>

      <h2 className="mb-3 text-sm font-medium" style={{ color: brand.silver }}>
        Bar ({totalBeats}/{timeSig} beats)
      </h2>
      <div
        className="mb-4 flex min-h-[56px] flex-wrap items-center gap-2 rounded-xl p-3"
        style={{
          backgroundColor: brand.slate,
          border: `1px solid ${brand.steel}`,
        }}
      >
        {bar.length === 0 ? (
          <span className="text-sm" style={{ color: brand.ash }}>
            Tap note values above to build a bar
          </span>
        ) : (
          bar.map((note, idx) => (
            <span
              key={idx}
              className="rounded-lg px-3 py-1.5 text-sm font-medium"
              style={{
                backgroundColor:
                  playingIndex === idx ? brand.violet : brand.graphite,
                color: playingIndex === idx ? brand.night : brand.ivory,
                boxShadow:
                  playingIndex === idx ? `0 0 16px ${brand.violet}60` : "none",
              }}
            >
              {note.label}
            </span>
          ))
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={playBar}
          disabled={bar.length === 0}
          className="rounded-lg px-6 py-3 text-sm font-medium transition-all"
          style={{
            backgroundColor: bar.length > 0 ? brand.violet : brand.graphite,
            color: bar.length > 0 ? brand.night : brand.ash,
          }}
        >
          Play Bar
        </button>
        <button
          onClick={() => setBar([])}
          className="rounded-lg px-6 py-3 text-sm font-medium transition-all"
          style={{ backgroundColor: brand.graphite, color: brand.ivory }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
