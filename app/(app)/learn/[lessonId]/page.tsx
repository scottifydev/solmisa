import { cache } from "react";
import type { Metadata } from "next";
import { getLessonWithContext } from "@/lib/actions/lessons";
import { createClient } from "@/lib/supabase/server";
import { LessonPlayer } from "@/components/lesson/lesson-player";
import { notFound } from "next/navigation";

const getCachedLesson = cache(getLessonWithContext);

interface Props {
  params: Promise<{ lessonId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const data = await getCachedLesson(lessonId);
  if (!data) return { title: "Lesson" };
  return { title: data.lesson.title };
}

export default async function LessonPage({ params }: Props) {
  const { lessonId } = await params;
  const [data, supabase] = await Promise.all([
    getCachedLesson(lessonId),
    createClient(),
  ]);

  if (!data) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <LessonPlayer
      lesson={data.lesson}
      moduleTitle={data.moduleTitle}
      totalLessons={data.totalLessons}
      userId={user?.id}
    />
  );
}
