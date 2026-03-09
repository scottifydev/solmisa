"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { brand } from "@/lib/tokens";
import * as Tone from "tone";
import type { AudioConfig } from "@/lib/audio/audio-config-types";
import { playAudioConfig } from "@/lib/audio/flow-audio-pipeline";
import { PlaybackEngine } from "@/lib/audio/playback";
import { NotationView } from "@/components/notation/notation-view";
import type { NotationData } from "@/lib/notation/types";

interface RhythmOption {
  id: string;
  label: string;
  notes: { value: string; dot?: boolean; rest?: boolean }[];
}

interface AudioRhythmProps {
  audioConfig: AudioConfig; // rhythm_percussion mode
  timeSignature: string;
  rhythmOptions: RhythmOption[];
  correctAnswer: string;
  onAnswer: (correct: boolean) => void;
}

function buildNotationData(
  timeSignature: string,
  notes: { value: string; dot?: boolean; rest?: boolean }[],
): NotationData {
  return {
    clef: "treble",
    key: "C",
    time: timeSignature,
    measures: [
      {
        notes: notes.map((n) => ({
          keys: ["b/4"],
          duration: n.value,
          dotted: n.dot,
          rest: n.rest,
        })),
      },
    ],
  };
}

export function AudioRhythm({
  audioConfig,
  timeSignature,
  rhythmOptions,
  correctAnswer,
  onAnswer,
}: AudioRhythmProps) {
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
      console.warn("Rhythm playback failed:", err);
    }

    setPlaying(false);
    setPlaybackDone(true);
  }, [playing, audioConfig, getEngine]);

  useEffect(() => {
    if (hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    const timer = setTimeout(() => handlePlay(), 400);
    return () => clearTimeout(timer);
  }, [handlePlay]);

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

  return (
    <div className="flex flex-col gap-4">
      {/* Replay button */}
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
          {playing ? "Playing..." : playbackDone ? "Replay" : "Listen"}
        </button>
      </div>

      {/* Rhythm option cards with notation */}
      {playbackDone && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-xs" style={{ color: brand.ash }}>
            Which rhythm did you hear?
          </p>
          {rhythmOptions.map((option) => {
            const isSelected = selected === option.id;
            const isCorrect = submitted && option.id === correctAnswer;
            const isWrong = submitted && isSelected && !isCorrect;

            let bg: string = brand.graphite;
            let border: string = brand.steel;

            if (isCorrect) {
              bg = brand.correct + "15";
              border = brand.correct;
            } else if (isWrong) {
              bg = brand.incorrect + "15";
              border = brand.incorrect;
            } else if (isSelected) {
              bg = brand.violet + "15";
              border = brand.violet;
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={submitted}
                className="rounded-xl p-3 transition-all"
                style={{
                  backgroundColor: bg,
                  border: `1.5px solid ${border}`,
                  cursor: submitted ? "default" : "pointer",
                }}
              >
                <div className="pointer-events-none max-w-[300px] mx-auto">
                  <NotationView
                    data={buildNotationData(timeSignature, option.notes)}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
