import type { SrsStageKey, SrsStageGroup } from "@/types/srs";
import { stageToGroup } from "@/lib/srs/stages";

export function selectModality(
  chainLink: {
    modalities: string[];
    modality_by_stage: Record<string, string>;
  },
  srsStage: SrsStageKey | null,
): string {
  if (srsStage) {
    const group = stageToGroup(srsStage);
    const stageModality = chainLink.modality_by_stage[group];
    if (stageModality) return stageModality;
  }

  return chainLink.modalities[0] ?? "select_one";
}

/**
 * Determine clef override for key signature cards based on SRS stage.
 * - apprentice/journeyman: treble (default)
 * - adept/virtuoso: bass (gated on Note Reading progress)
 * - mastered: random treble/bass
 *
 * Returns undefined if no override (use whatever clef is in card parameters).
 */
export function selectClefForKeySig(
  stageGroup: SrsStageGroup | null,
  hasNoteReadingBass: boolean,
): "treble" | "bass" | undefined {
  if (!stageGroup) return undefined;

  if (stageGroup === "mastered") {
    return Math.random() < 0.5 ? "treble" : "bass";
  }

  if (stageGroup === "adept" || stageGroup === "virtuoso") {
    return hasNoteReadingBass ? "bass" : "treble";
  }

  return undefined;
}
