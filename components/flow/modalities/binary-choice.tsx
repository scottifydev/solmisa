"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";

interface BinaryChoiceProps {
  prompt: string;
  optionA: { id: string; label: string };
  optionB: { id: string; label: string };
  correctAnswer: string;
  onAnswer: (correct: boolean) => void;
}

export function BinaryChoice({
  prompt,
  optionA,
  optionB,
  correctAnswer,
  onAnswer,
}: BinaryChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (id: string) => {
    if (submitted) return;
    setSelected(id);
    setSubmitted(true);
    const correct = id === correctAnswer;
    setTimeout(() => onAnswer(correct), correct ? 800 : 1500);
  };

  const renderButton = (option: { id: string; label: string }) => {
    const isSelected = selected === option.id;
    const isCorrect = submitted && option.id === correctAnswer;
    const isWrong = submitted && isSelected && !isCorrect;

    let bg: string = brand.graphite;
    let border: string = brand.steel;
    let textColor: string = brand.ivory;

    if (isCorrect) {
      bg = brand.correct + "20";
      border = brand.correct;
      textColor = brand.correct;
    } else if (isWrong) {
      bg = brand.incorrect + "20";
      border = brand.incorrect;
      textColor = brand.incorrect;
    }

    return (
      <button
        key={option.id}
        onClick={() => handleSelect(option.id)}
        disabled={submitted}
        className="flex-1 rounded-2xl px-6 py-6 text-base font-semibold transition-all"
        style={{
          backgroundColor: bg,
          border: `2px solid ${border}`,
          color: textColor,
          cursor: submitted ? "default" : "pointer",
          minHeight: 80,
        }}
      >
        {option.label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <p
        className="text-center text-sm font-medium"
        style={{ color: brand.ivory }}
      >
        {prompt}
      </p>
      <div className="flex gap-3">
        {renderButton(optionA)}
        {renderButton(optionB)}
      </div>
    </div>
  );
}
