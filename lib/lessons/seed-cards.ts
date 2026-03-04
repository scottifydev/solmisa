"use server";

import { createClient } from "@/lib/supabase/server";
import type { StageQuizResult } from "@/types/lesson";
import type { SrsStageKey } from "@/types/srs";

interface SeedCardsInput {
  user_id: string;
  lesson_id: string;
  stage_results: StageQuizResult[];
}

interface SeedCardsOutput {
  cards_seeded: number;
  cards_skipped: number;
}

export async function seedCardsFromLesson(input: SeedCardsInput): Promise<SeedCardsOutput> {
  const supabase = await createClient();
  let seeded = 0;
  let skipped = 0;

  // Filter to quiz results that seed cards
  const seedable = input.stage_results.filter((r) => r.seeds_card);
  if (seedable.length === 0) return { cards_seeded: 0, cards_skipped: 0 };

  // Look up card templates by slug
  const slugs = seedable.map((r) => r.seeds_card!);
  const { data: templates } = await supabase
    .from("card_templates")
    .select("id, slug, is_parametric, card_category")
    .in("slug", slugs);

  if (!templates || templates.length === 0) return { cards_seeded: 0, cards_skipped: 0 };

  const templateBySlug = new Map(templates.map((t) => [t.slug, t]));

  for (const result of seedable) {
    const template = templateBySlug.get(result.seeds_card!);
    if (!template) {
      skipped++;
      continue;
    }

    // Create card instance
    const { data: instance, error: instanceError } = await supabase
      .from("card_instances")
      .insert({
        template_id: template.id,
        rendered_prompt: null,
        rendered_options: null,
        rendered_answer: null,
        tier: "intro",
        params: null,
      })
      .select("id")
      .single();

    if (instanceError || !instance) {
      skipped++;
      continue;
    }

    // Determine initial review time based on correctness
    const hoursOffset = result.correct ? 4 : 2;
    const nextReviewAt = new Date(Date.now() + hoursOffset * 60 * 60 * 1000).toISOString();
    const initialStage: SrsStageKey = "apprentice_1";

    // Insert user_card_state (ON CONFLICT DO NOTHING equivalent)
    const { error: stateError } = await supabase
      .from("user_card_state")
      .upsert(
        {
          user_id: input.user_id,
          card_instance_id: instance.id,
          srs_stage: initialStage,
          difficulty_tier: "intro",
          ease_factor: 2.5,
          interval_days: 0,
          next_review_at: nextReviewAt,
          consecutive_correct: result.correct ? 1 : 0,
          total_reviews: 1,
          total_correct: result.correct ? 1 : 0,
        },
        { onConflict: "user_id,card_instance_id", ignoreDuplicates: true },
      );

    if (stateError) {
      skipped++;
    } else {
      seeded++;
    }
  }

  return { cards_seeded: seeded, cards_skipped: skipped };
}
