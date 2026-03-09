"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { brand } from "@/lib/tokens";
import * as Tone from "tone";
import type { AudioConfig } from "@/lib/audio/audio-config-types";
import { playAudioConfig } from "@/lib/audio/flow-audio-pipeline";
import { PlaybackEngine } from "@/lib/audio/playback";

interface FeedbackAudioControlsProps {
  audioConfig: AudioConfig;
  audioComparison?: {
    highlight_degrees?: number[];
    correct_config: AudioConfig;
    selected_config?: AudioConfig;
    slow_tempo?: number;
  };
  autoPlay?: boolean;
}

type ActiveButton = "original" | "answer" | "compare" | null;

export function FeedbackAudioControls({
  audioConfig,
  audioComparison,
  autoPlay,
}: FeedbackAudioControlsProps) {
  const [activeButton, setActiveButton] = useState<ActiveButton>(null);
  const engineRef = useRef<PlaybackEngine | null>(null);
  const hasAutoPlayed = useRef(false);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new PlaybackEngine();
    }
    return engineRef.current;
  }, []);

  const play = useCallback(
    async (config: AudioConfig) => {
      await Tone.start();
      await playAudioConfig(getEngine(), config);
    },
    [getEngine],
  );

  const handleOriginal = useCallback(async () => {
    if (activeButton) return;
    setActiveButton("original");
    try {
      await play(audioConfig);
    } catch (err) {
      console.warn("Feedback audio playback failed:", err);
    }
    setActiveButton(null);
  }, [activeButton, audioConfig, play]);

  const handleAnswer = useCallback(async () => {
    if (activeButton || !audioComparison) return;
    setActiveButton("answer");
    try {
      await play(audioComparison.correct_config);
    } catch (err) {
      console.warn("Feedback answer playback failed:", err);
    }
    setActiveButton(null);
  }, [activeButton, audioComparison, play]);

  const handleCompare = useCallback(async () => {
    if (activeButton || !audioComparison) return;
    setActiveButton("compare");
    try {
      const slowConfig: AudioConfig = {
        ...audioComparison.correct_config,
        ...(audioComparison.slow_tempo
          ? { tempo: audioComparison.slow_tempo }
          : {}),
      };

      if (audioComparison.selected_config) {
        await play(audioComparison.selected_config);
        await wait(400);
        await play(slowConfig);
      } else {
        await play(audioConfig);
        await wait(400);
        await play(slowConfig);
      }
    } catch (err) {
      console.warn("Feedback compare playback failed:", err);
    }
    setActiveButton(null);
  }, [activeButton, audioComparison, audioConfig, play]);

  useEffect(() => {
    if (!autoPlay || hasAutoPlayed.current || !audioComparison) return;
    hasAutoPlayed.current = true;
    const timer = setTimeout(() => {
      void handleCompare();
    }, 600);
    return () => clearTimeout(timer);
  }, [autoPlay, audioComparison, handleCompare]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <AudioButton
        label="Hear it again"
        isPlaying={activeButton === "original"}
        disabled={activeButton !== null && activeButton !== "original"}
        onClick={handleOriginal}
      />
      {audioComparison && (
        <>
          <AudioButton
            label="Hear the answer"
            isPlaying={activeButton === "answer"}
            disabled={activeButton !== null && activeButton !== "answer"}
            onClick={handleAnswer}
          />
          <AudioButton
            label="Compare"
            isPlaying={activeButton === "compare"}
            disabled={activeButton !== null && activeButton !== "compare"}
            onClick={handleCompare}
          />
        </>
      )}
    </div>
  );
}

function AudioButton({
  label,
  isPlaying,
  disabled,
  onClick,
}: {
  label: string;
  isPlaying: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all"
      style={{
        backgroundColor: isPlaying ? brand.violet + "20" : brand.graphite,
        border: `1.5px solid ${isPlaying ? brand.violet : brand.steel}`,
        color: isPlaying ? brand.violet : brand.silver,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled && !isPlaying ? 0.4 : 1,
      }}
    >
      {isPlaying ? <PlayingIndicator /> : <PlayIcon />}
      {isPlaying ? "Playing..." : label}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function PlayingIndicator() {
  return (
    <span className="flex items-center gap-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="inline-block h-2.5 w-0.5 animate-pulse rounded-full"
          style={{
            backgroundColor: brand.violet,
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
    </span>
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
