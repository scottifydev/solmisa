"use client";

import { useState, useTransition } from "react";
import type { CalibrationSuggestion as Suggestion } from "@/lib/actions/calibration";
import {
  acceptCalibration,
  dismissCalibration,
} from "@/lib/actions/calibration";
import { Button } from "@/components/ui/button";

interface CalibrationSuggestionProps {
  suggestions: Suggestion[];
}

const dimensionLabels: Record<string, string> = {
  degree_recognition: "Degree Recognition",
  interval_recognition: "Interval Recognition",
  chord_quality: "Chord Quality",
  melodic_dictation: "Melodic Dictation",
  rhythm_accuracy: "Rhythm Accuracy",
  meter_recognition: "Meter Recognition",
  note_reading: "Note Reading",
  key_signature: "Key Signatures",
  scale_construction: "Scale Construction",
  roman_numerals: "Roman Numerals",
};

function formatDimension(slug: string): string {
  return (
    dimensionLabels[slug] ??
    slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function CalibrationSuggestions({
  suggestions: initial,
}: CalibrationSuggestionProps) {
  const [suggestions, setSuggestions] = useState(initial);
  const [pending, startTransition] = useTransition();

  if (suggestions.length === 0) return null;

  const handleAccept = (
    dimension: string,
    action: "skip_ahead" | "step_back",
  ) => {
    startTransition(async () => {
      await acceptCalibration(dimension, action);
      setSuggestions((prev) => prev.filter((s) => s.dimension !== dimension));
    });
  };

  const handleDismiss = (dimension: string) => {
    startTransition(async () => {
      await dismissCalibration(dimension);
      setSuggestions((prev) => prev.filter((s) => s.dimension !== dimension));
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-mono uppercase tracking-wider text-ash">
        Placement Calibration
      </h3>
      {suggestions.map((s) => (
        <div
          key={s.dimension}
          className={`rounded-lg border p-4 space-y-3 ${
            s.action === "skip_ahead"
              ? "bg-correct/5 border-correct/20"
              : "bg-warning/5 border-warning/20"
          }`}
        >
          <div className="space-y-1">
            <p className="text-sm text-ivory font-medium">
              {formatDimension(s.dimension)}
            </p>
            <p className="text-xs text-silver leading-relaxed">
              {s.action === "skip_ahead"
                ? `You're scoring ${Math.round(s.accuracy * 100)}% accuracy — higher than your placement suggested. You may be ready to skip ahead.`
                : `You're scoring ${Math.round(s.accuracy * 100)}% accuracy — the material may be moving too fast. Consider revisiting the basics.`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() => handleAccept(s.dimension, s.action)}
            >
              {s.action === "skip_ahead" ? "Skip Ahead" : "Step Back"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => handleDismiss(s.dimension)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
