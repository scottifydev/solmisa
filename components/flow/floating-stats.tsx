"use client";

import { brand } from "@/lib/tokens";

interface FloatingStatsProps {
  cardsAnswered: number;
  correctCount: number;
  unlocks: number;
}

export function FloatingStats({
  cardsAnswered,
  correctCount,
  unlocks,
}: FloatingStatsProps) {
  const accuracy =
    cardsAnswered > 0 ? Math.round((correctCount / cardsAnswered) * 100) : 0;

  return (
    <div
      className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-medium shadow-lg"
      style={{
        backgroundColor: brand.obsidian,
        border: `1px solid ${brand.steel}`,
        color: brand.silver,
      }}
    >
      {cardsAnswered} card{cardsAnswered !== 1 ? "s" : ""} &middot; {accuracy}%
      {unlocks > 0 && <> &middot; {unlocks} unlocked</>}
    </div>
  );
}
