"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Lesson } from "@/types/lesson";
import { Button } from "@/components/ui/button";
import { completeLesson, getCompletionContext } from "@/lib/actions/lessons";
import type { CompletionContext } from "@/lib/actions/lessons";
import { seedLessonCardsV2 } from "@/lib/lessons/seed-cards";
import { StageRenderer } from "./stage-renderer";

interface LessonPlayerProps {
  lesson: Lesson;
  moduleTitle?: string;
  totalLessons?: number;
  userId?: string;
}

interface CompletionData {
  stagesCompleted: number;
  seededCards: Array<{ slug: string; initial_interval: string }>;
  context: CompletionContext;
}

function CompletionSummary({
  lesson,
  data,
}: {
  lesson: Lesson;
  data: CompletionData;
}) {
  const { stagesCompleted, seededCards, context } = data;

  return (
    <div className="max-w-lg mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold text-ivory">
          Lesson Complete
        </h1>
        <p className="text-silver">{lesson.title}</p>
        <p className="text-sm text-ash">
          {stagesCompleted} stage{stagesCompleted !== 1 ? "s" : ""} completed
        </p>
      </div>

      {seededCards.length > 0 && (
        <div className="rounded-lg border border-steel bg-obsidian p-4 space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-ash">
            Unlocked for Review
          </h2>
          <ul className="space-y-1">
            {seededCards.map((card) => (
              <li
                key={card.slug}
                className="flex items-center gap-2 text-sm text-ivory"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-violet" />
                {card.slug.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lesson.unlocks_drills.length > 0 && (
        <div className="rounded-lg border border-steel bg-obsidian p-4 space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-ash">
            Unlocked for Practice
          </h2>
          <ul className="space-y-1">
            {lesson.unlocks_drills.map((drill) => (
              <li
                key={drill}
                className="flex items-center gap-2 text-sm text-ivory"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-correct" />
                {drill.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {seededCards.length > 0 && (
        <p className="text-sm text-ash text-center">
          {seededCards.length} new review item
          {seededCards.length !== 1 ? "s" : ""} added — they{"'"}ll appear in
          your next review session.
        </p>
      )}

      <div className="space-y-3">
        {lesson.unlocks_drills.length > 0 && (
          <Link
            href={`/practice/${lesson.unlocks_drills[0]}`}
            className="block"
          >
            <Button fullWidth>Try a practice drill</Button>
          </Link>
        )}

        {context.nextLesson && (
          <Link href={`/learn/${context.nextLesson.id}`} className="block">
            <Button
              fullWidth
              variant={lesson.unlocks_drills.length > 0 ? "outline" : "primary"}
            >
              Next: {context.nextLesson.title}
            </Button>
          </Link>
        )}

        {context.dueCardCount > 0 && (
          <Link href="/review" className="block">
            <Button fullWidth variant="outline">
              Start Review ({context.dueCardCount} card
              {context.dueCardCount !== 1 ? "s" : ""} due)
            </Button>
          </Link>
        )}

        {!context.nextLesson &&
          lesson.unlocks_drills.length === 0 &&
          context.otherTracksWithContent.length > 0 && (
            <Link href="/learn" className="block">
              <Button fullWidth variant="secondary">
                Explore other tracks
              </Button>
            </Link>
          )}

        {!context.nextLesson &&
          lesson.unlocks_drills.length === 0 &&
          context.dueCardCount === 0 && (
            <Link href="/learn" className="block">
              <Button fullWidth>Back to Learn</Button>
            </Link>
          )}
      </div>
    </div>
  );
}

export function LessonPlayer({
  lesson,
  moduleTitle = "Module",
  totalLessons = 1,
  userId,
}: LessonPlayerProps) {
  const router = useRouter();
  const [completionData, setCompletionData] = useState<CompletionData | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const handleComplete = useCallback(
    async (count: number) => {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaving(true);

      let seededCards: CompletionData["seededCards"] = [];
      let context: CompletionContext = {
        nextLesson: null,
        dueCardCount: 0,
        otherTracksWithContent: [],
      };

      try {
        const [seedResult, ctx] = await Promise.all([
          userId
            ? seedLessonCardsV2(userId, lesson.id).catch(() => null)
            : Promise.resolve(null),
          getCompletionContext(lesson.id).catch(() => context),
          completeLesson(lesson.id).catch(() => {}),
        ]);

        seededCards = seedResult?.cards ?? [];
        context = ctx;
      } catch {
        // Don't block completion screen
      }

      setSaving(false);
      setCompletionData({ stagesCompleted: count, seededCards, context });
      router.refresh();
    },
    [userId, lesson.id, router],
  );

  if (saving) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center space-y-4">
        <div className="w-8 h-8 mx-auto rounded-full border-2 border-violet border-t-transparent animate-spin" />
        <p className="text-silver text-sm">Saving progress...</p>
      </div>
    );
  }

  if (completionData) {
    return <CompletionSummary lesson={lesson} data={completionData} />;
  }

  return (
    <div className="p-6">
      <StageRenderer
        lesson={{
          module_title: moduleTitle,
          lesson_title: lesson.title,
          lesson_num: lesson.lesson_order,
          total_lessons: totalLessons,
          drone_key: lesson.drone_key,
          allowed_keys: [],
          stages: lesson.stages,
        }}
        onComplete={handleComplete}
      />
    </div>
  );
}
