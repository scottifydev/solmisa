"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";

interface PartialFillProps {
  sequence: (string | null)[];
  options: string[];
  onAnswer: (correct: boolean) => void;
}

export function PartialFill({ sequence, options, onAnswer }: PartialFillProps) {
  const [filled, setFilled] = useState<(string | null)[]>(sequence);
  const [usedOptions, setUsedOptions] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<(boolean | null)[] | null>(null);

  // Find the next blank index
  const nextBlank = filled.findIndex(
    (val, i) => val === null && sequence[i] === null,
  );

  const handleOptionTap = (option: string) => {
    if (submitted || nextBlank === -1) return;

    setFilled((prev) => {
      const next = [...prev];
      next[nextBlank] = option;
      return next;
    });
    setUsedOptions((prev) => new Set(prev).add(option));
  };

  const handleSlotTap = (index: number) => {
    if (submitted) return;
    // Only allow clearing user-filled slots (original nulls)
    if (sequence[index] !== null) return;
    const value = filled[index];
    if (!value) return;

    setFilled((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setUsedOptions((prev) => {
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  };

  const handleCheck = () => {
    // Build expected full sequence from options
    const fullExpected = [...sequence];
    let optionIdx = 0;
    for (let i = 0; i < fullExpected.length; i++) {
      if (fullExpected[i] === null) {
        fullExpected[i] = options[optionIdx] ?? null;
        optionIdx++;
      }
    }

    const itemResults = filled.map((val, i) => {
      if (sequence[i] !== null) return null; // pre-filled, not judged
      return val === fullExpected[i];
    });

    setResults(itemResults);
    setSubmitted(true);

    const allCorrect = itemResults.every((r) => r === null || r === true);

    if (!allCorrect) {
      setTimeout(() => {
        setFilled(fullExpected);
        setResults(fullExpected.map(() => null));
      }, 1500);
    }

    setTimeout(() => onAnswer(allCorrect), allCorrect ? 800 : 2500);
  };

  const allFilled = filled.every((v) => v !== null);

  return (
    <div className="flex flex-col gap-4">
      {/* Sequence display */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {filled.map((val, i) => {
          const isOriginal = sequence[i] !== null;
          const result = results?.[i];
          const bg = isOriginal
            ? brand.graphite
            : result === true
              ? brand.correct + "20"
              : result === false
                ? brand.incorrect + "20"
                : val
                  ? brand.violet + "20"
                  : brand.slate;
          const border = isOriginal
            ? brand.steel
            : result === true
              ? brand.correct
              : result === false
                ? brand.incorrect
                : val
                  ? brand.violet
                  : brand.ash;

          return (
            <button
              key={i}
              onClick={() => handleSlotTap(i)}
              disabled={submitted || isOriginal}
              className="flex h-10 min-w-[48px] items-center justify-center rounded-lg px-3 text-sm font-semibold transition-all"
              style={{
                backgroundColor: bg,
                border: `1.5px solid ${border}`,
                color: val ? brand.ivory : brand.ash,
                cursor:
                  submitted || isOriginal
                    ? "default"
                    : val
                      ? "pointer"
                      : "default",
              }}
            >
              {val ?? "___"}
            </button>
          );
        })}
      </div>

      {/* Option buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {options.map((option) => {
          const isUsed = usedOptions.has(option);
          return (
            <button
              key={option}
              onClick={() => handleOptionTap(option)}
              disabled={submitted || isUsed}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-30"
              style={{
                backgroundColor: brand.graphite,
                border: `1.5px solid ${brand.steel}`,
                color: brand.silver,
                cursor: submitted || isUsed ? "default" : "pointer",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleCheck}
          disabled={!allFilled}
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
