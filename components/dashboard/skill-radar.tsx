"use client";

import { useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { brand, type as typeTokens } from "@/lib/tokens";
import type { RadarScore } from "@/lib/actions/radar";
import { RADAR_GROUP_LABELS, type RadarGroup } from "@/lib/radar/dimensions";
import { Sparkline } from "@/components/dashboard/sparkline";

interface SkillRadarProps {
  current: RadarScore[];
  lifetime: RadarScore[];
  emptyMessage?: string;
}

interface GroupedScore {
  group: RadarGroup;
  label: string;
  score: number;
  dimensions: RadarScore[];
}

function groupScores(scores: RadarScore[]): GroupedScore[] {
  const groups = new Map<RadarGroup, RadarScore[]>();
  for (const score of scores) {
    const existing = groups.get(score.group) ?? [];
    existing.push(score);
    groups.set(score.group, existing);
  }

  return Array.from(groups.entries()).map(([group, dims]) => {
    const avg =
      dims.length > 0
        ? Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length)
        : 0;
    return {
      group,
      label: RADAR_GROUP_LABELS[group],
      score: avg,
      dimensions: dims,
    };
  });
}

function scoreColor(score: number): string {
  if (score >= 80) return "#60a5fa"; // blue — mastered (color-blind safe)
  if (score >= 50) return "#fbbf24"; // amber — developing
  return "#9ca3af"; // gray — needs work
}

function scoreIndicator(score: number): string {
  if (score >= 80) return "\u2713"; // checkmark — mastered
  if (score >= 50) return "\u2192"; // arrow — developing
  return "\u25CB"; // circle — needs work
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: GroupedScore }[];
}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-md border border-steel bg-obsidian px-3 py-2 shadow-lg"
      style={{ fontFamily: typeTokens.mono }}
    >
      <div className="text-xs font-semibold text-ivory">{d.label}</div>
      <div className="text-[10px] text-silver mt-0.5">{d.score} / 100</div>
    </div>
  );
}

function DimensionDetail({ dimensions }: { dimensions: RadarScore[] }) {
  return (
    <div className="space-y-2 mt-3 pt-3 border-t border-steel">
      {dimensions.map((dim) => (
        <div key={dim.slug} className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-ash w-32 shrink-0 truncate">
            {dim.name}
          </span>
          <div className="flex-1 h-[6px] bg-steel rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-300"
              style={{
                width: `${dim.score}%`,
                backgroundColor: scoreColor(dim.score),
              }}
            />
          </div>
          <Sparkline history={dim.scoreHistory} />
          <span
            className="text-xs font-mono w-4 text-center"
            style={{ color: scoreColor(dim.score) }}
          >
            {scoreIndicator(dim.score)}
          </span>
          <span
            className="text-xs font-mono w-8 text-right"
            style={{ color: scoreColor(dim.score) }}
          >
            {dim.score}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SkillRadar({
  current,
  lifetime,
  emptyMessage,
}: SkillRadarProps) {
  const [mode, setMode] = useState<"current" | "lifetime">("current");
  const [expandedGroup, setExpandedGroup] = useState<RadarGroup | null>(null);

  const scores = mode === "current" ? current : lifetime;
  const grouped = groupScores(scores);
  const hasData = scores.some((s) => s.score > 0);

  return (
    <div className="rounded-xl border border-steel bg-obsidian p-5">
      <div className="flex items-center justify-between mb-3.5">
        <div className="text-[10px] tracking-[1.5px] uppercase text-silver/60 font-mono">
          Skills Radar
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setMode("current")}
            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
              mode === "current"
                ? "bg-violet/20 text-violet"
                : "text-ash hover:text-silver"
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setMode("lifetime")}
            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
              mode === "lifetime"
                ? "bg-violet/20 text-violet"
                : "text-ash hover:text-silver"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={grouped} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke={brand.steel} />
            <PolarAngleAxis
              dataKey="label"
              tick={{
                fill: brand.ash,
                fontSize: 10,
                fontFamily: typeTokens.mono,
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              dataKey="score"
              stroke={brand.violet}
              fill={brand.violet}
              fillOpacity={0.15}
              strokeWidth={2}
            />
            {hasData && <Tooltip content={<CustomTooltip />} />}
          </RadarChart>
        </ResponsiveContainer>
        {!hasData && emptyMessage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-silver/60 text-xs font-mono text-center bg-obsidian/80 px-3 py-1.5 rounded-md">
              {emptyMessage}
            </p>
          </div>
        )}
      </div>

      {/* Grouped dimension list with inline expand */}
      <div className="space-y-1 mt-4">
        {grouped.map((g) => (
          <div key={g.group}>
            <button
              onClick={() =>
                setExpandedGroup(expandedGroup === g.group ? null : g.group)
              }
              className="w-full flex items-center justify-between py-2 px-2 rounded hover:bg-steel/20 transition-colors"
            >
              <span className="text-xs text-ivory">{g.label}</span>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono"
                  style={{ color: scoreColor(g.score) }}
                >
                  {scoreIndicator(g.score)} {g.score}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`text-ash transition-transform ${
                    expandedGroup === g.group ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>
            {expandedGroup === g.group && (
              <DimensionDetail dimensions={g.dimensions} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
