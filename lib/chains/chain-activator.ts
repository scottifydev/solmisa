import { createClient } from "@/lib/supabase/server";

export async function activateStarterChains(userId: string): Promise<number> {
  const supabase = await createClient();

  // Find cold_start chains that are published
  const { data: coldStartChains } = await supabase
    .from("chain_definitions")
    .select("id, slug, total_links")
    .eq("is_published", true)
    .eq("unlock_condition->>type", "cold_start");

  if (!coldStartChains || coldStartChains.length === 0) return 0;

  let activated = 0;

  for (const chain of coldStartChains) {
    // Check if already active
    const { data: existing } = await supabase
      .from("user_chain_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("chain_id", chain.id)
      .maybeSingle();

    if (existing) continue;

    // Insert user_chain_progress
    const { error: progressError } = await supabase
      .from("user_chain_progress")
      .insert({
        user_id: userId,
        chain_id: chain.id,
        highest_unlocked_position: 1,
        is_active: true,
        total_reviews: 0,
        completed_once: false,
      });

    if (progressError) continue;

    // Find link 1's card template
    const { data: link1 } = await supabase
      .from("chain_links")
      .select("card_template_id")
      .eq("chain_id", chain.id)
      .eq("position", 1)
      .single();

    if (!link1) continue;

    // Find card instance for this template
    const { data: instance } = await supabase
      .from("card_instances")
      .select("id")
      .eq("template_id", link1.card_template_id)
      .limit(1)
      .single();

    if (!instance) continue;

    // Check if user_card_state already exists
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

    activated++;
  }

  return activated;
}

export async function evaluateNeighborUnlocks(
  userId: string,
  masteredChainSlug: string,
  _masteredPosition: number,
): Promise<string[]> {
  const supabase = await createClient();

  // Find neighbor_mastery chains
  const { data: neighborChains } = await supabase
    .from("chain_definitions")
    .select("id, slug, unlock_condition")
    .eq("is_published", true)
    .eq("unlock_condition->>type", "neighbor_mastery");

  if (!neighborChains || neighborChains.length === 0) return [];

  const activated: string[] = [];

  for (const chain of neighborChains) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const condition = chain.unlock_condition as any;
    if (condition?.requires_chain !== masteredChainSlug) continue;

    // Check if already active
    const { data: existing } = await supabase
      .from("user_chain_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("chain_id", chain.id)
      .maybeSingle();

    if (existing) continue;

    // Activate: insert progress
    const { error: progressError } = await supabase
      .from("user_chain_progress")
      .insert({
        user_id: userId,
        chain_id: chain.id,
        highest_unlocked_position: 1,
        is_active: true,
        total_reviews: 0,
        completed_once: false,
      });

    if (progressError) continue;

    // Seed link 1
    const { data: link1 } = await supabase
      .from("chain_links")
      .select("card_template_id")
      .eq("chain_id", chain.id)
      .eq("position", 1)
      .single();

    if (!link1) continue;

    const { data: instance } = await supabase
      .from("card_instances")
      .select("id")
      .eq("template_id", link1.card_template_id)
      .limit(1)
      .single();

    if (!instance) continue;

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

    activated.push(chain.slug);
  }

  return activated;
}
