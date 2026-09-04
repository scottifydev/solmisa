"use server";

import { createClient } from "@/lib/supabase/server";

interface SeedCardsV2Result {
  seeded_count: number;
  cards: Array<{ slug: string; initial_interval: string }>;
  lesson_id: string;
  track_id: string;
}

export async function seedLessonCardsV2(
  lessonId: string,
  initialIntervalOverride?: number,
): Promise<SeedCardsV2Result> {
  const supabase = await createClient();

  // The user is read from the session, never from the caller. seed_lesson_cards_v2
  // is SECURITY DEFINER and does not check ownership, so a client-supplied id
  // would let any signed-in user seed cards for someone else.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("seed_lesson_cards_v2", {
    p_user_id: user.id,
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
