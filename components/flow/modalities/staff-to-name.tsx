"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";
import { KeySignatureDisplay } from "@/components/notation/key-signature-display";
import { IDontKnowButton } from "./i-dont-know-button";

interface StaffToNameProps {
  keySignature: string;
  options: { id: string; label: string }[];
  correctAnswer: string;
  onAnswer: (correct: boolean) => void;
}

export function StaffToName({
  keySignature,
  options,
  correctAnswer,
  onAnswer,
}: StaffToNameProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
      {/* Key signature display */}
      <div className="w-full max-w-[200px]">
        <KeySignatureDisplay keySignature={keySignature} />
      </div>

      {/* Option grid */}
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
