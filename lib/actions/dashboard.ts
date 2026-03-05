"use server";

import { createClient } from "@/lib/supabase/server";
import type { ReviewStatsResponse, SrsStageGroup } from "@/types/srs";
import { stageToGroup } from "@/lib/srs/stages";
import type { RadarGroup } from "@/lib/radar/dimensions";
import { RADAR_GROUP_LABELS } from "@/lib/radar/dimensions";

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

export interface SmartSuggestion {
  type: "review" | "lesson" | "practice" | "track_nudge";
  title: string;
  subtitle: string;
  href: string;
  buttonLabel: string;
}

const TRACK_NAMES: Record<string, string> = {
  ear_training: "Ear Training",
  theory: "Theory",
  rhythm: "Rhythm",
  sight_reading: "Sight-Reading",
};

const GROUP_TO_TRACK: Record<RadarGroup, string> = {
  degree_recognition: "ear_training",
  ear_training: "ear_training",
  theory: "theory",
  rhythm: "rhythm",
  sight_reading: "sight_reading",
};

export async function getSmartSuggestion(): Promise<SmartSuggestion> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      type: "lesson",
      title: "Start your first lesson",
      subtitle: "Begin with the fundamentals of ear training.",
      href: "/learn",
      buttonLabel: "Get Started",
    };
  }

  const now = new Date().toISOString();
  const [{ count: dueCount }, { data: radarData }] = await Promise.all([
    supabase
      .from("user_card_state")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("srs_stage", "mastered")
      .lte("next_review_at", now),
    supabase
      .from("review_records")
      .select("correct, radar_dimensions, user_card_state!inner(user_id)")
      .eq("user_card_state.user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const due = dueCount ?? 0;

  // Check for track imbalance (Rule 20)
  const trackScores = new Map<string, { total: number; correct: number }>();
  for (const r of radarData ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dims = (r as any).radar_dimensions as string[] | null;
    if (!dims) continue;
    for (const dim of dims) {
      // Map dimension to track via group
      for (const [group, track] of Object.entries(GROUP_TO_TRACK)) {
        const prefix = group.split("_")[0] ?? "";
        if (dim.startsWith(prefix) || group === dim) {
          const s = trackScores.get(track) ?? { total: 0, correct: 0 };
          s.total++;
          if (r.correct) s.correct++;
          trackScores.set(track, s);
        }
      }
    }
  }

  // Detect imbalance: if any track avg > 60% and another < 30%
  const trackAccuracies: { track: string; acc: number }[] = [];
  for (const [track, s] of trackScores) {
    if (s.total >= 5) {
      trackAccuracies.push({
        track,
        acc: Math.round((s.correct / s.total) * 100),
      });
    }
  }

  const maxAcc = trackAccuracies.reduce((max, t) => Math.max(max, t.acc), 0);
  const weakTracks = trackAccuracies.filter(
    (t) => t.acc < 40 && maxAcc - t.acc > 25,
  );

  // Every 3rd suggestion (based on day of year) or if imbalance is significant
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  const isNudgeDay = dayOfYear % 3 === 0;

  const nudgeTrack = weakTracks[0];
  if (nudgeTrack && isNudgeDay) {
    const trackName = TRACK_NAMES[nudgeTrack.track] ?? nudgeTrack.track;
    return {
      type: "track_nudge",
      title: `Your ${trackName} could use some attention`,
      subtitle: `It's falling behind your other tracks. A focused session would help.`,
      href: `/learn?track=${nudgeTrack.track}`,
      buttonLabel: `Open ${trackName}`,
    };
  }

  // Priority 1: Reviews due
  if (due > 0) {
    const minutes = Math.max(1, Math.round(due * 0.7));
    return {
      type: "review",
      title: `You have ${due} items to review`,
      subtitle: `About ${minutes} minute${minutes > 1 ? "s" : ""} of practice.`,
      href: "/review",
      buttonLabel: "Start Review",
    };
  }

  // Priority 2: New lessons
  const [{ count: totalLessons }, { count: completedCount }] =
    await Promise.all([
      supabase.from("lessons").select("id", { count: "exact", head: true }),
      supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);

  const newLessons = (totalLessons ?? 0) - (completedCount ?? 0);
  if (newLessons > 0) {
    return {
      type: "lesson",
      title: "New lessons available",
      subtitle: `${newLessons} lesson${newLessons > 1 ? "s" : ""} ready to explore.`,
      href: "/learn",
      buttonLabel: "Continue Learning",
    };
  }

  // Priority 3: Practice suggestion
  if (nudgeTrack) {
    const trackName = TRACK_NAMES[nudgeTrack.track] ?? nudgeTrack.track;
    return {
      type: "practice",
      title: `Focus on ${trackName}`,
      subtitle: "Targeted practice strengthens weaker areas faster.",
      href: "/practice",
      buttonLabel: "Open Practice",
    };
  }

  return {
    type: "lesson",
    title: "All caught up",
    subtitle: "Check back later for new items to review.",
    href: "/learn",
    buttonLabel: "Browse Lessons",
  };
}

export interface TrackProgressItem {
  slug: string;
  name: string;
  lessonsCompleted: number;
  lessonsTotal: number;
  currentModule: string | null;
  lastActivity: string | null;
}

export async function getTrackProgress(): Promise<TrackProgressItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: tracks }, { data: lessons }, { data: progress }] =
    await Promise.all([
      supabase
        .from("skill_tracks")
        .select("id, slug, name")
        .order("display_order"),
      supabase
        .from("lessons")
        .select("id, title, track_id, modules!inner(title)"),
      supabase
        .from("lesson_progress")
        .select("lesson_id, status, updated_at")
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);

  if (!tracks) return [];

  const progressMap = new Map((progress ?? []).map((p) => [p.lesson_id, p]));
  const lessonsByTrack = new Map<string, typeof lessons>();
  for (const lesson of lessons ?? []) {
    const trackId = lesson.track_id as string;
    const existing = lessonsByTrack.get(trackId) ?? [];
    existing.push(lesson);
    lessonsByTrack.set(trackId, existing);
  }

  return tracks.map((track) => {
    const trackLessons = lessonsByTrack.get(track.id) ?? [];
    const completed = trackLessons.filter((l) => progressMap.has(l.id));
    const lastCompleted = completed.sort((a, b) => {
      const aDate = progressMap.get(a.id)?.updated_at ?? "";
      const bDate = progressMap.get(b.id)?.updated_at ?? "";
      return bDate.localeCompare(aDate);
    })[0];

    // Find next incomplete lesson's module
    const nextLesson = trackLessons.find((l) => !progressMap.has(l.id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentModule = nextLesson
      ? ((nextLesson.modules as any)?.title ?? null)
      : null;

    return {
      slug: track.slug,
      name: track.name,
      lessonsCompleted: completed.length,
      lessonsTotal: trackLessons.length,
      currentModule,
      lastActivity: lastCompleted
        ? (progressMap.get(lastCompleted.id)?.updated_at ?? null)
        : null,
    };
  });
}
