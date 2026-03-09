"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";
import { NotationView } from "@/components/notation/notation-view";
import type { NotationData } from "@/lib/notation/types";

interface StaffIntervalDisplayProps {
  clef: "treble" | "bass";
  notes: [string, string]; // e.g. ["C4", "G4"]
  layout: "harmonic" | "melodic";
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

export function StaffIntervalDisplay({
  clef,
  notes,
  layout,
  options,
  correctAnswer,
  onAnswer,
}: StaffIntervalDisplayProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const parsed = notes.map(parseNote);

  const notationData: NotationData = {
    clef,
    key: "C",
    measures: [
      {
        notes:
          layout === "harmonic"
            ? [
                {
                  keys: [parsed[0]!.key, parsed[1]!.key],
                  duration: "w",
                  accidental: parsed[0]!.accidental,
                },
              ]
            : [
                {
                  keys: [parsed[0]!.key],
                  duration: "h",
                  accidental: parsed[0]!.accidental,
                },
                {
                  keys: [parsed[1]!.key],
                  duration: "h",
                  accidental: parsed[1]!.accidental,
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
