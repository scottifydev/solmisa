"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ReviewQueueResponse, ReviewQueueItem, ReviewResult } from "@/types/srs";
import { submitReview } from "@/lib/actions/review";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SrsBadge } from "@/components/ui/srs-badge";
import { AnswerCard } from "@/components/ui/answer-card";

interface ReviewSessionProps {
  initialQueue: ReviewQueueResponse;
}

export function ReviewSession({ initialQueue }: ReviewSessionProps) {
  const router = useRouter();
  const [queue] = useState<ReviewQueueItem[]>(initialQueue.items);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef(Date.now());

  const total = queue.length;
  const currentCard = queue[currentIndex];
  const reviewed = correctCount + incorrectCount;

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handleAnswer = useCallback(async (result: ReviewResult) => {
    if (isSubmitting || !currentCard) return;
    setIsSubmitting(true);

    const responseTimeMs = Date.now() - startTimeRef.current;

    try {
      await submitReview({
        cardId: currentCard.cardId,
        result,
        responseTimeMs,
      });

      if (result === "correct") setCorrectCount((c) => c + 1);
      else if (result === "incorrect") setIncorrectCount((c) => c + 1);

      if (currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
        startTimeRef.current = Date.now();
      } else {
        setIsComplete(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [currentCard, currentIndex, total, isSubmitting]);

  if (isComplete) {
    const accuracy = reviewed > 0 ? Math.round((correctCount / reviewed) * 100) : 100;

    return (
      <div className="max-w-lg mx-auto p-6 text-center space-y-6">
        <div className="text-5xl">✨</div>
        <h1 className="font-display text-2xl font-bold text-ivory">Session Complete!</h1>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-steel bg-charcoal p-4">
            <div className="text-2xl font-display font-bold text-ivory">{reviewed}</div>
            <div className="text-silver text-xs">Reviewed</div>
          </div>
          <div className="rounded-xl border border-steel bg-charcoal p-4">
            <div className="text-2xl font-display font-bold text-correct">{accuracy}%</div>
            <div className="text-silver text-xs">Accuracy</div>
          </div>
          <div className="rounded-xl border border-steel bg-charcoal p-4">
            <div className="text-2xl font-display font-bold text-coral">{correctCount}</div>
            <div className="text-silver text-xs">Correct</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => router.push("/dashboard")}>
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

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-silver hover:text-ivory transition-colors text-sm"
          >
            ← Exit
          </button>
          <span className="text-silver text-sm font-mono">
            {currentIndex + 1} / {total}
          </span>
        </div>
        <ProgressBar value={currentIndex + 1} max={total} color="#FF6B6B" size="sm" />
      </div>

      {/* Card */}
      <div className="rounded-xl border border-steel bg-charcoal p-8 min-h-[200px] flex flex-col items-center justify-center text-center">
        <SrsBadge stage={currentCard.stage} size="sm" />

        <div className="mt-6 text-ivory font-display text-xl font-bold">
          {currentCard.front}
        </div>

        {isFlipped && (
          <div className="mt-4 pt-4 border-t border-steel w-full">
            <div className="text-silver text-sm mb-1">Answer</div>
            <div className="text-ivory text-lg">{currentCard.back}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isFlipped ? (
        <Button fullWidth onClick={handleFlip}>
          Show answer
        </Button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <AnswerCard
            label="Incorrect"
            state="default"
            onClick={() => handleAnswer("incorrect")}
            disabled={isSubmitting}
          />
          <AnswerCard
            label="Skip"
            state="default"
            onClick={() => handleAnswer("skip")}
            disabled={isSubmitting}
          />
          <AnswerCard
            label="Correct"
            state="default"
            onClick={() => handleAnswer("correct")}
            disabled={isSubmitting}
          />
        </div>
      )}

      {/* Score tally */}
      <div className="flex justify-center gap-6 text-sm">
        <span className="text-correct">✓ {correctCount}</span>
        <span className="text-incorrect">✗ {incorrectCount}</span>
      </div>
    </div>
  );
}
