import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  getTracksWithProgress,
  getModulesWithLessonsForTrack,
  getNextLessonSuggestion,
} from "@/lib/actions/lessons";
import { getGuidedMode } from "@/lib/actions/profile";
import { ModuleCard } from "@/components/learn/module-card";
import { TrackSelector } from "@/components/learn/track-selector";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Learn" };

interface LearnPageProps {
  searchParams: Promise<{ track?: string }>;
}

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const params = await searchParams;
  const [tracks, guidedMode] = await Promise.all([
    getTracksWithProgress(),
    getGuidedMode(),
  ]);

  if (guidedMode) {
    const suggestion = await getNextLessonSuggestion();
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ivory">Learn</h1>
          <p className="text-silver text-sm mt-1">Your next step is ready</p>
        </div>

        {suggestion ? (
          <div className="bg-obsidian border border-steel rounded-lg p-6 space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ash">
              {suggestion.trackName} &mdash; {suggestion.moduleTitle}
            </div>
            <h2 className="font-display text-lg text-ivory">
              {suggestion.lessonTitle}
            </h2>
            <Link href={`/learn/${suggestion.lessonId}`}>
              <Button fullWidth>Continue Learning &rarr;</Button>
            </Link>
          </div>
        ) : (
          <EmptyState
            title="All caught up"
            message="You've completed all available lessons. New material unlocks as content is added."
          />
        )}
      </div>
    );
  }

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
