"use client";

import { useState } from "react";
import type { ReviewQueueResponse } from "@/types/srs";
import { Button } from "@/components/ui/button";
import { SrsBadge } from "@/components/ui/srs-badge";
import Link from "next/link";

interface PreSessionProps {
  queue: ReviewQueueResponse;
  onStart: (limit?: number) => void;
}

const SIZE_OPTIONS = [10, 25, 50] as const;

export function PreSession({ queue, onStart }: PreSessionProps) {
  const totalDue = queue.total_due;
  const estimatedMinutes = Math.max(1, Math.round((totalDue * 10) / 60));

  const defaultSize = totalDue <= 50 ? totalDue : 50;
  const [selectedSize, setSelectedSize] = useState<number>(defaultSize);

  const nonZeroStages = queue.stage_breakdown.filter((s) => s.count > 0);

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-obsidian border border-steel rounded-lg p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-violet"
          >
            <path d="M21.5 2v6h-6" />
            <path d="M2.5 12a10 10 0 0 1 16.6-7.5L21.5 2" />
            <path d="M2.5 22v-6h6" />
            <path d="M21.5 12a10 10 0 0 1-16.6 7.5L2.5 22" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-display text-xl text-ivory">Reviews Due</h1>

        {/* Large count */}
        <div className="font-display text-5xl text-violet font-bold">
          {totalDue}
        </div>

        {/* Stage breakdown */}
        {nonZeroStages.length > 0 && (
          <div className="flex gap-2 justify-center flex-wrap">
            {nonZeroStages.map((s) => (
              <SrsBadge
                key={s.group}
                stage={s.group}
                count={s.count}
                size="sm"
              />
            ))}
          </div>
        )}

        {/* Estimated time */}
        <div className="text-sm text-silver font-mono">
          ~{estimatedMinutes} minute{estimatedMinutes !== 1 ? "s" : ""}
        </div>

        {/* Session size selector */}
        {totalDue > 10 && (
          <div className="flex gap-2 justify-center">
            {SIZE_OPTIONS.filter((s) => s < totalDue).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-mono transition-colors
                  ${
                    selectedSize === size
                      ? "bg-graphite text-ivory"
                      : "text-silver hover:text-ivory hover:bg-steel/30"
                  }
                `}
              >
                {size}
              </button>
            ))}
            <button
              onClick={() => setSelectedSize(totalDue)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-mono transition-colors
                ${
                  selectedSize === totalDue
                    ? "bg-graphite text-ivory"
                    : "text-silver hover:text-ivory hover:bg-steel/30"
                }
              `}
            >
              All
            </button>
          </div>
        )}

        {/* Start button */}
        <Button
          fullWidth
          size="lg"
          onClick={() =>
            onStart(selectedSize === totalDue ? undefined : selectedSize)
          }
        >
          Start Session
        </Button>

        {/* Skip link */}
        <Link
          href="/dashboard"
          className="block text-sm text-ash hover:text-silver transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
