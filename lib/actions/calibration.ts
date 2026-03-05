"use server";

import { createClient } from "@/lib/supabase/server";

export interface CalibrationSuggestion {
  dimension: string;
  action: "skip_ahead" | "step_back";
  accuracy: number;
  totalReviews: number;
}

export interface CalibrationCheck {
  suggestions: CalibrationSuggestion[];
  sessionCount: number;
}

export async function checkCalibration(): Promise<CalibrationCheck> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { suggestions: [], sessionCount: 0 };

  // Count distinct review sessions (distinct dates with reviews)
  const { data: records } = await supabase
    .from("review_records")
    .select("created_at, user_card_state!inner(user_id)")
    .eq("user_card_state.user_id", user.id)
    .order("created_at");

  if (!records || records.length === 0)
    return { suggestions: [], sessionCount: 0 };

  // Count sessions by distinct calendar dates
  const sessionDates = new Set<string>();
  for (const r of records) {
    if (r.created_at) {
      sessionDates.add(r.created_at.slice(0, 10));
    }
  }
  const sessionCount = sessionDates.size;

  // Only trigger after 1-3 sessions
  if (sessionCount < 1 || sessionCount > 3)
    return { suggestions: [], sessionCount };

  // Get low-confidence, uncalibrated onboarding dimensions
  const { data: onboarding } = await supabase
    .from("onboarding_results")
    .select("dimension, confidence, calibration_complete")
    .eq("user_id", user.id);

  if (!onboarding) return { suggestions: [], sessionCount };

  // Filter: confidence is "low" (stored as string) and not yet calibrated
  const lowConfDims = onboarding.filter(
    (o) =>
      (o.confidence === "low" ||
        (typeof o.confidence === "number" && o.confidence < 0.6)) &&
      !o.calibration_complete,
  );

  if (lowConfDims.length === 0) return { suggestions: [], sessionCount };

  // Compute per-dimension accuracy from review_records
  const { data: allRecords } = await supabase
    .from("review_records")
    .select("correct, radar_dimensions, user_card_state!inner(user_id)")
    .eq("user_card_state.user_id", user.id);

  const dimStats = new Map<string, { total: number; correct: number }>();
  for (const record of allRecords ?? []) {
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

  const suggestions: CalibrationSuggestion[] = [];

  for (const dim of lowConfDims) {
    const stats = dimStats.get(dim.dimension);
    if (!stats || stats.total < 3) continue; // Need minimum reviews

    const accuracy = stats.correct / stats.total;

    if (accuracy > 0.9) {
      suggestions.push({
        dimension: dim.dimension,
        action: "skip_ahead",
        accuracy,
        totalReviews: stats.total,
      });
    } else if (accuracy < 0.4) {
      suggestions.push({
        dimension: dim.dimension,
        action: "step_back",
        accuracy,
        totalReviews: stats.total,
      });
    }
  }

  return { suggestions, sessionCount };
}

export async function acceptCalibration(
  dimension: string,
  action: "skip_ahead" | "step_back",
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (action === "skip_ahead") {
    // Find uncompleted lessons in this dimension's track and mark first few as complete
    const { data: onboarding } = await supabase
      .from("onboarding_results")
      .select("track_id")
      .eq("user_id", user.id)
      .eq("dimension", dimension)
      .single();

    if (onboarding?.track_id) {
      // Get first 3 uncompleted lessons in this track
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("track_id", onboarding.track_id)
        .order("lesson_order")
        .limit(10);

      if (lessons) {
        const { data: progress } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .in(
            "lesson_id",
            lessons.map((l) => l.id),
          );

        const completedIds = new Set((progress ?? []).map((p) => p.lesson_id));
        const uncompleted = lessons.filter((l) => !completedIds.has(l.id));
        const toSkip = uncompleted.slice(0, 3);

        if (toSkip.length > 0) {
          const now = new Date().toISOString();
          await supabase.from("lesson_progress").upsert(
            toSkip.map((l) => ({
              user_id: user.id,
              lesson_id: l.id,
              status: "completed" as const,
              completed_at: now,
            })),
            { onConflict: "user_id,lesson_id" },
          );

          // Update track_progress
          const { data: tp } = await supabase
            .from("track_progress")
            .select("lessons_completed")
            .eq("user_id", user.id)
            .eq("track_id", onboarding.track_id)
            .single();

          if (tp) {
            await supabase
              .from("track_progress")
              .update({
                lessons_completed: tp.lessons_completed + toSkip.length,
              })
              .eq("user_id", user.id)
              .eq("track_id", onboarding.track_id);
          }
        }
      }
    }
  }
  // step_back: no lesson changes needed, user just continues from current position
  // The suggestion itself is informational — user sees they need more practice

  // Mark calibration complete for this dimension
  await supabase
    .from("onboarding_results")
    .update({ calibration_complete: true })
    .eq("user_id", user.id)
    .eq("dimension", dimension);

  return { success: true };
}

export async function dismissCalibration(
  dimension: string,
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("onboarding_results")
    .update({ calibration_complete: true })
    .eq("user_id", user.id)
    .eq("dimension", dimension);

  return { success: true };
}
