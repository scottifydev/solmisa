export type SrsStage = "apprentice" | "journeyman" | "adept" | "virtuoso" | "mastered";

export type ReviewResult = "correct" | "incorrect" | "skip";

export interface ReviewQueueItem {
  cardId: string;
  front: string;
  back: string;
  dueAt: string;
  interval: number;
  easeFactor: number;
  stage: SrsStage;
  cardCategory: "perceptual" | "declarative";
}

export interface ReviewQueueResponse {
  items: ReviewQueueItem[];
  totalDue: number;
}

export interface ReviewAnswerRequest {
  cardId: string;
  result: ReviewResult;
  responseTimeMs: number;
}

export interface ReviewAnswerResponse {
  newInterval: number;
  newEaseFactor: number;
  newStage: SrsStage;
  nextDueAt: string;
}

export interface ReviewStatsResponse {
  totalCards: number;
  dueToday: number;
  byStage: SrsStageGroup[];
  streakDays: number;
  reviewsToday: number;
}

export interface SrsStageGroup {
  stage: SrsStage;
  count: number;
  percentage: number;
}
