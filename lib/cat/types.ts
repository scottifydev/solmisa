import type { RadarGroup } from "@/lib/radar/dimensions";

export type CATItemType = "multiple_choice" | "aural" | "rhythm_tap";

export interface CATItem {
  id: string;
  dimension: string;
  group: RadarGroup;
  difficulty: number; // IRT difficulty parameter (1-5 scale)
  item_type: CATItemType;
  prompt: string;
  options?: { id: string; label: string }[];
  correct_answer: string;
  audio_degrees?: number[];
  drone_key?: string;
  rhythm_config?: {
    tempo: number;
    time_signature: [number, number];
    pattern: { beat: number; duration: number; rest?: boolean }[];
  };
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface DimensionEstimate {
  dimension: string;
  group: RadarGroup;
  theta: number; // ability estimate (-3 to +3 logit scale)
  standardError: number;
  itemsAdministered: number;
}

export interface TrackPlacement {
  trackSlug: string;
  startingLesson: number;
  confidence: ConfidenceLevel;
  dimensions: DimensionEstimate[];
}

export interface PlacementResult {
  tracks: TrackPlacement[];
  radarScores: {
    slug: string;
    name: string;
    group: RadarGroup;
    score: number;
  }[];
  lowConfidenceDimensions: string[];
}

export interface CATState {
  estimates: DimensionEstimate[];
  administered: string[];
  responses: { itemId: string; correct: boolean; responseTimeMs: number }[];
  completed: boolean;
}
