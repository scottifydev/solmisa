"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ReviewQueueResponse, ReviewQueueItem } from "@/types/srs";
import { submitReview } from "@/lib/actions/review";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/ui/stat-card";
import { SrsBadge } from "@/components/ui/srs-badge";
import { AnswerCard } from "@/components/ui/answer-card";
import { colors, semanticColors } from "@/lib/tokens";
import { stageToGroup } from "@/lib/srs/stages";

interface ReviewSessionProps {
  initialQueue: ReviewQueueResponse;
}

export function ReviewSession({ initialQueue }: ReviewSessionProps) {
  const router = useRouter();
  const [queue] = useState<ReviewQueueItem[]>(initialQueue.items);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef(Date.now());

  const total = queue.length;
  const currentCard = queue[currentIndex];
  const reviewed = correctCount + incorrectCount;

  const options = (currentCard?.options_data ?? []) as {
    id: string;
    label: string;
    sublabel?: string;
    degree?: number;
  }[];
  const correctAnswer = (currentCard?.answer_data as { correct_answer?: string })
    ?.correct_answer;

  const handleSelect = useCallback(
    (optionId: string) => {
      if (revealed) return;
      setSelected(optionId);
    },
    [revealed]
  );

  const handleCheck = useCallback(async () => {
    if (!selected || !currentCard || isSubmitting) return;
    setIsSubmitting(true);

    const isCorrect = selected === correctAnswer;
    setRevealed(true);

    if (isCorrect) setCorrectCount((c) => c + 1);
    else setIncorrectCount((c) => c + 1);

    const responseTimeMs = Date.now() - startTimeRef.current;

    try {
      await submitReview({
        user_card_state_id: currentCard.card_instance_id,
        correct: isCorrect,
        response_time_ms: responseTimeMs,
        response: { selected },
      });
    } catch {
      // Silently handle — don't block UI
    }

    // Show feedback briefly, then advance
    setTimeout(() => {
      if (currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setRevealed(false);
        startTimeRef.current = Date.now();
      } else {
        setIsComplete(true);
      }
      setIsSubmitting(false);
    }, 1200);
  }, [selected, currentCard, correctAnswer, currentIndex, total, isSubmitting]);

  if (isComplete) {
    const accuracy =
      reviewed > 0 ? Math.round((correctCount / reviewed) * 100) : 100;

    return (
      <div className="max-w-lg mx-auto p-6 text-center space-y-6">
        <div className="text-5xl">&#x2728;</div>
        <h1 className="font-display text-2xl font-bold text-ivory">
          Session Complete!
        </h1>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Reviewed" value={reviewed} />
          <StatCard
            label="Accuracy"
            value={`${accuracy}%`}
            color={semanticColors.correct}
          />
          <StatCard label="Correct" value={correctCount} color={colors.coral} />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </Button>
          <Button fullWidth onClick={() => router.refresh()}>
            Review more
          </Button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  const getCardState = (optionId: string) => {
    if (!revealed) {
      return selected === optionId ? "selected" : "default";
    }
    if (optionId === correctAnswer) return "correct";
    if (optionId === selected && optionId !== correctAnswer) return "incorrect";
    return "disabled";
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-silver hover:text-ivory transition-colors text-sm"
          >
            &larr; Exit
          </button>
          <span className="text-silver text-sm font-mono">
            {currentIndex + 1} / {total}
          </span>
        </div>
        <ProgressBar value={currentIndex + 1} max={total} size="sm" />
      </div>

      {/* Question */}
      <div className="rounded-xl border border-steel bg-obsidian p-8 text-center">
        <SrsBadge stage={stageToGroup(currentCard.srs_stage)} size="sm" />
        <div className="mt-6 text-ivory font-display text-xl font-bold">
          {currentCard.prompt_rendered}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <AnswerCard
            key={opt.id}
            label={opt.label}
            sublabel={opt.sublabel}
            state={getCardState(opt.id)}
            degreeColor={
              opt.degree as 1 | 2 | 3 | 4 | 5 | 6 | 7 | undefined
            }
            onClick={() => handleSelect(opt.id)}
            disabled={revealed}
          />
        ))}
      </div>

      {/* Check button */}
      {!revealed && (
        <Button
          fullWidth
          disabled={!selected || isSubmitting}
          onClick={handleCheck}
        >
          Check
        </Button>
      )}

      {/* Score tally */}
      <div className="flex justify-center gap-6 text-sm">
        <span className="text-correct">&#x2713; {correctCount}</span>
        <span className="text-incorrect">&#x2717; {incorrectCount}</span>
      </div>
    </div>
  );
}
