"use client";

import { useState, useEffect, useCallback } from "react";

interface DrillWrapperProps {
  prompt: string;
  sub?: string;
  children: (props: {
    onAnswer: (correct: boolean) => void;
    key: number;
  }) => React.ReactNode;
  maxWidth?: number;
}

export function DrillWrapper({
  prompt,
  sub,
  children,
  maxWidth = 420,
}: DrillWrapperProps) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const advance = useCallback(() => {
    setRound((r) => r + 1);
    setAnswered(false);
    setLastCorrect(null);
  }, []);

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (answered) return;
      setAnswered(true);
      setLastCorrect(isCorrect);
      setTotal((t) => t + 1);
      if (isCorrect) setCorrect((c) => c + 1);
      const delay = isCorrect ? 1000 : 2000;
      setTimeout(advance, delay);
    },
    [answered, advance],
  );

  return (
    <div
      className="flex flex-col items-center gap-3"
      style={{ width: "100%", maxWidth }}
    >
      {/* Streak counter */}
      <div className="self-end font-mono text-[13px] text-silver">
        {total > 0 ? `${correct}/${total}` : "\u00a0"}
      </div>

      {/* Card */}
      <div
        className="w-full bg-obsidian border border-steel rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
        style={{ padding: "24px 20px 18px" }}
      >
        <div className="text-center mb-4">
          <div className="font-display text-lg font-semibold text-ivory">
            {prompt}
          </div>
          {sub && (
            <div className="font-body text-xs text-ash mt-0.5">{sub}</div>
          )}
        </div>

        {children({ onAnswer: handleAnswer, key: round })}
      </div>

      {/* Manual next button (shown after answer) */}
      {answered && (
        <button
          onClick={advance}
          className="px-6 py-2 rounded-lg border text-sm font-body font-medium transition-colors"
          style={{
            background: "rgba(139,92,246,0.08)",
            borderColor: "rgba(139,92,246,0.15)",
            color: "#8b5cf6",
          }}
        >
          Next →
        </button>
      )}
    </div>
  );
}
