"use client";

import { useState, useEffect, useRef } from "react";
import type { ConfidenceRating } from "@/types/srs";

interface ConfidencePromptProps {
  onSelect: (confidence: ConfidenceRating) => void;
}

const AUTO_TIMEOUT_MS = 2000;

export function ConfidencePrompt({ onSelect }: ConfidencePromptProps) {
  const [progress, setProgress] = useState(0);
  const selectedRef = useRef(false);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / AUTO_TIMEOUT_MS, 1);
      setProgress(pct);
      if (pct >= 1 && !selectedRef.current) {
        selectedRef.current = true;
        clearInterval(interval);
        onSelect("sure");
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onSelect]);

  const handleSelect = (confidence: ConfidenceRating) => {
    if (selectedRef.current) return;
    selectedRef.current = true;
    onSelect(confidence);
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      <p className="text-center text-xs font-mono text-ash">
        How confident are you?
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSelect("sure")}
          className="py-4 rounded-lg border-[1.5px] border-correct/40 hover:border-correct hover:bg-correct/5 transition-all"
        >
          <div className="font-body text-base font-semibold text-ivory">
            Sure
          </div>
        </button>
        <button
          onClick={() => handleSelect("guessing")}
          className="py-4 rounded-lg border-[1.5px] border-warning/40 hover:border-warning hover:bg-warning/5 transition-all"
        >
          <div className="font-body text-base font-semibold text-ivory">
            Guessing
          </div>
        </button>
      </div>
      <div className="w-full h-[2px] bg-steel rounded-sm overflow-hidden">
        <div
          className="h-full bg-ash/40 rounded-sm transition-none"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
