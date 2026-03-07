import type { SrsStageKey } from "@/types/srs";
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
