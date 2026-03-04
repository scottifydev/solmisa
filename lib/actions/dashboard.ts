"use server";

import { createClient } from "@/lib/supabase/server";
import type { ReviewStatsResponse, SrsStageGroup, SrsStage } from "@/types/srs";
import type { ModuleProgress } from "@/types/lesson";

export async function getDashboardStats(): Promise<ReviewStatsResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const now = new Date().toISOString();

  // Get total cards and due count
  const { data: cards } = await supabase
    .from("srs_cards")
    .select("id, stage, due_at")
    .eq("user_id", user.id);

  const allCards = cards ?? [];
  const dueToday = allCards.filter((c) => c.due_at <= now).length;

  // Count by stage
  const stageCounts: Record<string, number> = {};
  for (const card of allCards) {
    stageCounts[card.stage] = (stageCounts[card.stage] || 0) + 1;
  }

  const total = allCards.length || 1;
  const byStage: SrsStageGroup[] = (
    ["apprentice", "journeyman", "adept", "virtuoso", "mastered"] as SrsStage[]
  ).map((stage) => ({
    stage,
    count: stageCounts[stage] || 0,
    percentage: Math.round(((stageCounts[stage] || 0) / total) * 100),
  }));

  // Get today's review count
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: reviewsToday } = await supabase
    .from("srs_reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("reviewed_at", todayStart.toISOString());

  // Calculate streak (simplified: count consecutive days with reviews)
  const { data: recentReviews } = await supabase
    .from("srs_reviews")
    .select("reviewed_at")
    .eq("user_id", user.id)
    .order("reviewed_at", { ascending: false })
    .limit(100);

  let streakDays = 0;
  if (recentReviews && recentReviews.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const hasReview = recentReviews.some((r) => {
        const d = new Date(r.reviewed_at);
        return d >= dayStart && d < dayEnd;
      });

      if (hasReview) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today might not have a review yet; check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
  }

  return {
    totalCards: allCards.length,
    dueToday,
    byStage,
    streakDays,
    reviewsToday: reviewsToday ?? 0,
  };
}

export async function getModuleProgress(): Promise<ModuleProgress[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("is_published", true);

  if (!modules) return [];

  const progress: ModuleProgress[] = [];

  for (const mod of modules) {
    const { count: totalLessons } = await supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("module_id", mod.id)
      .eq("is_published", true);

    const { count: completedLessons } = await supabase
      .from("user_lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in(
        "lesson_id",
        (
          await supabase
            .from("lessons")
            .select("id")
            .eq("module_id", mod.id)
        ).data?.map((l) => l.id) ?? []
      );

    const total = totalLessons ?? 0;
    const completed = completedLessons ?? 0;

    progress.push({
      moduleId: mod.id,
      completedLessons: completed,
      totalLessons: total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return progress;
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
