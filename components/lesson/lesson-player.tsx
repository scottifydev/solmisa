"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/types/lesson";
import type { StageQuizResult } from "@/types/lesson";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { semanticColors } from "@/lib/tokens";
import { completeLesson } from "@/lib/actions/lessons";
import { seedCardsFromLesson } from "@/lib/lessons/seed-cards";
import { StageRenderer } from "./stage-renderer";

interface LessonPlayerProps {
  lesson: Lesson;
  moduleTitle?: string;
  totalLessons?: number;
  userId?: string;
}

export function LessonPlayer({
  lesson,
  moduleTitle = "Module",
  totalLessons = 1,
  userId,
}: LessonPlayerProps) {
  const router = useRouter();
  const [results, setResults] = useState<StageQuizResult[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [, setCardsSeeded] = useState(0);

  const handleComplete = useCallback((quizResults: StageQuizResult[]) => {
    setResults(quizResults);
  }, []);

  const handleFinish = async () => {
    setSaving(true);

    // Seed SRS cards from quiz results
    if (userId && results) {
      try {
        const seedResult = await seedCardsFromLesson({
          user_id: userId,
          lesson_id: lesson.id,
          stage_results: results,
        });
        setCardsSeeded(seedResult.cards_seeded);
      } catch {
        // Don't block completion on seeding failure
      }
    }

    await completeLesson(lesson.id);
    router.push("/learn");
    router.refresh();
  };

  if (results !== null) {
    const quizCount = results.length;
    const correctCount = results.filter((r) => r.correct).length;
    const accuracy =
      quizCount > 0 ? Math.round((correctCount / quizCount) * 100) : 100;

    return (
      <div className="max-w-lg mx-auto p-6 text-center space-y-6">
        <h1 className="font-display text-2xl font-bold text-ivory">
          Lesson Complete
        </h1>
        <p className="text-silver">{lesson.title}</p>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Accuracy"
            value={`${accuracy}%`}
            color={semanticColors.correct}
          />
          <StatCard label="Questions" value={`${correctCount}/${quizCount}`} />
        </div>

        <Button fullWidth loading={saving} onClick={handleFinish}>
          Continue
        </Button>
      </div>
    );
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
