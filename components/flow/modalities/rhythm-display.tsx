"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";
import { NotationView } from "@/components/notation/notation-view";
import type { NotationData } from "@/lib/notation/types";

interface RhythmNote {
  value: string; // "w", "h", "q", "8", "16"
  dot?: boolean;
  rest?: boolean;
}

interface RhythmDisplayProps {
  timeSignature: string; // "4/4", "3/4", "6/8"
  notes: RhythmNote[];
  options: { id: string; label: string }[];
  correctAnswer: string;
  onAnswer: (correct: boolean) => void;
}

export function RhythmDisplay({
  timeSignature,
  notes,
  options,
  correctAnswer,
  onAnswer,
}: RhythmDisplayProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const notationData: NotationData = {
    clef: "treble",
    key: "C",
    time: timeSignature,
    measures: [
      {
        notes: notes.map((n) => ({
          keys: ["b/4"], // All notes on B4 for rhythm-only display
          duration: n.value,
          dotted: n.dot,
          rest: n.rest,
        })),
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
      <div className="w-full max-w-[400px]">
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
