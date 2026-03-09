"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { brand } from "@/lib/tokens";
import * as Tone from "tone";
import type { AudioConfig } from "@/lib/audio/audio-config-types";
import { playAudioConfig } from "@/lib/audio/flow-audio-pipeline";
import { PlaybackEngine } from "@/lib/audio/playback";

interface OptionData {
  id: string;
  label: string;
}

interface AudioSelectProps {
  audioConfig: AudioConfig;
  options: OptionData[];
  correctAnswer: string;
  prompt: string;
  onAnswer: (correct: boolean) => void;
}

export function AudioSelect({
  audioConfig,
  options,
  correctAnswer,
  prompt,
  onAnswer,
}: AudioSelectProps) {
  const [playing, setPlaying] = useState(false);
  const [playbackDone, setPlaybackDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const hasAutoPlayed = useRef(false);
  const engineRef = useRef<PlaybackEngine | null>(null);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new PlaybackEngine();
    }
    return engineRef.current;
  }, []);

  const handlePlay = useCallback(async () => {
    if (playing) return;
    setPlaying(true);

    try {
      await Tone.start();
      await playAudioConfig(getEngine(), audioConfig);
    } catch (err) {
      console.warn("Audio playback failed:", err);
    }

    setPlaying(false);
    setPlaybackDone(true);
  }, [playing, audioConfig, getEngine]);

  // Auto-play on mount
  useEffect(() => {
    if (hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    const timer = setTimeout(() => handlePlay(), 400);
    return () => clearTimeout(timer);
  }, [handlePlay]);

  // Cleanup engine on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleSelect = (id: string) => {
    if (submitted) return;
    setSelected(id);
  };

  const handleCheck = () => {
    if (!selected) return;
    const correct = selected === correctAnswer;
    setSubmitted(true);
    setTimeout(() => onAnswer(correct), correct ? 800 : 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Prompt */}
      {prompt && (
        <p
          className="text-center text-sm font-medium"
          style={{ color: brand.silver }}
        >
          {prompt}
        </p>
      )}

      {/* Playback controls */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handlePlay}
          disabled={playing}
          className="flex min-h-[48px] items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
          style={{
            backgroundColor: playing ? brand.violet + "30" : brand.graphite,
            border: `1.5px solid ${playing ? brand.violet : brand.steel}`,
            color: playing ? brand.violet : brand.ivory,
            cursor: playing ? "default" : "pointer",
          }}
        >
          {playing ? (
            <>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block h-3 w-0.5 animate-pulse rounded-full"
                  style={{
                    backgroundColor: brand.violet,
                    animationDelay: "0ms",
                  }}
                />
                <span
                  className="inline-block h-4 w-0.5 animate-pulse rounded-full"
                  style={{
                    backgroundColor: brand.violet,
                    animationDelay: "150ms",
                  }}
                />
                <span
                  className="inline-block h-2 w-0.5 animate-pulse rounded-full"
                  style={{
                    backgroundColor: brand.violet,
                    animationDelay: "300ms",
                  }}
                />
                <span
                  className="inline-block h-3.5 w-0.5 animate-pulse rounded-full"
                  style={{
                    backgroundColor: brand.violet,
                    animationDelay: "75ms",
                  }}
                />
              </span>
              Playing...
            </>
          ) : (
            <>
              <PlayIcon />
              {playbackDone ? "Replay" : "Play"}
            </>
          )}
        </button>

        {!playbackDone && !playing && (
          <p className="text-xs" style={{ color: brand.ash }}>
            Tap play to listen
          </p>
        )}
      </div>

      {/* Options — visible after first playback */}
      {playbackDone && (
        <div className="flex flex-col gap-2">
          {options.map((option) => {
            const isSelected = selected === option.id;
            const isCorrect = submitted && option.id === correctAnswer;
            const isWrong = submitted && isSelected && !isCorrect;

            let bg: string = brand.graphite;
            let border: string = brand.steel;
            let textColor: string = brand.silver;

            if (isCorrect) {
              bg = brand.correct + "20";
              border = brand.correct;
              textColor = brand.correct;
            } else if (isWrong) {
              bg = brand.incorrect + "20";
              border = brand.incorrect;
              textColor = brand.incorrect;
            } else if (isSelected) {
              bg = brand.violet + "20";
              border = brand.violet;
              textColor = brand.violet;
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={submitted}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all"
                style={{
                  backgroundColor: bg,
                  border: `1.5px solid ${border}`,
                  color: textColor,
                  cursor: submitted ? "default" : "pointer",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Check button */}
      {playbackDone && !submitted && (
        <button
          onClick={handleCheck}
          disabled={!selected}
          className="mt-2 w-full rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-40"
          style={{
            backgroundColor: brand.violet,
            color: brand.night,
          }}
        >
          Check
        </button>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}
