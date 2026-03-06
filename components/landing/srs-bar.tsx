import type { SrsStage } from "@/types/srs";
import { srsStageColors, srsStageLabels } from "@/lib/tokens";

const srsIcons: Record<SrsStage, string> = {
  apprentice: "\u{1F331}",
  journeyman: "\u{1F525}",
  adept: "\u{26A1}",
  virtuoso: "\u{1F48E}",
  mastered: "\u{1F451}",
};

const plainLanguageLabels: Record<SrsStage, string> = {
  apprentice: "Just started",
  journeyman: "Getting familiar",
  adept: "Building confidence",
  virtuoso: "Nearly there",
  mastered: "Fully learned",
};

interface SrsBarProps {
  stages: { stage: SrsStage; count: number }[];
  total: number;
  plainLabels?: boolean;
}

export function SrsBar({ stages, total, plainLabels }: SrsBarProps) {
  const labels = plainLabels ? plainLanguageLabels : srsStageLabels;

  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden">
        {stages.map(({ stage, count }) => (
          <div
            key={stage}
            className="transition-all duration-400"
            style={{
              flex: count,
              backgroundColor: srsStageColors[stage],
              opacity: 0.75,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {stages.map(({ stage, count }) => (
          <div key={stage} className="flex items-center gap-1.5">
            <span className="text-xs">{srsIcons[stage]}</span>
            <span className="text-[11px] text-ash font-mono">
              {labels[stage]}
            </span>
            <span
              className="text-[13px] font-bold"
              style={{ color: srsStageColors[stage] }}
            >
              {count}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="text-[10px] tracking-[1.5px] uppercase text-silver/40 font-mono">
        {total} items total
      </div>
    </div>
  );
}
