"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { brand } from "@/lib/tokens";
import * as Tone from "tone";
import type { AudioConfig } from "@/lib/audio/audio-config-types";
import { playAudioConfig } from "@/lib/audio/flow-audio-pipeline";
import { PlaybackEngine } from "@/lib/audio/playback";
import { IDontKnowButton } from "./i-dont-know-button";

interface FeelingOption {
  id: string;
  label: string;
  tint?: string; // subtle color tint for expressiveness
}

interface FeelingStateMatchProps {
  audioConfig: AudioConfig;
  options: FeelingOption[];
  correctAnswer: string;
  onAnswer: (correct: boolean) => void;
}

export function FeelingStateMatch({
  audioConfig,
  options,
  correctAnswer,
  onAnswer,
}: FeelingStateMatchProps) {
  const [playing, setPlaying] = useState(false);
  const [playbackDone, setPlaybackDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
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

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleSelect = (id: string) => {
    if (submitted || !playbackDone) return;
    setSelected(id);
    setSubmitted(true);
    const correct = id === correctAnswer;
    setTimeout(() => onAnswer(correct), correct ? 800 : 2000);
  };

  const handleDontKnow = () => {
    if (submitted) return;
    setSubmitted(true);
    setTimeout(() => onAnswer(false), 2500);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Replay control */}
      <div className="flex justify-center">
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
                  style={{ backgroundColor: brand.violet }}
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
              </span>
              Listening...
            </>
          ) : (
            <>
              <PlayIcon />
              {playbackDone ? "Replay" : "Listen"}
            </>
          )}
        </button>
      </div>

      {/* Feeling cards — single column, wider, expressive */}
      {playbackDone && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-xs" style={{ color: brand.ash }}>
            What does this sound feel like?
          </p>
          {options.map((option) => {
            const isSelected = selected === option.id;
            const isCorrect = submitted && option.id === correctAnswer;
            const isWrong = submitted && isSelected && !isCorrect;

            let bg: string = brand.graphite;
            let border: string = brand.steel;
            let textColor: string = brand.silver;

            if (isCorrect) {
              bg = brand.correct + "15";
              border = brand.correct;
              textColor = brand.correct;
            } else if (isWrong) {
              bg = brand.incorrect + "15";
              border = brand.incorrect;
              textColor = brand.incorrect;
            } else if (isSelected) {
              bg = brand.violet + "15";
              border = brand.violet;
              textColor = brand.violet;
            }

            // Apply subtle tint from option config
            const tintStyle =
              !submitted && option.tint
                ? { borderLeft: `3px solid ${option.tint}` }
                : {};

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={submitted}
                className="rounded-xl px-5 py-4 text-left text-base font-semibold transition-all"
                style={{
                  backgroundColor: bg,
                  border: `1.5px solid ${border}`,
                  color: textColor,
                  cursor: submitted ? "default" : "pointer",
                  minHeight: 56,
                  ...tintStyle,
                }}
              >
                {option.label}
              </button>
            );
          })}
          <IDontKnowButton onDontKnow={handleDontKnow} visible={!submitted} />
        </div>
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
