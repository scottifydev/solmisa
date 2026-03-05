import type { CardCategory } from "./srs";

// ─── Skill Tracks (v2) ──────────────────────────────────────

export type SkillTrackSlug =
  | "ear_training"
  | "theory"
  | "rhythm"
  | "sight_reading";

export interface SkillTrack {
  id: string;
  slug: SkillTrackSlug;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

// ─── Module & Lesson (DB mirrors) ────────────────────────────

export interface ModuleUnlockCriteria {
  required_lessons?: string[];
  min_accuracy?: number;
  min_stage?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  module_order: number;
  track_id: string;
  unlock_criteria: ModuleUnlockCriteria | null;
  lessons?: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  title: string;
  lesson_order: number;
  isCompleted: boolean;
}

export interface SoftPrerequisite {
  type: "lesson" | "drill" | "review_count";
  target_id?: string;
  min_count?: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  module_id: string;
  track_id: string;
  lesson_order: number;
  drone_key: string | null;
  unlocks_cards: string[];
  unlocks_drills: string[];
  soft_prerequisites: SoftPrerequisite[];
  stages: LessonStage[];
}

// ─── Progress Tracking ───────────────────────────────────────

export type LessonProgressStatus = "not_started" | "in_progress" | "completed";
export type ModuleProgressStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  current_stage_index: number;
  score: number | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  status: ModuleProgressStatus;
  lessons_completed: number;
  unlocked_at: string | null;
  completed_at: string | null;
}

// ─── Lesson Stages ───────────────────────────────────────────

export type LessonStageType =
  | "aural_teach"
  | "theory_teach"
  | "interactive"
  | "guided_practice"
  | "rhythm"
  // v1 compat — removed once lesson content is migrated (Phase 3)
  | "aural_quiz"
  | "theory_quiz";

export type LessonStage =
  | AuralTeachStage
  | TheoryTeachStage
  | InteractiveStage
  | GuidedPracticeStage
  | RhythmStage
  // v1 compat — removed once lesson content is migrated (Phase 3)
  | AuralQuizStage
  | TheoryQuizStage;

export interface AuralTeachStage {
  type: "aural_teach";
  title: string;
  instructions: string;
  audio_degrees: number[];
  show_degree_circle: boolean;
  highlight_degree?: number;
}

export interface TheoryTeachStage {
  type: "theory_teach";
  title: string;
  content: string;
  notation?: string;
  degree?: number;
  show_degree_circle: boolean;
}

// ─── v2 Stage Types ─────────────────────────────────────────

export interface InteractiveStage {
  type: "interactive";
  title: string;
  instructions: string;
  component: string;
  config: Record<string, unknown>;
  audio_degrees?: number[];
  show_degree_circle?: boolean;
}

export interface GuidedPracticeStage {
  type: "guided_practice";
  title: string;
  instructions: string;
  component: string;
  config: Record<string, unknown>;
  trials?: number;
  pass_threshold?: number;
  engagement_weight?: number;
}

// ─── Drill Config (parameterized quiz generation) ────────────

export interface DrillConfig {
  type: string;
  degrees?: (number | string)[];
  pair?: [number | string, number | string];
  trials?: number;
  threshold?: number;
  pass_threshold?: number;
  context_mode?: string;
  keys?: string[];
  response_mode?: string;
  time_limit_sec?: number;
  patterns?: string[];
  length_bars?: number;
  intervals?: string[] | string;
  direction?: string;
  meters?: string[];
  forms?: string[];
  mode?: string;
  modes?: string[];
  options?: QuizOption[];
  pattern?: string;
  bpm?: number;
  bpm_range?: [number, number];
  tolerance_ms?: number;
  meter?: string;
  counting?: string;
  complexity?: string;
  rhythm?: string;
  max_interval?: number;
  timbres?: string[];
  sequence_length?: number;
  domains?: string[];
}

// Options-based quiz (pre-authored concrete questions)
export interface OptionsAuralQuizStage {
  type: "aural_quiz";
  prompt: string;
  options: QuizOption[];
  correct_answer: string;
  seeds_card?: string;
  show_resolution?: boolean;
}

// Drill-based quiz (parameterized, generates trials at runtime)
export interface DrillAuralQuizStage {
  type: "aural_quiz";
  prompt: string;
  drill: DrillConfig;
  seeds_card?: string;
}

export type AuralQuizStage = OptionsAuralQuizStage | DrillAuralQuizStage;

export interface OptionsTheoryQuizStage {
  type: "theory_quiz";
  prompt: string;
  options: QuizOption[];
  correct_answer: string;
  seeds_card?: string;
}

export interface DrillTheoryQuizStage {
  type: "theory_quiz";
  prompt: string;
  drill: DrillConfig;
  seeds_card?: string;
}

export type TheoryQuizStage = OptionsTheoryQuizStage | DrillTheoryQuizStage;

export interface RhythmStage {
  type: "rhythm";
  title?: string;
  instructions?: string;
  mode: "listen" | "tap" | "quiz";
  tempo: number;
  time_signature: [number, number];
  pattern: RhythmEvent[];
  seeds_card?: string;
}

export interface QuizOption {
  id: string;
  label: string;
  sublabel?: string;
  degree?: number;
}

export function isOptionsQuiz(
  stage: AuralQuizStage | TheoryQuizStage,
): stage is OptionsAuralQuizStage | OptionsTheoryQuizStage {
  return "options" in stage;
}

export function isDrillQuiz(
  stage: AuralQuizStage | TheoryQuizStage,
): stage is DrillAuralQuizStage | DrillTheoryQuizStage {
  return "drill" in stage;
}

// ─── Rhythm Types ─────────────────────────────────────────────

export interface RhythmEvent {
  beat: number;
  duration: number;
  rest?: boolean;
}

// ─── Rendering Types ──────────────────────────────────────────

export interface StageRendererProps {
  lesson: LessonRenderData;
  onComplete: (results: StageQuizResult[]) => void;
}

export interface LessonRenderData {
  module_title: string;
  lesson_title: string;
  lesson_num: number;
  total_lessons: number;
  drone_key: string | null;
  allowed_keys: string[];
  stages: LessonStage[];
}

export interface LessonCompletionResult {
  lesson_id: string;
  duration_ms: number;
  stage_results: StageQuizResult[];
}

export interface StageQuizResult {
  stage_index: number;
  stage_type: LessonStageType;
  correct: boolean;
  response_time_ms: number;
  seeds_card: string | null;
  card_category: CardCategory | null;
}

export interface StageCompletionResult {
  stage_index: number;
  stage_type: LessonStageType;
  completed: boolean;
  engagement_score?: number;
  response_time_ms?: number;
}

// ─── v2 Domain Types ─────────────────────────────────────────

export type DrillType =
  | "degree_id"
  | "interval_id"
  | "chord_quality"
  | "degree_discrimination"
  | "meter_id"
  | "minor_form_id"
  | "rhythm_tap"
  | "rhythm_echo"
  | "note_reading"
  | "key_signature_id"
  | "scale_construction"
  | "roman_numeral_id"
  | "melodic_dictation"
  | "harmonic_dictation";

export type OnboardingLevel =
  | "beginner"
  | "elementary"
  | "intermediate"
  | "advanced";
export type PracticeToolType =
  | "internal_drill"
  | "external_app"
  | "instrument"
  | "singing";

export interface TrackProgress {
  id: string;
  user_id: string;
  track_id: string;
  lessons_completed: number;
  current_module_id: string | null;
  started_at: string | null;
  updated_at: string;
}

export interface Drill {
  id: string;
  track_id: string;
  slug: string;
  title: string;
  description: string | null;
  drill_type: DrillType;
  config: Record<string, unknown>;
  difficulty_range: string[];
  display_order: number;
}

export interface OnboardingResult {
  id: string;
  user_id: string;
  track_id: string;
  dimension: string;
  estimated_level: OnboardingLevel;
  confidence: number;
  raw_responses: unknown[];
}

export interface PracticeRecommendation {
  id: string;
  track_id: string;
  dimension: string;
  level: OnboardingLevel;
  tool_type: PracticeToolType;
  tool_name: string;
  tool_url: string | null;
  description: string | null;
  display_order: number;
}

export interface RadarCache {
  id: string;
  user_id: string;
  dimension: string;
  score: number;
  total_reviews: number;
  computed_at: string;
}
