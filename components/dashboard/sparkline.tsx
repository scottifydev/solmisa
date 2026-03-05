"use client";

import type { ScoreHistoryEntry } from "@/lib/actions/radar";

interface SparklineProps {
  history: ScoreHistoryEntry[];
  width?: number;
  height?: number;
}

function trendColor(history: ScoreHistoryEntry[]): string {
  if (history.length < 3) return "#666"; // gray - not enough data
  const recent = history.slice(-3);
  const older = history.slice(-6, -3);
  if (older.length === 0) return "#666";
  const recentAvg = recent.reduce((s, e) => s + e.score, 0) / recent.length;
  const olderAvg = older.reduce((s, e) => s + e.score, 0) / older.length;
  const diff = recentAvg - olderAvg;
  if (diff > 3) return "#50C878"; // green - improving
  if (diff < -3) return "#E8A838"; // amber - declining
  return "#666"; // gray - stable
}

export function Sparkline({
  history,
  width = 60,
  height = 20,
}: SparklineProps) {
  if (history.length < 3) {
    return <span className="text-[9px] font-mono text-ash/50 italic">--</span>;
  }

  const scores = history.map((e) => e.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const points = scores.map((score, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = height - ((score - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  });

  const color = trendColor(history);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
