/**
 * FSRS-inspired SRS scheduling engine.
 *
 * Calculates the next review interval and ease factor based on the user's
 * answer quality. Uses a simplified Free Spaced Repetition Scheduler approach.
 */

import type { SrsStage, ReviewResult } from "@/types/srs";

interface SchedulingInput {
  currentInterval: number; // days
  easeFactor: number;
  stage: SrsStage;
  result: ReviewResult;
  responseTimeMs: number;
}

interface SchedulingOutput {
  newInterval: number;
  newEaseFactor: number;
  newStage: SrsStage;
  nextDueAt: Date;
}

const STAGE_ORDER: SrsStage[] = [
  "apprentice",
  "journeyman",
  "adept",
  "virtuoso",
  "mastered",
];

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

// Learning step intervals in minutes for apprentice stage
const LEARNING_STEPS = [1, 10, 60, 480]; // 1min, 10min, 1hr, 8hr

function getStageIndex(stage: SrsStage): number {
  return STAGE_ORDER.indexOf(stage);
}

function getStageByIndex(index: number): SrsStage {
  return STAGE_ORDER[Math.max(0, Math.min(index, STAGE_ORDER.length - 1))];
}

export function schedule(input: SchedulingInput): SchedulingOutput {
  const { currentInterval, easeFactor, stage, result } = input;

  if (result === "skip") {
    // Skip doesn't change scheduling — just push due date forward slightly
    return {
      newInterval: currentInterval,
      newEaseFactor: easeFactor,
      newStage: stage,
      nextDueAt: addMinutes(new Date(), 30),
    };
  }

  if (result === "incorrect") {
    return handleIncorrect(currentInterval, easeFactor, stage);
  }

  return handleCorrect(currentInterval, easeFactor, stage);
}

function handleCorrect(
  currentInterval: number,
  easeFactor: number,
  stage: SrsStage
): SchedulingOutput {
  if (stage === "apprentice") {
    // Move through learning steps
    const stepIndex = currentInterval < 1 ? 0 : Math.min(
      LEARNING_STEPS.findIndex((s) => s > currentInterval * 1440) - 1,
      LEARNING_STEPS.length - 1
    );
    const nextStep = stepIndex + 1;

    if (nextStep >= LEARNING_STEPS.length) {
      // Graduate to journeyman
      return {
        newInterval: 1,
        newEaseFactor: easeFactor,
        newStage: "journeyman",
        nextDueAt: addDays(new Date(), 1),
      };
    }

    return {
      newInterval: LEARNING_STEPS[nextStep] / 1440, // convert minutes to days
      newEaseFactor: easeFactor,
      newStage: "apprentice",
      nextDueAt: addMinutes(new Date(), LEARNING_STEPS[nextStep]),
    };
  }

  // For graduated cards, apply SM-2 style interval multiplication
  const newEase = Math.max(MIN_EASE_FACTOR, easeFactor + 0.1);
  const newInterval = Math.max(1, Math.round(currentInterval * newEase));

  // Stage thresholds: journeyman < 7d, adept 7-21d, virtuoso 21-90d, mastered 90d+
  let newStage: SrsStage;
  if (newInterval >= 90) newStage = "mastered";
  else if (newInterval >= 21) newStage = "virtuoso";
  else if (newInterval >= 7) newStage = "adept";
  else newStage = "journeyman";

  return {
    newInterval,
    newEaseFactor: newEase,
    newStage,
    nextDueAt: addDays(new Date(), newInterval),
  };
}

function handleIncorrect(
  currentInterval: number,
  easeFactor: number,
  stage: SrsStage
): SchedulingOutput {
  const stageIdx = getStageIndex(stage);

  // Decrease ease factor
  const newEase = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);

  // Demote stage (but never below apprentice)
  const newStage = getStageByIndex(Math.max(0, stageIdx - 1));

  if (newStage === "apprentice") {
    // Back to learning steps
    return {
      newInterval: LEARNING_STEPS[0] / 1440,
      newEaseFactor: newEase,
      newStage: "apprentice",
      nextDueAt: addMinutes(new Date(), LEARNING_STEPS[0]),
    };
  }

  // Reduce interval significantly
  const newInterval = Math.max(1, Math.round(currentInterval * 0.5));

  return {
    newInterval,
    newEaseFactor: newEase,
    newStage,
    nextDueAt: addDays(new Date(), newInterval),
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

export { DEFAULT_EASE_FACTOR, STAGE_ORDER };
