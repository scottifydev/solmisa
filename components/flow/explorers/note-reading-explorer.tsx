"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { brand } from "@/lib/tokens";

type Clef = "treble" | "bass";

interface NoteDef {
  name: string;
  octave: number;
  midi: number;
  treblePosition: string;
  bassPosition: string;
}

const TREBLE_NOTES: NoteDef[] = [
  {
    name: "C",
    octave: 4,
    midi: 60,
    treblePosition: "Below staff, 1st ledger line",
    bassPosition: "Above staff, 1st ledger line",
  },
  {
    name: "D",
    octave: 4,
    midi: 62,
    treblePosition: "Just below first line",
    bassPosition: "Above staff, 1st ledger line space",
  },
  {
    name: "E",
    octave: 4,
    midi: 64,
    treblePosition: "First line",
    bassPosition: "Above staff, 2nd ledger line",
  },
  {
    name: "F",
    octave: 4,
    midi: 65,
    treblePosition: "First space",
    bassPosition: "Above staff, 2nd ledger line space",
  },
  {
    name: "G",
    octave: 4,
    midi: 67,
    treblePosition: "Second line",
    bassPosition: "Above staff, 3rd ledger line",
  },
  {
    name: "A",
    octave: 4,
    midi: 69,
    treblePosition: "Second space",
    bassPosition: "Above staff, 3rd ledger line space",
  },
  {
    name: "B",
    octave: 4,
    midi: 71,
    treblePosition: "Third line",
    bassPosition: "Above staff, 4th ledger line",
  },
  {
    name: "C",
    octave: 5,
    midi: 72,
    treblePosition: "Third space",
    bassPosition: "Far above staff",
  },
  {
    name: "D",
    octave: 5,
    midi: 74,
    treblePosition: "Fourth line",
    bassPosition: "Far above staff",
  },
  {
    name: "E",
    octave: 5,
    midi: 76,
    treblePosition: "Fourth space",
    bassPosition: "Far above staff",
  },
  {
    name: "F",
    octave: 5,
    midi: 77,
    treblePosition: "Fifth line",
    bassPosition: "Far above staff",
  },
  {
    name: "G",
    octave: 5,
    midi: 79,
    treblePosition: "Above fifth line",
    bassPosition: "Far above staff",
  },
];

const BASS_NOTES: NoteDef[] = [
  {
    name: "G",
    octave: 2,
    midi: 43,
    treblePosition: "Far below staff",
    bassPosition: "Below staff, 1st ledger line",
  },
  {
    name: "A",
    octave: 2,
    midi: 45,
    treblePosition: "Far below staff",
    bassPosition: "Below staff, 1st ledger line space",
  },
  {
    name: "B",
    octave: 2,
    midi: 47,
    treblePosition: "Far below staff",
    bassPosition: "First line",
  },
  {
    name: "C",
    octave: 3,
    midi: 48,
    treblePosition: "Far below staff",
    bassPosition: "First space",
  },
  {
    name: "D",
    octave: 3,
    midi: 50,
    treblePosition: "Far below staff",
    bassPosition: "Second line",
  },
  {
    name: "E",
    octave: 3,
    midi: 52,
    treblePosition: "Below staff, 3rd ledger line",
    bassPosition: "Second space",
  },
  {
    name: "F",
    octave: 3,
    midi: 53,
    treblePosition: "Below staff, 2nd ledger line space",
    bassPosition: "Third line",
  },
  {
    name: "G",
    octave: 3,
    midi: 55,
    treblePosition: "Below staff, 2nd ledger line",
    bassPosition: "Third space",
  },
  {
    name: "A",
    octave: 3,
    midi: 57,
    treblePosition: "Below staff, 1st ledger line space",
    bassPosition: "Fourth line",
  },
  {
    name: "B",
    octave: 3,
    midi: 59,
    treblePosition: "Below staff, 1st ledger line",
    bassPosition: "Fourth space",
  },
  {
    name: "C",
    octave: 4,
    midi: 60,
    treblePosition: "Below staff, 1st ledger line",
    bassPosition: "Above staff, 1st ledger line",
  },
  {
    name: "D",
    octave: 4,
    midi: 62,
    treblePosition: "Just below first line",
    bassPosition: "Above staff",
  },
];

function getRandomNote(clef: Clef): NoteDef {
  const pool = clef === "treble" ? TREBLE_NOTES : BASS_NOTES;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx]!;
}

export function NoteReadingExplorer() {
  const [clef, setClef] = useState<Clef>("treble");
  const [note, setNote] = useState<NoteDef>(() => getRandomNote("treble"));
  const [revealed, setRevealed] = useState(true);

  const randomize = useCallback(() => {
    setNote(getRandomNote(clef));
    setRevealed(false);
  }, [clef]);

  const switchClef = useCallback((newClef: Clef) => {
    setClef(newClef);
    setNote(getRandomNote(newClef));
    setRevealed(true);
  }, []);

  const position = clef === "treble" ? note.treblePosition : note.bassPosition;

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
        Note Reading Explorer
      </h1>
      <p className="mb-6 text-sm" style={{ color: brand.silver }}>
        Practice identifying notes on the staff. Toggle between treble and bass
        clef, then tap Random to test yourself.
      </p>

      <div className="mb-8 flex gap-3">
        <button
          onClick={() => switchClef("treble")}
          className="rounded-lg px-5 py-2.5 text-sm font-medium transition-all"
          style={{
            backgroundColor: clef === "treble" ? brand.violet : brand.graphite,
            color: clef === "treble" ? brand.night : brand.ivory,
          }}
        >
          Treble Clef
        </button>
        <button
          onClick={() => switchClef("bass")}
          className="rounded-lg px-5 py-2.5 text-sm font-medium transition-all"
          style={{
            backgroundColor: clef === "bass" ? brand.violet : brand.graphite,
            color: clef === "bass" ? brand.night : brand.ivory,
          }}
        >
          Bass Clef
        </button>
      </div>

      <div
        className="mb-6 flex flex-col items-center rounded-xl p-8"
        style={{
          backgroundColor: brand.slate,
          border: `1px solid ${brand.steel}`,
        }}
      >
        <span className="mb-1 text-sm" style={{ color: brand.ash }}>
          {clef === "treble" ? "Treble" : "Bass"} Clef
        </span>
        <span className="mb-3 text-sm" style={{ color: brand.silver }}>
          {position}
        </span>

        {revealed ? (
          <span className="text-6xl font-bold" style={{ color: brand.violet }}>
            {note.name}
            <span className="text-2xl" style={{ color: brand.silver }}>
              {note.octave}
            </span>
          </span>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="rounded-lg px-6 py-3 text-lg font-medium"
            style={{
              backgroundColor: brand.graphite,
              color: brand.ivory,
              border: `1px solid ${brand.steel}`,
            }}
          >
            Reveal Note
          </button>
        )}
      </div>

      <button
        onClick={randomize}
        className="w-full rounded-lg px-6 py-3 text-sm font-medium transition-all"
        style={{
          backgroundColor: brand.violet,
          color: brand.night,
          minHeight: 44,
        }}
      >
        Random Note
      </button>
    </div>
  );
}
