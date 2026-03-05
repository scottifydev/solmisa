import type { Metadata } from "next";
import { Suspense } from "react";
import { getPracticeData } from "@/lib/actions/practice";
import { getTracksWithProgress } from "@/lib/actions/lessons";
import { TrackSelector } from "@/components/learn/track-selector";
import { DrillCard } from "@/components/practice/drill-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Practice" };

interface PracticePageProps {
  searchParams: Promise<{ track?: string }>;
}

export default async function PracticePage({
  searchParams,
}: PracticePageProps) {
  const params = await searchParams;
  const [tracks, practiceData] = await Promise.all([
    getTracksWithProgress(),
    getPracticeData(params.track),
  ]);

  const { drills, trackSlug } = practiceData;
  const trackName =
    tracks.find((t) => t.slug === trackSlug)?.name ?? "Practice";

  const unlockedDrills = drills.filter((d) => d.unlocked);
  const lockedDrills = drills.filter((d) => !d.unlocked);

  // Group by drill_type
  const drillsByType = new Map<string, typeof drills>();
  for (const drill of unlockedDrills) {
    const existing = drillsByType.get(drill.drill_type) ?? [];
    existing.push(drill);
    drillsByType.set(drill.drill_type, existing);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ivory">Practice</h1>
        <p className="text-silver text-sm mt-1">
          No stakes, no scores. Just focused repetition.
        </p>
      </div>

      <Suspense fallback={null}>
        <TrackSelector tracks={tracks} />
      </Suspense>

      {/* Recommendations section — always visible */}
      <div className="rounded-lg border border-violet/20 bg-violet/5 p-4 space-y-2">
        <h2 className="text-xs font-mono uppercase tracking-wider text-ash">
          Suggested
        </h2>
        <p className="text-sm text-silver">
          {unlockedDrills.length === 0
            ? "While you work through lessons, practice will unlock here. Start a lesson to begin."
            : "Focus on areas where you want more confidence. Drills here never affect your review scores."}
        </p>
      </div>

      {drills.length === 0 ? (
        <EmptyState
          title={`${trackName} drills coming soon`}
          message="Practice drills are being prepared for this track. Check back soon!"
        />
      ) : (
        <div className="space-y-6">
          {/* Unlocked drills */}
          {unlockedDrills.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-ash">
                Available
              </h2>
              <div className="space-y-2">
                {unlockedDrills.map((drill) => (
                  <DrillCard key={drill.id} drill={drill} />
                ))}
              </div>
            </div>
          )}

          {/* Locked drills */}
          {lockedDrills.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-ash">
                Locked
              </h2>
              <div className="space-y-2">
                {lockedDrills.map((drill) => (
                  <DrillCard key={drill.id} drill={drill} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
