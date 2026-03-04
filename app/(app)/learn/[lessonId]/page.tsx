import { getLesson } from "@/lib/actions/lessons";
import { LessonPlayer } from "@/components/lesson/lesson-player";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { lessonId } = await params;
  const lesson = await getLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  return <LessonPlayer lesson={lesson} />;
}
