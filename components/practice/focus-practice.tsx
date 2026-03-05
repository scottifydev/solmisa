"use client";

import { useState } from "react";
import Link from "next/link";
import type { FocusDrill } from "@/lib/actions/practice";

interface FocusPracticeProps {
  drills: FocusDrill[];
}

export function FocusPractice({ drills }: FocusPracticeProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = drills.filter((d) => !dismissed.has(d.drillSlug));
  if (visible.length === 0) return null;

  const handleDismiss = (slug: string) => {
    setDismissed((prev) => new Set([...prev, slug]));
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-mono uppercase tracking-wider text-ash">
        Focus Practice
      </h2>
      <div className="space-y-2">
        {visible.map((drill) => (
          <div
            key={drill.drillSlug}
            className="rounded-lg border border-warning/20 bg-warning/5 p-4 relative"
          >
            <button
              onClick={() => handleDismiss(drill.drillSlug)}
              className="absolute top-3 right-3 text-ash hover:text-silver transition-colors"
              aria-label="Dismiss"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <Link
              href={`/practice/${drill.drillSlug}`}
              className="block space-y-1"
            >
              <div className="font-body text-sm font-semibold text-ivory">
                {drill.drillTitle}
              </div>
              <p className="text-xs text-silver leading-relaxed pr-6">
                {drill.reason}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
