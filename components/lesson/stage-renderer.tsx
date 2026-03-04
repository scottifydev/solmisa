"use client";

import { useState } from "react";
import type { StageRendererProps } from "@/types/lesson";
import { Button } from "@/components/ui/button";
import { AnswerCard } from "@/components/ui/answer-card";
import { AudioPlayer } from "@/components/ui/audio-player";

export function StageRenderer({ stage, onComplete, onAnswer }: StageRendererProps) {
  const config = stage.config;
  const type = stage.type;

  switch (type) {
    case "aural_teach":
      return <AuralTeach config={config} onComplete={onComplete} />;
    case "theory_teach":
      return <TheoryTeach config={config} onComplete={onComplete} />;
    case "aural_quiz":
      return <QuizStage config={config} onComplete={onComplete} onAnswer={onAnswer} />;
    case "theory_quiz":
      return <QuizStage config={config} onComplete={onComplete} onAnswer={onAnswer} />;
    case "practice":
      return <PracticeStage config={config} onComplete={onComplete} />;
    default:
      return (
        <div className="text-center text-silver p-8">
          <p>Unknown stage type: {type as string}</p>
          <Button variant="outline" className="mt-4" onClick={onComplete}>
            Skip
          </Button>
        </div>
      );
  }
}

function AuralTeach({
  config,
  onComplete,
}: {
  config: Record<string, unknown>;
  onComplete: () => void;
}) {
  const instructions = (config.instructions as string) ?? "Listen carefully to the audio.";
  const audioSrc = config.audioSrc as string | undefined;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-steel bg-charcoal p-6">
        <h2 className="font-display text-lg font-bold text-ivory mb-3">Listen</h2>
        <p className="text-silver">{instructions}</p>
      </div>

      {audioSrc && (
        <AudioPlayer src={audioSrc} label="Lesson audio" />
      )}

      <Button fullWidth onClick={onComplete}>
        I&apos;ve got it — Continue
      </Button>
    </div>
  );
}

function TheoryTeach({
  config,
  onComplete,
}: {
  config: Record<string, unknown>;
  onComplete: () => void;
}) {
  const content = (config.content as string) ?? "";
  const notation = config.notation as string | undefined;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-steel bg-charcoal p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-ivory">Theory</h2>
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
  config,
  onComplete,
  onAnswer,
}: {
  config: Record<string, unknown>;
  onComplete: () => void;
  onAnswer?: (correct: boolean) => void;
}) {
  const question = (config.question as string) ?? "Choose the correct answer:";
  const audioSrc = config.audioSrc as string | undefined;
  const correctAnswer = config.correctAnswer as string;
  const options = (config.options as Array<{ id: string; label: string; sublabel?: string; degree?: number }>) ?? [];

  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (optionId: string) => {
    if (revealed) return;
    setSelected(optionId);
  };

  const handleCheck = () => {
    if (!selected) return;
    const isCorrect = selected === correctAnswer;
    onAnswer?.(isCorrect);
    setRevealed(true);
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
      <div>
        <h2 className="font-display text-lg font-bold text-ivory">{question}</h2>
      </div>

      {audioSrc && (
        <AudioPlayer src={audioSrc} label="Listen" variant="standalone" />
      )}

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

      {!revealed ? (
        <Button fullWidth disabled={!selected} onClick={handleCheck}>
          Check
        </Button>
      ) : (
        <Button fullWidth onClick={onComplete}>
          {selected === correctAnswer ? "Continue" : "Got it — Continue"}
        </Button>
      )}
    </div>
  );
}

function PracticeStage({
  config,
  onComplete,
}: {
  config: Record<string, unknown>;
  onComplete: () => void;
}) {
  const instructions = (config.instructions as string) ?? "Practice the exercise below.";
  const audioSrc = config.audioSrc as string | undefined;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-steel bg-charcoal p-6">
        <h2 className="font-display text-lg font-bold text-ivory mb-3">Practice</h2>
        <p className="text-silver">{instructions}</p>
      </div>

      {audioSrc && (
        <AudioPlayer src={audioSrc} label="Reference audio" />
      )}

      <Button fullWidth onClick={onComplete}>
        Done practicing — Continue
      </Button>
    </div>
  );
}
