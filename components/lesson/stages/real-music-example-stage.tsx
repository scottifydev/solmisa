"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { RealMusicExampleStage } from "@/types/lesson";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/tokens";

interface RealMusicExampleStageProps {
  stage: RealMusicExampleStage;
  onComplete: () => void;
}

export function RealMusicExampleStageView({
  stage,
  onComplete,
}: RealMusicExampleStageProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inHighlight, setInHighlight] = useState(false);
  const rafRef = useRef<number>(0);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    setProgress(pct);

    if (
      stage.highlight_start_ms !== undefined &&
      stage.highlight_end_ms !== undefined
    ) {
      const ms = audio.currentTime * 1000;
      setInHighlight(
        ms >= stage.highlight_start_ms && ms <= stage.highlight_end_ms,
      );
    }

    rafRef.current = requestAnimationFrame(updateProgress);
  }, [stage.highlight_start_ms, stage.highlight_end_ms]);

  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      cancelAnimationFrame(rafRef.current);
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, [playing, updateProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setPlaying(false);
      setHasPlayed(true);
      setInHighlight(false);
      cancelAnimationFrame(rafRef.current);
    };
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("ended", onEnded);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-obsidian border border-steel rounded-lg p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-ivory">
          {stage.title}
        </h2>
        <p className="text-[15px] text-silver leading-relaxed">
          {stage.concept_text}
        </p>
      </div>

      {/* Audio player */}
      <div className="bg-obsidian border border-steel rounded-lg p-5 space-y-4">
        <audio ref={audioRef} src={stage.clip_url} preload="auto" />

        <button
          onClick={handlePlay}
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center transition-colors"
          style={{
            backgroundColor: inHighlight
              ? `${brand.violet}33`
              : `${brand.violet}1A`,
            borderWidth: 1.5,
            borderColor: inHighlight ? brand.violet : `${brand.violet}66`,
          }}
        >
          {playing ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-violet"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-violet ml-0.5"
            >
              <polygon points="5 3 19 12 5 21" />
            </svg>
          )}
        </button>

        {/* Progress bar */}
        <div className="w-full h-1 bg-steel rounded-sm overflow-hidden">
          <div
            className="h-full rounded-sm transition-all duration-100"
            style={{
              width: `${progress}%`,
              backgroundColor: inHighlight ? brand.violet : brand.silver,
            }}
          />
        </div>

        {inHighlight && (
          <p className="text-xs text-violet font-mono text-center animate-pulse">
            Listen here...
          </p>
        )}
      </div>

      {/* Follow-up text (appears after playback) */}
      {hasPlayed && (
        <div className="bg-violet/5 border border-violet/20 rounded-lg p-5">
          <p className="text-[15px] text-silver leading-relaxed">
            {stage.follow_up_text}
          </p>
        </div>
      )}

      <Button fullWidth disabled={!hasPlayed} onClick={onComplete}>
        Continue &rarr;
      </Button>
    </div>
  );
}
