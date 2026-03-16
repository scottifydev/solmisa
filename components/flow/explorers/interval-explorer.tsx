"use client";

import { useState, useCallback } from "react";
import * as Tone from "tone";
import Link from "next/link";
import { brand } from "@/lib/tokens";
import { ensureAudio, playChord } from "@/lib/audio/solmisa-piano";

interface IntervalDef {
  name: string;
  shortName: string;
  semitones: number;
  color: string;
}

const INTERVALS: IntervalDef[] = [
  { name: "Minor 2nd", shortName: "m2", semitones: 1, color: "#ef4444" },
  { name: "Major 2nd", shortName: "M2", semitones: 2, color: "#ff6b9d" },
  { name: "Minor 3rd", shortName: "m3", semitones: 3, color: "#c084fc" },
  { name: "Major 3rd", shortName: "M3", semitones: 4, color: "#a78bfa" },
  { name: "Perfect 4th", shortName: "P4", semitones: 5, color: "#60a5fa" },
  { name: "Tritone", shortName: "TT", semitones: 6, color: "#f59e0b" },
  { name: "Perfect 5th", shortName: "P5", semitones: 7, color: "#34d399" },
  { name: "Minor 6th", shortName: "m6", semitones: 8, color: "#fbbf24" },
  { name: "Major 6th", shortName: "M6", semitones: 9, color: "#38bdf8" },
  { name: "Minor 7th", shortName: "m7", semitones: 10, color: "#f97316" },
  { name: "Major 7th", shortName: "M7", semitones: 11, color: "#e74c6f" },
  { name: "Octave", shortName: "P8", semitones: 12, color: "#e2e2e2" },
];

const ROOT_MIDI = 60;

export function IntervalExplorer() {
  const [activeInterval, setActiveInterval] = useState<string | null>(null);
  const [harmonic, setHarmonic] = useState(false);
  const [descending, setDescending] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const playInterval = useCallback(
    async (interval: IntervalDef) => {
      setAudioLoading(true);
      const s = await ensureAudio();
      setAudioLoading(false);
      setActiveInterval(interval.shortName);

      const targetMidi = descending
        ? ROOT_MIDI - interval.semitones
        : ROOT_MIDI + interval.semitones;

      if (harmonic) {
        playChord([ROOT_MIDI, targetMidi], "2n");
      } else {
        const now = Tone.now();
        s.triggerAttackRelease(ROOT_MIDI, "8n", now);
        s.triggerAttackRelease(targetMidi, "8n", now + 0.3);
      }

      setTimeout(() => setActiveInterval(null), 700);
    },
    [harmonic, descending],
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
        Interval Explorer
      </h1>
      <p className="mb-4 text-sm" style={{ color: brand.silver }}>
        Tap an interval to hear it. Toggle between melodic and harmonic,
        ascending and descending.
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

      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => setHarmonic((v) => !v)}
          className="rounded-lg px-5 py-2.5 text-sm font-medium transition-all"
          style={{
            backgroundColor: harmonic ? brand.violet : brand.graphite,
            color: harmonic ? brand.night : brand.ivory,
          }}
        >
          {harmonic ? "Harmonic" : "Melodic"}
        </button>
        <button
          onClick={() => setDescending((v) => !v)}
          className="rounded-lg px-5 py-2.5 text-sm font-medium transition-all"
          style={{
            backgroundColor: descending ? brand.violet : brand.graphite,
            color: descending ? brand.night : brand.ivory,
          }}
        >
          {descending ? "Descending" : "Ascending"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {INTERVALS.map((interval) => {
          const isActive = activeInterval === interval.shortName;

          return (
            <button
              key={interval.shortName}
              onClick={() => playInterval(interval)}
              className="flex flex-col items-center rounded-xl p-3 transition-all"
              style={{
                backgroundColor: brand.slate,
                border: `2px solid ${isActive ? interval.color : brand.steel}`,
                boxShadow: isActive ? `0 0 24px ${interval.color}50` : "none",
                minHeight: 44,
              }}
            >
              <span
                className="text-lg font-bold"
                style={{ color: interval.color }}
              >
                {interval.shortName}
              </span>
              <span className="mt-1 text-xs" style={{ color: brand.ash }}>
                {interval.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
