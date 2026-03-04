import { SkeletonRect, SkeletonText } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <SkeletonRect className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonRect key={i} className="h-24" />
        ))}
      </div>
      <SkeletonText lines={4} />
    </div>
  );
}
