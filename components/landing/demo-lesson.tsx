"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnswerCard } from "@/components/ui/answer-card";

interface DemoLessonProps {
  onBack: () => void;
  onComplete: () => void;
}

interface LessonStage {
  type: "teach" | "quiz";
  title?: string;
  body: string;
  options?: { id: string; label: string; degree?: 1 | 2 | 3 | 4 | 5 | 6 | 7 }[];
  correctAnswer?: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
}

const STAGES: LessonStage[] = [
  {
    type: "teach",
    title: "Meet Do",
    body: "Every melody has a home base \u2014 a note that everything else revolves around. In music, we call this the tonic, or Do. Before we name anything else, listen for the note that feels like \"home.\"",
  },
  {
    type: "teach",
    body: "When you hear a drone playing, that\u2019s Do. It\u2019s the foundation. Every other degree in the scale defines itself by how it relates to this one note.",
  },
  {
    type: "teach",
    body: "Do doesn\u2019t sound tense or restless. It sounds resolved \u2014 like arriving, not departing. That feeling of rest is what makes it tonic.",
  },
  {
    type: "quiz",
    body: "Which word best describes how Do (the tonic) feels?",
    options: [
      { id: "a", label: "Tense" },
      { id: "b", label: "Resolved" },
      { id: "c", label: "Unstable" },
      { id: "d", label: "Anxious" },
    ],
    correctAnswer: "b",
    correctFeedback: "Do is the point of rest. Every journey through the scale begins and ends here.",
    incorrectFeedback: "Do feels resolved \u2014 stable and at rest. It\u2019s the musical \"home\" that other degrees pull toward.",
  },
  {
    type: "teach",
    body: "In movable-do solf\u00E8ge, we sing this note as \"Do.\" In scale degree numbers, it\u2019s simply \"1.\" Both systems work \u2014 what matters is that you learn to feel this degree, not just name it.",
  },
  {
    type: "quiz",
    body: "Do is the ___ degree of the scale.",
    options: [
      { id: "a", label: "3rd" },
      { id: "b", label: "5th" },
      { id: "c", label: "1st", degree: 1 },
      { id: "d", label: "7th" },
    ],
    correctAnswer: "c",
    correctFeedback: "The 1st degree. The foundation everything else is built on.",
    incorrectFeedback: "Do is the 1st degree \u2014 the root of the scale and the center of tonal gravity.",
  },
  {
    type: "quiz",
    body: "If someone plays a scale and stops on the note that feels most \"complete,\" which degree did they land on?",
    options: [
      { id: "a", label: "Sol (5)", degree: 5 },
      { id: "b", label: "Do (1)", degree: 1 },
      { id: "c", label: "Mi (3)", degree: 3 },
      { id: "d", label: "Re (2)", degree: 2 },
    ],
    correctAnswer: "b",
    correctFeedback: "Do is where completeness lives. You\u2019ll learn to feel this instinctively.",
    incorrectFeedback: "The most \"complete\" feeling is Do (1) \u2014 the tonic. Sol (5) is stable but still wants to resolve to Do.",
  },
];

export function DemoLesson({ onBack, onComplete }: DemoLessonProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);

  const stage = STAGES[stageIndex]!;
  const totalStages = STAGES.length;
  const progress = ((stageIndex + 1) / totalStages) * 100;

  const handleAnswer = (optionId: string) => {
    if (revealed) return;
    setSelected(optionId);
    setRevealed(true);
    setQuizTotal((t) => t + 1);
    if (optionId === stage.correctAnswer) {
      setQuizCorrect((c) => c + 1);
    }
  };

  const advance = () => {
    if (stageIndex < totalStages - 1) {
      setStageIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      onComplete();
    }
  };

  const getCardState = (optionId: string) => {
    if (!revealed) return selected === optionId ? "selected" : ("default" as const);
    if (optionId === stage.correctAnswer) return "correct" as const;
    if (optionId === selected) return "incorrect" as const;
    return "disabled" as const;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-silver hover:text-ivory transition-colors text-sm font-mono"
        >
          &larr; Exit
        </button>
        <span className="text-silver/60 text-xs font-mono">
          Module 1 &middot; Lesson 1
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-steel overflow-hidden">
        <div
          className="h-full bg-coral rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage content */}
      <div className="w-full max-w-[500px] rounded-2xl border border-steel bg-obsidian p-7">
        {stage.title && (
          <h2 className="font-display text-2xl font-bold text-ivory mb-4">
            {stage.title}
          </h2>
        )}

        <p className="text-ivory/90 font-body text-[16px] leading-relaxed mb-6">
          {stage.body}
        </p>

        {stage.type === "quiz" && stage.options && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {stage.options.map((opt) => (
                <AnswerCard
                  key={opt.id}
                  label={opt.label}
                  state={getCardState(opt.id)}
                  degreeColor={opt.degree}
                  onClick={() => handleAnswer(opt.id)}
                  disabled={revealed}
                />
              ))}
            </div>

            {revealed && (
              <div
                className={`mt-3 rounded-lg px-4 py-3 text-sm font-body ${
                  selected === stage.correctAnswer
                    ? "bg-correct/10 text-correct border border-correct/30"
                    : "bg-incorrect/10 text-incorrect border border-incorrect/30"
                }`}
              >
                {selected === stage.correctAnswer
                  ? stage.correctFeedback
                  : stage.incorrectFeedback}
              </div>
            )}
          </>
        )}
      </div>

      {/* Continue button */}
      {(stage.type === "teach" || revealed) && (
        <Button fullWidth onClick={advance}>
          {stageIndex === totalStages - 1 ? "Finish lesson" : "Continue"}
        </Button>
      )}

      {/* Quiz score */}
      {quizTotal > 0 && (
        <div className="text-[11px] text-silver/40 font-mono">
          {quizCorrect}/{quizTotal} correct
        </div>
      )}
    </div>
  );
}
