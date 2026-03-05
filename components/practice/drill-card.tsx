"use client";

import Link from "next/link";
import type { DrillItem } from "@/lib/actions/practice";
import { Button } from "@/components/ui/button";

const DRILL_TYPE_LABELS: Record<string, string> = {
  degree_id: "Degree Recognition",
  interval_id: "Interval ID",
  chord_quality: "Chord Quality",
  degree_discrimination: "Degree Discrimination",
  meter_id: "Meter ID",
  minor_form_id: "Minor Forms",
  rhythm_tap: "Rhythm Tapping",
  rhythm_echo: "Rhythm Echo",
  note_reading: "Note Reading",
  key_signature_id: "Key Signatures",
  scale_construction: "Scale Construction",
  roman_numeral_id: "Roman Numerals",
  melodic_dictation: "Melodic Dictation",
  harmonic_dictation: "Harmonic Dictation",
};

export function DrillCard({ drill }: { drill: DrillItem }) {
  return (
    <div
      className={`rounded-lg border bg-obsidian p-4 transition-colors ${
        drill.unlocked
          ? "border-steel hover:border-silver/30"
          : "border-steel opacity-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-mono text-ash uppercase tracking-wider">
            {DRILL_TYPE_LABELS[drill.drill_type] ?? drill.drill_type}
          </span>
          <h3
            className={`font-display text-sm font-bold mt-0.5 ${drill.unlocked ? "text-ivory" : "text-silver"}`}
          >
            {drill.title}
          </h3>
          {drill.description && (
            <p className="text-xs text-silver mt-1 line-clamp-2">
              {drill.description}
            </p>
          )}
          {!drill.unlocked && drill.unlocked_by_lesson && (
            <p className="text-[10px] text-ash italic mt-2">
              Complete &ldquo;{drill.unlocked_by_lesson}&rdquo; to unlock
            </p>
          )}
        </div>
        <div className="shrink-0">
          {drill.unlocked ? (
            <Link href={`/practice/${drill.slug}`}>
              <Button size="sm">Play</Button>
            </Link>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ash mt-1"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
