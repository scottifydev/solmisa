import type {
  SrsStageKey,
  CardCategory,
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
  const { item, correct, card_category } = input;

  // Ease factor adjustment
  const easeDelta = correct
    ? FSRS_DEFAULTS.easeCorrectDelta
    : FSRS_DEFAULTS.easeIncorrectDelta;
  const newEase = clamp(
    item.ease_factor + easeDelta,
    FSRS_DEFAULTS.minEase,
    FSRS_DEFAULTS.maxEase
  );

  // Stage transition
  const candidateStage = getNextStage(item.srs_stage, correct);

  // Tier gate: only stretch tier can push past journeyman_2
  const newStage = correct && !canAdvanceSrs(item.difficulty_tier, candidateStage)
    ? item.srs_stage // blocked — stay at current stage
    : candidateStage;

  // Interval
  const baseHours = getIntervalHours(newStage);
  const intervalDays = baseHours === Infinity
    ? Infinity
    : (baseHours * newEase) / 24;

  // Next review timestamp
  const nextReviewAt = baseHours === Infinity
    ? new Date("9999-12-31T23:59:59Z").toISOString()
    : new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

  // Difficulty tier promotion/demotion
  const newTier = computeTierChange(item, correct, card_category);

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
  _cardCategory: CardCategory
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
    const recentReviews = Math.min(item.total_reviews, TIER_RULES.demotionThreshold.outOf);
    const recentCorrect = Math.min(item.total_correct, recentReviews);
    const recentWrong = recentReviews - recentCorrect;

    if (recentWrong >= TIER_RULES.demotionThreshold.wrong && recentReviews >= TIER_RULES.demotionThreshold.outOf) {
      if (currentTier === "stretch") return "core";
      if (currentTier === "core") return "intro";
    }
  }

  return currentTier;
}

// ─── Perceptual Session Scheduling ──────────────────────────

export interface PerceptualSessionResult {
  accuracy: number;
  itemCount: number;
  shouldPromote: boolean;
  shouldDemote: boolean;
  shouldReplayLesson: boolean;
}

/**
 * Evaluate a perceptual session for a skill group.
 * Called at end of session with aggregate accuracy.
 */
export function evaluatePerceptualSession(
  accuracy: number,
  itemCount: number
): PerceptualSessionResult {
  return {
    accuracy,
    itemCount,
    shouldPromote: accuracy >= 0.9,
    shouldDemote: accuracy < 0.7,
    shouldReplayLesson: accuracy < 0.5 && itemCount >= 3,
  };
}

// ─── Session Assembly ───────────────────────────────────────

export interface SessionConfig {
  batchSize: number;
  maxBatchSize: number;
  maxNewCards: number;
  mixRatio: { new: number; review: number };
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  batchSize: 20,
  maxBatchSize: 25,
  maxNewCards: 5,
  mixRatio: { new: 0.85, review: 0.15 },
};

/**
 * Calculate how many new vs review cards to include in a lesson session.
 */
export function computeSessionMix(
  totalNewAvailable: number,
  totalReviewDue: number,
  config: SessionConfig = DEFAULT_SESSION_CONFIG
): { newCount: number; reviewCount: number } {
  const total = Math.min(config.batchSize, totalNewAvailable + totalReviewDue);

  if (total === 0) return { newCount: 0, reviewCount: 0 };

  const maxNew = Math.min(totalNewAvailable, config.maxNewCards);
  const idealNew = Math.round(total * config.mixRatio.new);
  const newCount = Math.min(maxNew, idealNew);
  const reviewCount = Math.min(totalReviewDue, total - newCount);

  return { newCount, reviewCount };
}

// ─── Utilities ──────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
