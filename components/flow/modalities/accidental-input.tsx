"use client";

import { useState, useMemo } from "react";
import { brand } from "@/lib/tokens";
import { SHARP_ORDER, FLAT_ORDER } from "@/lib/notation/accidental-data";

interface AccidentalInputProps {
  prompt: string;
  expectedAccidentals: string[];
  ordered: boolean;
  onAnswer: (correct: boolean) => void;
}

export function AccidentalInput({
  prompt,
  expectedAccidentals,
  ordered,
  onAnswer,
}: AccidentalInputProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean> | null>(null);

  const isSharp = useMemo(
    () => expectedAccidentals.some((a) => a.includes("#")),
    [expectedAccidentals],
  );
  const buttons = isSharp ? SHARP_ORDER : FLAT_ORDER;

  const toggleAccidental = (acc: string) => {
    if (submitted) return;
    setSelected((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc],
    );
  };

  const handleCheck = () => {
    const resultMap: Record<string, boolean> = {};
    let allCorrect: boolean;

    if (ordered) {
      allCorrect =
        selected.length === expectedAccidentals.length &&
        selected.every((acc, i) => acc === expectedAccidentals[i]);
      selected.forEach((acc, i) => {
        resultMap[`${acc}-${i}`] = acc === expectedAccidentals[i];
      });
    } else {
      const expectedSet = new Set(expectedAccidentals);
      allCorrect =
        selected.length === expectedAccidentals.length &&
        selected.every((acc) => expectedSet.has(acc));
      selected.forEach((acc) => {
        resultMap[acc] = expectedSet.has(acc);
      });
    }

    // Mark missing ones
    for (const exp of expectedAccidentals) {
      if (!selected.includes(exp)) {
        resultMap[`missing-${exp}`] = false;
        allCorrect = false;
      }
    }

    setResults(resultMap);
    setSubmitted(true);

    setTimeout(() => onAnswer(allCorrect), allCorrect ? 800 : 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-center text-sm font-medium"
        style={{ color: brand.ivory }}
      >
        {prompt}
      </p>

      {/* Selected accidentals row */}
      <div
        className="flex min-h-[44px] flex-wrap items-center justify-center gap-2 rounded-xl px-3 py-2"
        style={{
          backgroundColor: brand.slate,
          border: `1px solid ${brand.steel}`,
        }}
      >
        {selected.length === 0 ? (
          <span className="text-xs" style={{ color: brand.ash }}>
            Tap accidentals below
          </span>
        ) : (
          selected.map((acc, i) => {
            const key = ordered ? `${acc}-${i}` : acc;
            const result = results?.[key];
            const bg =
              result === true
                ? brand.correct + "20"
                : result === false
                  ? brand.incorrect + "20"
                  : brand.violet + "20";
            const border =
              result === true
                ? brand.correct
                : result === false
                  ? brand.incorrect
                  : brand.violet;

            return (
              <button
                key={`selected-${i}`}
                onClick={() => !submitted && toggleAccidental(acc)}
                disabled={submitted}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: bg,
                  border: `1.5px solid ${border}`,
                  color: brand.ivory,
                  cursor: submitted ? "default" : "pointer",
                }}
              >
                {acc}
              </button>
            );
          })
        )}
      </div>

      {/* Accidental buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {buttons.map((acc) => {
          const isSelected = selected.includes(acc);
          return (
            <button
              key={acc}
              onClick={() => toggleAccidental(acc)}
              disabled={submitted}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
              style={{
                backgroundColor: isSelected
                  ? brand.violet + "30"
                  : brand.graphite,
                border: `1.5px solid ${isSelected ? brand.violet : brand.steel}`,
                color: isSelected ? brand.violet : brand.silver,
                cursor: submitted ? "default" : "pointer",
                opacity: submitted ? 0.6 : 1,
              }}
            >
              {acc}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleCheck}
          disabled={selected.length === 0}
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
