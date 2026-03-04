export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      modules: {
        Row: Module;
        Insert: Omit<Module, "id" | "created_at">;
        Update: Partial<Omit<Module, "id">>;
        Relationships: [];
      };
      lessons: {
        Row: Lesson;
        Insert: Omit<Lesson, "id" | "created_at">;
        Update: Partial<Omit<Lesson, "id">>;
        Relationships: [];
      };
      lesson_stages: {
        Row: LessonStageRow;
        Insert: Omit<LessonStageRow, "id">;
        Update: Partial<Omit<LessonStageRow, "id">>;
        Relationships: [];
      };
      srs_cards: {
        Row: SrsCard;
        Insert: Omit<SrsCard, "id" | "created_at">;
        Update: Partial<Omit<SrsCard, "id">>;
        Relationships: [];
      };
      srs_reviews: {
        Row: SrsReview;
        Insert: Omit<SrsReview, "id">;
        Update: Partial<Omit<SrsReview, "id">>;
        Relationships: [];
      };
      skill_axes: {
        Row: SkillAxis;
        Insert: Omit<SkillAxis, "id" | "updated_at">;
        Update: Partial<Omit<SkillAxis, "id">>;
        Relationships: [];
      };
      assessment_questions: {
        Row: AssessmentQuestion;
        Insert: Omit<AssessmentQuestion, "id">;
        Update: Partial<Omit<AssessmentQuestion, "id">>;
        Relationships: [];
      };
      assessment_responses: {
        Row: AssessmentResponse;
        Insert: Omit<AssessmentResponse, "id" | "created_at">;
        Update: Partial<Omit<AssessmentResponse, "id">>;
        Relationships: [];
      };
      activity_log: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, "id" | "created_at">;
        Update: Partial<Omit<ActivityLog, "id">>;
        Relationships: [];
      };
      user_lesson_progress: {
        Row: UserLessonProgress;
        Insert: Omit<UserLessonProgress, "id" | "completed_at">;
        Update: Partial<Omit<UserLessonProgress, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      experience_level: ExperienceLevel;
      srs_stage: SrsStageEnum;
      lesson_stage_type: LessonStageType;
      card_category: CardCategory;
    };
  };
}

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type SrsStageEnum = "apprentice" | "journeyman" | "adept" | "virtuoso" | "mastered";
export type LessonStageType = "aural_teach" | "theory_teach" | "aural_quiz" | "theory_quiz" | "practice";
export type CardCategory = "perceptual" | "declarative";

export interface Profile {
  id: string;
  display_name: string | null;
  instrument: string | null;
  experience_level: ExperienceLevel | null;
  onboarding_completed: boolean;
  preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  display_name?: string | null;
  instrument?: string | null;
  experience_level?: ExperienceLevel | null;
  onboarding_completed?: boolean;
  preferences?: Record<string, unknown> | null;
}

export interface ProfileUpdate {
  display_name?: string | null;
  instrument?: string | null;
  experience_level?: ExperienceLevel | null;
  onboarding_completed?: boolean;
  preferences?: Record<string, unknown> | null;
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  is_published: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  order: number;
  is_published: boolean;
  created_at: string;
}

export interface LessonStageRow {
  id: string;
  lesson_id: string;
  stage_type: LessonStageType;
  config: Record<string, unknown>;
  order: number;
}

export interface SrsCard {
  id: string;
  user_id: string;
  lesson_id: string;
  card_category: CardCategory;
  front: string;
  back: string;
  interval: number;
  ease_factor: number;
  due_at: string;
  stage: SrsStageEnum;
  created_at: string;
}

export interface SrsReview {
  id: string;
  card_id: string;
  user_id: string;
  result: "correct" | "incorrect" | "skip";
  response_time_ms: number | null;
  reviewed_at: string;
}

export interface SkillAxis {
  id: string;
  user_id: string;
  axis_name: string;
  score: number;
  updated_at: string;
}

export interface AssessmentQuestion {
  id: string;
  lesson_id: string | null;
  question_text: string;
  correct_answer: string;
  distractors: string[];
  axis_weights: Record<string, number> | null;
}

export interface AssessmentResponse {
  id: string;
  user_id: string;
  question_id: string;
  answer: string;
  is_correct: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
}
