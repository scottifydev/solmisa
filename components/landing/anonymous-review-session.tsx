"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { DemoReviewCard } from "@/lib/data/demo-data";
import { AnswerCard } from "@/components/ui/answer-card";
import { SrsBadge } from "@/components/ui/srs-badge";
import { OnboardingTooltip } from "./onboarding-tooltip";

interface AnonymousReviewSessionProps {
  cards: DemoReviewCard[];
}

export function AnonymousReviewSession({ cards }: AnonymousReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<(boolean | null)[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showAnswerTip, setShowAnswerTip] = useState(true);
  const [showFeedbackTip, setShowFeedbackTip] = useState(false);

  const total = cards.length;
  const currentCard = cards[currentIndex]!;
  const correctCount = results.filter((r) => r === true).length;

  const handleSelect = useCallback(
    (optionId: string) => {
      if (revealed) return;
      setSelected(optionId);
      setRevealed(true);
      setShowAnswerTip(false);

      const isCorrect = optionId === currentCard.correctAnswer;
      const newResults = [...results, isCorrect];
      setResults(newResults);

      if (newResults.length === 1) {
        setShowFeedbackTip(true);
      }

      // Auto-advance after feedback
      setTimeout(() => {
        if (currentIndex < total - 1) {
          setCurrentIndex((i) => i + 1);
          setSelected(null);
          setRevealed(false);
        } else {
          setIsComplete(true);
        }
      }, 1800);
    },
    [revealed, currentCard, currentIndex, total, results],
  );

  const getCardState = (optionId: string) => {
    if (!revealed) {
      return selected === optionId ? "selected" : ("default" as const);
    }
    if (optionId === currentCard.correctAnswer) return "correct" as const;
    if (optionId === selected) return "incorrect" as const;
    return "disabled" as const;
  };

  // Session complete screen
  if (isComplete) {
    const accuracy =
      results.length > 0
        ? Math.round((correctCount / results.length) * 100)
        : 0;

    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-ivory tracking-tight">
            Session Complete
          </h1>
          <p className="text-silver text-sm mt-2">
            {correctCount}/{results.length} correct &middot; {accuracy}%
            accuracy
          </p>
        </div>

        {/* Progress dots - final state */}
        <div className="flex gap-1.5">
          {results.map((result, i) => (
            <div
              key={i}
              className={`w-[7px] h-[7px] rounded-full ${
                result ? "bg-correct" : "bg-incorrect"
              }`}
            />
          ))}
        </div>

        <div className="w-full max-w-[500px] rounded-2xl border border-steel bg-obsidian p-7 text-center space-y-4">
          <p className="text-ivory font-body">
            {accuracy >= 80
              ? "Solid session. Sign up to track your progress and unlock new material."
              : "Each review strengthens the connection. Sign up to continue building your ear."}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg bg-violet text-white font-body font-medium hover:bg-violet/90 transition-colors"
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
    );
  }

  if (!currentCard) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ivory tracking-tight">
          Review Session
        </h1>
        <p className="text-ash text-[13px] font-mono mt-1">
          {correctCount}/{results.length} correct
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {cards.map((_, i) => {
          const isActive = i === currentIndex;
          const result = results[i];
          let bg = "bg-steel";
          if (result === true) bg = "bg-correct";
          else if (result === false) bg = "bg-incorrect";
          else if (isActive) bg = "bg-violet";

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
          <span className="text-[12px] text-ash font-mono">
            {currentIndex + 1}/{total}
          </span>
        </div>

        {/* Prompt */}
        <p className="text-[18px] text-ivory font-body font-medium leading-relaxed mb-5">
          {currentCard.prompt}
        </p>

        {/* Options grid */}
        <div className="relative">
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
          <OnboardingTooltip
            text="Tap the degree you think matches the prompt"
            position="top"
            show={showAnswerTip && currentIndex === 0}
            onDismiss={() => setShowAnswerTip(false)}
          />
        </div>

        {/* Feedback banner */}
        {revealed && (
          <div className="relative">
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
            <OnboardingTooltip
              text="Spaced repetition schedules reviews at optimal intervals to build lasting memory"
              show={showFeedbackTip}
              onDismiss={() => setShowFeedbackTip(false)}
            />
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      {!revealed && (
        <div className="text-[11px] text-silver/30 font-mono">
          click to answer
        </div>
      )}
    </div>
  );
}
