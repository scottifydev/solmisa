import { getModulesWithLessons } from "@/lib/actions/lessons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { colors, degreeColors } from "@/lib/tokens";
import Link from "next/link";

export default async function LearnPage() {
  const modules = await getModulesWithLessons();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-ivory">Learn</h1>
        <p className="text-silver mt-1">Work through the ear training curriculum</p>
      </div>

      {modules.length === 0 ? (
        <EmptyState
          title="No modules yet"
          description="Curriculum content is being prepared. Check back soon!"
        />
      ) : (
        <div className="space-y-6">
          {modules.map((mod, modIndex) => {
            const completedCount = mod.lessons.filter((l) => l.isCompleted).length;
            const total = mod.lessons.length;
            const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
            const color = degreeColors[(modIndex + 1) as keyof typeof degreeColors] ?? colors.coral;

            return (
              <div key={mod.id} className="rounded-xl border border-steel bg-charcoal overflow-hidden">
                {/* Module header */}
                <div className="p-5 border-b border-steel">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-display text-lg font-bold text-ivory">
                        {mod.title}
                      </h2>
                      {mod.description && (
                        <p className="text-silver text-sm mt-1">{mod.description}</p>
                      )}
                    </div>
                    <span className="text-silver text-sm font-mono">
                      {completedCount}/{total}
                    </span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={percentage} color={color} size="sm" />
                  </div>
                </div>

                {/* Lesson list */}
                <div className="divide-y divide-steel/50">
                  {mod.lessons.map((lesson, lessonIndex) => {
                    const prevCompleted = lessonIndex === 0 || mod.lessons[lessonIndex - 1].isCompleted;
                    const isLocked = !prevCompleted && !lesson.isCompleted;

                    return (
                      <Link
                        key={lesson.id}
                        href={isLocked ? "#" : `/learn/${lesson.id}`}
                        className={`
                          flex items-center gap-4 p-4 transition-colors
                          ${isLocked
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-steel/20"
                          }
                        `}
                        onClick={isLocked ? (e) => e.preventDefault() : undefined}
                      >
                        {/* Completion indicator */}
                        <div
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono flex-shrink-0
                            ${lesson.isCompleted
                              ? "bg-correct/20 text-correct"
                              : isLocked
                                ? "bg-steel/50 text-silver/50"
                                : "border border-steel text-silver"
                            }
                          `}
                        >
                          {lesson.isCompleted ? "✓" : lesson.order}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-ivory text-sm font-medium truncate">
                            {lesson.title}
                          </div>
                        </div>

                        {isLocked && (
                          <span className="text-silver/50 text-xs">🔒</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
