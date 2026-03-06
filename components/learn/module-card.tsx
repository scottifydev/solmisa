"use client";

import { useState } from "react";
import Link from "next/link";
import type { ModuleProgressStatus, LessonSummary } from "@/types/lesson";
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
  lessons?: LessonSummary[];
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

function LessonRow({
  lesson,
  moduleOrder,
  isAvailable,
  prerequisiteTitle,
}: {
  lesson: LessonSummary;
  moduleOrder: number;
  isAvailable: boolean;
  prerequisiteTitle?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center gap-3">
        {lesson.isCompleted ? (
          <div className="w-5 h-5 rounded-full bg-correct/20 flex items-center justify-center">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-correct"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ) : isAvailable ? (
          <div className="w-5 h-5 rounded-full bg-violet/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-violet" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-steel" />
        )}
        <span className="text-[10px] font-mono text-ash">
          {moduleOrder}.{lesson.lesson_order}
        </span>
        <span
          className={`text-sm ${lesson.isCompleted || isAvailable ? "text-ivory" : "text-silver"}`}
        >
          {lesson.title}
        </span>
      </div>
      {!isAvailable && prerequisiteTitle && (
        <p className="text-[11px] text-ash italic ml-8 mt-0.5">
          Complete &ldquo;{prerequisiteTitle}&rdquo; to unlock
        </p>
      )}
    </>
  );

  if (!isAvailable) {
    return <div className="py-2.5 px-3 rounded-md opacity-40">{inner}</div>;
  }

  return (
    <Link
      href={`/learn/${lesson.id}`}
      className="block py-2.5 px-3 rounded-md transition-colors hover:bg-graphite/50"
    >
      {inner}
    </Link>
  );
}

export function ModuleCard({
  module,
  status,
  lessonsCompleted,
  lessonCount,
  lessons,
}: ModuleCardProps) {
  const [expanded, setExpanded] = useState(
    status === "in_progress" || status === "available",
  );
  const { borderClass, opacityClass } = statusConfig[status];
  const color =
    degreeColors[module.module_order as keyof typeof degreeColors] ??
    colors.violet;
  const isLocked = status === "locked";

  const handleToggle = () => {
    if (!isLocked) setExpanded((e) => !e);
  };

  // Determine lesson availability: sequential within module
  const getLessonAvailability = (lessonIndex: number): boolean => {
    if (isLocked) return false;
    if (!lessons) return false;
    if (lessonIndex === 0) return true; // First lesson always available
    const prevLesson = lessons[lessonIndex - 1];
    return prevLesson?.isCompleted ?? false;
  };

  return (
    <div
      className={`rounded-lg border bg-obsidian transition-colors ${borderClass} ${opacityClass}`}
    >
      <button
        onClick={handleToggle}
        className={`w-full p-5 text-left ${!isLocked ? "cursor-pointer" : "cursor-not-allowed"}`}
        disabled={isLocked}
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
          <div className="shrink-0 mt-1 flex items-center gap-2">
            <StatusIcon status={status} />
            {!isLocked && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`text-ash transition-transform ${expanded ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </div>
        </div>

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

        {isLocked && module.module_order > 1 && (
          <div className="text-xs text-ash italic mt-2">
            Complete Module {module.module_order - 1} first
          </div>
        )}
      </button>

      {/* Expandable lesson list */}
      {expanded && lessons && lessons.length > 0 && (
        <div className="border-t border-steel px-3 py-2 space-y-0.5">
          {lessons.map((lesson, i) => {
            const available = getLessonAvailability(i);
            const prerequisiteTitle =
              !available && i > 0 ? lessons[i - 1]?.title : undefined;
            return (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                moduleOrder={module.module_order}
                isAvailable={available}
                prerequisiteTitle={prerequisiteTitle}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
