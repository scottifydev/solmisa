"use client";

import { useState } from "react";
import {
  StaffInteractive,
  TREBLE_POSITIONS,
} from "../inputs/staff-interactive";

// positions -2..5 = C4..C5, -2..8 = C4..F5
const POOL_BEGINNER = [-2, -1, 0, 1, 2, 3, 4, 5].map(
  (p) => TREBLE_POSITIONS[p]!,
);
const POOL_ADVANCED = Object.values(TREBLE_POSITIONS);

let lastNote: string | undefined;
function randomNote(pool: string[]): string {
  for (let i = 0; i < 3; i++) {
    const note = pool[Math.floor(Math.random() * pool.length)] ?? "C4";
    if (note !== lastNote || pool.length <= 1) {
      lastNote = note;
      return note;
    }
  }
  const note = pool[Math.floor(Math.random() * pool.length)] ?? "C4";
  lastNote = note;
  return note;
}

interface PlaceNoteOnStaffProps {
  onAnswer: (correct: boolean) => void;
  range?: "beginner" | "advanced";
}

export function PlaceNoteOnStaff({
  onAnswer,
  range = "beginner",
}: PlaceNoteOnStaffProps) {
  const pool = range === "advanced" ? POOL_ADVANCED : POOL_BEGINNER;
  const [targetNote] = useState(() => randomNote(pool));

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
      {/* Note name stimulus */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          fontFamily: "'Outfit',sans-serif",
          color: "#8b5cf6",
          textShadow: "0 0 24px rgba(139,92,246,0.3)",
          lineHeight: 1,
        }}
      >
        {targetNote}
      </div>

      {/* Interactive staff */}
      <StaffInteractive correctNote={targetNote} onAnswer={onAnswer} />
    </div>
  );
}
