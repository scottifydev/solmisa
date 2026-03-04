"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { brand } from "@/lib/tokens";

interface AudioPlayerProps {
  src?: string;
  onPlay?: () => void;
  onStop?: () => void;
  label?: string;
  sublabel?: string;
  playing?: boolean;
  showReplay?: boolean;
  variant?: "standalone" | "inline" | "inline-lesson";
}

// ─── Waveform Bars ──────────────────────────────────────────

function WaveformBars({
  variant,
}: {
  variant: "standalone" | "inline" | "inline-lesson";
}) {
  const config =
    variant === "inline-lesson"
      ? {
          heights: [12, 18, 8, 16, 10, 14, 6],
          width: 3,
          duration: "0.7s",
          stagger: 0.1,
        }
      : {
          heights: [10, 16, 6, 14, 8, 12],
          width: 2.5,
          duration: "0.6s",
          stagger: 0.08,
        };

  return (
    <div className="flex items-center gap-[2px]" style={{ height: 20 }}>
      {config.heights.map((h, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: config.width,
            height: h,
            backgroundColor: brand.coral,
            opacity: 0.6,
            animation: `wave ${config.duration} ease-in-out infinite alternate`,
            animationDelay: `${i * config.stagger}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <polygon points="2,0 12,6 2,12" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
      <rect width="10" height="10" rx="1" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function AudioPlayer({
  src,
  onPlay,
  onStop,
  label = "Listen",
  sublabel,
  playing: controlledPlaying,
  showReplay = true,
  variant = "standalone",
}: AudioPlayerProps) {
  const [internalPlaying, setInternalPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isPlaying = controlledPlaying ?? internalPlaying;

  const handlePlay = useCallback(() => {
    setEnded(false);
    if (src) {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.addEventListener("ended", () => {
          setInternalPlaying(false);
          setEnded(true);
        });
      }
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
      setInternalPlaying(true);
    }
    onPlay?.();
  }, [src, onPlay]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setInternalPlaying(false);
    onStop?.();
  }, [onStop]);

  // Sync ended state with controlled mode
  useEffect(() => {
    if (
      controlledPlaying !== undefined &&
      !controlledPlaying &&
      internalPlaying
    ) {
      setInternalPlaying(false);
      setEnded(true);
    }
  }, [controlledPlaying, internalPlaying]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleClick = () => {
    if (ended && showReplay) {
      setEnded(false);
      handlePlay();
    } else if (isPlaying) {
      handleStop();
    } else {
      handlePlay();
    }
  };

  const buttonIcon =
    ended && showReplay ? (
      <ReplayIcon />
    ) : isPlaying ? (
      <StopIcon />
    ) : (
      <PlayIcon />
    );
  const displayLabel = ended && showReplay ? "Replay" : label;

  // ─── Standalone ─────────────────────────────────────────

  if (variant === "standalone") {
    return (
      <button
        onClick={handleClick}
        className={`
          flex items-center gap-3 rounded-[10px] p-3.5 px-[18px] transition-all
          ${
            isPlaying
              ? "border border-coral/40 bg-gradient-to-r from-coral/[0.08] to-info/[0.08]"
              : "border-[1.5px] border-steel bg-obsidian hover:bg-graphite/30"
          }
        `}
      >
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center shrink-0
            ${isPlaying ? "bg-coral text-night" : "bg-graphite text-ivory"}
          `}
        >
          {buttonIcon}
        </div>
        {isPlaying ? (
          <WaveformBars variant="standalone" />
        ) : (
          <span className="text-xs text-silver font-body">{displayLabel}</span>
        )}
      </button>
    );
  }

  // ─── Inline Lesson ──────────────────────────────────────

  if (variant === "inline-lesson") {
    return (
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-3 py-[14px] px-[18px] rounded-[10px] transition-all
          ${
            isPlaying
              ? "border border-coral/40 bg-gradient-to-br from-coral/[0.08] to-correct/[0.08]"
              : "border border-steel bg-obsidian hover:bg-graphite/30"
          }
        `}
      >
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center shrink-0
            ${isPlaying ? "bg-gradient-to-r from-coral to-correct text-night" : "bg-graphite text-ivory"}
          `}
        >
          {buttonIcon}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[13px] font-body font-semibold text-ivory">
            {isPlaying ? "Playing..." : displayLabel}
          </div>
          {sublabel && (
            <div className="text-[11px] font-mono text-ash">{sublabel}</div>
          )}
        </div>
        {isPlaying && <WaveformBars variant="inline-lesson" />}
      </button>
    );
  }

  // ─── Inline (default for review cards) ──────────────────

  return (
    <button
      onClick={handleClick}
      className={`
        w-full flex items-center gap-3 py-2.5 px-[18px] rounded-[10px] transition-all
        ${
          isPlaying
            ? "border border-coral/40 bg-gradient-to-br from-coral/[0.08] to-info/[0.08]"
            : "border border-steel bg-obsidian hover:bg-graphite/30"
        }
      `}
    >
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center shrink-0
          ${isPlaying ? "bg-coral text-night" : "bg-graphite text-ivory"}
        `}
      >
        {buttonIcon}
      </div>
      {isPlaying ? (
        <WaveformBars variant="inline" />
      ) : (
        <span className="font-mono text-xs text-silver">{displayLabel}</span>
      )}
    </button>
  );
}
