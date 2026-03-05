import { SkeletonRect } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <SkeletonRect className="h-8 w-32" />
      <div className="rounded-xl border border-steel bg-obsidian p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <SkeletonRect className="h-4 w-24" />
            <SkeletonRect className="h-10" />
          </div>
        ))}
        <SkeletonRect className="h-10 w-32" />
      </div>
    </div>
  );
}
