"use server";

import { createClient } from "@/lib/supabase/server";
import type { ReviewStatsResponse, SrsStageGroup, SrsStage } from "@/types/srs";
import type { ModuleProgress } from "@/types/lesson";

export async function getDashboardStats(): Promise<ReviewStatsResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const now = new Date().toISOString();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Fetch counts and stage data in parallel
  const [
    { count: totalCards },
    { count: dueToday },
    { data: stageData },
    { count: reviewsToday },
  ] = await Promise.all([
    supabase
      .from("srs_cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("srs_cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lte("due_at", now),
    supabase
      .from("srs_cards")
      .select("stage")
      .eq("user_id", user.id),
    supabase
      .from("srs_reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("reviewed_at", todayStart.toISOString()),
  ]);

  const total = totalCards ?? 0;
  const stageCounts: Record<string, number> = {};
  for (const card of stageData ?? []) {
    stageCounts[card.stage] = (stageCounts[card.stage] || 0) + 1;
  }

  const byStage: SrsStageGroup[] = (
    ["apprentice", "journeyman", "adept", "virtuoso", "mastered"] as SrsStage[]
  ).map((stage) => ({
    stage,
    count: stageCounts[stage] || 0,
    percentage: Math.round(((stageCounts[stage] || 0) / (total || 1)) * 100),
  }));

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
    totalCards: total,
    dueToday: dueToday ?? 0,
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

  const moduleIds = modules.map((m) => m.id);

  // Fetch all lessons and progress in two queries instead of 3N+1
  const [{ data: allLessons }, { data: completedProgress }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, module_id")
      .in("module_id", moduleIds)
      .eq("is_published", true),
    supabase
      .from("user_lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id),
  ]);

  const completedIds = new Set((completedProgress ?? []).map((p) => p.lesson_id));

  // Group by module
  const lessonsByModule = new Map<string, string[]>();
  for (const lesson of allLessons ?? []) {
    const existing = lessonsByModule.get(lesson.module_id) ?? [];
    existing.push(lesson.id);
    lessonsByModule.set(lesson.module_id, existing);
  }

  return modules.map((mod) => {
    const lessonIds = lessonsByModule.get(mod.id) ?? [];
    const total = lessonIds.length;
    const completed = lessonIds.filter((id) => completedIds.has(id)).length;
    return {
      moduleId: mod.id,
      completedLessons: completed,
      totalLessons: total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });
}

