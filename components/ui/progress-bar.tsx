interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({
  value,
  max = 100,
  color = "#FF6B6B",
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const heightClass = size === "sm" ? "h-1" : "h-2";

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-silver mb-1 font-mono">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={`w-full ${heightClass} bg-steel rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
