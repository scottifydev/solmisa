"use server";

import { createClient } from "@/lib/supabase/server";
import type { Module, Lesson, LessonSummary } from "@/types/lesson";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getModulesWithLessons(): Promise<Module[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("is_published", true)
    .order("order");

  if (!modules) return [];

  // Get all user progress in one query
  const { data: progress } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id);

  const completedLessonIds = new Set(progress?.map((p) => p.lesson_id) ?? []);

  // Fetch all lessons in one query instead of per-module
  const moduleIds = modules.map((m) => m.id);
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, order, module_id")
    .in("module_id", moduleIds)
    .eq("is_published", true)
    .order("order");

  // Group lessons by module
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
      order: mod.order,
      lessons: lessons.map((l): LessonSummary => ({
        id: l.id,
        title: l.title,
        order: l.order,
        isCompleted: completedLessonIds.has(l.id),
      })),
    };
  });
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  if (!UUID_RE.test(lessonId)) return null;

  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, modules(title)")
    .eq("id", lessonId)
    .single();

  if (!lesson) return null;

  const { data: stages } = await supabase
    .from("lesson_stages")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const moduleData = lesson.modules as any;

  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    moduleId: lesson.module_id,
    moduleTitle: moduleData?.title ?? "",
    stages: (stages ?? []).map((s) => ({
      id: s.id,
      type: s.stage_type,
      config: s.config as Record<string, unknown>,
      order: s.order,
    })),
  };
}

export async function completeLesson(lessonId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  if (!UUID_RE.test(lessonId)) throw new Error("Invalid lesson ID");

  // Upsert to avoid duplicates
  await supabase
    .from("user_lesson_progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId },
      { onConflict: "user_id,lesson_id" }
    );
}
