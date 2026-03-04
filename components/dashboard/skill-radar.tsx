"use client";

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
import type { SkillAxis } from "@/lib/skill-axes";

interface SkillRadarProps {
  axes: SkillAxis[];
  emptyMessage?: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: SkillAxis }[];
}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-md border border-steel bg-obsidian px-3 py-2 shadow-lg"
      style={{ fontFamily: typeTokens.mono }}
    >
      <div className="text-xs font-semibold text-ivory">{d.axis_name}</div>
      <div className="text-[10px] text-silver mt-0.5">
        {d.score} / {d.max_points} ({d.percentage}%)
      </div>
    </div>
  );
}

export function SkillRadar({ axes, emptyMessage }: SkillRadarProps) {
  const hasData = axes.some((a) => a.score > 0);

  return (
    <div className="rounded-xl border border-steel bg-obsidian p-5">
      <div className="text-[10px] tracking-[1.5px] uppercase text-silver/60 font-mono mb-3.5">
        Skill Radar
      </div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={axes} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke={brand.steel} />
            <PolarAngleAxis
              dataKey="axis_name"
              tick={{
                fill: brand.ash,
                fontSize: 10,
                fontFamily: typeTokens.mono,
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1000]}
              tick={false}
              axisLine={false}
            />
            <Radar
              dataKey="score"
              stroke={brand.coral}
              fill={brand.coral}
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
    </div>
  );
}
