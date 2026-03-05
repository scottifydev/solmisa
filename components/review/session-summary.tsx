"use client";

import { useRouter } from "next/navigation";
import type { CardCategory } from "@/types/srs";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { semanticColors } from "@/lib/tokens";

// ─── Types ──────────────────────────────────────────────────

export interface SessionResultItem {
  correct: boolean;
  stageChanged: boolean;
  stageBefore: string;
  stageAfter: string;
  category: CardCategory;
}

export interface SessionSummaryProps {
  results: SessionResultItem[];
  startTime: number;
  streakDays?: number;
  streakIsNew?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────

function formatTime(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function accuracyColor(accuracy: number): string {
  if (accuracy >= 0.8) return semanticColors.correct;
  if (accuracy >= 0.6) return semanticColors.warning;
  return semanticColors.incorrect;
}

// ─── Animated Checkmark ─────────────────────────────────────

function AnimatedCheckmark() {
  return (
    <div className="flex justify-center mb-6">
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        className="animated-check"
      >
        <circle
          cx="36"
          cy="36"
          r="32"
          fill="none"
          stroke={semanticColors.correct}
          strokeWidth="3"
          className="check-circle"
        />
        <path
          d="M22 36 L32 46 L50 26"
          fill="none"
          stroke={semanticColors.correct}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="check-mark"
        />
        <style>{`
          .check-circle {
            stroke-dasharray: 201;
            stroke-dashoffset: 201;
            animation: drawCircle 0.6s ease-out forwards;
          }
          .check-mark {
            stroke-dasharray: 50;
            stroke-dashoffset: 50;
            animation: drawCheck 0.4s ease-out 0.3s forwards;
          }
          @keyframes drawCircle {
            to { stroke-dashoffset: 0; }
          }
          @keyframes drawCheck {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </svg>
    </div>
  );
}

// ─── Category Breakdown Row ─────────────────────────────────

function CategoryRow({
  label,
  reviewed,
  correct,
}: {
  label: string;
  reviewed: number;
  correct: number;
}) {
  const accuracy = reviewed > 0 ? correct / reviewed : 0;
  const pct = Math.round(accuracy * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono text-ash uppercase tracking-wider w-24 shrink-0">
        {label}
      </span>
      <div className="flex-1">
        <ProgressBar
          value={pct}
          max={100}
          color={accuracyColor(accuracy)}
          size="sm"
        />
      </div>
      <span className="text-xs font-mono text-silver w-10 text-right">
        {pct}%
      </span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function SessionSummary({
  results,
  startTime,
  streakDays,
  streakIsNew,
}: SessionSummaryProps) {
  const router = useRouter();

  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const accuracy = total > 0 ? correct / total : 1;
  const accuracyPct = Math.round(accuracy * 100);
  const elapsedMs = Date.now() - startTime;

  // Stage changes
  const promoted = results.filter((r) => r.stageChanged && r.correct).length;
  const demoted = results.filter((r) => r.stageChanged && !r.correct).length;
  const hasStageChanges = promoted > 0 || demoted > 0;

  // Category breakdown
  const byCategory = new Map<
    CardCategory,
    { reviewed: number; correct: number }
  >();
  for (const r of results) {
    const cat = byCategory.get(r.category) ?? { reviewed: 0, correct: 0 };
    cat.reviewed++;
    if (r.correct) cat.correct++;
    byCategory.set(r.category, cat);
  }
  const categoryEntries = Array.from(byCategory.entries());
  const showCategories = categoryEntries.length > 1;

  const categoryLabels: Record<CardCategory, string> = {
    perceptual: "Ear Training",
    declarative: "Theory",
    rhythm: "Rhythm",
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-obsidian border border-steel rounded-lg p-8 text-center space-y-6">
        <AnimatedCheckmark />

        <h1 className="font-display text-xl text-ivory">Session Complete!</h1>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Reviewed" value={total} />
          <StatCard
            label="Accuracy"
            value={`${accuracyPct}%`}
            color={accuracyColor(accuracy)}
          />
          <StatCard label="Time" value={formatTime(elapsedMs)} />
          <StatCard
            label="Streak"
            value={streakDays !== undefined ? `${streakDays}` : "--"}
            sub={streakDays !== undefined ? "days" : undefined}
            color={semanticColors.warning}
          />
        </div>

        {/* Stage changes */}
        {hasStageChanges && (
          <div className="space-y-1 text-sm">
            {promoted > 0 && (
              <div className="text-correct">
                {"\u2191"} {promoted} item{promoted !== 1 ? "s" : ""} promoted
              </div>
            )}
            {demoted > 0 && (
              <div className="text-incorrect">
                {"\u2193"} {demoted} item{demoted !== 1 ? "s" : ""} regressed
              </div>
            )}
          </div>
        )}

        {/* Category breakdown */}
        {showCategories && (
          <div className="space-y-2 text-left">
            {categoryEntries.map(([cat, data]) => (
              <CategoryRow
                key={cat}
                label={categoryLabels[cat]}
                reviewed={data.reviewed}
                correct={data.correct}
              />
            ))}
          </div>
        )}

        {/* Streak callout */}
        {streakIsNew && streakDays !== undefined && (
          <div className="bg-warning/10 border border-warning/20 rounded-md p-4">
            <span className="text-warning font-display">
              {streakDays <= 1
                ? "Streak started!"
                : `Day ${streakDays} streak!`}
            </span>
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-2">
          <Button fullWidth onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push("/learn")}
          >
            Start Lessons
          </Button>
        </div>
      </div>
    </div>
  );
}
