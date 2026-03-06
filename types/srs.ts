// ─── Stage Types ───────────────────────────────────────────────

export type SrsStageKey =
  | "apprentice_1"
  | "apprentice_2"
  | "apprentice_3"
  | "apprentice_4"
  | "journeyman_1"
  | "journeyman_2"
  | "adept_1"
  | "adept_2"
  | "virtuoso_1"
  | "virtuoso_2"
  | "mastered";

export type SrsStageGroup =
  | "apprentice"
  | "journeyman"
  | "adept"
  | "virtuoso"
  | "mastered";

// For backwards compat with UI components that use the 5-group type
export type SrsStage = SrsStageGroup;

export interface SrsStageMetadata {
  label: string;
  color: string;
  icon: string;
  keys: readonly SrsStageKey[];
}

export const SRS_STAGES: Record<SrsStageGroup, SrsStageMetadata> = {
  apprentice: {
    label: "Apprentice",
    color: "#f87171",
    icon: "seedling",
    keys: ["apprentice_1", "apprentice_2", "apprentice_3", "apprentice_4"],
  },
  journeyman: {
    label: "Journeyman",
    color: "#fbbf24",
    icon: "fire",
    keys: ["journeyman_1", "journeyman_2"],
  },
  adept: {
    label: "Adept",
    color: "#34d399",
    icon: "lightning",
    keys: ["adept_1", "adept_2"],
  },
  virtuoso: {
    label: "Virtuoso",
    color: "#60a5fa",
    icon: "gem",
    keys: ["virtuoso_1", "virtuoso_2"],
  },
  mastered: {
    label: "Mastered",
    color: "#b794f6",
    icon: "crown",
    keys: ["mastered"],
  },
} as const;

// ─── Card & Scheduling Types ──────────────────────────────────

export type CardCategory = "perceptual" | "declarative" | "rhythm";

export type DifficultyTier = "intro" | "core" | "stretch";

export type ConfidenceRating = "sure" | "guessing";

export type ResponseType =
  | "select_one"
  | "select_degree"
  | "select_interval"
  | "select_chord"
  | "sing"
  | "play"
  | "sequence"
  | "toggle_set"
  | "free_response"
  | "tap_rhythm"
  | "sing_self_assess";

export interface DifficultyTierConfig {
  key_pool: string[];
  context_mode: string;
  timbre_pool: string[];
  tempo_range: [number, number];
  options_count: number;
}

export interface PlaybackConfig {
  type: "tone_js" | "sample" | "audio_url";
  drone: boolean;
  drone_key: string;
  sequence: string[];
  tempo: string;
  timbre: string;
  auto_play: boolean;
  replay_allowed: boolean;
  pause_before_options_ms: number;
}

export interface FeedbackConfig {
  correct: {
    text: string;
    show_answer: boolean;
    play_confirmation: boolean;
  };
  incorrect: {
    text: string;
    show_answer: boolean;
    play_correct: boolean;
    delay_ms: number;
  };
}

export interface BlockScoringConfig {
  block_size: number;
  promote_threshold: number;
  demote_threshold: number;
  min_blocks_for_promotion: number;
  scoring_mode: "binary" | "partial_credit" | "pitch_tolerance";
}

export interface SrsItemState {
  id: string;
  user_id: string;
  card_instance_id: string;
  srs_stage: SrsStageKey;
  difficulty_tier: DifficultyTier;
  ease_factor: number;
  interval_days: number;
  next_review_at: string;
  correct_streak: number;
  total_reviews: number;
  total_correct: number;
  dimension_accuracy: Record<string, number> | null;
  created_at: string;
  updated_at: string;
}

export interface SrsSchedulerInput {
  item: SrsItemState;
  card_category: CardCategory;
  correct: boolean;
  response_time_ms: number;
  session_accuracy?: number;
  confidence?: ConfidenceRating;
}

export interface SchedulerResult {
  new_stage: SrsStageKey;
  new_ease_factor: number;
  new_interval_days: number;
  next_review_at: string;
  new_difficulty_tier: DifficultyTier;
  tier_promoted: boolean;
}

// ─── Review Queue Types (API) ─────────────────────────────────

export interface ReviewQueueItem {
  user_card_state_id: string;
  card_instance_id: string;
  card_template_id: string;
  prompt_rendered: string;
  response_type: ResponseType;
  options_data: Record<string, unknown>[] | null;
  answer_data: Record<string, unknown>;
  card_category: CardCategory;
  srs_stage: SrsStageKey;
  difficulty_tier: DifficultyTier;
  playback: PlaybackConfig | null;
  feedback: FeedbackConfig;
  dimensions: string[];
  track_slug: string;
}

export interface ReviewQueueResponse {
  items: ReviewQueueItem[];
  total_due: number;
  session_size: number;
  stage_breakdown: { group: SrsStageGroup; count: number }[];
}

export interface ReviewAnswerRequest {
  user_card_state_id: string;
  correct: boolean;
  response_time_ms: number;
  response: Record<string, unknown>;
  session_accuracy?: number;
  confidence?: ConfidenceRating;
}

export interface ReviewAnswerResponse {
  new_stage: SrsStageKey;
  new_interval_days: number;
  next_review_at: string;
  stage_changed: boolean;
  tier_promoted: boolean;
  new_difficulty_tier?: DifficultyTier;
}

export interface ReviewStatsResponse {
  totalCards: number;
  dueToday: number;
  byStage: { stage: SrsStageGroup; count: number }[];
  streakDays: number;
  reviewsToday: number;
  weekAccuracy: number | null;
}

// ─── Constants ────────────────────────────────────────────────

export const FSRS_DEFAULTS = {
  defaultEase: 2.5,
  minEase: 1.3,
  maxEase: 3.0,
  easeCorrectDelta: 0.1,
  easeIncorrectDelta: -0.2,
  masteredRegressionPenalty: 2,
} as const;

export const SESSION_DEFAULTS = {
  batchSize: 20,
  maxBatchSize: 25,
  maxNewCardsPerSession: 5,
  lessonMixRatio: { new: 0.85, review: 0.15 },
} as const;

export const PERCEPTUAL_SESSION = {
  blockSize: 5,
  promoteThreshold: 0.8,
  demoteThreshold: 0.4,
} as const;

export const TIER_RULES = {
  promotionStreak: 3,
  demotionThreshold: { wrong: 2, outOf: 5 },
} as const;
