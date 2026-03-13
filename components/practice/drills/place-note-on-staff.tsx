"use client";

import { useState } from "react";
import {
  StaffInteractive,
  TREBLE_POSITIONS,
} from "../inputs/staff-interactive";

const NOTE_POOL = Object.values(TREBLE_POSITIONS);

function randomNote(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)] ?? "C4";
}

interface PlaceNoteOnStaffProps {
  onAnswer: (correct: boolean) => void;
}

export function PlaceNoteOnStaff({ onAnswer }: PlaceNoteOnStaffProps) {
  const [targetNote] = useState(() => randomNote(NOTE_POOL));

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
