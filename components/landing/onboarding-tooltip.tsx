"use client";

import { useState, useEffect } from "react";

interface OnboardingTooltipProps {
  text: string;
  position?: "top" | "bottom";
  show: boolean;
  onDismiss: () => void;
}

export function OnboardingTooltip({
  text,
  position = "bottom",
  show,
  onDismiss,
}: OnboardingTooltipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className={`absolute z-50 ${
        position === "top" ? "bottom-full mb-2" : "top-full mt-2"
      } left-1/2 -translate-x-1/2 w-max max-w-[260px]`}
      onClick={(e) => {
        e.stopPropagation();
        onDismiss();
      }}
    >
      <div className="relative bg-obsidian border border-violet/30 rounded-lg px-3.5 py-2.5 shadow-lg">
        <p className="text-ivory text-xs font-body leading-relaxed">{text}</p>
        <button
          aria-label="Dismiss tooltip"
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-steel text-silver hover:text-ivory flex items-center justify-center text-[10px]"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
        >
          &times;
        </button>
        {/* Arrow */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-obsidian border-violet/30 rotate-45 ${
            position === "top"
              ? "bottom-[-5px] border-r border-b"
              : "top-[-5px] border-l border-t"
          }`}
        />
      </div>
    </div>
  );
}
