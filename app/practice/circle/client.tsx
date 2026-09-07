"use client";

import { useState } from "react";
import { CircleOfFifths } from "@/components/practice/drills/circle-of-fifths";

export function CircleDrillClient() {
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  function handleAnswer(isCorrect: boolean) {
    setTotal((t) => t + 1);
    if (isCorrect) setCorrect((c) => c + 1);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center gap-4">
      {/* Named for assistive tech; the visual design carries the title
          through the nav, so it is not repeated on screen. */}
      <h1 className="sr-only">Circle of Fifths</h1>
      {/* Streak */}
      <div
        className="self-end font-mono text-[13px] text-silver"
        role="status"
        aria-label={total > 0 ? `${correct} correct of ${total}` : undefined}
      >
        {total > 0 ? `${correct}/${total}` : "\u00a0"}
      </div>

      <CircleOfFifths onAnswer={handleAnswer} />
    </div>
  );
}
