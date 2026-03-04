"use client";

import { useState } from "react";
import type { StageRendererProps, StageQuizResult, LessonStage } from "@/types/lesson";
import { Button } from "@/components/ui/button";
import { AnswerCard } from "@/components/ui/answer-card";

export function StageRenderer({ stage, stageIndex, droneKey, onComplete }: StageRendererProps) {
  switch (stage.type) {
    case "aural_teach":
      return (
        <AuralTeach
          instructions={stage.instructions}
          onComplete={() => onComplete(null)}
        />
      );
    case "theory_teach":
      return (
        <TheoryTeach
          title={stage.title}
          content={stage.content}
          notation={stage.notation}
          onComplete={() => onComplete(null)}
        />
      );
    case "aural_quiz":
      return (
        <QuizStage
          prompt={stage.prompt}
          options={stage.options}
          correctAnswer={stage.correct_answer}
          stageIndex={stageIndex}
          stageType="aural_quiz"
          seedsCard={stage.seeds_card ?? null}
          onComplete={onComplete}
        />
      );
    case "theory_quiz":
      return (
        <QuizStage
          prompt={stage.prompt}
          options={stage.options}
          correctAnswer={stage.correct_answer}
          stageIndex={stageIndex}
          stageType="theory_quiz"
          seedsCard={stage.seeds_card ?? null}
          onComplete={onComplete}
        />
      );
    case "rhythm":
      return (
        <div className="space-y-6">
          <div className="rounded-xl border border-steel bg-obsidian p-6">
            <h2 className="font-display text-lg font-bold text-ivory mb-3">Rhythm</h2>
            <p className="text-silver">Rhythm stages coming soon.</p>
          </div>
          <Button fullWidth onClick={() => onComplete(null)}>
            Continue
          </Button>
        </div>
      );
    default:
      return (
        <div className="text-center text-silver p-8">
          <p>Unknown stage type</p>
          <Button variant="outline" className="mt-4" onClick={() => onComplete(null)}>
            Skip
          </Button>
        </div>
      );
  }
}

function AuralTeach({
  instructions,
  onComplete,
}: {
  instructions: string;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-steel bg-obsidian p-6">
        <h2 className="font-display text-lg font-bold text-ivory mb-3">Listen</h2>
        <p className="text-silver">{instructions}</p>
      </div>
      <Button fullWidth onClick={onComplete}>
        I&apos;ve got it — Continue
      </Button>
    </div>
  );
}

function TheoryTeach({
  title,
  content,
  notation,
  onComplete,
}: {
  title: string;
  content: string;
  notation?: string;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-steel bg-obsidian p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-ivory">{title}</h2>
        <div className="text-silver whitespace-pre-wrap">{content}</div>
        {notation && (
          <div className="bg-night rounded-lg p-4 font-mono text-sm text-ivory">
            {notation}
          </div>
        )}
      </div>
      <Button fullWidth onClick={onComplete}>
        Continue
      </Button>
    </div>
  );
}

function QuizStage({
  prompt,
  options,
  correctAnswer,
  stageIndex,
  stageType,
  seedsCard,
  onComplete,
}: {
  prompt: string;
  options: { id: string; label: string; sublabel?: string; degree?: number }[];
  correctAnswer: string;
  stageIndex: number;
  stageType: "aural_quiz" | "theory_quiz";
  seedsCard: string | null;
  onComplete: (result: StageQuizResult | null) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [startTime] = useState(Date.now());

  const handleSelect = (optionId: string) => {
    if (revealed) return;
    setSelected(optionId);
  };

  const handleCheck = () => {
    if (!selected) return;
    const isCorrect = selected === correctAnswer;
    setRevealed(true);

    const result: StageQuizResult = {
      stage_index: stageIndex,
      stage_type: stageType,
      correct: isCorrect,
      response_time_ms: Date.now() - startTime,
      seeds_card: seedsCard,
      card_category: stageType === "aural_quiz" ? "perceptual" : "declarative",
    };

    // Delay to show feedback, then complete
    setTimeout(() => onComplete(result), 1200);
  };

  const getCardState = (optionId: string) => {
    if (!revealed) {
      return selected === optionId ? "selected" : "default";
    }
    if (optionId === correctAnswer) return "correct";
    if (optionId === selected) return "incorrect";
    return "disabled";
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-bold text-ivory">{prompt}</h2>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <AnswerCard
            key={opt.id}
            label={opt.label}
            sublabel={opt.sublabel}
            state={getCardState(opt.id)}
            degreeColor={opt.degree as 1 | 2 | 3 | 4 | 5 | 6 | 7 | undefined}
            onClick={() => handleSelect(opt.id)}
            disabled={revealed}
          />
        ))}
      </div>

      {!revealed && (
        <Button fullWidth disabled={!selected} onClick={handleCheck}>
          Check
        </Button>
      )}
    </div>
  );
}
