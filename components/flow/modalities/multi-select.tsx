"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";

interface MultiSelectProps {
  prompt: string;
  options: { id: string; label: string }[];
  correctAnswers: string[];
  minSelections?: number;
  maxSelections?: number;
  onAnswer: (correct: boolean) => void;
}

export function MultiSelect({
  prompt,
  options,
  correctAnswers,
  minSelections = 1,
  maxSelections,
  onAnswer,
}: MultiSelectProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const max = maxSelections ?? correctAnswers.length;

  const handleToggle = (id: string) => {
    if (submitted) return;
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else if (next.size < max) {
      next.add(id);
    }
    setSelected(next);
  };

  const handleCheck = () => {
    if (selected.size < minSelections) return;
    setSubmitted(true);
    const correct =
      selected.size === correctAnswers.length &&
      correctAnswers.every((a) => selected.has(a));
    setTimeout(() => onAnswer(correct), correct ? 800 : 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-center text-sm font-medium"
        style={{ color: brand.ivory }}
      >
        {prompt}
      </p>

      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isChecked = selected.has(option.id);
          const isCorrectAnswer = correctAnswers.includes(option.id);
          const isCorrect = submitted && isChecked && isCorrectAnswer;
          const isWrong = submitted && isChecked && !isCorrectAnswer;
          const isMissed = submitted && !isChecked && isCorrectAnswer;

          let bg: string = brand.graphite;
          let border: string = brand.steel;
          let textColor: string = brand.silver;

          if (isCorrect || isMissed) {
            bg = brand.correct + "15";
            border = brand.correct;
            textColor = brand.correct;
          } else if (isWrong) {
            bg = brand.incorrect + "15";
            border = brand.incorrect;
            textColor = brand.incorrect;
          } else if (isChecked) {
            bg = brand.violet + "15";
            border = brand.violet;
            textColor = brand.violet;
          }

          return (
            <button
              key={option.id}
              onClick={() => handleToggle(option.id)}
              disabled={submitted}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all"
              style={{
                backgroundColor: bg,
                border: `1.5px solid ${border}`,
                color: textColor,
                cursor: submitted ? "default" : "pointer",
                minHeight: 48,
              }}
            >
              {/* Checkbox indicator */}
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs"
                style={{
                  borderColor: isChecked ? "currentColor" : brand.steel,
                  backgroundColor: isChecked ? "currentColor" : "transparent",
                }}
              >
                {isChecked && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={brand.night}
                    strokeWidth="3"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleCheck}
          disabled={selected.size < minSelections}
          className="mt-2 w-full rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-40"
          style={{
            backgroundColor: brand.violet,
            color: brand.night,
          }}
        >
          Check
        </button>
      )}
    </div>
  );
}
