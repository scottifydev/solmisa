"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CardCategory } from "@/types/srs";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { semanticColors } from "@/lib/tokens";
import {
  checkCalibration,
  type CalibrationSuggestion,
} from "@/lib/actions/calibration";
import { CalibrationSuggestions } from "@/components/review/calibration-suggestion";

// ─── Types ──────────────────────────────────────────────────

export interface SessionResultItem {
  correct: boolean;
  stageChanged: boolean;
  stageBefore: string;
  stageAfter: string;
  category: CardCategory;
  track_slug: string;
  tierPromoted?: boolean;
  newTier?: string;
}

export interface SessionSummaryProps {
  results: SessionResultItem[];
  startTime: number;
  streakDays?: number;
  streakIsNew?: boolean;
  remainingDue?: number;
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
  remainingDue = 0,
}: SessionSummaryProps) {
  const router = useRouter();
  const [calibrationSuggestions, setCalibrationSuggestions] = useState<
    CalibrationSuggestion[]
  >([]);

  useEffect(() => {
    void checkCalibration().then((result) => {
      setCalibrationSuggestions(result.suggestions);
    });
  }, []);

  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const accuracy = total > 0 ? correct / total : 1;
  const accuracyPct = Math.round(accuracy * 100);
  const elapsedMs = Date.now() - startTime;

  // Stage changes
  const promoted = results.filter((r) => r.stageChanged && r.correct).length;
  const demoted = results.filter((r) => r.stageChanged && !r.correct).length;
  const hasStageChanges = promoted > 0 || demoted > 0;

  // Tier promotions
  const tierPromotions = results.filter((r) => r.tierPromoted);

  // Per-track breakdown
  const byTrack = new Map<
    string,
    { reviewed: number; correct: number; promoted: number; demoted: number }
  >();
  for (const r of results) {
    const track = byTrack.get(r.track_slug) ?? {
      reviewed: 0,
      correct: 0,
      promoted: 0,
      demoted: 0,
    };
    track.reviewed++;
    if (r.correct) track.correct++;
    if (r.stageChanged && r.correct) track.promoted++;
    if (r.stageChanged && !r.correct) track.demoted++;
    byTrack.set(r.track_slug, track);
  }
  const trackEntries = Array.from(byTrack.entries());
  const showTracks = trackEntries.length > 1;

  const trackLabels: Record<string, string> = {
    ear_training: "Ear Training",
    theory: "Theory",
    rhythm: "Rhythm",
    sight_reading: "Sight Reading",
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-obsidian border border-steel rounded-lg p-8 text-center space-y-6">
        <AnimatedCheckmark />

        <h1 className="font-display text-xl text-ivory">Session complete</h1>

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

        {/* Tier promotions */}
        {tierPromotions.length > 0 && (
          <div className="bg-violet/10 border border-violet/20 rounded-md p-4 space-y-1">
            {tierPromotions.map((r, i) => (
              <div key={i} className="text-sm text-violet font-medium">
                Difficulty increased to {r.newTier}
              </div>
            ))}
          </div>
        )}

        {/* Per-track breakdown */}
        {showTracks && (
          <div className="space-y-3 text-left">
            <h2 className="text-[10px] font-mono uppercase tracking-wider text-ash">
              By Track
            </h2>
            {trackEntries.map(([slug, data]) => (
              <div key={slug} className="space-y-1">
                <CategoryRow
                  label={trackLabels[slug] ?? slug}
                  reviewed={data.reviewed}
                  correct={data.correct}
                />
                <div className="flex gap-3 pl-24 text-[10px] font-mono">
                  {data.promoted > 0 && (
                    <span className="text-correct">
                      {"\u2191"} {data.promoted}
                    </span>
                  )}
                  {data.demoted > 0 && (
                    <span className="text-incorrect">
                      {"\u2193"} {data.demoted}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Streak callout */}
        {streakIsNew && streakDays !== undefined && (
          <div className="bg-warning/10 border border-warning/20 rounded-md p-4">
            <span className="text-warning font-display">
              {streakDays <= 1
                ? "Streak started"
                : `${streakDays} days consistent`}
            </span>
          </div>
        )}

        {/* Calibration suggestions */}
        {calibrationSuggestions.length > 0 && (
          <CalibrationSuggestions suggestions={calibrationSuggestions} />
        )}

        {/* CTAs */}
        <div className="space-y-2">
          {remainingDue > 0 ? (
            <Button fullWidth onClick={() => router.push("/review")}>
              {remainingDue} more review{remainingDue !== 1 ? "s" : ""} due
            </Button>
          ) : (
            <Button fullWidth onClick={() => router.push("/learn")}>
              Continue Learning
            </Button>
          )}
          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
