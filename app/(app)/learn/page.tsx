import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getTracksWithProgress,
  getModulesWithLessonsForTrack,
} from "@/lib/actions/lessons";
import { ModuleCard } from "@/components/learn/module-card";
import { TrackSelector } from "@/components/learn/track-selector";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Learn" };

interface LearnPageProps {
  searchParams: Promise<{ track?: string }>;
}

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const params = await searchParams;
  const tracks = await getTracksWithProgress();
  const selectedTrack = params.track ?? tracks[0]?.slug ?? "ear_training";
  const modules = await getModulesWithLessonsForTrack(selectedTrack);

  const trackName =
    tracks.find((t) => t.slug === selectedTrack)?.name ?? "Lessons";

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ivory">Learn</h1>
        <p className="text-silver text-sm mt-1">
          Choose a track and work through the curriculum
        </p>
      </div>

      <Suspense fallback={null}>
        <TrackSelector tracks={tracks} />
      </Suspense>

      {modules.length === 0 ? (
        <EmptyState
          title={`${trackName} content coming soon`}
          message="Lessons are being prepared for this track. Check back soon!"
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
              lessons={mod.lessons}
            />
          ))}
        </div>
      )}
    </div>
  );
}
