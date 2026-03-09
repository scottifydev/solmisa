"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";

interface MultiStepSelectProps {
  items: string[]; // e.g. ["I", "IV", "V", "I"]
  options: { id: string; label: string }[];
  correctLabels: string[]; // must match items.length
  onAnswer: (correct: boolean) => void;
}

export function MultiStepSelect({
  items,
  options,
  correctLabels,
  onAnswer,
}: MultiStepSelectProps) {
  const [labels, setLabels] = useState<(string | null)[]>(
    () => new Array(items.length).fill(null) as (string | null)[],
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const filledCount = labels.filter((l) => l !== null).length;
  const allFilled = filledCount === items.length;

  const handleSlotClick = (index: number) => {
    if (submitted) return;
    setActiveSlot(activeSlot === index ? null : index);
  };

  const handleOptionClick = (optionId: string) => {
    if (activeSlot === null || submitted) return;
    const next = [...labels];
    next[activeSlot] = optionId;
    setLabels(next);
    // Auto-advance to next empty slot
    const nextEmpty = next.findIndex((l, i) => i > activeSlot && l === null);
    setActiveSlot(nextEmpty >= 0 ? nextEmpty : null);
  };

  const handleCheck = () => {
    if (!allFilled) return;
    setSubmitted(true);
    const correct = labels.every((l, i) => l === correctLabels[i]);
    setTimeout(() => onAnswer(correct), correct ? 800 : 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Item row with label slots */}
      <div className="flex justify-center gap-3">
        {items.map((item, i) => {
          const label = labels[i];
          const isActive = activeSlot === i;
          const isCorrect = submitted && label === correctLabels[i];
          const isWrong =
            submitted && label !== null && label !== correctLabels[i];

          let slotBg: string = brand.slate;
          let slotBorder: string = brand.steel;
          if (isActive) slotBorder = brand.violet;
          if (isCorrect) {
            slotBg = brand.correct + "15";
            slotBorder = brand.correct;
          }
          if (isWrong) {
            slotBg = brand.incorrect + "15";
            slotBorder = brand.incorrect;
          }

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="text-sm font-bold"
                style={{ color: brand.ivory }}
              >
                {item}
              </span>
              <button
                onClick={() => handleSlotClick(i)}
                disabled={submitted}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all min-w-[48px]"
                style={{
                  backgroundColor: slotBg,
                  border: `1.5px solid ${slotBorder}`,
                  color: label
                    ? isCorrect
                      ? brand.correct
                      : isWrong
                        ? brand.incorrect
                        : brand.violet
                    : brand.ash,
                  cursor: submitted ? "default" : "pointer",
                }}
              >
                {label
                  ? (options.find((o) => o.id === label)?.label ?? label)
                  : "—"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Option picker — visible when a slot is active */}
      {activeSlot !== null && !submitted && (
        <div className="grid grid-cols-3 gap-2">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
              style={{
                backgroundColor: brand.graphite,
                border: `1.5px solid ${brand.steel}`,
                color: brand.silver,
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Check button */}
      {allFilled && !submitted && (
        <button
          onClick={handleCheck}
          className="mt-2 w-full rounded-xl py-3 text-sm font-semibold transition-colors"
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
