"use client";

import type { ReactNode } from "react";
import { degreeColors } from "@/lib/tokens";

export type AnswerCardState = "default" | "hover" | "selected" | "correct" | "incorrect" | "disabled";

interface AnswerCardProps {
  label?: string;
  sublabel?: string;
  state?: AnswerCardState;
  degreeColor?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}

const stateClasses: Record<AnswerCardState, string> = {
  default: "border-steel hover:border-silver bg-obsidian hover:bg-steel/50 cursor-pointer",
  hover: "border-silver bg-steel/50 cursor-pointer",
  selected: "border-coral bg-coral/10 ring-1 ring-coral/30 cursor-pointer",
  correct: "border-correct bg-correct/10 ring-1 ring-correct/30",
  incorrect: "border-incorrect bg-incorrect/10 ring-1 ring-incorrect/30",
  disabled: "border-steel/50 bg-obsidian/50 opacity-50 cursor-not-allowed",
};

export function AnswerCard({
  label,
  sublabel,
  state = "default",
  degreeColor,
  onClick,
  disabled,
  children,
}: AnswerCardProps) {
  const effectiveState = disabled ? "disabled" : state;
  const borderColor = degreeColor && effectiveState === "default"
    ? degreeColors[degreeColor]
    : undefined;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled || effectiveState === "correct" || effectiveState === "incorrect"}
      className={`
        relative w-full rounded-xl border-2 p-4 text-left transition-all font-body
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/50
        ${stateClasses[effectiveState]}
      `}
      style={borderColor ? { borderColor } : undefined}
    >
      {label && (
        <div className="text-ivory font-medium">{label}</div>
      )}
      {sublabel && (
        <div className="text-silver text-sm mt-0.5">{sublabel}</div>
      )}
      {children}
    </button>
  );
}
