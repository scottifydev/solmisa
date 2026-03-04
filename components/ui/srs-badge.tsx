import type { SrsStage } from "@/types/srs";
import { srsStageColors, srsStageLabels } from "@/lib/tokens";

interface SrsBadgeProps {
  stage: SrsStage;
  count?: number;
  size?: "sm" | "md";
}

export function SrsBadge({ stage, count, size = "md" }: SrsBadgeProps) {
  const color = srsStageColors[stage];
  const label = srsStageLabels[stage];
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-body font-medium ${sizeClasses}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
      {count !== undefined && (
        <span className="font-mono text-xs opacity-80">{count}</span>
      )}
    </span>
  );
}
