"use client";

import { useState } from "react";
import { StaffNoteDragger } from "../inputs/staff-note-dragger";

// Semitone values for each natural note
const DIATONIC_SEMI = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B

// Staff positions for 8 consecutive diatonic notes starting from each tonic
// Position 0 = E4 (bottom treble staff line), -2 = C4 (ledger line below)
const TONIC_POSITIONS: Record<string, number[]> = {
  C: [-2, -1, 0, 1, 2, 3, 4, 5],
  D: [-1, 0, 1, 2, 3, 4, 5, 6],
  E: [0, 1, 2, 3, 4, 5, 6, 7],
  F: [1, 2, 3, 4, 5, 6, 7, 8],
  G: [2, 3, 4, 5, 6, 7, 8, 9],
  A: [-4, -3, -2, -1, 0, 1, 2, 3],
  B: [-3, -2, -1, 0, 1, 2, 3, 4],
};

// Letter index in DIATONIC_SEMI for each tonic
const TONIC_LETTER_IDX: Record<string, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

const TONIC_NAMES = Object.keys(TONIC_POSITIONS);

// Scale types defined by semitone intervals from tonic
const SCALE_INTERVALS: Record<
  string,
  { asc: (number | null)[]; desc: (number | null)[] | null }
> = {
  "Natural Minor": { asc: [0, 2, 3, 5, 7, 8, 10, 12], desc: null },
  "Harmonic Minor": { asc: [0, 2, 3, 5, 7, 8, 11, 12], desc: null },
  "Melodic Minor": {
    asc: [0, 2, 3, 5, 7, 9, 11, 12],
    desc: [12, 10, 8, 7, 5, 3, 2, 0],
  },
  Dorian: { asc: [0, 2, 3, 5, 7, 9, 10, 12], desc: null },
  Phrygian: { asc: [0, 1, 3, 5, 7, 8, 10, 12], desc: null },
  Lydian: { asc: [0, 2, 4, 6, 7, 9, 11, 12], desc: null },
  Mixolydian: { asc: [0, 2, 4, 5, 7, 9, 10, 12], desc: null },
  Locrian: { asc: [0, 1, 3, 5, 6, 8, 10, 12], desc: null },
  "Major Pentatonic": {
    asc: [0, 2, 4, null, 7, 9, null, 12],
    desc: null,
  },
  "Minor Pentatonic": {
    asc: [0, null, 3, 5, 7, null, 10, 12],
    desc: null,
  },
  Blues: { asc: [0, null, 3, 5, 6, null, 10, 12], desc: null },
  "Whole Tone": { asc: [0, 2, 4, 6, 8, 10, null, 12], desc: null },
};

const SCALE_NAMES = Object.keys(SCALE_INTERVALS);

// Tonics that work for Whole Tone without needing double sharps/flats
const WHOLE_TONE_TONICS = ["C", "D", "F", "G"];

/**
 * Compute the accidental array for a given tonic and interval pattern.
 * Returns null if any accidental exceeds [-1, +1] range.
 */
function computeAccidentals(
  tonicLetterIdx: number,
  intervals: (number | null)[],
): (number | null)[] | null {
  const tonicSemi = DIATONIC_SEMI[tonicLetterIdx]!;
  const result: (number | null)[] = [];

  for (let deg = 0; deg < intervals.length; deg++) {
    const interval = intervals[deg];
    if (interval === null || interval === undefined) {
      result.push(null);
      continue;
    }
    const letterIdx = (tonicLetterIdx + deg) % 7;
    const naturalSemi = DIATONIC_SEMI[letterIdx]!;
    const targetSemi = (tonicSemi + interval) % 12;
    let acc = targetSemi - naturalSemi;
    if (acc > 6) acc -= 12;
    if (acc < -6) acc += 12;
    if (acc < -1 || acc > 1) return null; // needs double sharp/flat
    result.push(acc);
  }
  return result;
}

let lastScaleCombo: string | undefined;

function randomScaleAndTonic(scaleFilter?: string): {
  scaleName: string;
  tonic: string;
  asc: (number | null)[];
  desc: (number | null)[] | null;
  positions: number[];
} {
  const scalePool =
    scaleFilter && scaleFilter !== "all" && SCALE_INTERVALS[scaleFilter]
      ? [scaleFilter]
      : SCALE_NAMES;

  for (let attempt = 0; attempt < 20; attempt++) {
    const scaleName =
      scalePool[Math.floor(Math.random() * scalePool.length)] ??
      "Natural Minor";
    const scale = SCALE_INTERVALS[scaleName]!;

    const tonicPool =
      scaleName === "Whole Tone" ? WHOLE_TONE_TONICS : TONIC_NAMES;
    const tonic =
      tonicPool[Math.floor(Math.random() * tonicPool.length)] ?? "C";

    const combo = `${tonic}-${scaleName}`;
    if (combo === lastScaleCombo && scalePool.length > 1) continue;

    const letterIdx = TONIC_LETTER_IDX[tonic]!;
    const asc = computeAccidentals(letterIdx, scale.asc);
    if (!asc) continue;

    let desc: (number | null)[] | null = null;
    if (scale.desc) {
      desc = computeAccidentals(letterIdx, scale.desc);
      if (!desc) continue;
    }

    lastScaleCombo = combo;
    return {
      scaleName,
      tonic,
      asc,
      desc,
      positions: TONIC_POSITIONS[tonic]!,
    };
  }

  // Fallback to C
  lastScaleCombo = "C-Natural Minor";
  return {
    scaleName: "Natural Minor",
    tonic: "C",
    asc: [0, 0, -1, 0, 0, -1, -1, 0],
    desc: null,
    positions: TONIC_POSITIONS["C"]!,
  };
}

interface BuildScaleProps {
  onAnswer: (correct: boolean) => void;
  scaleType?: string;
}

export function BuildScale({ onAnswer, scaleType }: BuildScaleProps) {
  const [scale] = useState(() => randomScaleAndTonic(scaleType));
  const [answered, setAnswered] = useState(false);

  function handleComplete(correct: boolean) {
    if (answered) return;
    setAnswered(true);
    onAnswer(correct);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        width: "100%",
      }}
    >
      {/* Stimulus */}
      <div
        style={{
          fontSize: 38,
          fontWeight: 800,
          fontFamily: "'Outfit',sans-serif",
          color: "#8b5cf6",
          textShadow: "0 0 24px rgba(139,92,246,0.3)",
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        {scale.tonic}{" "}
        <span style={{ fontSize: 24, fontWeight: 500, color: "#a09bb3" }}>
          {scale.scaleName}
        </span>
      </div>

      {scale.desc && (
        <div
          style={{
            fontSize: 11,
            color: "#65607a",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          Ascending AND descending — they differ
        </div>
      )}

      <StaffNoteDragger
        correctAsc={scale.asc}
        correctDesc={scale.desc}
        startPositions={scale.positions}
        onComplete={handleComplete}
        disabled={answered}
      />
    </div>
  );
}
