import { getLessonWithContext } from "@/lib/actions/lessons";
import { createClient } from "@/lib/supabase/server";
import { LessonPlayer } from "@/components/lesson/lesson-player";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { lessonId } = await params;
  const [data, supabase] = await Promise.all([
    getLessonWithContext(lessonId),
    createClient(),
  ]);

  if (!data) {
    notFound();
  }

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <LessonPlayer
      lesson={data.lesson}
      moduleTitle={data.moduleTitle}
      totalLessons={data.totalLessons}
      userId={user?.id}
    />
  );
}
