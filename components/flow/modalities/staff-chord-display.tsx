"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";
import { NotationView } from "@/components/notation/notation-view";
import type { NotationData } from "@/lib/notation/types";

interface StaffChordDisplayProps {
  clef: "treble" | "bass" | "grand";
  notes: string[]; // e.g. ["C4", "E4", "G4"]
  showFiguredBass?: string; // e.g. "6/3"
  options: { id: string; label: string }[];
  correctAnswer: string;
  onAnswer: (correct: boolean) => void;
}

function parseNote(note: string): {
  key: string;
  accidental?: string;
} {
  const match = note.match(/^([A-Ga-g])([#b]?)(\d+)$/);
  if (!match) return { key: "c/4" };
  const letter = match[1]!.toLowerCase();
  const acc = match[2] || undefined;
  const octave = match[3]!;
  return { key: `${letter}/${octave}`, accidental: acc || undefined };
}

export function StaffChordDisplay({
  clef,
  notes,
  showFiguredBass,
  options,
  correctAnswer,
  onAnswer,
}: StaffChordDisplayProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const parsed = notes.map(parseNote);
  const keys = parsed.map((p) => p.key);
  // Use first accidental found (chords typically share the key context)
  const accidental = parsed.find((p) => p.accidental)?.accidental;

  const notationData: NotationData = {
    clef: clef === "grand" ? "treble" : clef,
    key: "C",
    measures: [
      {
        notes: [
          {
            keys,
            duration: "w",
            accidental,
          },
        ],
      },
    ],
  };

  const handleSelect = (id: string) => {
    if (submitted) return;
    setSelected(id);
    setSubmitted(true);
    const correct = id === correctAnswer;
    setTimeout(() => onAnswer(correct), correct ? 800 : 1500);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-[300px]">
        <NotationView data={notationData} />
      </div>

      {showFiguredBass && (
        <p
          className="text-center text-lg font-mono"
          style={{ color: brand.silver }}
        >
          {showFiguredBass}
        </p>
      )}

      <div className="grid w-full grid-cols-2 gap-2">
        {options.map((option) => {
          const isSelected = selected === option.id;
          const isCorrect = submitted && option.id === correctAnswer;
          const isWrong = submitted && isSelected && !isCorrect;

          let bg: string = brand.graphite;
          let border: string = brand.steel;
          let textColor: string = brand.silver;

          if (isCorrect) {
            bg = brand.correct + "20";
            border = brand.correct;
            textColor = brand.correct;
          } else if (isWrong) {
            bg = brand.incorrect + "20";
            border = brand.incorrect;
            textColor = brand.incorrect;
          } else if (isSelected) {
            bg = brand.violet + "20";
            border = brand.violet;
            textColor = brand.violet;
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={submitted}
              className="rounded-xl px-4 py-3 text-sm font-semibold transition-all"
              style={{
                backgroundColor: bg,
                border: `1.5px solid ${border}`,
                color: textColor,
                cursor: submitted ? "default" : "pointer",
                minHeight: 48,
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
