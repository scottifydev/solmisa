"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GuidedPracticeStage as GuidedPracticeStageType } from "@/types/lesson";
import type { NoteName, DiatonicDegree } from "@/types/audio";
import { Button } from "@/components/ui/button";
import { AnswerCard } from "@/components/ui/answer-card";
import type { useDrone } from "@/hooks/use-drone";
import type { usePlayback } from "@/hooks/use-playback";

const SOLFEGE: Record<number, string> = {
  1: "Do",
  2: "Re",
  3: "Mi",
  4: "Fa",
  5: "Sol",
  6: "La",
  7: "Ti",
};

interface GuidedPracticeStageProps {
  stage: GuidedPracticeStageType;
  stageIndex: number;
  droneKey: string | null;
  drone: ReturnType<typeof useDrone>;
  playback: ReturnType<typeof usePlayback>;
  onComplete: () => void;
  onEngagement?: (engaged: boolean, tappedCorrectly: boolean) => void;
}

export function GuidedPracticeStageView({
  stage,
  stageIndex,
  droneKey,
  drone,
  playback,
  onComplete,
  onEngagement,
}: GuidedPracticeStageProps) {
  const [selected, setSelected] = useState<string | number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [tappedCorrectly, setTappedCorrectly] = useState(false);
  const [timerProgress, setTimerProgress] = useState(0);
  const hasPlayed = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const key = (stage.drone_key ?? droneKey ?? "C") as NoteName;
  const correctAnswer = stage.correct_answer;

  const playTarget = useCallback(async () => {
    if (stage.practice_type === "degree" && stage.audio_degrees.length > 0) {
      await drone.start({ key });
      await drone.playCadence({ key });
      for (const deg of stage.audio_degrees) {
        await playback.playDegree({
          degree: deg as DiatonicDegree,
          key,
          duration: 1,
        });
      }
    }
  }, [drone, playback, key, stage.practice_type, stage.audio_degrees]);

  const reveal = useCallback(
    async (userCorrect: boolean) => {
      if (revealed) return;
      setRevealed(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);

      if (stage.show_resolution) {
        const correctDeg =
          typeof correctAnswer === "number"
            ? correctAnswer
            : parseInt(String(correctAnswer), 10);
        if (!isNaN(correctDeg)) {
          await playback.playResolution({
            fromDegree: correctDeg as DiatonicDegree,
            key,
          });
        }
      }

      onEngagement?.(selected !== null, userCorrect);
    },
    [
      revealed,
      stage.show_resolution,
      correctAnswer,
      playback,
      key,
      onEngagement,
      selected,
    ],
  );

  // Play audio on mount
  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;
    const timer = setTimeout(() => void playTarget(), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start reveal countdown after audio
  useEffect(() => {
    if (hasPlayed.current && !revealed) {
      const startDelay = 1500; // wait for audio to finish
      const countdownStart = setTimeout(() => {
        const intervalMs = 50;
        const steps = stage.reveal_delay_ms / intervalMs;
        let step = 0;
        timerRef.current = setInterval(() => {
          step++;
          setTimerProgress((step / steps) * 100);
          if (step >= steps) {
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }, intervalMs);

        revealTimeoutRef.current = setTimeout(() => {
          void reveal(false);
        }, stage.reveal_delay_ms);
      }, startDelay);

      return () => {
        clearTimeout(countdownStart);
        if (timerRef.current) clearInterval(timerRef.current);
        if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (optionValue: string | number) => {
    if (revealed) return;
    setSelected(optionValue);

    const isCorrect = String(optionValue) === String(correctAnswer);
    if (isCorrect) {
      setTappedCorrectly(true);
      void reveal(true);
    }
    // Wrong tap: no feedback, countdown continues
  };

  const getOptionLabel = (opt: string | number): string => {
    if (stage.practice_type === "degree" && typeof opt === "number") {
      return SOLFEGE[opt] ?? `Degree ${opt}`;
    }
    return String(opt);
  };

  const getOptionSublabel = (opt: string | number): string => {
    if (stage.practice_type === "degree" && typeof opt === "number") {
      return `degree ${opt}`;
    }
    return "";
  };

  const getCardState = (
    optionValue: string | number,
  ): "default" | "selected" | "correct" | "disabled" => {
    if (!revealed) {
      return selected !== null && String(selected) === String(optionValue)
        ? "selected"
        : "default";
    }
    if (String(optionValue) === String(correctAnswer)) return "correct";
    return "disabled";
  };

  return (
    <div className="space-y-6">
      {/* Practice mode badge */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] px-2 py-[3px] rounded-sm font-mono tracking-wide uppercase bg-info/10 text-info border border-info/30">
          practice mode
        </span>
      </div>

      <div className="bg-obsidian border border-steel rounded-lg p-6">
        <h2 className="font-display text-lg font-bold text-ivory mb-2">
          {stage.title}
        </h2>
        <p className="text-[15px] text-silver leading-relaxed">
          {stage.instructions}
        </p>
      </div>

      {/* Replay button */}
      <button
        onClick={() => void playTarget()}
        className="text-sm text-violet hover:text-violet/80 transition-colors font-mono"
      >
        &#9654; Replay
      </button>

      {/* Timer bar */}
      {!revealed && (
        <div className="w-full h-[3px] bg-steel rounded-sm overflow-hidden">
          <div
            className="h-full rounded-sm transition-all duration-100 bg-info/50"
            style={{ width: `${timerProgress}%` }}
          />
        </div>
      )}

      {/* Answer options */}
      <div className="grid grid-cols-2 gap-3">
        {stage.options.map((opt) => (
          <AnswerCard
            key={String(opt)}
            label={getOptionLabel(opt)}
            sublabel={getOptionSublabel(opt)}
            state={getCardState(opt)}
            degreeColor={
              stage.practice_type === "degree" && typeof opt === "number"
                ? (opt as 1 | 2 | 3 | 4 | 5 | 6 | 7)
                : undefined
            }
            onClick={() => handleSelect(opt)}
            disabled={revealed}
          />
        ))}
      </div>

      {/* Gentle feedback on correct pre-timer tap */}
      {revealed && tappedCorrectly && (
        <div className="rounded-lg px-4 py-3 text-sm font-body border bg-correct/10 text-correct border-correct/30">
          You heard it. That recognition will get sharper with practice.
        </div>
      )}

      {revealed && (
        <Button fullWidth onClick={onComplete}>
          Continue &rarr;
        </Button>
      )}
    </div>
  );
}
