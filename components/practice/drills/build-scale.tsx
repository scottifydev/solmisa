"use client";

import { useState } from "react";
import { StaffNoteDragger } from "../inputs/staff-note-dragger";

const SCALES: Record<
  string,
  { asc: (number | null)[]; desc: (number | null)[] | null }
> = {
  "Natural Minor": { asc: [0, 0, -1, 0, 0, -1, -1, 0], desc: null },
  "Harmonic Minor": { asc: [0, 0, -1, 0, 0, -1, 0, 0], desc: null },
  "Melodic Minor": {
    asc: [0, 0, -1, 0, 0, 0, 0, 0],
    desc: [0, 0, -1, 0, 0, -1, -1, 0],
  },
  Dorian: { asc: [0, 0, -1, 0, 0, 0, -1, 0], desc: null },
  Phrygian: { asc: [0, -1, -1, 0, 0, -1, -1, 0], desc: null },
  Lydian: { asc: [0, 0, 0, 1, 0, 0, 0, 0], desc: null },
  Mixolydian: { asc: [0, 0, 0, 0, 0, 0, -1, 0], desc: null },
  Locrian: { asc: [0, -1, -1, 0, -1, -1, -1, 0], desc: null },
  "Major Pentatonic": { asc: [0, 0, 0, null, 0, 0, null, 0], desc: null },
  "Minor Pentatonic": { asc: [0, null, -1, 0, 0, null, -1, 0], desc: null },
  Blues: { asc: [0, null, -1, 0, -1, null, -1, 0], desc: null },
  "Whole Tone": { asc: [0, 0, 0, 1, 1, 1, null, 0], desc: null },
};

const SCALE_NAMES = Object.keys(SCALES);

let lastScaleName: string | undefined;
function randomScale(filter?: string): {
  name: string;
  asc: (number | null)[];
  desc: (number | null)[] | null;
} {
  const pool =
    filter && filter !== "all" && SCALES[filter] ? [filter] : SCALE_NAMES;
  for (let i = 0; i < 3; i++) {
    const name = pool[Math.floor(Math.random() * pool.length)] ?? "Natural Minor";
    if (name !== lastScaleName || pool.length <= 1) {
      lastScaleName = name;
      return { name, ...SCALES[name]! };
    }
  }
  const name = pool[Math.floor(Math.random() * pool.length)] ?? "Natural Minor";
  lastScaleName = name;
  return { name, ...SCALES[name]! };
}

interface BuildScaleProps {
  onAnswer: (correct: boolean) => void;
  scaleType?: string;
}

export function BuildScale({ onAnswer, scaleType }: BuildScaleProps) {
  const [scale] = useState(() => randomScale(scaleType));
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
        C{" "}
        <span style={{ fontSize: 24, fontWeight: 500, color: "#a09bb3" }}>
          {scale.name}
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
        onComplete={handleComplete}
        disabled={answered}
      />
    </div>
  );
}
