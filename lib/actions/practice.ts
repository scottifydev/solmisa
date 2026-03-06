"use server";

import { createClient } from "@/lib/supabase/server";
import { isValidSlug } from "@/lib/utils/validation";

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

export interface DrillConfig {
  id: string;
  slug: string;
  title: string;
  drill_type: string;
  config: Record<string, unknown>;
}

export async function getDrillConfig(
  drillSlug: string,
): Promise<DrillConfig | null> {
  if (!isValidSlug(drillSlug)) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: drill } = await supabase
    .from("drills")
    .select("id, slug, title, drill_type, config")
    .eq("slug", drillSlug)
    .single();

  if (!drill) return null;

  return {
    id: drill.id,
    slug: drill.slug,
    title: drill.title,
    drill_type: drill.drill_type,
    config: (drill.config ?? {}) as Record<string, unknown>,
  };
}

export async function logDrillSession(
  drillSlug: string,
  durationMinutes: number,
  itemsAttempted: number,
) {
  if (!isValidSlug(drillSlug)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("activity_logs").insert({
    user_id: user.id,
    activity_type: "drill_session",
    duration_minutes: durationMinutes,
    notes: JSON.stringify({
      drill_slug: drillSlug,
      items_attempted: itemsAttempted,
    }),
  });
  if (error) console.warn("Failed to log drill session:", error.message);
}

// ─── Focus Practice (weak dimension → drill mapping) ─────

export interface FocusDrill {
  drillSlug: string;
  drillTitle: string;
  dimension: string;
  dimensionName: string;
  accuracy: number;
  reason: string;
}

const DIMENSION_TO_DRILL_PREFIX: Record<string, string[]> = {
  degree_recognition: ["degree_recognition"],
  ear_training: ["interval", "chord"],
  theory: ["theory", "key_signature", "scale", "roman_numeral"],
  rhythm: ["rhythm"],
  sight_reading: ["sight_reading", "note_reading"],
};

function dimensionGroupToDrillPrefixes(dimSlug: string): string[] {
  for (const [group, prefixes] of Object.entries(DIMENSION_TO_DRILL_PREFIX)) {
    if (dimSlug.startsWith(group.split("_")[0] ?? "")) return prefixes;
  }
  // Fall back to checking dimension slug prefix directly
  const prefix = dimSlug.split("_").slice(0, -1).join("_");
  return prefix ? [prefix] : [];
}

export async function getFocusPractice(limit = 3): Promise<FocusDrill[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Get radar scores
  const { data: radarScores } = await supabase
    .from("radar_cache")
    .select("dimension, score, total_reviews")
    .eq("user_id", user.id)
    .gt("total_reviews", 2)
    .order("score");

  if (!radarScores || radarScores.length === 0) return [];

  // Get unlocked drill slugs
  const { data: completedLessons } = await supabase
    .from("lesson_progress")
    .select("lessons!inner(unlocks_drills)")
    .eq("user_id", user.id)
    .eq("status", "completed");

  const unlockedSlugs = new Set<string>();
  for (const lp of completedLessons ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unlocks = ((lp.lessons as any)?.unlocks_drills ?? []) as string[];
    for (const slug of unlocks) unlockedSlugs.add(slug);
  }

  if (unlockedSlugs.size === 0) return [];

  // Get all drills
  const { data: allDrills } = await supabase
    .from("drills")
    .select("slug, title");

  const drillMap = new Map<string, string>();
  for (const d of allDrills ?? []) {
    if (unlockedSlugs.has(d.slug)) drillMap.set(d.slug, d.title);
  }

  // Import dimensions map
  const { DIMENSION_MAP } = await import("@/lib/radar/dimensions");

  const results: FocusDrill[] = [];
  for (const score of radarScores) {
    if (results.length >= limit) break;
    if (score.score >= 0.7) continue; // Not weak enough

    const dimInfo = DIMENSION_MAP.get(score.dimension);
    if (!dimInfo) continue;

    const prefixes = dimensionGroupToDrillPrefixes(score.dimension);
    let matchedSlug: string | null = null;
    let matchedTitle = "";

    for (const [slug, title] of drillMap) {
      if (prefixes.some((p) => slug.includes(p))) {
        matchedSlug = slug;
        matchedTitle = title;
        break;
      }
    }

    if (!matchedSlug) continue;

    const pct = Math.round(score.score * 100);
    results.push({
      drillSlug: matchedSlug,
      drillTitle: matchedTitle,
      dimension: score.dimension,
      dimensionName: dimInfo.name,
      accuracy: score.score,
      reason: `${dimInfo.name} accuracy is ${pct}% — focused repetition builds this skill.`,
    });
  }

  return results;
}

export interface PracticeRecommendation {
  id: string;
  dimension: string;
  tool_type: string;
  tool_name: string;
  tool_url: string | null;
  description: string | null;
}

const ACCURACY_THRESHOLD = 0.7;

export async function getRecommendations(
  limit = 3,
): Promise<PracticeRecommendation[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Get per-dimension accuracy from review records
  const { data: records } = await supabase
    .from("review_records")
    .select("correct, radar_dimensions, user_card_state!inner(user_id)")
    .eq("user_card_state.user_id", user.id);

  const dimStats = new Map<string, { total: number; correct: number }>();
  for (const record of records ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dims = (record as any).radar_dimensions as string[] | null;
    if (!dims) continue;
    for (const dim of dims) {
      const stats = dimStats.get(dim) ?? { total: 0, correct: 0 };
      stats.total++;
      if (record.correct) stats.correct++;
      dimStats.set(dim, stats);
    }
  }

  // Find weak dimensions
  const weakDimensions: string[] = [];
  for (const [dim, stats] of dimStats) {
    if (stats.total >= 3 && stats.correct / stats.total < ACCURACY_THRESHOLD) {
      weakDimensions.push(dim);
    }
  }

  if (weakDimensions.length === 0) {
    // No weak dimensions — return general recommendations
    const { data: recs } = await supabase
      .from("practice_recommendations")
      .select("id, dimension, tool_type, tool_name, tool_url, description")
      .order("display_order")
      .limit(limit);
    return (recs ?? []) as PracticeRecommendation[];
  }

  // Fetch recommendations matching weak dimensions
  const { data: recs } = await supabase
    .from("practice_recommendations")
    .select("id, dimension, tool_type, tool_name, tool_url, description")
    .in("dimension", weakDimensions)
    .order("display_order")
    .limit(limit);

  return (recs ?? []) as PracticeRecommendation[];
}
