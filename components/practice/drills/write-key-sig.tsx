"use client";

import { useState } from "react";
import { KeySigPlacer, type KeySigData } from "../inputs/key-sig-placer";

const KEY_SIGS: KeySigData[] = [
  { sharps: 0, flats: 0, major: "C", minor: "A" },
  { sharps: 1, flats: 0, major: "G", minor: "E" },
  { sharps: 2, flats: 0, major: "D", minor: "B" },
  { sharps: 3, flats: 0, major: "A", minor: "F♯" },
  { sharps: 4, flats: 0, major: "E", minor: "C♯" },
  { sharps: 5, flats: 0, major: "B", minor: "G♯" },
  { sharps: 6, flats: 0, major: "F♯", minor: "D♯" },
  { sharps: 0, flats: 1, major: "F", minor: "D" },
  { sharps: 0, flats: 2, major: "B♭", minor: "G" },
  { sharps: 0, flats: 3, major: "E♭", minor: "C" },
  { sharps: 0, flats: 4, major: "A♭", minor: "F" },
  { sharps: 0, flats: 5, major: "D♭", minor: "B♭" },
  { sharps: 0, flats: 6, major: "G♭", minor: "E♭" },
];

function randomKeySig(): KeySigData {
  return KEY_SIGS[Math.floor(Math.random() * KEY_SIGS.length)]!;
}

interface WriteKeySigProps {
  mode?: "major" | "minor";
  onAnswer: (correct: boolean) => void;
}

export function WriteKeySig({ mode = "major", onAnswer }: WriteKeySigProps) {
  const [keySig] = useState(randomKeySig);
  const [answered, setAnswered] = useState(false);

  const keyName = mode === "major" ? keySig.major : keySig.minor;
  const modeLabel = mode === "major" ? "major" : "minor";

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
      {/* Key name stimulus */}
      <div
        style={{
          fontSize: 42,
          fontWeight: 800,
          fontFamily: "'Outfit',sans-serif",
          color: "#8b5cf6",
          textShadow: "0 0 24px rgba(139,92,246,0.3)",
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        {keyName}{" "}
        <span style={{ fontSize: 24, fontWeight: 500, color: "#a09bb3" }}>
          {modeLabel}
        </span>
      </div>

      <KeySigPlacer keySig={keySig} onComplete={handleComplete} />
    </div>
  );
}
