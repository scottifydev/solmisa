"use server";

import { createClient } from "@/lib/supabase/server";
import type { ReviewStatsResponse, SrsStageGroup } from "@/types/srs";
import { stageToGroup } from "@/lib/srs/stages";

export async function getNavStats(): Promise<{
  streak: number;
  reviewCount: number;
  newLessonCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { streak: 0, reviewCount: 0, newLessonCount: 0 };

  const now = new Date().toISOString();
  const [
    { count: dueToday },
    { data: profile },
    { count: totalLessons },
    { count: completedLessons },
  ] = await Promise.all([
    supabase
      .from("user_card_state")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("srs_stage", "mastered")
      .lte("next_review_at", now),
    supabase.from("profiles").select("streak_days").eq("id", user.id).single(),
    supabase.from("lessons").select("id", { count: "exact", head: true }),
    supabase
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed"),
  ]);

  const newLessons = Math.max(0, (totalLessons ?? 0) - (completedLessons ?? 0));

  return {
    streak: profile?.streak_days ?? 0,
    reviewCount: dueToday ?? 0,
    newLessonCount: newLessons,
  };
}

export async function getDashboardStats(): Promise<ReviewStatsResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const now = new Date().toISOString();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    { count: totalCards },
    { count: dueToday },
    { data: stageData },
    { count: reviewsToday },
    { data: profile },
    { data: weekReviews },
  ] = await Promise.all([
    supabase
      .from("user_card_state")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("user_card_state")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("srs_stage", "mastered")
      .lte("next_review_at", now),
    supabase.from("user_card_state").select("srs_stage").eq("user_id", user.id),
    supabase
      .from("review_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString()),
    supabase.from("profiles").select("streak_days").eq("id", user.id).single(),
    supabase
      .from("review_records")
      .select("correct")
      .eq("user_id", user.id)
      .gte("created_at", weekAgo.toISOString()),
  ]);

  const total = totalCards ?? 0;

  // Aggregate stages into groups
  const groupCounts: Record<SrsStageGroup, number> = {
    apprentice: 0,
    journeyman: 0,
    adept: 0,
    virtuoso: 0,
    mastered: 0,
  };
  for (const card of stageData ?? []) {
    const group = stageToGroup(card.srs_stage);
    groupCounts[group]++;
  }

  const byStage = (
    [
      "apprentice",
      "journeyman",
      "adept",
      "virtuoso",
      "mastered",
    ] as SrsStageGroup[]
  ).map((stage) => ({
    stage,
    count: groupCounts[stage],
  }));

  const weekTotal = weekReviews?.length ?? 0;
  const weekCorrect = weekReviews?.filter((r) => r.correct).length ?? 0;
  const weekAccuracy =
    weekTotal > 0 ? Math.round((weekCorrect / weekTotal) * 100) : null;

  return {
    totalCards: total,
    dueToday: dueToday ?? 0,
    byStage,
    streakDays: profile?.streak_days ?? 0,
    reviewsToday: reviewsToday ?? 0,
    weekAccuracy,
  };
}
