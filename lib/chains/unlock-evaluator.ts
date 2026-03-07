import { createClient } from "@/lib/supabase/server";
import { stageIndex } from "@/lib/srs/stages";
import type { SrsStageKey } from "@/types/srs";
import type { UnlockResult } from "./types";

export async function evaluateUnlocks(
  userId: string,
  cardTemplateId: string,
  newSrsStage: SrsStageKey,
): Promise<UnlockResult | null> {
  const supabase = await createClient();

  // Find chain_links referencing this card template
  const { data: links } = await supabase
    .from("chain_links")
    .select(
      "id, chain_id, position, unlock_stage, chain_definitions!inner(id, slug, name, root_key, total_links)",
    )
    .eq("card_template_id", cardTemplateId);

  if (!links || links.length === 0) return null;

  for (const link of links) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain = link.chain_definitions as any;
    const nextPosition = link.position + 1;

    if (nextPosition > chain.total_links) {
      // Last link — check if all mastered for completed_once
      if (newSrsStage === "mastered") {
        await supabase
          .from("user_chain_progress")
          .update({ completed_once: true })
          .eq("user_id", userId)
          .eq("chain_id", chain.id);
      }
      continue;
    }

    // Get the next link
    const { data: nextLink } = await supabase
      .from("chain_links")
      .select("id, card_template_id, unlock_stage, description")
      .eq("chain_id", chain.id)
      .eq("position", nextPosition)
      .single();

    if (!nextLink) continue;

    // Check if the new stage meets the unlock requirement
    const requiredStage = nextLink.unlock_stage as SrsStageKey;
    if (stageIndex(newSrsStage) < stageIndex(requiredStage)) continue;

    // Check current progress
    const { data: progress } = await supabase
      .from("user_chain_progress")
      .select("id, highest_unlocked_position")
      .eq("user_id", userId)
      .eq("chain_id", chain.id)
      .single();

    if (!progress) continue;

    // Already unlocked?
    if (nextPosition <= progress.highest_unlocked_position) continue;

    // UNLOCK: update highest position
    await supabase
      .from("user_chain_progress")
      .update({ highest_unlocked_position: nextPosition })
      .eq("id", progress.id);

    // Seed the new card's user_card_state
    const { data: instance } = await supabase
      .from("card_instances")
      .select("id")
      .eq("template_id", nextLink.card_template_id)
      .limit(1)
      .single();

    if (instance) {
      const { data: existingState } = await supabase
        .from("user_card_state")
        .select("id")
        .eq("user_id", userId)
        .eq("card_instance_id", instance.id)
        .maybeSingle();

      if (!existingState) {
        await supabase.from("user_card_state").insert({
          user_id: userId,
          card_instance_id: instance.id,
          srs_stage: "apprentice_1",
          difficulty_tier: "intro",
          ease_factor: 2.5,
          interval_days: 0,
          next_review_at: new Date().toISOString(),
          correct_streak: 0,
          total_reviews: 0,
          total_correct: 0,
        });
      }
    }

    return {
      chainSlug: chain.slug,
      chainName: chain.name,
      newPosition: nextPosition,
      linkDescription: nextLink.description ?? "",
      cardTemplateId: nextLink.card_template_id,
    };
  }

  return null;
}
