import type {
  DifficultyTier,
  SrsStageKey,
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
  const tierResult = computeTierChange(item, correct, newStage);

  // If tier promoted, reset stage to apprentice_1 with a shortened interval
  if (tierResult.promoted) {
    const promotedIntervalHours = 2; // Shortened: proven ability at lower tier
    const promotedIntervalDays =
      (promotedIntervalHours * FSRS_DEFAULTS.defaultEase) / 24;
    const promotedNextReview = new Date(
      Date.now() + promotedIntervalDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    return {
      new_stage: "apprentice_1",
      new_ease_factor: FSRS_DEFAULTS.defaultEase,
      new_interval_days: promotedIntervalDays,
      next_review_at: promotedNextReview,
      new_difficulty_tier: tierResult.tier,
      tier_promoted: true,
    };
  }

  return {
    new_stage: newStage,
    new_ease_factor: newEase,
    new_interval_days: intervalDays === Infinity ? 0 : intervalDays,
    next_review_at: nextReviewAt,
    new_difficulty_tier: tierResult.tier,
    tier_promoted: false,
  };
}

// ─── Difficulty Tier Promotion/Demotion ─────────────────────

const TIER_PROMOTION_MIN_REVIEWS = 10;
const TIER_PROMOTION_ACCURACY = 0.9;
const TIER_PROMOTION_STAGES: SrsStageKey[] = [
  "journeyman_2",
  "adept_1",
  "adept_2",
  "virtuoso_1",
  "virtuoso_2",
  "mastered",
];

function computeTierChange(
  item: SrsSchedulerInput["item"],
  correct: boolean,
  newStage: SrsStageKey,
): { tier: DifficultyTier; promoted: boolean } {
  const currentTier = item.difficulty_tier;

  if (correct) {
    // Promote when reaching journeyman_2+ AND 90%+ accuracy over sufficient reviews
    if (
      currentTier !== "stretch" &&
      TIER_PROMOTION_STAGES.includes(newStage) &&
      item.total_reviews >= TIER_PROMOTION_MIN_REVIEWS
    ) {
      const accuracy = item.total_correct / item.total_reviews;
      if (accuracy >= TIER_PROMOTION_ACCURACY) {
        const nextTier: DifficultyTier =
          currentTier === "intro" ? "core" : "stretch";
        return { tier: nextTier, promoted: true };
      }
    }
  } else {
    // Demote on consecutive failures: streak was already 0 before this wrong answer
    // (correct_streak resets to 0 on first wrong, so streak===0 here means
    // the previous review was also wrong — i.e. 2+ wrong in a row)
    if (
      item.correct_streak === 0 &&
      item.total_reviews >= TIER_RULES.demotionThreshold.outOf
    ) {
      if (currentTier === "stretch") return { tier: "core", promoted: false };
      if (currentTier === "core") return { tier: "intro", promoted: false };
    }
  }

  return { tier: currentTier, promoted: false };
}

// ─── Utilities ──────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
