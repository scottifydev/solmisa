"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import type { ReviewQueueItem } from "@/types/srs";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SrsBadge } from "@/components/ui/srs-badge";
import { AnswerCard } from "@/components/ui/answer-card";

interface AnonymousReviewSessionProps {
  cards: ReviewQueueItem[];
}

const GATE_AFTER_CARD = 3;

export function AnonymousReviewSession({ cards }: AnonymousReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isGated, setIsGated] = useState(false);
  const startTimeRef = useRef(Date.now());

  const total = cards.length;
  const currentCard = cards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
    if (currentIndex >= GATE_AFTER_CARD) {
      setIsGated(true);
    }
  }, [currentIndex]);

  const handleAnswer = useCallback((result: "correct" | "incorrect" | "skip") => {
    if (result === "correct") setCorrectCount((c) => c + 1);
    else if (result === "incorrect") setIncorrectCount((c) => c + 1);

    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
      startTimeRef.current = Date.now();
    }
  }, [currentIndex, total]);

  if (!currentCard) return null;

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-silver text-sm">Demo Review</span>
          <span className="text-silver text-sm font-mono">
            {currentIndex + 1} / {total}
          </span>
        </div>
        <ProgressBar value={currentIndex + 1} max={total} size="sm" />
      </div>

      {/* Card */}
      <div className="relative rounded-xl border border-steel bg-charcoal p-8 min-h-[200px] flex flex-col items-center justify-center text-center">
        <SrsBadge stage={currentCard.stage} size="sm" />

        <div className="mt-6 text-ivory font-display text-xl font-bold">
          {currentCard.front}
        </div>

        {isFlipped && !isGated && (
          <div className="mt-4 pt-4 border-t border-steel w-full">
            <div className="text-silver text-sm mb-1">Answer</div>
            <div className="text-ivory text-lg">{currentCard.back}</div>
          </div>
        )}
      </div>

      {/* Gate overlay — shown after flipping card 4 */}
      {isGated && (
        <div className="rounded-xl border border-coral/30 bg-charcoal p-8 text-center space-y-4">
          <h2 className="font-display text-xl font-bold text-ivory">
            Sign up to keep going
          </h2>
          <p className="text-silver">
            12 more cards waiting for you. Your progress, streak, and mastery &mdash; all saved automatically.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg bg-coral text-white font-body font-medium hover:bg-coral/90 transition-colors"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="text-silver hover:text-ivory transition-colors text-sm"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      )}

      {/* Actions — only show when not gated */}
      {!isGated && (
        <>
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
              />
              <AnswerCard
                label="Skip"
                state="default"
                onClick={() => handleAnswer("skip")}
              />
              <AnswerCard
                label="Correct"
                state="default"
                onClick={() => handleAnswer("correct")}
              />
            </div>
          )}

          {/* Score tally */}
          <div className="flex justify-center gap-6 text-sm">
            <span className="text-correct">&#10003; {correctCount}</span>
            <span className="text-incorrect">&#10007; {incorrectCount}</span>
          </div>
        </>
      )}
    </div>
  );
}
