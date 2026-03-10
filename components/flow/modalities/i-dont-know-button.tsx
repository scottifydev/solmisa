"use client";

import { brand } from "@/lib/tokens";

interface IDontKnowButtonProps {
  onDontKnow: () => void;
  visible: boolean;
}

export function IDontKnowButton({ onDontKnow, visible }: IDontKnowButtonProps) {
  if (!visible) return null;
  return (
    <button
      onClick={onDontKnow}
      className="mx-auto text-xs transition-opacity hover:opacity-80"
      style={{ color: brand.ash }}
    >
      I don&apos;t know yet
    </button>
  );
}
