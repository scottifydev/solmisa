"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/types/lesson";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { completeLesson } from "@/lib/actions/lessons";
import { StageRenderer } from "./stage-renderer";

interface LessonPlayerProps {
  lesson: Lesson;
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const router = useRouter();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalStages = lesson.stages.length;
  const currentStage = lesson.stages[currentStageIndex];
  const progress = totalStages > 0 ? ((currentStageIndex + 1) / totalStages) * 100 : 0;

  const handleStageComplete = useCallback(() => {
    if (currentStageIndex < totalStages - 1) {
      setCurrentStageIndex((i) => i + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentStageIndex, totalStages]);

  const handleAnswer = useCallback((correct: boolean) => {
    setTotalAnswers((t) => t + 1);
    if (correct) setCorrectCount((c) => c + 1);
  }, []);

  const handleFinish = async () => {
    setSaving(true);
    await completeLesson(lesson.id);
    router.push("/learn");
    router.refresh();
  };

  if (isComplete) {
    const accuracy = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 100;

    return (
      <div className="max-w-lg mx-auto p-6 text-center space-y-6">
        <div className="text-5xl">🎉</div>
        <h1 className="font-display text-2xl font-bold text-ivory">Lesson Complete!</h1>
        <p className="text-silver">{lesson.title}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-steel bg-charcoal p-4">
            <div className="text-2xl font-display font-bold text-correct">{accuracy}%</div>
            <div className="text-silver text-sm">Accuracy</div>
          </div>
          <div className="rounded-xl border border-steel bg-charcoal p-4">
            <div className="text-2xl font-display font-bold text-ivory">{totalStages}</div>
            <div className="text-silver text-sm">Stages</div>
          </div>
        </div>

        <Button fullWidth loading={saving} onClick={handleFinish}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header with progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-silver hover:text-ivory transition-colors text-sm"
          >
            ← Back
          </button>
          <span className="text-silver text-sm font-mono">
            {currentStageIndex + 1} / {totalStages}
          </span>
        </div>
        <ProgressBar value={progress} color="#FF6B6B" size="sm" />
        <h1 className="font-display text-xl font-bold text-ivory">{lesson.title}</h1>
        <p className="text-silver text-xs">{lesson.moduleTitle}</p>
      </div>

      {/* Stage content */}
      {currentStage && (
        <StageRenderer
          stage={currentStage}
          onComplete={handleStageComplete}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
