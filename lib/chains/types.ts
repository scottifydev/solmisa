import type { SrsStageKey } from "@/types/srs";

export interface FlowStreamCard {
  userCardStateId: string | null;
  cardInstanceId: string;
  cardTemplateId: string;
  promptRendered: string;
  answerData: Record<string, unknown>;
  optionsData: Record<string, unknown>[] | null;
  parameters: Record<string, unknown>;
  feedback: Record<string, unknown>;
  chainSlug: string;
  chainName: string;
  chainRootKey: string;
  linkPosition: number;
  totalLinks: number;
  linkDescription: string;
  modality: string;
  isNew: boolean;
  srsStage: SrsStageKey | null;
}

export interface UnlockResult {
  chainSlug: string;
  chainName: string;
  newPosition: number;
  linkDescription: string;
  cardTemplateId: string;
}

export interface FlowState {
  chains: {
    slug: string;
    name: string;
    rootKey: string;
    totalLinks: number;
    highestUnlocked: number;
    dueCount: number;
    completedOnce: boolean;
    lastReviewedAt: string | null;
  }[];
  totalDue: number;
  hasChains: boolean;
}

export interface FlowAnswerRequest {
  user_card_state_id: string;
  correct: boolean;
  response_time_ms: number;
  confidence?: "easy" | "good" | "hard" | "knew_it" | "blanked";
  consecutiveMissCount?: number;
}
