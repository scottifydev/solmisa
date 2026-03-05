"use client";

import { useState } from "react";
import { AssessmentCard } from "./assessment-card";
import { submitAssessmentAnswer } from "@/lib/actions/assessment";
import type { AssessmentQuestion } from "@/lib/actions/assessment";
import { Button } from "@/components/ui/button";

interface OnboardingAssessmentProps {
  questions: AssessmentQuestion[];
  onComplete: () => void;
  onBack: () => void;
}

export function OnboardingAssessment({
  questions,
  onComplete,
  onBack,
}: OnboardingAssessmentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const q of questions) {
      if (q.selected_option !== null) {
        map.set(q.id, q.selected_option);
      }
    }
    return map;
  });

  const current = questions[currentIndex];
  if (!current) return null;

  const totalQuestions = questions.length;
  const answeredCount = answers.size;

  const handleAnswer = async (optionIndex: number) => {
    try {
      await submitAssessmentAnswer(current.id, optionIndex);
      setAnswers((prev) => new Map(prev).set(current.id, optionIndex));

      // Auto-advance after a brief pause
      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((i) => i + 1);
        }
      }, 300);
    } catch {
      // Keep current question visible on failure — user can retry
    }
  };

  const handleSkip = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const isLast = currentIndex === totalQuestions - 1;
  const canFinish = answeredCount >= 3; // minimum 3 answers to proceed

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-ivory">
          Quick skill assessment
        </h2>
        <p className="text-silver text-sm mt-1">
          Help us understand your musical background
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-steel rounded-full overflow-hidden">
          <div
            className="h-full bg-violet rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-[11px] font-mono text-silver/60 shrink-0">
          {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      <AssessmentCard
        key={current.id}
        questionText={current.question_text}
        options={current.options}
        selectedOption={answers.get(current.id) ?? null}
        onAnswer={handleAnswer}
        showSkip
        onSkip={handleSkip}
      />

      <div className="flex gap-3">
        {currentIndex > 0 ? (
          <Button variant="ghost" onClick={() => setCurrentIndex((i) => i - 1)}>
            Back
          </Button>
        ) : (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        )}
        {isLast || canFinish ? (
          <Button fullWidth onClick={onComplete}>
            {isLast ? "Finish" : "Skip remaining"}
          </Button>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
