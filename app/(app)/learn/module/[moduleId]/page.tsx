import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getModuleWithLessons } from "@/lib/actions/lessons";
import { LessonListItem } from "@/components/learn/lesson-list-item";
import Link from "next/link";

interface Props {
  params: Promise<{ moduleId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  const data = await getModuleWithLessons(moduleId);
  if (!data) return { title: "Module" };
  return { title: data.module.title };
}

export default async function ModulePage({ params }: Props) {
  const { moduleId } = await params;
  const data = await getModuleWithLessons(moduleId);

  if (!data) redirect("/learn");

  const { module: mod, lessons } = data;

  // Find the first non-completed lesson
  const firstIncompleteIdx = lessons.findIndex((l) => l.status !== "completed");

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Back link */}
      <Link
        href="/learn"
        className="text-silver text-sm hover:text-ivory transition-colors"
      >
        &larr; Learn
      </Link>

      {/* Module header */}
      <div>
        <div className="text-[10px] font-mono text-ash uppercase tracking-wider mb-1">
          Module {mod.module_order}
        </div>
        <h1 className="font-display text-2xl font-bold text-ivory">
          {mod.title}
        </h1>
        {mod.description && (
          <p className="text-silver text-sm mt-1">{mod.description}</p>
        )}
      </div>

      {/* Lesson list */}
      <div className="space-y-1">
        {lessons.map((lesson, idx) => (
          <LessonListItem
            key={lesson.id}
            lesson={lesson}
            moduleOrder={mod.module_order}
            status={lesson.status}
            score={lesson.score}
            isNext={idx === firstIncompleteIdx}
          />
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="text-center text-ash text-sm py-8">
          No lessons in this module yet.
        </div>
      )}
    </div>
  );
}
