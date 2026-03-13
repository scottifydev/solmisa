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
      {/* Streak */}
      <div className="self-end font-mono text-[13px] text-silver">
        {total > 0 ? `${correct}/${total}` : "\u00a0"}
      </div>

      <CircleOfFifths onAnswer={handleAnswer} />
    </div>
  );
}
