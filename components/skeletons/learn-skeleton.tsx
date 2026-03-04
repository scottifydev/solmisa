import { SkeletonRect } from "@/components/ui/skeleton";

export function LearnSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <SkeletonRect className="h-8 w-32" />
      {[1, 2, 3].map((i) => (
        <SkeletonRect key={i} className="h-20" />
      ))}
    </div>
  );
}
