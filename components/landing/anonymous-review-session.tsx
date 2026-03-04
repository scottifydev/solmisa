"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { DemoReviewCard } from "@/lib/data/demo-data";
import { AnswerCard } from "@/components/ui/answer-card";
import { SrsBadge } from "@/components/ui/srs-badge";
import { srsStageColors } from "@/lib/tokens";

interface AnonymousReviewSessionProps {
  cards: DemoReviewCard[];
}

const GATE_AFTER_CARD = 3;

export function AnonymousReviewSession({ cards }: AnonymousReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<(boolean | null)[]>([]);
  const [isGated, setIsGated] = useState(false);

  const total = cards.length;
  const currentCard = cards[currentIndex];
  const correctCount = results.filter((r) => r === true).length;

  const handleSelect = useCallback(
    (optionId: string) => {
      if (revealed || isGated) return;
      setSelected(optionId);
      setRevealed(true);

      const isCorrect = optionId === currentCard.correctAnswer;
      const newResults = [...results, isCorrect];
      setResults(newResults);

      // Auto-advance after feedback
      setTimeout(() => {
        if (currentIndex + 1 >= GATE_AFTER_CARD) {
          setIsGated(true);
        } else if (currentIndex < total - 1) {
          setCurrentIndex((i) => i + 1);
          setSelected(null);
          setRevealed(false);
        }
      }, 1800);
    },
    [revealed, isGated, currentCard, currentIndex, total, results]
  );

  const getCardState = (optionId: string) => {
    if (!revealed) {
      return selected === optionId ? "selected" : ("default" as const);
    }
    if (optionId === currentCard.correctAnswer) return "correct" as const;
    if (optionId === selected) return "incorrect" as const;
    return "disabled" as const;
  };

  if (!currentCard) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ivory tracking-tight">
          Review Session
        </h1>
        <p className="text-silver/60 text-[13px] font-mono mt-1">
          {correctCount}/{results.length} correct
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {cards.map((_, i) => {
          const isActive = i === currentIndex && !isGated;
          const result = results[i];
          let bg = "bg-steel";
          if (result === true) bg = "bg-correct";
          else if (result === false) bg = "bg-incorrect";
          else if (isActive) bg = "bg-coral";

          return (
            <div
              key={i}
              className={`h-[7px] rounded-full transition-all duration-300 ${bg}`}
              style={{ width: isActive ? 22 : 7 }}
            />
          );
        })}
      </div>

      {/* Review card */}
      <div className="w-full max-w-[500px] rounded-2xl border border-steel bg-obsidian p-7">
        {/* Card header */}
        <div className="flex items-center justify-between mb-5">
          <SrsBadge stage={currentCard.stage} size="sm" />
          <span className="text-[12px] text-silver/60 font-mono">
            {currentIndex + 1}/{total}
          </span>
        </div>

        {/* Prompt */}
        <p className="text-[18px] text-ivory font-body font-medium leading-relaxed mb-5">
          {currentCard.prompt}
        </p>

        {/* Gate overlay */}
        {isGated ? (
          <div className="space-y-5">
            {/* Blurred options */}
            <div className="grid grid-cols-2 gap-2 blur-sm pointer-events-none select-none">
              {currentCard.options.map((opt) => (
                <div
                  key={opt.id}
                  className="p-3 rounded-xl border border-steel bg-night text-silver text-sm font-body font-semibold"
                >
                  {opt.label}
                </div>
              ))}
            </div>

            {/* Gate CTA */}
            <div className="rounded-xl border border-coral/30 bg-obsidian p-6 text-center space-y-3">
              <h2 className="font-display text-xl font-bold text-ivory">
                Sign up to keep going
              </h2>
              <p className="text-silver text-sm">
                {total - GATE_AFTER_CARD} more cards waiting. Your progress,
                streak, and mastery &mdash; all saved automatically.
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
          </div>
        ) : (
          <>
            {/* Options grid */}
            <div className="grid grid-cols-2 gap-2">
              {currentCard.options.map((opt) => (
                <AnswerCard
                  key={opt.id}
                  label={opt.label}
                  state={getCardState(opt.id)}
                  degreeColor={
                    opt.degree as 1 | 2 | 3 | 4 | 5 | 6 | 7 | undefined
                  }
                  onClick={() => handleSelect(opt.id)}
                  disabled={revealed}
                />
              ))}
            </div>

            {/* Feedback banner */}
            {revealed && (
              <div
                className={`mt-3 rounded-lg px-4 py-3 text-sm font-body ${
                  selected === currentCard.correctAnswer
                    ? "bg-correct/10 text-correct border border-correct/30"
                    : "bg-incorrect/10 text-incorrect border border-incorrect/30"
                }`}
              >
                {selected === currentCard.correctAnswer
                  ? currentCard.correctFeedback
                  : currentCard.incorrectFeedback}
              </div>
            )}
          </>
        )}
      </div>

      {/* Keyboard hint */}
      {!isGated && (
        <div className="text-[11px] text-silver/30 font-mono">
          click to answer
        </div>
      )}
    </div>
  );
}
