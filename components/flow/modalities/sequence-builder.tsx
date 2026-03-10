"use client";

import { useState, useCallback } from "react";
import { brand } from "@/lib/tokens";
import { IDontKnowButton } from "./i-dont-know-button";

const SHARP_LETTERS = ["F", "C", "G", "D", "A", "E", "B"] as const;
const FLAT_LETTERS = ["B", "E", "A", "D", "G", "C", "F"] as const;

interface SequenceBuilderProps {
  accidentalType: "sharps" | "flats";
  correctCount: number;
  revealedCount?: number;
  prompt: string;
  onAnswer: (correct: boolean) => void;
}

export function SequenceBuilder({
  accidentalType,
  correctCount,
  revealedCount = 0,
  prompt,
  onAnswer,
}: SequenceBuilderProps) {
  const letters = accidentalType === "sharps" ? SHARP_LETTERS : FLAT_LETTERS;
  const symbol = accidentalType === "sharps" ? "#" : "b";

  const [activatedCount, setActivatedCount] = useState(revealedCount);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handlePillTap = useCallback(
    (index: number) => {
      if (submitted) return;
      // Can only activate the next pill in sequence
      if (index !== activatedCount) return;
      setActivatedCount((prev) => prev + 1);
    },
    [submitted, activatedCount],
  );

  const handleUndo = useCallback(() => {
    if (submitted) return;
    if (activatedCount <= revealedCount) return;
    setActivatedCount((prev) => prev - 1);
  }, [submitted, activatedCount, revealedCount]);

  const handleDone = useCallback(() => {
    if (submitted) return;
    const correct = activatedCount === correctCount;
    setIsCorrect(correct);
    setSubmitted(true);
    setTimeout(() => onAnswer(correct), correct ? 800 : 2000);
  }, [submitted, activatedCount, correctCount, onAnswer]);

  const handleDontKnow = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    setTimeout(() => onAnswer(false), 2500);
  }, [submitted, onAnswer]);

  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-center text-sm font-medium"
        style={{ color: brand.ivory }}
      >
        {prompt}
      </p>

      {/* Pill strip */}
      <div
        className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-3"
        style={{
          backgroundColor: brand.slate,
          border: `1px solid ${brand.steel}`,
        }}
      >
        {letters.map((letter, i) => {
          const isRevealed = i < revealedCount;
          const isActive = i < activatedCount;
          const isNext = i === activatedCount && !submitted;

          // After submission: show correct answer
          const isCorrectPosition = i < correctCount;
          const wasOverSelected =
            submitted && !isCorrect && isActive && !isCorrectPosition;
          const wasMissed =
            submitted && !isCorrect && !isActive && isCorrectPosition;

          let bg: string;
          let borderColor: string;
          let textColor: string;
          let shadow: string | undefined;

          if (submitted) {
            if (wasOverSelected) {
              bg = brand.incorrect + "25";
              borderColor = brand.incorrect;
              textColor = brand.incorrect;
            } else if (wasMissed) {
              bg = brand.correct + "25";
              borderColor = brand.correct;
              textColor = brand.correct;
            } else if (isActive && isCorrectPosition) {
              bg = isCorrect ? brand.correct + "25" : brand.violet + "25";
              borderColor = isCorrect ? brand.correct : brand.violet;
              textColor = isCorrect ? brand.correct : brand.ivory;
            } else {
              bg = brand.graphite;
              borderColor = brand.steel;
              textColor = brand.ash;
            }
          } else if (isRevealed) {
            bg = brand.violet + "20";
            borderColor = brand.violetDim;
            textColor = brand.violet;
          } else if (isActive) {
            bg = brand.violet + "25";
            borderColor = brand.violet;
            textColor = brand.ivory;
            shadow = `0 0 10px ${brand.violet}60, 0 0 20px ${brand.violet}30`;
          } else if (isNext) {
            bg = brand.graphite;
            borderColor = brand.ash;
            textColor = brand.silver;
          } else {
            bg = brand.graphite;
            borderColor = brand.steel;
            textColor = brand.ash;
          }

          return (
            <button
              key={letter}
              onClick={() => handlePillTap(i)}
              disabled={submitted || i !== activatedCount}
              className="flex h-10 min-w-[44px] items-center justify-center rounded-lg px-2 text-sm font-semibold transition-all"
              style={{
                backgroundColor: bg,
                border: `1.5px solid ${borderColor}`,
                color: textColor,
                cursor: isNext ? "pointer" : "default",
                boxShadow: shadow,
                opacity: !submitted && !isActive && !isNext ? 0.5 : 1,
              }}
            >
              {letter}
              {symbol}
            </button>
          );
        })}
      </div>

      {/* Undo + Done row */}
      {!submitted && (
        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={activatedCount <= revealedCount}
            className="rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-30"
            style={{
              backgroundColor: brand.graphite,
              border: `1.5px solid ${brand.steel}`,
              color: brand.silver,
            }}
          >
            Undo
          </button>
          <button
            onClick={handleDone}
            className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: brand.violet,
              color: brand.night,
            }}
          >
            Done
          </button>
        </div>
      )}
      <IDontKnowButton onDontKnow={handleDontKnow} visible={!submitted} />

      {/* Feedback message */}
      {submitted && (
        <p
          className="text-center text-sm font-medium"
          style={{ color: isCorrect ? brand.correct : brand.incorrect }}
        >
          {isCorrect
            ? "Correct"
            : `${correctCount === 0 ? "No accidentals" : correctCount + " accidental" + (correctCount === 1 ? "" : "s")} in this key.`}
        </p>
      )}
    </div>
  );
}
