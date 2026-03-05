import Link from "next/link";
import type { ModuleProgressStatus } from "@/types/lesson";
import { ProgressBar } from "@/components/ui/progress-bar";
import { degreeColors, colors } from "@/lib/tokens";

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string | null;
    module_order: number;
  };
  status: ModuleProgressStatus;
  lessonsCompleted: number;
  lessonCount: number;
}

const statusConfig: Record<
  ModuleProgressStatus,
  { borderClass: string; opacityClass: string }
> = {
  locked: { borderClass: "border-steel", opacityClass: "opacity-50" },
  available: { borderClass: "border-steel", opacityClass: "" },
  in_progress: { borderClass: "border-violet/40", opacityClass: "" },
  completed: { borderClass: "border-correct/30", opacityClass: "" },
};

function StatusIcon({ status }: { status: ModuleProgressStatus }) {
  if (status === "locked") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ash"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }
  if (status === "completed") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-correct"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-violet border-t-transparent animate-spin" />
    );
  }
  // available
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-silver"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function ModuleCard({
  module,
  status,
  lessonsCompleted,
  lessonCount,
}: ModuleCardProps) {
  const { borderClass, opacityClass } = statusConfig[status];
  const color =
    degreeColors[module.module_order as keyof typeof degreeColors] ??
    colors.violet;
  const isLocked = status === "locked";

  const content = (
    <div
      className={`
        rounded-lg border bg-obsidian p-5 transition-colors
        ${borderClass} ${opacityClass}
        ${!isLocked ? "hover:bg-graphite/30 cursor-pointer" : "cursor-not-allowed"}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-ash uppercase tracking-wider mb-1">
            Module {module.module_order}
          </div>
          <h3 className="font-display text-lg text-ivory font-bold">
            {module.title}
          </h3>
          {module.description && (
            <p className="text-sm text-silver mt-1 line-clamp-2">
              {module.description}
            </p>
          )}
        </div>
        <div className="shrink-0 mt-1">
          <StatusIcon status={status} />
        </div>
      </div>

      {/* Progress bar */}
      {lessonCount > 0 && (
        <div className="mt-3">
          <ProgressBar
            value={lessonsCompleted}
            max={lessonCount}
            color={color}
            size="sm"
          />
          <div className="text-[10px] font-mono text-ash mt-1">
            {lessonsCompleted}/{lessonCount} lessons
          </div>
        </div>
      )}

      {/* Locked message */}
      {isLocked && module.module_order > 1 && (
        <div className="text-xs text-ash italic mt-2">
          Complete Module {module.module_order - 1} first
        </div>
      )}
    </div>
  );

  if (isLocked) return content;

  return <Link href={`/learn/module/${module.id}`}>{content}</Link>;
}
