"use client";

import { useState } from "react";
import { AssessmentCard } from "./assessment-card";
import { submitAssessmentAnswer } from "@/lib/actions/assessment";
import type { AssessmentQuestion } from "@/lib/actions/assessment";

interface TrickleQuestionProps {
  question: AssessmentQuestion;
}

export function TrickleQuestion({ question }: TrickleQuestionProps) {
  const [dismissed, setDismissed] = useState(false);
  const [answered, setAnswered] = useState(false);

  if (dismissed || answered) return null;

  const handleAnswer = async (optionIndex: number) => {
    try {
      await submitAssessmentAnswer(question.id, optionIndex);
      setAnswered(true);
    } catch {
      // Keep card visible on failure — user can retry
    }
  };

  return (
    <div className="rounded-xl border border-steel bg-obsidian p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] tracking-[1.5px] uppercase text-silver/60 font-mono">
          Quick Question
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-silver/40 hover:text-silver text-xs transition-colors"
        >
          Not now
        </button>
      </div>
      <AssessmentCard
        questionText={question.question_text}
        options={question.options}
        selectedOption={null}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
