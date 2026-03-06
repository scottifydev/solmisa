"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { TrackWithProgress } from "@/lib/actions/lessons";
import { brand } from "@/lib/tokens";

const TRACK_ICONS: Record<string, string> = {
  ear_training: "ear",
  theory: "book",
  rhythm: "drum",
  sight_reading: "eye",
};

function TrackCard({
  track,
  isActive,
  onClick,
}: {
  track: TrackWithProgress;
  isActive: boolean;
  onClick: () => void;
}) {
  const progress =
    track.total_lessons > 0
      ? (track.lessons_completed / track.total_lessons) * 100
      : 0;

  return (
    <button
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition-all ${
        isActive
          ? "border-violet bg-violet/5"
          : "border-steel bg-obsidian hover:border-silver/30"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-ash">
          {TRACK_ICONS[track.slug] ?? track.slug}
        </span>
        {track.has_new_lessons && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet/20 text-violet font-mono uppercase">
            new
          </span>
        )}
      </div>

      <h3
        className={`font-display text-sm font-bold mb-1 ${isActive ? "text-ivory" : "text-silver"}`}
      >
        {track.name}
      </h3>

      {track.current_lesson_label && (
        <p className="text-[11px] text-ash mb-3">
          {track.current_lesson_label}
        </p>
      )}

      {/* Progress bar */}
      <div className="w-full h-[3px] bg-steel rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: isActive
              ? brand.violet
              : "rgba(183, 148, 246, 0.4)",
          }}
        />
      </div>
      <p className="text-[10px] text-ash mt-1 font-mono">
        {track.lessons_completed}/{track.total_lessons}
      </p>
    </button>
  );
}

export function TrackSelector({ tracks }: { tracks: TrackWithProgress[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTrack =
    searchParams.get("track") ?? tracks[0]?.slug ?? "ear_training";

  const handleSelect = (slug: string) => {
    router.push(`/learn?track=${slug}`, { scroll: false });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {tracks.map((track) => (
        <TrackCard
          key={track.id}
          track={track}
          isActive={track.slug === currentTrack}
          onClick={() => handleSelect(track.slug)}
        />
      ))}
    </div>
  );
}
