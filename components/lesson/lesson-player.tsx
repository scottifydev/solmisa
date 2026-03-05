"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/types/lesson";
import { Button } from "@/components/ui/button";
import { completeLesson } from "@/lib/actions/lessons";
import { seedLessonCardsV2 } from "@/lib/lessons/seed-cards";
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
  const [stagesCompleted, setStagesCompleted] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleComplete = useCallback((count: number) => {
    setStagesCompleted(count);
  }, []);

  const handleFinish = async () => {
    setSaving(true);
    try {
      if (userId) {
        try {
          await seedLessonCardsV2(userId, lesson.id);
        } catch {
          // Don't block completion on seeding failure
        }
      }

      try {
        await completeLesson(lesson.id);
      } catch {
        // Don't block navigation on completion tracking failure
      }
      router.push("/learn");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  if (stagesCompleted !== null) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center space-y-6">
        <h1 className="font-display text-2xl font-bold text-ivory">
          Lesson Complete
        </h1>
        <p className="text-silver">{lesson.title}</p>
        <p className="text-sm text-shadow">
          {stagesCompleted} stage{stagesCompleted !== 1 ? "s" : ""} completed
        </p>
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
