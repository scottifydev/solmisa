import type {
  DifficultyTier,
  SrsSchedulerInput,
  SchedulerResult,
} from "@/types/srs";
import { FSRS_DEFAULTS, TIER_RULES } from "@/types/srs";
import { getNextStage, getIntervalHours, canAdvanceSrs } from "./stages";

// ─── Core Scheduler ─────────────────────────────────────────

/**
 * Compute next SRS state after a review.
 *
 * For declarative cards: called once per item with item-level correctness.
 * For perceptual cards: called once per skill group with session-level accuracy
 *   (pass session accuracy via input.session_accuracy, correct = sessionAccuracy >= 0.8).
 */
export function computeSchedule(input: SrsSchedulerInput): SchedulerResult {
  const { item, correct, confidence } = input;

  // Ease factor adjustment — modulated by confidence
  const baseEaseDelta = correct
    ? FSRS_DEFAULTS.easeCorrectDelta
    : FSRS_DEFAULTS.easeIncorrectDelta;
  // Correct + guessing = halved boost (fragile memory)
  const easeDelta =
    correct && confidence === "guessing" ? baseEaseDelta * 0.5 : baseEaseDelta;
  const newEase = clamp(
    item.ease_factor + easeDelta,
    FSRS_DEFAULTS.minEase,
    FSRS_DEFAULTS.maxEase,
  );

  // Stage transition
  const candidateStage = getNextStage(item.srs_stage, correct);

  // Tier gate: only stretch tier can push past journeyman_2
  const newStage =
    correct && !canAdvanceSrs(item.difficulty_tier, candidateStage)
      ? item.srs_stage // blocked — stay at current stage
      : candidateStage;

  // Interval
  const baseHours = getIntervalHours(newStage);
  const intervalDays =
    baseHours === Infinity ? Infinity : (baseHours * newEase) / 24;

  // Next review timestamp
  const nextReviewAt =
    baseHours === Infinity
      ? new Date("9999-12-31T23:59:59Z").toISOString()
      : new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

  // Difficulty tier promotion/demotion
  const newTier = computeTierChange(item, correct);

  return {
    new_stage: newStage,
    new_ease_factor: newEase,
    new_interval_days: intervalDays === Infinity ? 0 : intervalDays,
    next_review_at: nextReviewAt,
    new_difficulty_tier: newTier,
  };
}

// ─── Difficulty Tier Promotion/Demotion ─────────────────────

function computeTierChange(
  item: SrsSchedulerInput["item"],
  correct: boolean,
): DifficultyTier {
  const currentTier = item.difficulty_tier;

  if (correct) {
    // Promote after N correct in a row at current tier
    const newStreak = item.correct_streak + 1;
    if (newStreak >= TIER_RULES.promotionStreak) {
      if (currentTier === "intro") return "core";
      if (currentTier === "core") return "stretch";
    }
  } else {
    // Demote if 2 wrong in last 5
    // We track this via total_reviews and total_correct
    // Simplified: if streak is 0 and recent accuracy is bad, demote
    const recentReviews = Math.min(
      item.total_reviews,
      TIER_RULES.demotionThreshold.outOf,
    );
    const recentCorrect = Math.min(item.total_correct, recentReviews);
    const recentWrong = recentReviews - recentCorrect;

    if (
      recentWrong >= TIER_RULES.demotionThreshold.wrong &&
      recentReviews >= TIER_RULES.demotionThreshold.outOf
    ) {
      if (currentTier === "stretch") return "core";
      if (currentTier === "core") return "intro";
    }
  }

  return currentTier;
}

// ─── Utilities ──────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
