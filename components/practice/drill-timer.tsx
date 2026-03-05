"use client";

import { useState, useEffect, useRef } from "react";

const NUDGE_10_MIN_MS = 10 * 60 * 1000;
const NUDGE_20_MIN_MS = 20 * 60 * 1000;

const NUDGE_10 =
  "You've been drilling for 10 minutes — that's a solid session. Take a break, switch activities, or keep going.";
const NUDGE_20 =
  "20 minutes of focused practice. Research suggests diminishing returns beyond this — consider switching to a different skill or taking a break.";

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function DrillTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [nudgeText, setNudgeText] = useState<string | null>(null);
  const shown10 = useRef(false);
  const shown20 = useRef(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() - startRef.current;
      setElapsed(now);

      if (!shown10.current && now >= NUDGE_10_MIN_MS) {
        shown10.current = true;
        setNudgeText(NUDGE_10);
      } else if (!shown20.current && now >= NUDGE_20_MIN_MS) {
        shown20.current = true;
        setNudgeText(NUDGE_20);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <span className="text-[10px] font-mono text-ash tabular-nums">
        {formatElapsed(elapsed)}
      </span>

      {nudgeText && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-6 pointer-events-none">
          <div className="pointer-events-auto max-w-sm w-full bg-obsidian border border-steel rounded-lg p-4 shadow-lg space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <p className="text-sm text-silver leading-relaxed">{nudgeText}</p>
            <button
              onClick={() => setNudgeText(null)}
              className="text-xs font-mono text-violet hover:text-violet/80 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
