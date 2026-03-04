import Link from "next/link";
import type { LessonProgressStatus } from "@/types/lesson";

interface LessonListItemProps {
  lesson: {
    id: string;
    title: string;
    lesson_order: number;
  };
  moduleOrder: number;
  status: LessonProgressStatus;
  score?: number | null;
  isNext: boolean;
}

function StatusIndicator({
  status,
  isNext,
}: {
  status: LessonProgressStatus;
  isNext: boolean;
}) {
  if (status === "completed") {
    return (
      <div className="w-6 h-6 rounded-full bg-correct/20 flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-correct">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="w-6 h-6 rounded-full border-2 border-coral flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-coral" />
      </div>
    );
  }
  // not_started
  if (isNext) {
    return (
      <div className="w-6 h-6 rounded-full bg-coral/20 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
      </div>
    );
  }
  return <div className="w-6 h-6 rounded-full border border-steel" />;
}

function ActionChip({
  status,
  isNext,
  score,
}: {
  status: LessonProgressStatus;
  isNext: boolean;
  score?: number | null;
}) {
  if (status === "completed" && score != null) {
    return (
      <span className="text-sm font-mono text-ash">{Math.round(score)}%</span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-graphite text-coral font-mono">
        Continue
      </span>
    );
  }
  if (isNext) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-coral text-night font-mono">
        Start
      </span>
    );
  }
  return null;
}

export function LessonListItem({
  lesson,
  moduleOrder,
  status,
  score,
  isNext,
}: LessonListItemProps) {
  const textColor = status === "not_started" && !isNext ? "text-silver" : "text-ivory";

  return (
    <Link
      href={`/learn/${lesson.id}`}
      className="flex items-center gap-3 py-3 px-4 hover:bg-graphite/50 transition-colors rounded-md"
    >
      <StatusIndicator status={status} isNext={isNext} />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-mono text-ash mr-2">
          {moduleOrder}.{lesson.lesson_order}
        </span>
        <span className={`text-sm font-body ${textColor}`}>{lesson.title}</span>
      </div>
      <ActionChip status={status} isNext={isNext} score={score} />
    </Link>
  );
}
