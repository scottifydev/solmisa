"use server";

import { createClient } from "@/lib/supabase/server";
import type { Module, Lesson, LessonSummary, LessonStage } from "@/types/lesson";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getModulesWithLessons(): Promise<Module[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

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
      .map((p) => p.lesson_id)
  );

  const lessonsByModule = new Map<string, typeof allLessons>();
  for (const lesson of allLessons ?? []) {
    const existing = lessonsByModule.get(lesson.module_id) ?? [];
    existing.push(lesson);
    lessonsByModule.set(lesson.module_id, existing);
  }

  return modules.map((mod) => {
    const lessons = lessonsByModule.get(mod.id) ?? [];
    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      module_order: mod.module_order,
      unlock_criteria: mod.unlock_criteria,
      lessons: lessons.map(
        (l): LessonSummary => ({
          id: l.id,
          title: l.title,
          lesson_order: l.lesson_order,
          isCompleted: completedIds.has(l.id),
        })
      ),
    };
  });
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  if (!UUID_RE.test(lessonId)) return null;

  const supabase = await createClient();

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
    lesson_order: lesson.lesson_order,
    drone_key: lesson.drone_key,
    stages: (lesson.stages ?? []) as LessonStage[],
  };
}

export interface LessonWithContext {
  lesson: Lesson;
  moduleTitle: string;
  totalLessons: number;
  allowedKeys: string[];
}

export async function getLessonWithContext(lessonId: string): Promise<LessonWithContext | null> {
  if (!UUID_RE.test(lessonId)) return null;

  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (!lesson) return null;

  // Fetch module info + sibling count
  const [{ data: module }, { count }] = await Promise.all([
    supabase.from("modules").select("title").eq("id", lesson.module_id).single(),
    supabase.from("lessons").select("id", { count: "exact", head: true }).eq("module_id", lesson.module_id),
  ]);

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      module_id: lesson.module_id,
      lesson_order: lesson.lesson_order,
      drone_key: lesson.drone_key,
      stages: (lesson.stages ?? []) as LessonStage[],
    },
    moduleTitle: module?.title ?? "Module",
    totalLessons: count ?? 1,
    allowedKeys: [],
  };
}

export async function completeLesson(lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  if (!UUID_RE.test(lessonId)) throw new Error("Invalid lesson ID");

  await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status: "completed",
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );
}
