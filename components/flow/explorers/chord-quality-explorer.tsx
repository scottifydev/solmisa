"use client";

import { useState, useCallback } from "react";
import * as Tone from "tone";
import Link from "next/link";
import { brand } from "@/lib/tokens";
import { ensureAudio, playChord } from "@/lib/audio/solmisa-piano";

interface ChordDef {
  name: string;
  formula: string;
  intervals: number[];
  color: string;
}

const CHORDS: ChordDef[] = [
  { name: "Major", formula: "1  3  5", intervals: [0, 4, 7], color: "#34d399" },
  {
    name: "Minor",
    formula: "1  b3  5",
    intervals: [0, 3, 7],
    color: "#a78bfa",
  },
  {
    name: "Diminished",
    formula: "1  b3  b5",
    intervals: [0, 3, 6],
    color: "#ef4444",
  },
  {
    name: "Augmented",
    formula: "1  3  #5",
    intervals: [0, 4, 8],
    color: "#f59e0b",
  },
  {
    name: "Dom7",
    formula: "1  3  5  b7",
    intervals: [0, 4, 7, 10],
    color: "#60a5fa",
  },
  {
    name: "Maj7",
    formula: "1  3  5  7",
    intervals: [0, 4, 7, 11],
    color: "#ff6b9d",
  },
];

const ROOT_MIDI = 60;

export function ChordQualityExplorer() {
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [arpeggiated, setArpeggiated] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const playChordHandler = useCallback(
    async (chord: ChordDef) => {
      setAudioLoading(true);
      const s = await ensureAudio();
      setAudioLoading(false);
      setActiveChord(chord.name);

      const midiNotes = chord.intervals.map((i) => ROOT_MIDI + i);

      if (arpeggiated) {
        const now = Tone.now();
        midiNotes.forEach((midiNote, idx) => {
          s.triggerAttackRelease(midiNote, "8n", now + idx * 0.15);
        });
      } else {
        playChord(midiNotes, "2n");
      }

      setTimeout(() => setActiveChord(null), 800);
    },
    [arpeggiated],
  );

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
        Chord Quality Explorer
      </h1>
      <p className="mb-4 text-sm" style={{ color: brand.silver }}>
        Tap a chord to hear its quality. Toggle between blocked and arpeggiated
        voicings.
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

      <button
        onClick={() => setArpeggiated((v) => !v)}
        className="mb-8 rounded-lg px-5 py-2.5 text-sm font-medium transition-all"
        style={{
          backgroundColor: arpeggiated ? brand.violet : brand.graphite,
          color: arpeggiated ? brand.night : brand.ivory,
        }}
      >
        {arpeggiated ? "Arpeggiated" : "Blocked"}
      </button>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CHORDS.map((chord) => {
          const isActive = activeChord === chord.name;

          return (
            <button
              key={chord.name}
              onClick={() => playChordHandler(chord)}
              className="flex flex-col items-center rounded-xl p-4 transition-all"
              style={{
                backgroundColor: brand.slate,
                border: `2px solid ${isActive ? chord.color : brand.steel}`,
                boxShadow: isActive ? `0 0 24px ${chord.color}50` : "none",
                minHeight: 44,
              }}
            >
              <span
                className="text-lg font-bold"
                style={{ color: chord.color }}
              >
                {chord.name}
              </span>
              <span
                className="mt-2 font-mono text-xs"
                style={{ color: brand.ash }}
              >
                {chord.formula}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
