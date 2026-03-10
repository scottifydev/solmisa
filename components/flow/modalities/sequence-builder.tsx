"use client";

import { useState, useCallback } from "react";
import { brand } from "@/lib/tokens";
import { IDontKnowButton } from "./i-dont-know-button";

const SHARP_LETTERS = ["F", "C", "G", "D", "A", "E", "B"] as const;
const FLAT_LETTERS = ["B", "E", "A", "D", "G", "C", "F"] as const;

interface SequenceBuilderProps {
  correctType: "sharps" | "flats";
  correctCount: number;
  revealedCount?: number;
  prompt: string;
  onAnswer: (correct: boolean) => void;
}

export function SequenceBuilder({
  correctType,
  correctCount,
  revealedCount = 0,
  prompt,
  onAnswer,
}: SequenceBuilderProps) {
  // If pills are pre-revealed, the type is implicit — commit to correct type
  const initialType = revealedCount > 0 ? correctType : null;
  const [selectedType, setSelectedType] = useState<"sharps" | "flats" | null>(
    initialType,
  );
  const [activatedCount, setActivatedCount] = useState(revealedCount);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handlePillTap = useCallback(
    (type: "sharps" | "flats", index: number) => {
      if (submitted) return;
      if (selectedType === null) {
        // Must start from index 0
        if (index !== 0) return;
        setSelectedType(type);
        setActivatedCount(1);
        return;
      }
      // Locked to selected strip
      if (type !== selectedType) return;
      // Must be next in sequence
      if (index !== activatedCount) return;
      setActivatedCount((prev) => prev + 1);
    },
    [submitted, selectedType, activatedCount],
  );

  const handleUndo = useCallback(() => {
    if (submitted) return;
    if (activatedCount > revealedCount) {
      const next = activatedCount - 1;
      setActivatedCount(next);
      if (next === 0 && revealedCount === 0) {
        setSelectedType(null);
      }
    }
  }, [submitted, activatedCount, revealedCount]);

  const handleDone = useCallback(() => {
    if (submitted) return;
    const correct =
      correctCount === 0
        ? activatedCount === 0
        : selectedType === correctType && activatedCount === correctCount;
    setIsCorrect(correct);
    setSubmitted(true);
    setTimeout(() => onAnswer(correct), correct ? 800 : 2000);
  }, [
    submitted,
    selectedType,
    correctType,
    correctCount,
    activatedCount,
    onAnswer,
  ]);

  const handleDontKnow = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    setTimeout(() => onAnswer(false), 2500);
  }, [submitted, onAnswer]);

  const renderStrip = (type: "sharps" | "flats") => {
    const letters = type === "sharps" ? SHARP_LETTERS : FLAT_LETTERS;
    const symbol = type === "sharps" ? "#" : "b";
    const isActiveStrip = selectedType === type;
    const isLockedStrip = selectedType !== null && selectedType !== type;
    const isCorrectStrip = submitted && type === correctType;

    return (
      <div
        key={type}
        className="flex items-center gap-1 rounded-xl px-2 py-2.5"
        style={{
          backgroundColor: brand.slate,
          border: `1px solid ${
            submitted && isCorrectStrip
              ? brand.correct + "60"
              : isActiveStrip
                ? brand.violet + "60"
                : isLockedStrip
                  ? brand.graphite
                  : brand.steel
          }`,
          opacity: isLockedStrip && !submitted ? 0.35 : 1,
          transition: "opacity 0.2s, border-color 0.2s",
        }}
      >
        <span
          className="w-5 shrink-0 text-center text-sm font-bold"
          style={{
            color: isLockedStrip && !submitted ? brand.ash : brand.silver,
            fontStyle: "italic",
          }}
        >
          {symbol}
        </span>
        {letters.map((letter, i) => {
          const isRevealedPill = type === correctType && i < revealedCount;
          const isActivePill = isActiveStrip && i < activatedCount;
          const isNextPill =
            isActiveStrip && i === activatedCount && !submitted;
          const canTap =
            !submitted &&
            !isLockedStrip &&
            (selectedType === null
              ? i === 0
              : isActiveStrip && i === activatedCount);

          // Post-submission feedback
          const isCorrectPill =
            submitted && type === correctType && i < correctCount;
          const wasOverSelected =
            submitted &&
            isActivePill &&
            !(type === correctType && i < correctCount);
          const wasMissed =
            submitted &&
            type === correctType &&
            !isActivePill &&
            i < correctCount;

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
            } else if (isCorrectPill && isActivePill) {
              bg = brand.correct + "25";
              borderColor = brand.correct;
              textColor = brand.correct;
            } else {
              bg = brand.graphite;
              borderColor = brand.steel;
              textColor = brand.ash;
            }
          } else if (isRevealedPill) {
            bg = brand.violet + "20";
            borderColor = brand.violetDim;
            textColor = brand.violet;
          } else if (isActivePill) {
            bg = brand.violet + "25";
            borderColor = brand.violet;
            textColor = brand.ivory;
            shadow = `0 0 10px ${brand.violet}60, 0 0 20px ${brand.violet}30`;
          } else if (isNextPill) {
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
              key={`${type}-${letter}`}
              onClick={() => handlePillTap(type, i)}
              disabled={submitted || !canTap}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: bg,
                border: `1.5px solid ${borderColor}`,
                color: textColor,
                cursor: canTap ? "pointer" : "default",
                boxShadow: shadow,
                opacity:
                  !submitted && !isActivePill && !isNextPill && !isRevealedPill
                    ? 0.5
                    : 1,
              }}
            >
              {letter}
              {symbol}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-center text-sm font-medium"
        style={{ color: brand.ivory }}
      >
        {prompt}
      </p>

      <div className="flex flex-col gap-2">
        {renderStrip("sharps")}
        {renderStrip("flats")}
      </div>

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

      {submitted && (
        <p
          className="text-center text-sm font-medium"
          style={{ color: isCorrect ? brand.correct : brand.incorrect }}
        >
          {isCorrect
            ? "Correct"
            : correctCount === 0
              ? "No accidentals in this key."
              : `${correctCount} ${correctType} in this key.`}
        </p>
      )}
    </div>
  );
}
