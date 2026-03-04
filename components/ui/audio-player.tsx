"use client";

import { useRef, useState, useCallback } from "react";
import type { AudioPlayerProps } from "@/types/audio";

export function AudioPlayer({
  src,
  label,
  sublabel,
  variant = "standalone",
  onPlay,
  onStop,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onStop?.();
    } else {
      audio.play();
      setIsPlaying(true);
      onPlay?.();
    }
  }, [isPlaying, onPlay, onStop]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    onStop?.();
  }, [onStop]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-2">
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-coral flex items-center justify-center text-white hover:bg-coral/90 transition-colors"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        {label && <span className="text-ivory text-sm">{label}</span>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-steel bg-charcoal p-4">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      {label && (
        <div className="mb-2">
          <div className="text-ivory font-medium text-sm">{label}</div>
          {sublabel && <div className="text-silver text-xs">{sublabel}</div>}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-coral flex items-center justify-center text-white hover:bg-coral/90 transition-colors flex-shrink-0"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <div className="flex-1">
          <div className="w-full h-1.5 bg-steel rounded-full overflow-hidden">
            <div
              className="h-full bg-coral rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-silver text-xs font-mono tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
