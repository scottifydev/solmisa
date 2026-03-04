import type { SrsStageGroup } from "@/types/srs";
import { srsStageColors, srsStageLabels, srsStages } from "@/lib/tokens";

interface SrsBadgeProps {
  stage: SrsStageGroup;
  substage?: number;
  showInterval?: boolean;
  showIcon?: boolean;
  count?: number;
  size?: "sm" | "md";
  variant?: "badge" | "pill";
}

const STAGE_INTERVALS: Record<string, string> = {
  apprentice_1: "4h", apprentice_2: "8h", apprentice_3: "1d", apprentice_4: "2d",
  journeyman_1: "4d", journeyman_2: "7d",
  adept_1: "14d", adept_2: "30d",
  virtuoso_1: "60d", virtuoso_2: "120d",
  mastered: "\u221E",
};

export function SrsBadge({
  stage,
  substage,
  showInterval,
  showIcon = true,
  count,
  size = "md",
  variant = "badge",
}: SrsBadgeProps) {
  const color = srsStageColors[stage];
  const label = srsStageLabels[stage];
  const icon = srsStages[stage].icon;

  const intervalKey = substage ? `${stage}_${substage}` : stage;
  const interval = STAGE_INTERVALS[intervalKey];

  if (variant === "pill") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full font-mono text-[10px] tracking-[1.5px] uppercase"
        style={{
          backgroundColor: `${color}14`,
          color,
          border: `1.5px solid ${color}54`,
          padding: "4px 10px",
        }}
      >
        {showIcon && <span>{icon}</span>}
        {label}
      </span>
    );
  }

  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono tracking-[1.5px] uppercase ${sizeClasses}`}
      style={{
        backgroundColor: `${color}14`,
        color,
        border: `1.5px solid ${color}54`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
      {substage !== undefined && (
        <span className="opacity-80">{substage}</span>
      )}
      {showInterval && interval && (
        <span className="opacity-70">{interval}</span>
      )}
      {count !== undefined && (
        <span className="font-mono opacity-80">{count}</span>
      )}
    </span>
  );
}
