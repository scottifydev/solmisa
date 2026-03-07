import type { SrsStageKey, SrsStageGroup, DifficultyTier } from "@/types/srs";

// ─── Stage Transition Map ───────────────────────────────────

interface StageTransition {
  onCorrect: SrsStageKey | null; // null = mastered (no further)
  onIncorrect: SrsStageKey;
  intervalHours: number;
}

export const STAGE_TRANSITIONS: Record<SrsStageKey, StageTransition> = {
  apprentice_1: {
    onCorrect: "apprentice_2",
    onIncorrect: "apprentice_1",
    intervalHours: 4,
  },
  apprentice_2: {
    onCorrect: "apprentice_3",
    onIncorrect: "apprentice_1",
    intervalHours: 8,
  },
  apprentice_3: {
    onCorrect: "apprentice_4",
    onIncorrect: "apprentice_2",
    intervalHours: 24,
  },
  apprentice_4: {
    onCorrect: "journeyman_1",
    onIncorrect: "apprentice_3",
    intervalHours: 48,
  },
  journeyman_1: {
    onCorrect: "journeyman_2",
    onIncorrect: "apprentice_4",
    intervalHours: 96,
  },
  journeyman_2: {
    onCorrect: "adept_1",
    onIncorrect: "journeyman_1",
    intervalHours: 168,
  },
  adept_1: {
    onCorrect: "adept_2",
    onIncorrect: "journeyman_2",
    intervalHours: 336,
  },
  adept_2: {
    onCorrect: "virtuoso_1",
    onIncorrect: "adept_1",
    intervalHours: 720,
  },
  virtuoso_1: {
    onCorrect: "virtuoso_2",
    onIncorrect: "adept_2",
    intervalHours: 1440,
  },
  virtuoso_2: {
    onCorrect: "mastered",
    onIncorrect: "virtuoso_1",
    intervalHours: 2880,
  },
  mastered: {
    onCorrect: null,
    onIncorrect: "virtuoso_1",
    intervalHours: Infinity,
  },
};

export function getNextStage(
  current: SrsStageKey,
  correct: boolean,
): SrsStageKey {
  const transition = STAGE_TRANSITIONS[current];

  if (correct) {
    return transition.onCorrect ?? current; // mastered stays mastered
  }

  return transition.onIncorrect;
}

export function getIntervalHours(stage: SrsStageKey): number {
  return STAGE_TRANSITIONS[stage].intervalHours;
}

export function stageToGroup(key: SrsStageKey): SrsStageGroup {
  if (key.startsWith("apprentice")) return "apprentice";
  if (key.startsWith("journeyman")) return "journeyman";
  if (key.startsWith("adept")) return "adept";
  if (key.startsWith("virtuoso")) return "virtuoso";
  return "mastered";
}

// ─── Stage Ordering ─────────────────────────────────────────

const STAGE_ORDER: SrsStageKey[] = [
  "apprentice_1",
  "apprentice_2",
  "apprentice_3",
  "apprentice_4",
  "journeyman_1",
  "journeyman_2",
  "adept_1",
  "adept_2",
  "virtuoso_1",
  "virtuoso_2",
  "mastered",
];

export function stageIndex(key: SrsStageKey): number {
  return STAGE_ORDER.indexOf(key);
}

/**
 * Only stretch tier can advance SRS beyond journeyman_2.
 * Returns true if SRS advancement is allowed at the given tier + target stage.
 */
export function canAdvanceSrs(
  tier: DifficultyTier,
  targetStage: SrsStageKey,
): boolean {
  if (tier === "stretch") return true;
  return stageIndex(targetStage) <= stageIndex("journeyman_2");
}

// ─── Audiation Pause by Stage ─────────────────────────────────

export const AUDIATION_PAUSE_MS: Record<SrsStageGroup, number> = {
  apprentice: 2000,
  journeyman: 1500,
  adept: 1200,
  virtuoso: 900,
  mastered: 750,
};

export function getAudiationPauseMs(stage: SrsStageKey): number {
  return AUDIATION_PAUSE_MS[stageToGroup(stage)];
}
