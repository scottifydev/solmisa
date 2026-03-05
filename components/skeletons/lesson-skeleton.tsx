import { SkeletonRect } from "@/components/ui/skeleton";

export function LessonSkeleton() {
  return (
    <div className="max-w-[500px] mx-auto p-6 space-y-6">
      <SkeletonRect className="h-4 w-24" />
      <SkeletonRect className="h-8 w-48" />
      <SkeletonRect className="h-2 w-full" />
      <SkeletonRect className="h-64" />
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <SkeletonRect key={i} className="h-12 flex-1" />
        ))}
      </div>
    </div>
  );
}
