export interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  title: string;
  order: number;
  isCompleted: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  moduleId: string;
  moduleTitle: string;
  stages: LessonStage[];
}

export interface ModuleProgress {
  moduleId: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface LessonProgress {
  lessonId: string;
  currentStageIndex: number;
  totalStages: number;
  isCompleted: boolean;
}

export type LessonStageType =
  | "aural_teach"
  | "theory_teach"
  | "aural_quiz"
  | "theory_quiz"
  | "practice";

export interface LessonStage {
  id: string;
  type: LessonStageType;
  config: Record<string, unknown>;
  order: number;
}

export interface AuralTeachStage {
  type: "aural_teach";
  audioSrc: string;
  instructions: string;
  degree: number;
  key: string;
}

export interface TheoryTeachStage {
  type: "theory_teach";
  content: string;
  notation?: string;
  degree: number;
}

export interface AuralQuizStage {
  type: "aural_quiz";
  audioSrc: string;
  options: QuizOption[];
  correctAnswer: string;
}

export interface TheoryQuizStage {
  type: "theory_quiz";
  question: string;
  options: QuizOption[];
  correctAnswer: string;
}

export interface PracticeStage {
  type: "practice";
  instructions: string;
  audioSrc?: string;
  targetDegrees: number[];
}

export interface QuizOption {
  id: string;
  label: string;
  sublabel?: string;
  degree?: number;
}

export interface StageRendererProps {
  stage: LessonStage;
  onComplete: () => void;
  onAnswer?: (correct: boolean) => void;
}

export interface LessonRenderData {
  lesson: Lesson;
  progress: LessonProgress;
  stages: LessonStage[];
}
