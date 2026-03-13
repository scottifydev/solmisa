"use client";

import { useState } from "react";
import { StaffNoteDragger, type KeyData } from "../inputs/staff-note-dragger";

const MODES: Record<string, { alts: number[] }> = {
  Lydian: { alts: [0, 0, 0, 1, 0, 0, 0] },
  Ionian: { alts: [0, 0, 0, 0, 0, 0, 0] },
  Mixolydian: { alts: [0, 0, 0, 0, 0, 0, -1] },
  Dorian: { alts: [0, 0, -1, 0, 0, 0, -1] },
  Aeolian: { alts: [0, 0, -1, 0, 0, -1, -1] },
  Phrygian: { alts: [0, -1, -1, 0, 0, -1, -1] },
  Locrian: { alts: [0, -1, -1, 0, -1, -1, -1] },
};

const MODE_NAMES = Object.keys(MODES);

const KEYS: KeyData[] = [
  { name: "C", positions: [-2, -1, 0, 1, 2, 3, 4], sharps: 0, flats: 0 },
  { name: "G", positions: [2, 3, 4, 5, 6, 7, 8], sharps: 1, flats: 0 },
  { name: "D", positions: [-1, 0, 1, 2, 3, 4, 5], sharps: 2, flats: 0 },
  { name: "F", positions: [1, 2, 3, 4, 5, 6, 7], sharps: 0, flats: 1 },
  { name: "B♭", positions: [4, 5, 6, 7, 8, 9, 10], sharps: 0, flats: 2 },
  { name: "E♭", positions: [0, 1, 2, 3, 4, 5, 6], sharps: 0, flats: 3 },
];

function randomMode(): { modeName: string; alts: number[]; keyData: KeyData } {
  const modeName =
    MODE_NAMES[Math.floor(Math.random() * MODE_NAMES.length)] ?? "Dorian";
  const alts = MODES[modeName]!.alts;
  const keyData = KEYS[Math.floor(Math.random() * KEYS.length)]!;
  return { modeName, alts, keyData };
}

interface BuildModeProps {
  onAnswer: (correct: boolean) => void;
}

export function BuildMode({ onAnswer }: BuildModeProps) {
  const [{ modeName, alts, keyData }] = useState(randomMode);
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
        {keyData.name}{" "}
        <span style={{ fontSize: 24, fontWeight: 500, color: "#a09bb3" }}>
          {modeName}
        </span>
      </div>

      <StaffNoteDragger
        correctAsc={alts}
        keyData={keyData}
        onComplete={handleComplete}
        disabled={answered}
      />
    </div>
  );
}
