import { SkeletonRect } from "@/components/ui/skeleton";

export function ModuleSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <SkeletonRect className="h-4 w-16" />
      <div className="space-y-1">
        <SkeletonRect className="h-3 w-20" />
        <SkeletonRect className="h-8 w-48" />
        <SkeletonRect className="h-4 w-64" />
      </div>
      <div className="space-y-1">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonRect key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}
