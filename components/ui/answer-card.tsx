"use client";

import type { ReactNode } from "react";
import { degreeColors } from "@/lib/tokens";

export type AnswerCardState =
  | "default"
  | "hover"
  | "selected"
  | "correct"
  | "incorrect"
  | "disabled";

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
  default:
    "border-steel hover:border-silver bg-obsidian hover:bg-steel/50 cursor-pointer",
  hover: "border-silver bg-steel/50 cursor-pointer",
  selected: "border-violet bg-violet/10 ring-1 ring-violet/30 cursor-pointer",
  correct: "border-correct bg-correct/10 ring-1 ring-correct/30",
  incorrect: "border-incorrect bg-incorrect/10 ring-1 ring-incorrect/30",
  disabled: "border-steel/50 bg-obsidian/50 opacity-50 cursor-not-allowed",
};

interface AnswerGridProps {
  columns?: 2 | 3 | 4;
  children: ReactNode;
}

export function AnswerGrid({ columns = 2, children }: AnswerGridProps) {
  const colClass =
    columns === 3
      ? "grid-cols-3"
      : columns === 4
        ? "grid-cols-4"
        : "grid-cols-2";
  return <div className={`grid ${colClass} gap-3`}>{children}</div>;
}

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
  const borderColor =
    degreeColor && effectiveState === "default"
      ? degreeColors[degreeColor]
      : undefined;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={
        disabled ||
        effectiveState === "correct" ||
        effectiveState === "incorrect"
      }
      className={`
        relative w-full rounded-xl border-2 p-4 text-left transition-all font-body
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/50
        ${stateClasses[effectiveState]}
      `}
      style={borderColor ? { borderColor } : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          {label && <div className="text-ivory font-medium">{label}</div>}
          {sublabel && (
            <div className="text-silver text-sm mt-0.5">{sublabel}</div>
          )}
        </div>
        {effectiveState === "correct" && (
          <span className="text-correct text-lg shrink-0 ml-2">&#x2713;</span>
        )}
        {effectiveState === "incorrect" && (
          <span className="text-incorrect text-lg shrink-0 ml-2">&#x2717;</span>
        )}
      </div>
      {children}
    </button>
  );
}
