import { SkeletonRect } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <SkeletonRect className="h-9 w-28" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonRect key={i} className="h-24" />
        ))}
      </div>
      <div className="rounded-xl border border-steel bg-obsidian p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <SkeletonRect className="h-4 w-24" />
            <SkeletonRect className="h-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
