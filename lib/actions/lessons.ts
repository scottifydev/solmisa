"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  Module,
  Lesson,
  LessonSummary,
  LessonStage,
  ModuleProgressStatus,
} from "@/types/lesson";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ModuleListItem extends Module {
  progressStatus: ModuleProgressStatus;
  lessonsCompleted: number;
  lessonCount: number;
}

export async function getModulesWithLessons(): Promise<ModuleListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .order("module_order");

  if (!modules) return [];

  const moduleIds = modules.map((m) => m.id);

  const [{ data: allLessons }, { data: progress }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title, lesson_order, module_id")
      .in("module_id", moduleIds)
      .order("lesson_order"),
    supabase
      .from("lesson_progress")
      .select("lesson_id, status")
      .eq("user_id", user.id),
  ]);

  const completedIds = new Set(
    (progress ?? [])
      .filter((p) => p.status === "completed")
      .map((p) => p.lesson_id),
  );

  const inProgressIds = new Set(
    (progress ?? [])
      .filter((p) => p.status === "in_progress")
      .map((p) => p.lesson_id),
  );

  const lessonsByModule = new Map<string, typeof allLessons>();
  for (const lesson of allLessons ?? []) {
    const existing = lessonsByModule.get(lesson.module_id) ?? [];
    existing.push(lesson);
    lessonsByModule.set(lesson.module_id, existing);
  }

  let prevModuleCompleted = true; // Module 1 is always available

  return modules.map((mod) => {
    const lessons = lessonsByModule.get(mod.id) ?? [];
    const completedCount = lessons.filter((l) => completedIds.has(l.id)).length;
    const hasInProgress = lessons.some((l) => inProgressIds.has(l.id));

    let progressStatus: ModuleProgressStatus;
    if (completedCount === lessons.length && lessons.length > 0) {
      progressStatus = "completed";
    } else if (completedCount > 0 || hasInProgress) {
      progressStatus = "in_progress";
    } else if (prevModuleCompleted) {
      progressStatus = "available";
    } else {
      progressStatus = "locked";
    }

    // Only unlock next module if this one is completed
    prevModuleCompleted = progressStatus === "completed";

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      module_order: mod.module_order,
      track_id: mod.track_id,
      unlock_criteria: mod.unlock_criteria,
      progressStatus,
      lessonsCompleted: completedCount,
      lessonCount: lessons.length,
      lessons: lessons.map(
        (l): LessonSummary => ({
          id: l.id,
          title: l.title,
          lesson_order: l.lesson_order,
          isCompleted: completedIds.has(l.id),
        }),
      ),
    };
  });
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  if (!UUID_RE.test(lessonId)) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (!lesson) return null;

  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    module_id: lesson.module_id,
    track_id: lesson.track_id,
    lesson_order: lesson.lesson_order,
    drone_key: lesson.drone_key,
    unlocks_cards: lesson.unlocks_cards ?? [],
    unlocks_drills: lesson.unlocks_drills ?? [],
    soft_prerequisites: (lesson.soft_prerequisites ??
      []) as Lesson["soft_prerequisites"],
    stages: (lesson.stages ?? []) as LessonStage[],
  };
}

export interface LessonWithContext {
  lesson: Lesson;
  moduleTitle: string;
  totalLessons: number;
  allowedKeys: string[];
}

export async function getLessonWithContext(
  lessonId: string,
): Promise<LessonWithContext | null> {
  if (!UUID_RE.test(lessonId)) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (!lesson) return null;

  // Fetch module info + sibling count
  const [{ data: module }, { count }] = await Promise.all([
    supabase
      .from("modules")
      .select("title")
      .eq("id", lesson.module_id)
      .single(),
    supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("module_id", lesson.module_id),
  ]);

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      module_id: lesson.module_id,
      track_id: lesson.track_id,
      lesson_order: lesson.lesson_order,
      drone_key: lesson.drone_key,
      unlocks_cards: lesson.unlocks_cards ?? [],
      unlocks_drills: lesson.unlocks_drills ?? [],
      soft_prerequisites: (lesson.soft_prerequisites ??
        []) as Lesson["soft_prerequisites"],
      stages: (lesson.stages ?? []) as LessonStage[],
    },
    moduleTitle: module?.title ?? "Module",
    totalLessons: count ?? 1,
    allowedKeys: [],
  };
}

export interface ModuleWithLessons {
  module: {
    id: string;
    title: string;
    description: string | null;
    module_order: number;
  };
  lessons: {
    id: string;
    title: string;
    lesson_order: number;
    status: "not_started" | "in_progress" | "completed";
    score: number | null;
  }[];
}

export async function getModuleWithLessons(
  moduleId: string,
): Promise<ModuleWithLessons | null> {
  if (!UUID_RE.test(moduleId)) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: mod }, { data: lessons }] = await Promise.all([
    supabase.from("modules").select("*").eq("id", moduleId).single(),
    supabase
      .from("lessons")
      .select("id, title, lesson_order")
      .eq("module_id", moduleId)
      .order("lesson_order"),
  ]);

  if (!mod) return null;

  const lessonIds = (lessons ?? []).map((l) => l.id);
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status, score")
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds);

  const progressMap = new Map((progress ?? []).map((p) => [p.lesson_id, p]));

  return {
    module: {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      module_order: mod.module_order,
    },
    lessons: (lessons ?? []).map((l) => {
      const p = progressMap.get(l.id);
      return {
        id: l.id,
        title: l.title,
        lesson_order: l.lesson_order,
        status:
          (p?.status as "not_started" | "in_progress" | "completed") ??
          "not_started",
        score: p?.score ?? null,
      };
    }),
  };
}

export interface TrackWithProgress {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  lessons_completed: number;
  total_lessons: number;
  has_new_lessons: boolean;
  current_lesson_label: string | null;
}

export async function getTracksWithProgress(): Promise<TrackWithProgress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [
    { data: tracks },
    { data: lessons },
    { data: progress },
    { data: trackProgress },
  ] = await Promise.all([
    supabase.from("skill_tracks").select("*").order("display_order"),
    supabase.from("lessons").select("id, track_id, lesson_order, module_id"),
    supabase
      .from("lesson_progress")
      .select("lesson_id, status")
      .eq("user_id", user.id),
    supabase
      .from("track_progress")
      .select("track_id, lessons_completed")
      .eq("user_id", user.id),
  ]);

  if (!tracks) return [];

  const completedIds = new Set(
    (progress ?? [])
      .filter((p) => p.status === "completed")
      .map((p) => p.lesson_id),
  );

  const trackProgressMap = new Map(
    (trackProgress ?? []).map((tp) => [tp.track_id, tp.lessons_completed]),
  );

  return tracks.map((track) => {
    const trackLessons = (lessons ?? []).filter((l) => l.track_id === track.id);
    const totalLessons = trackLessons.length;
    const lessonsCompleted = trackLessons.filter((l) =>
      completedIds.has(l.id),
    ).length;
    const hasNewLessons = trackLessons.some((l) => !completedIds.has(l.id));

    let currentLessonLabel: string | null = null;
    if (totalLessons > 0) {
      const nextLesson = trackLessons
        .sort((a, b) => a.lesson_order - b.lesson_order)
        .find((l) => !completedIds.has(l.id));
      if (nextLesson) {
        currentLessonLabel = `Lesson ${nextLesson.lesson_order} of ${totalLessons}`;
      } else {
        currentLessonLabel = `All ${totalLessons} complete`;
      }
    }

    return {
      id: track.id,
      slug: track.slug,
      name: track.name,
      description: track.description,
      icon: track.icon,
      display_order: track.display_order,
      lessons_completed: lessonsCompleted,
      total_lessons: totalLessons,
      has_new_lessons: hasNewLessons && lessonsCompleted < totalLessons,
      current_lesson_label: currentLessonLabel,
    };
  });
}

export async function getModulesWithLessonsForTrack(
  trackSlug: string,
): Promise<ModuleListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: track } = await supabase
    .from("skill_tracks")
    .select("id")
    .eq("slug", trackSlug)
    .single();

  if (!track) return [];

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("track_id", track.id)
    .order("module_order");

  if (!modules) return [];

  const moduleIds = modules.map((m) => m.id);

  const [{ data: allLessons }, { data: progress }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title, lesson_order, module_id")
      .in("module_id", moduleIds)
      .order("lesson_order"),
    supabase
      .from("lesson_progress")
      .select("lesson_id, status")
      .eq("user_id", user.id),
  ]);

  const completedIds = new Set(
    (progress ?? [])
      .filter((p) => p.status === "completed")
      .map((p) => p.lesson_id),
  );

  const inProgressIds = new Set(
    (progress ?? [])
      .filter((p) => p.status === "in_progress")
      .map((p) => p.lesson_id),
  );

  const lessonsByModule = new Map<string, typeof allLessons>();
  for (const lesson of allLessons ?? []) {
    const existing = lessonsByModule.get(lesson.module_id) ?? [];
    existing.push(lesson);
    lessonsByModule.set(lesson.module_id, existing);
  }

  let prevModuleCompleted = true;

  return modules.map((mod) => {
    const lessons = lessonsByModule.get(mod.id) ?? [];
    const completedCount = lessons.filter((l) => completedIds.has(l.id)).length;
    const hasInProgress = lessons.some((l) => inProgressIds.has(l.id));

    let progressStatus: ModuleProgressStatus;
    if (completedCount === lessons.length && lessons.length > 0) {
      progressStatus = "completed";
    } else if (completedCount > 0 || hasInProgress) {
      progressStatus = "in_progress";
    } else if (prevModuleCompleted) {
      progressStatus = "available";
    } else {
      progressStatus = "locked";
    }

    prevModuleCompleted = progressStatus === "completed";

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      module_order: mod.module_order,
      track_id: mod.track_id,
      unlock_criteria: mod.unlock_criteria,
      progressStatus,
      lessonsCompleted: completedCount,
      lessonCount: lessons.length,
      lessons: lessons.map(
        (l): LessonSummary => ({
          id: l.id,
          title: l.title,
          lesson_order: l.lesson_order,
          isCompleted: completedIds.has(l.id),
        }),
      ),
    };
  });
}

export interface NextLessonSuggestion {
  lessonId: string;
  lessonTitle: string;
  trackName: string;
  trackSlug: string;
  moduleTitle: string;
  lessonOrder: number;
}

export async function getNextLessonSuggestion(): Promise<NextLessonSuggestion | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: tracks }, { data: allLessons }, { data: progress }] =
    await Promise.all([
      supabase
        .from("skill_tracks")
        .select("id, slug, name")
        .order("display_order"),
      supabase
        .from("lessons")
        .select(
          "id, title, lesson_order, module_id, track_id, modules!inner(title, module_order)",
        )
        .order("lesson_order"),
      supabase
        .from("lesson_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);

  if (!tracks || !allLessons) return null;

  const completedIds = new Set((progress ?? []).map((p) => p.lesson_id));

  // Find the first uncompleted lesson across all tracks, prioritizing track display_order
  for (const track of tracks) {
    const trackLessons = allLessons
      .filter((l) => l.track_id === track.id)
      .sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aModOrder = (a.modules as any)?.module_order ?? 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bModOrder = (b.modules as any)?.module_order ?? 0;
        if (aModOrder !== bModOrder) return aModOrder - bModOrder;
        return a.lesson_order - b.lesson_order;
      });

    const next = trackLessons.find((l) => !completedIds.has(l.id));
    if (next) {
      return {
        lessonId: next.id,
        lessonTitle: next.title,
        trackName: track.name,
        trackSlug: track.slug,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        moduleTitle: (next.modules as any)?.title ?? "Module",
        lessonOrder: next.lesson_order,
      };
    }
  }

  return null;
}

export async function completeLesson(lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  if (!UUID_RE.test(lessonId)) throw new Error("Invalid lesson ID");

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status: "completed",
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );
  if (error) throw new Error(error.message);
}

export interface CompletionContext {
  nextLesson: { id: string; title: string; lesson_order: number } | null;
  dueCardCount: number;
  otherTracksWithContent: { slug: string; name: string }[];
}

export async function getCompletionContext(
  lessonId: string,
): Promise<CompletionContext> {
  if (!UUID_RE.test(lessonId))
    return { nextLesson: null, dueCardCount: 0, otherTracksWithContent: [] };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { nextLesson: null, dueCardCount: 0, otherTracksWithContent: [] };

  const { data: lesson } = await supabase
    .from("lessons")
    .select("module_id, track_id, lesson_order")
    .eq("id", lessonId)
    .single();

  if (!lesson)
    return { nextLesson: null, dueCardCount: 0, otherTracksWithContent: [] };

  const [{ data: nextLesson }, { count: dueCount }, { data: otherTracks }] =
    await Promise.all([
      supabase
        .from("lessons")
        .select("id, title, lesson_order")
        .eq("module_id", lesson.module_id)
        .gt("lesson_order", lesson.lesson_order)
        .order("lesson_order")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("user_card_state")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .neq("srs_stage", "mastered")
        .lte("next_review_at", new Date().toISOString()),
      supabase
        .from("skill_tracks")
        .select("slug, name")
        .neq("id", lesson.track_id),
    ]);

  return {
    nextLesson: nextLesson
      ? {
          id: nextLesson.id,
          title: nextLesson.title,
          lesson_order: nextLesson.lesson_order,
        }
      : null,
    dueCardCount: dueCount ?? 0,
    otherTracksWithContent: (otherTracks ?? []).map((t) => ({
      slug: t.slug,
      name: t.name,
    })),
  };
}
