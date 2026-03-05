"use client";

import type { PracticeRecommendation } from "@/lib/actions/practice";

const TOOL_ICONS: Record<string, string> = {
  internal_drill: "target",
  external_app: "link",
  instrument: "music",
  singing: "mic",
};

const TOOL_LABELS: Record<string, string> = {
  internal_drill: "Drill",
  external_app: "App",
  instrument: "Instrument",
  singing: "Singing",
};

export function RecommendationCard({
  rec,
  onDismiss,
}: {
  rec: PracticeRecommendation;
  onDismiss?: () => void;
}) {
  return (
    <div className="rounded-lg border border-violet/20 bg-violet/5 p-4 space-y-2 relative">
      {onDismiss && (
        <button
          onClick={onDismiss}
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
      )}

      <div className="flex items-center gap-2">
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet/20 text-violet font-mono uppercase">
          {TOOL_LABELS[rec.tool_type] ?? rec.tool_type}
        </span>
        <span className="text-[10px] font-mono text-ash uppercase tracking-wider">
          {rec.tool_name}
        </span>
      </div>

      {rec.description && (
        <p className="text-sm text-silver leading-relaxed">{rec.description}</p>
      )}

      {rec.tool_url && (
        <a
          href={rec.tool_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-violet hover:text-violet/80 transition-colors"
        >
          Open {rec.tool_name} &rarr;
        </a>
      )}
    </div>
  );
}
