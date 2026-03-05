"use client";

import { useState } from "react";
import type { AssessmentOption } from "@/lib/actions/assessment";

interface AssessmentCardProps {
  questionText: string;
  options: AssessmentOption[];
  selectedOption: number | null;
  onAnswer: (optionIndex: number) => Promise<void>;
  showSkip?: boolean;
  onSkip?: () => void;
}

export function AssessmentCard({
  questionText,
  options,
  selectedOption,
  onAnswer,
  showSkip,
  onSkip,
}: AssessmentCardProps) {
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState(selectedOption);

  const handleSelect = async (index: number) => {
    if (pending) return;
    setPending(true);
    setSelected(index);
    try {
      await onAnswer(index);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-ivory font-body text-[15px] leading-relaxed">
        {questionText}
      </h3>
      <div className="space-y-2">
        {options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={pending}
            className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
              selected === i
                ? "border-violet bg-violet/10 text-ivory"
                : "border-steel bg-obsidian text-silver hover:border-silver"
            } ${pending ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
          >
            {option.text}
          </button>
        ))}
      </div>
      {showSkip && onSkip && (
        <button
          onClick={onSkip}
          className="text-silver/60 text-xs hover:text-silver transition-colors font-mono"
        >
          Skip this question
        </button>
      )}
    </div>
  );
}
