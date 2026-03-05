"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ACTIVITY_TYPES } from "@/lib/activity-types";

export interface ActivityLogEntry {
  id: string;
  activity_type: string;
  duration_minutes: number | null;
  notes: string | null;
  axis_impacts: Record<string, number>;
  created_at: string;
}

export async function logActivity(
  activityType: string,
  durationMinutes: number | null,
  notes: string | null,
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const typeConfig = ACTIVITY_TYPES.find((t) => t.key === activityType);
  if (!typeConfig) throw new Error("Invalid activity type");

  const duration = Math.max(
    1,
    Math.min(480, durationMinutes ?? typeConfig.defaultDuration),
  );

  // Scale impacts by duration (base impacts are per 30 min)
  const durationMultiplier = Math.max(0.5, duration / 30);
  const scaledImpacts: Record<string, number> = {};
  for (const [axis, basePoints] of Object.entries(typeConfig.axisImpacts)) {
    scaledImpacts[axis] = Math.round(basePoints * durationMultiplier);
  }

  // Insert activity log
  const { error: logError } = await supabase.from("activity_logs").insert({
    user_id: user.id,
    activity_type: activityType,
    duration_minutes: duration,
    notes: notes || null,
    axis_impacts: scaledImpacts,
  });

  if (logError) throw new Error(logError.message);

  // Update skill axes
  for (const [axis, points] of Object.entries(scaledImpacts)) {
    const { data: existing } = await supabase
      .from("skill_axes")
      .select("id, score")
      .eq("user_id", user.id)
      .eq("axis_name", axis)
      .eq("source", "activity")
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("skill_axes")
        .update({
          score: (existing.score ?? 0) + points,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("skill_axes").insert({
        user_id: user.id,
        axis_name: axis,
        score: points,
        source: "activity",
      });
      if (error) throw new Error(error.message);
    }
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getRecentActivities(
  limit = 20,
): Promise<ActivityLogEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data } = await supabase
    .from("activity_logs")
    .select(
      "id, activity_type, duration_minutes, notes, axis_impacts, created_at",
    )
    .eq("user_id", user.id)
    .gte("created_at", weekAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    activity_type: row.activity_type,
    duration_minutes: row.duration_minutes,
    notes: row.notes,
    axis_impacts: (row.axis_impacts as Record<string, number>) ?? {},
    created_at: row.created_at ?? new Date().toISOString(),
  }));
}

export async function getWeeklySummary(): Promise<{
  totalMinutes: number;
  byType: { type: string; count: number; minutes: number }[];
  activityCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data } = await supabase
    .from("activity_logs")
    .select("activity_type, duration_minutes")
    .eq("user_id", user.id)
    .gte("created_at", weekAgo.toISOString());

  const rows = data ?? [];
  let totalMinutes = 0;
  const typeMap = new Map<string, { count: number; minutes: number }>();

  for (const row of rows) {
    const mins = row.duration_minutes ?? 0;
    totalMinutes += mins;
    const existing = typeMap.get(row.activity_type) ?? { count: 0, minutes: 0 };
    existing.count++;
    existing.minutes += mins;
    typeMap.set(row.activity_type, existing);
  }

  const byType = Array.from(typeMap.entries()).map(([type, stats]) => ({
    type,
    count: stats.count,
    minutes: stats.minutes,
  }));

  return { totalMinutes, byType, activityCount: rows.length };
}

export async function deleteActivity(activityId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get the activity to reverse axis impacts
  const { data: activity } = await supabase
    .from("activity_logs")
    .select("axis_impacts")
    .eq("id", activityId)
    .eq("user_id", user.id)
    .single();

  if (!activity) throw new Error("Activity not found");

  const impacts = (activity.axis_impacts as Record<string, number>) ?? {};

  // Reverse the axis impacts
  for (const [axis, points] of Object.entries(impacts)) {
    const { data: existing } = await supabase
      .from("skill_axes")
      .select("id, score")
      .eq("user_id", user.id)
      .eq("axis_name", axis)
      .eq("source", "activity")
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("skill_axes")
        .update({
          score: Math.max(0, (existing.score ?? 0) - points),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    }
  }

  const { error: deleteError } = await supabase
    .from("activity_logs")
    .delete()
    .eq("id", activityId)
    .eq("user_id", user.id);
  if (deleteError) throw new Error(deleteError.message);
  revalidatePath("/dashboard");
}
