"use server";

import { createClient } from "@/lib/supabase/server";
import type { Module, Lesson, LessonSummary } from "@/types/lesson";

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

  const result: Module[] = [];

  for (const mod of modules) {
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, title, order")
      .eq("module_id", mod.id)
      .eq("is_published", true)
      .order("order");

    const lessonSummaries: LessonSummary[] = (lessons ?? []).map((l) => ({
      id: l.id,
      title: l.title,
      order: l.order,
      isCompleted: completedLessonIds.has(l.id),
    }));

    result.push({
      id: mod.id,
      title: mod.title,
      description: mod.description,
      order: mod.order,
      lessons: lessonSummaries,
    });
  }

  return result;
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
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

  // Upsert to avoid duplicates
  await supabase
    .from("user_lesson_progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId },
      { onConflict: "user_id,lesson_id" }
    );
}
