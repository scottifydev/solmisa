"use client";

import { useState } from "react";
import { SkillRadar } from "@/components/dashboard/skill-radar";
import { Button } from "@/components/ui/button";
import type { PlacementResult } from "@/lib/cat/types";
import type { RadarScore } from "@/lib/actions/radar";

interface CATResultsProps {
  placement: PlacementResult;
  onContinue: () => void;
  loading?: boolean;
}

const TRACK_NAMES: Record<string, string> = {
  ear_training: "Ear Training",
  theory: "Theory",
  rhythm: "Rhythm",
  sight_reading: "Sight-Reading",
};

function confidenceLabel(confidence: string): string {
  if (confidence === "high") return "confident";
  if (confidence === "medium") return "estimated";
  return "approximate";
}

export function CATResults({
  placement,
  onContinue,
  loading,
}: CATResultsProps) {
  const [showDetails, setShowDetails] = useState(false);

  const radarScores: RadarScore[] = placement.radarScores.map((s) => ({
    slug: s.slug,
    name: s.name,
    group: s.group,
    score: s.score,
    total_reviews: 0,
    scoreHistory: [],
  }));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-ivory">
          Here&apos;s your starting point
        </h2>
        <p className="text-silver text-sm mt-2">
          We&apos;ll calibrate further as you learn.
          {placement.lowConfidenceDimensions.length > 0 &&
            " Some areas need more data — expect quicker check-ins there."}
        </p>
      </div>

      {/* Radar */}
      <SkillRadar
        current={radarScores}
        lifetime={radarScores}
        emptyMessage="Complete the test to see your profile"
      />

      {/* Track placements */}
      <div className="space-y-2">
        {placement.tracks.map((track) => (
          <div
            key={track.trackSlug}
            className="flex items-center justify-between rounded-lg border border-steel bg-obsidian px-4 py-3"
          >
            <div>
              <div className="text-ivory text-sm font-medium">
                {TRACK_NAMES[track.trackSlug] ?? track.trackSlug}
              </div>
              <div className="text-silver/60 text-[10px] font-mono mt-0.5">
                {confidenceLabel(track.confidence)} placement
              </div>
            </div>
            <div className="text-right">
              <div className="text-violet text-sm font-mono">
                Lesson {track.startingLesson}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low confidence note */}
      {placement.lowConfidenceDimensions.length > 0 && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-silver/60 text-xs hover:text-silver transition-colors font-mono w-full text-left"
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>
      )}
      {showDetails && placement.lowConfidenceDimensions.length > 0 && (
        <div className="rounded-lg border border-steel bg-obsidian/50 px-4 py-3">
          <p className="text-silver text-xs leading-relaxed">
            We need more data on:{" "}
            {placement.lowConfidenceDimensions
              .map((d) => d.replace(/_/g, " "))
              .join(", ")}
            . Early reviews in these areas will be scheduled more frequently to
            refine your profile.
          </p>
        </div>
      )}

      <Button fullWidth loading={loading} onClick={onContinue}>
        Start Learning
      </Button>
    </div>
  );
}
