"use server";

import { createClient } from "@/lib/supabase/server";

export interface DrillItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  drill_type: string;
  track_slug: string;
  unlocked: boolean;
  unlocked_by_lesson: string | null;
}

export interface PracticeTabData {
  drills: DrillItem[];
  trackSlug: string;
}

export async function getPracticeData(
  trackSlug?: string,
): Promise<PracticeTabData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { drills: [], trackSlug: trackSlug ?? "ear_training" };

  // Get selected track
  let trackFilter: { id: string; slug: string } | null = null;
  if (trackSlug) {
    const { data: track } = await supabase
      .from("skill_tracks")
      .select("id, slug")
      .eq("slug", trackSlug)
      .single();
    trackFilter = track;
  }

  if (!trackFilter) {
    const { data: firstTrack } = await supabase
      .from("skill_tracks")
      .select("id, slug")
      .order("display_order")
      .limit(1)
      .single();
    trackFilter = firstTrack;
  }

  if (!trackFilter)
    return { drills: [], trackSlug: trackSlug ?? "ear_training" };

  // Fetch drills for track
  const { data: drills } = await supabase
    .from("drills")
    .select("id, slug, title, description, drill_type")
    .eq("track_id", trackFilter.id)
    .order("display_order");

  // Get completed lessons to determine unlock state
  const { data: completedLessons } = await supabase
    .from("lesson_progress")
    .select("lesson_id, lessons!inner(unlocks_drills, title)")
    .eq("user_id", user.id)
    .eq("status", "completed");

  // Build set of unlocked drill slugs and map to lesson titles
  const unlockedSlugs = new Set<string>();
  const drillToLesson = new Map<string, string>();

  for (const lp of completedLessons ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lesson = lp.lessons as any;
    const unlocks = (lesson?.unlocks_drills ?? []) as string[];
    for (const slug of unlocks) {
      unlockedSlugs.add(slug);
    }
  }

  // For locked drills, find which lesson unlocks them
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("title, unlocks_drills")
    .eq("track_id", trackFilter.id);

  for (const lesson of allLessons ?? []) {
    const unlocks = (lesson.unlocks_drills ?? []) as string[];
    for (const slug of unlocks) {
      if (!drillToLesson.has(slug)) {
        drillToLesson.set(slug, lesson.title);
      }
    }
  }

  const drillItems: DrillItem[] = (drills ?? []).map((d) => ({
    id: d.id,
    slug: d.slug,
    title: d.title,
    description: d.description,
    drill_type: d.drill_type,
    track_slug: trackFilter!.slug,
    unlocked: unlockedSlugs.has(d.slug),
    unlocked_by_lesson: unlockedSlugs.has(d.slug)
      ? null
      : (drillToLesson.get(d.slug) ?? null),
  }));

  return { drills: drillItems, trackSlug: trackFilter.slug };
}
