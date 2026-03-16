"use client";

import { useState, useCallback } from "react";
import * as Tone from "tone";
import Link from "next/link";
import { brand } from "@/lib/tokens";
import { ensureAudio, playChord } from "@/lib/audio/solmisa-piano";

interface InversionDef {
  name: string;
  label: string;
  intervals: number[];
  noteLabels: string;
}

const INVERSIONS: InversionDef[] = [
  {
    name: "root",
    label: "Root Position",
    intervals: [0, 4, 7],
    noteLabels: "C  E  G",
  },
  {
    name: "first",
    label: "1st Inversion",
    intervals: [4, 7, 12],
    noteLabels: "E  G  C",
  },
  {
    name: "second",
    label: "2nd Inversion",
    intervals: [7, 12, 16],
    noteLabels: "G  C  E",
  },
];

const ROOT_MIDI = 60;

export function InversionExplorer() {
  const [activeInversion, setActiveInversion] = useState<string | null>(null);
  const [arpeggiated, setArpeggiated] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const playInversion = useCallback(
    async (inv: InversionDef) => {
      setAudioLoading(true);
      const s = await ensureAudio();
      setAudioLoading(false);
      setActiveInversion(inv.name);

      const midiNotes = inv.intervals.map((i) => ROOT_MIDI + i);

      if (arpeggiated) {
        const now = Tone.now();
        midiNotes.forEach((midiNote, idx) => {
          s.triggerAttackRelease(midiNote, "8n", now + idx * 0.15);
        });
      } else {
        playChord(midiNotes, "2n");
      }

      setTimeout(() => setActiveInversion(null), 800);
    },
    [arpeggiated],
  );

  const inversionColors = {
    root: "#34d399",
    first: "#60a5fa",
    second: "#a78bfa",
  } as const;

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
        Chord Inversion Explorer
      </h1>
      <p className="mb-4 text-sm" style={{ color: brand.silver }}>
        Same three notes (C major triad), different voicings. The lowest note
        changes the color and feel of the chord.
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

      <div className="flex flex-col gap-4">
        {INVERSIONS.map((inv) => {
          const isActive = activeInversion === inv.name;
          const color =
            inversionColors[inv.name as keyof typeof inversionColors];

          return (
            <button
              key={inv.name}
              onClick={() => playInversion(inv)}
              className="flex flex-col rounded-xl p-5 text-left transition-all"
              style={{
                backgroundColor: brand.slate,
                border: `2px solid ${isActive ? color : brand.steel}`,
                boxShadow: isActive ? `0 0 24px ${color}50` : "none",
                minHeight: 44,
              }}
            >
              <span className="text-lg font-bold" style={{ color }}>
                {inv.label}
              </span>
              <span
                className="mt-2 font-mono text-sm"
                style={{ color: brand.ivory }}
              >
                {inv.noteLabels}
              </span>
              <span className="mt-1 text-xs" style={{ color: brand.ash }}>
                {inv.name === "root"
                  ? "Root in the bass -- most stable, grounded sound"
                  : inv.name === "first"
                    ? "Third in the bass -- lighter, sweeter quality"
                    : "Fifth in the bass -- open, bright, less stable"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
