"use client";

import { useState, useCallback } from "react";
import { brand } from "@/lib/tokens";
import * as Tone from "tone";
import { playScale } from "@/lib/audio/scale-player";

interface OptionData {
  id: string;
  label: string;
}

interface AudioConfig {
  type: "scale" | "mode" | "interval" | "chord";
  root: string;
  scaleType?: string;
  direction?: "ascending" | "descending" | "both";
  tempo?: number;
}

interface AudioToNameProps {
  audioConfig: AudioConfig;
  options: OptionData[];
  correctAnswer: string;
  onAnswer: (correct: boolean) => void;
}

export function AudioToName({
  audioConfig,
  options,
  correctAnswer,
  onAnswer,
}: AudioToNameProps) {
  const [playing, setPlaying] = useState(false);
  const [playbackDone, setPlaybackDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const handlePlay = useCallback(async () => {
    if (playing) return;
    setPlaying(true);

    try {
      await Tone.start();
      await playScale({
        root: audioConfig.root,
        scaleType: audioConfig.scaleType ?? "major",
        direction: audioConfig.direction ?? "ascending",
        tempo: audioConfig.tempo ?? 3,
      });
    } catch (err) {
      console.warn("Scale playback failed:", err);
    }

    setPlaying(false);
    setPlaybackDone(true);
  }, [playing, audioConfig]);

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
      {/* Playback area */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handlePlay}
          disabled={playing}
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
          style={{
            backgroundColor: playing ? brand.violet + "30" : brand.graphite,
            border: `1.5px solid ${playing ? brand.violet : brand.steel}`,
            color: playing ? brand.violet : brand.ivory,
            cursor: playing ? "default" : "pointer",
          }}
        >
          {playing ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet border-t-transparent" />
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
            Tap play to hear the scale
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
