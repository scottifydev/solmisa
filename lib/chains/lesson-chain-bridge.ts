"use server";

import { createClient } from "@/lib/supabase/server";

// Maps track_slug + module_order to chain topics they unlock
// Theory track module orders:
//   TH-1: Notation Basics
//   TH-2: Rhythm & Meter
//   TH-3: Key Signatures → key_signature chains
//   TH-4: Intervals → interval chains
//   TH-5: Scale Construction
//   TH-6: Minor Keys → mode chains
//   TH-7: Diatonic Chords → chord chains
//   TH-8: Progressions → progression chains
const TRACK_MODULE_TO_TOPIC: Record<string, Record<number, string>> = {
  theory: {
    3: "key_signature",
    4: "interval",
    6: "mode",
    7: "chord",
    8: "progression",
  },
};

export async function activateChainsForLesson(
  userId: string,
  lessonId: string,
): Promise<number> {
  const supabase = await createClient();

  // Look up lesson → module → track to determine which topic to unlock
  const { data: lesson } = await supabase
    .from("lessons")
    .select("module_id, track_id")
    .eq("id", lessonId)
    .single();

  if (!lesson) return 0;

  // Get track slug and module order
  const [{ data: track }, { data: mod }] = await Promise.all([
    supabase
      .from("skill_tracks")
      .select("slug")
      .eq("id", lesson.track_id)
      .single(),
    supabase
      .from("modules")
      .select("module_order")
      .eq("id", lesson.module_id)
      .single(),
  ]);

  if (!track || !mod) return 0;

  const topicMap = TRACK_MODULE_TO_TOPIC[track.slug];
  if (!topicMap) return 0;

  const topic = topicMap[mod.module_order];
  if (!topic) return 0;

  // Find chains with this topic that have lesson_prerequisite unlock condition
  const { data: chains } = await supabase
    .from("chain_definitions")
    .select("id, slug, total_links")
    .eq("is_published", true)
    .eq("topic", topic);

  if (!chains || chains.length === 0) return 0;

  let activated = 0;

  for (const chain of chains) {
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
