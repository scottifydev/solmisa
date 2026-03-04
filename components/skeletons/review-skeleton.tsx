import { SkeletonRect, SkeletonCircle } from "@/components/ui/skeleton";

export function ReviewSkeleton() {
  return (
    <div className="p-6 flex flex-col items-center space-y-6">
      <SkeletonCircle className="w-16 h-16" />
      <SkeletonRect className="h-32 w-full max-w-md" />
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonRect key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}
