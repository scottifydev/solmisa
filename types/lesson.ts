import type { CardCategory } from "./srs";

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
  unlock_criteria: ModuleUnlockCriteria | null;
  lessons?: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  title: string;
  lesson_order: number;
  isCompleted: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  module_id: string;
  lesson_order: number;
  drone_key: string | null;
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

// ─── Lesson Stages (the 5 types) ─────────────────────────────

export type LessonStageType =
  | "aural_teach"
  | "theory_teach"
  | "aural_quiz"
  | "theory_quiz"
  | "rhythm";

export type LessonStage =
  | AuralTeachStage
  | TheoryTeachStage
  | AuralQuizStage
  | TheoryQuizStage
  | RhythmStage;

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

export interface AuralQuizStage {
  type: "aural_quiz";
  prompt: string;
  options: QuizOption[];
  correct_answer: string;
  seeds_card?: string;
  show_resolution?: boolean;
}

export interface TheoryQuizStage {
  type: "theory_quiz";
  prompt: string;
  options: QuizOption[];
  correct_answer: string;
  seeds_card?: string;
}

export interface RhythmStage {
  type: "rhythm";
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

// ─── Rhythm Types ─────────────────────────────────────────────

export interface RhythmEvent {
  beat: number;
  duration: number;
  rest?: boolean;
}

export interface RhythmTapperProps {
  events: RhythmEvent[];
  tempo: number;
  timeSignature: [number, number];
  onComplete: (result: RhythmTapResult) => void;
}

export interface RhythmTapResult {
  accuracy: number;
  taps: { time: number; expected: number; delta: number }[];
}

// ─── Rendering Types ──────────────────────────────────────────

export interface StageRendererProps {
  stage: LessonStage;
  stageIndex: number;
  totalStages: number;
  droneKey: string | null;
  onComplete: (result: StageQuizResult | null) => void;
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
  stage_results: StageQuizResult[];
  duration_ms: number;
}

export interface StageQuizResult {
  stage_index: number;
  stage_type: LessonStageType;
  correct: boolean;
  response_time_ms: number;
  seeds_card: string | null;
  card_category: CardCategory | null;
}
