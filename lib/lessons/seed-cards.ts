"use server";

import { createClient } from "@/lib/supabase/server";

interface SeedCardsV2Result {
  seeded_count: number;
  cards: Array<{ slug: string; initial_interval: string }>;
  lesson_id: string;
  track_id: string;
}

export async function seedLessonCardsV2(
  userId: string,
  lessonId: string,
  initialIntervalOverride?: number,
): Promise<SeedCardsV2Result> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("seed_lesson_cards_v2", {
    p_user_id: userId,
    p_lesson_id: lessonId,
    ...(initialIntervalOverride !== undefined && {
      p_initial_interval_override: `${initialIntervalOverride} hours`,
    }),
  });

  if (error) throw error;

  return (
    (data as SeedCardsV2Result) ?? {
      seeded_count: 0,
      cards: [],
      lesson_id: lessonId,
      track_id: "",
    }
  );
}
