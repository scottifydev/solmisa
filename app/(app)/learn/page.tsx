import type { Metadata } from "next";
import { getModulesWithLessons } from "@/lib/actions/lessons";
import { ModuleCard } from "@/components/learn/module-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Learn" };

export default async function LearnPage() {
  const modules = await getModulesWithLessons();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ivory">Learn</h1>
        <p className="text-silver text-sm mt-1">
          Work through the ear training curriculum
        </p>
      </div>

      {modules.length === 0 ? (
        <EmptyState
          title="Curriculum coming soon"
          message="Modules are being prepared. Check back soon!"
        />
      ) : (
        <div className="space-y-4">
          {modules.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              status={mod.progressStatus}
              lessonsCompleted={mod.lessonsCompleted}
              lessonCount={mod.lessonCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
