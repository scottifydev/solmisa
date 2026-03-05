"use server";

import { createClient } from "@/lib/supabase/server";
import type { PlacementResult } from "@/lib/cat/types";

export async function savePlacementResults(
  placement: PlacementResult,
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1. Write onboarding_results per dimension
  const onboardingRows = placement.radarScores.map((score) => ({
    user_id: user.id,
    dimension: score.slug,
    estimated_level: score.score,
    confidence: placement.lowConfidenceDimensions.includes(score.slug)
      ? "low"
      : "high",
  }));

  if (onboardingRows.length > 0) {
    await supabase
      .from("onboarding_results")
      .upsert(onboardingRows, { onConflict: "user_id,dimension" });
  }

  // 2. Write radar_cache entries
  const radarRows = placement.radarScores.map((score) => ({
    user_id: user.id,
    dimension: score.slug,
    score: score.score,
    total_reviews: 0,
    computed_at: new Date().toISOString(),
  }));

  if (radarRows.length > 0) {
    await supabase
      .from("radar_cache")
      .upsert(radarRows, { onConflict: "user_id,dimension" });
  }

  // 3. Create track_progress rows with starting lessons
  const trackSlugs = ["ear_training", "theory", "rhythm", "sight_reading"];
  const { data: tracks } = await supabase
    .from("skill_tracks")
    .select("id, slug")
    .in("slug", trackSlugs);

  if (tracks) {
    const trackMap = new Map(tracks.map((t) => [t.slug, t.id]));

    const progressRows = placement.tracks
      .filter((tp) => trackMap.has(tp.trackSlug))
      .map((tp) => ({
        user_id: user.id,
        track_id: trackMap.get(tp.trackSlug)!,
        current_lesson: tp.startingLesson,
        lessons_completed: tp.startingLesson - 1,
      }));

    if (progressRows.length > 0) {
      await supabase
        .from("track_progress")
        .upsert(progressRows, { onConflict: "user_id,track_id" });
    }
  }

  // 4. Clear cat_state and mark onboarding complete
  await supabase
    .from("profiles")
    .update({
      cat_state: null,
      onboarding_complete: true,
    })
    .eq("id", user.id);

  return { success: true };
}

export async function saveCATState(
  catState: Record<string, unknown>,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ cat_state: catState })
    .eq("id", user.id);
}
