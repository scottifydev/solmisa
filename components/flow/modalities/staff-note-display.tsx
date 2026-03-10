"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";
import { NotationView } from "@/components/notation/notation-view";
import type { NotationData } from "@/lib/notation/types";
import { IDontKnowButton } from "./i-dont-know-button";

interface StaffNoteDisplayProps {
  clef: "treble" | "bass";
  note: string; // e.g. "F#4"
  showAccidental?: boolean;
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

export function StaffNoteDisplay({
  clef,
  note,
  showAccidental = true,
  options,
  correctAnswer,
  onAnswer,
}: StaffNoteDisplayProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const parsed = parseNote(note);
  const notationData: NotationData = {
    clef,
    key: "C",
    measures: [
      {
        notes: [
          {
            keys: [parsed.key],
            duration: "w",
            accidental: showAccidental ? parsed.accidental : undefined,
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

  const handleDontKnow = () => {
    if (submitted) return;
    setSubmitted(true);
    setTimeout(() => onAnswer(false), 2500);
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
      <IDontKnowButton onDontKnow={handleDontKnow} visible={!submitted} />
    </div>
  );
}
