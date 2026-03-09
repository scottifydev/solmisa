"use client";

import { useState, useRef, useEffect } from "react";
import { brand } from "@/lib/tokens";

interface TimedSelectProps {
  prompt: string;
  options: { id: string; label: string }[];
  correctAnswer: string;
  speedThresholdMs?: number;
  onAnswer: (correct: boolean, responseTimeMs?: number) => void;
}

export function TimedSelect({
  prompt,
  options,
  correctAnswer,
  speedThresholdMs = 3000,
  onAnswer,
}: TimedSelectProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(performance.now());
  const rafRef = useRef<number | null>(null);

  // Timer bar animation
  useEffect(() => {
    if (submitted) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const animate = () => {
      const now = performance.now();
      setElapsed(now - startTimeRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [submitted]);

  const progress = Math.min(elapsed / speedThresholdMs, 1);

  const handleSelect = (id: string) => {
    if (submitted) return;
    const responseTime = performance.now() - startTimeRef.current;
    setSelected(id);
    setSubmitted(true);
    const correct = id === correctAnswer;
    setTimeout(
      () => onAnswer(correct, Math.round(responseTime)),
      correct ? 800 : 1500,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Timer bar */}
      <div
        className="h-1 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: brand.slate }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(1 - progress) * 100}%`,
            backgroundColor:
              progress < 0.5
                ? brand.violet
                : progress < 0.8
                  ? brand.violet + "80"
                  : brand.incorrect + "80",
          }}
        />
      </div>

      <p
        className="text-center text-sm font-medium"
        style={{ color: brand.ivory }}
      >
        {prompt}
      </p>

      <div className="grid grid-cols-2 gap-2">
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
