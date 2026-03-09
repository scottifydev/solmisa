"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";

interface PartConfig {
  prompt: string;
  options: { id: string; label: string }[];
  correctAnswer: string;
}

interface TwoPartSelectProps {
  part1: PartConfig;
  part2: PartConfig;
  onAnswer: (correct: boolean) => void;
}

export function TwoPartSelect({ part1, part2, onAnswer }: TwoPartSelectProps) {
  const [part1Answer, setPart1Answer] = useState<string | null>(null);
  const [part2Answer, setPart2Answer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handlePart1Select = (id: string) => {
    if (part1Answer !== null) return;
    setPart1Answer(id);
  };

  const handlePart2Select = (id: string) => {
    if (submitted) return;
    setPart2Answer(id);
    setSubmitted(true);
    const correct =
      id === part2.correctAnswer && part1Answer === part1.correctAnswer;
    setTimeout(() => onAnswer(correct), correct ? 800 : 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Part 1 */}
      <div className="flex flex-col gap-2">
        <p
          className="text-center text-sm font-medium"
          style={{ color: brand.ivory }}
        >
          {part1.prompt}
        </p>

        {part1Answer === null ? (
          <div className="grid grid-cols-2 gap-2">
            {part1.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handlePart1Select(option.id)}
                className="rounded-xl px-4 py-3 text-sm font-semibold transition-all"
                style={{
                  backgroundColor: brand.graphite,
                  border: `1.5px solid ${brand.steel}`,
                  color: brand.silver,
                  cursor: "pointer",
                  minHeight: 48,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            <span
              className="rounded-full px-4 py-1.5 text-sm font-semibold"
              style={{
                backgroundColor: submitted
                  ? part1Answer === part1.correctAnswer
                    ? brand.correct + "20"
                    : brand.incorrect + "20"
                  : brand.violet + "20",
                color: submitted
                  ? part1Answer === part1.correctAnswer
                    ? brand.correct
                    : brand.incorrect
                  : brand.violet,
                border: `1.5px solid ${
                  submitted
                    ? part1Answer === part1.correctAnswer
                      ? brand.correct
                      : brand.incorrect
                    : brand.violet
                }`,
              }}
            >
              {part1.options.find((o) => o.id === part1Answer)?.label}
            </span>
          </div>
        )}
      </div>

      {/* Part 2 — revealed after Part 1 */}
      {part1Answer !== null && (
        <div className="flex flex-col gap-2">
          <p
            className="text-center text-sm font-medium"
            style={{ color: brand.ivory }}
          >
            {part2.prompt}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {part2.options.map((option) => {
              const isSelected = part2Answer === option.id;
              const isCorrect = submitted && option.id === part2.correctAnswer;
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
                  onClick={() => handlePart2Select(option.id)}
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
      )}
    </div>
  );
}
