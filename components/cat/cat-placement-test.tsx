"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { brand, type as typeTokens } from "@/lib/tokens";
import { Button } from "@/components/ui/button";
import { useDrone } from "@/hooks/use-drone";
import { usePlayback } from "@/hooks/use-playback";
import {
  createInitialState,
  selectNextItem,
  processResponse,
  isComplete,
  getPlacement,
} from "@/lib/cat/engine";
import type { CATItem, CATState, PlacementResult } from "@/lib/cat/types";
import { ITEM_BANK } from "@/lib/cat/item-bank";
import { RADAR_GROUP_LABELS, type RadarGroup } from "@/lib/radar/dimensions";
import type { NoteName, DiatonicDegree } from "@/types/audio";

interface CATPlacementTestProps {
  onComplete: (placement: PlacementResult) => void;
  onSkipAll: () => void;
  onBack: () => void;
  quietEnvironment?: boolean;
}

interface RadarDataPoint {
  group: RadarGroup;
  label: string;
  score: number;
}

function buildRadarData(state: CATState): RadarDataPoint[] {
  const groupScores = new Map<RadarGroup, number[]>();
  for (const est of state.estimates) {
    const scores = groupScores.get(est.group) ?? [];
    const normalized = (est.theta + 3) / 6;
    scores.push(Math.max(0, Math.min(100, Math.round(normalized * 100))));
    groupScores.set(est.group, scores);
  }

  return Array.from(groupScores.entries()).map(([group, scores]) => ({
    group,
    label: RADAR_GROUP_LABELS[group],
    score:
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
  }));
}

function applyNoisyEnvironmentAdjustment(
  placement: PlacementResult,
): PlacementResult {
  // Find dimensions that have aural items in the bank
  const auralDimensions = new Set(
    ITEM_BANK.filter((i) => i.item_type === "aural").map((i) => i.dimension),
  );
  const extra = Array.from(auralDimensions).filter(
    (d) => !placement.lowConfidenceDimensions.includes(d),
  );
  return {
    ...placement,
    lowConfidenceDimensions: [...placement.lowConfidenceDimensions, ...extra],
  };
}

export function CATPlacementTest({
  onComplete,
  onSkipAll,
  onBack,
  quietEnvironment,
}: CATPlacementTestProps) {
  const [catState, setCATState] = useState<CATState>(createInitialState);
  const [currentItem, setCurrentItem] = useState<CATItem | null>(() =>
    selectNextItem(createInitialState()),
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answering, setAnswering] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const startTimeRef = useRef(Date.now());

  const drone = useDrone();
  const playback = usePlayback();

  // Stop drone on unmount
  useEffect(() => {
    return () => {
      drone.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playAudio = useCallback(
    async (item: CATItem) => {
      const key = (item.drone_key ?? "C") as NoteName;
      if (!drone.isPlaying) {
        await drone.start({ key, octave: 4 });
      }

      if (item.audio_degrees && item.audio_degrees.length > 0) {
        if (item.audio_degrees.length === 1) {
          await playback.playDegree({
            degree: item.audio_degrees[0] as DiatonicDegree,
            key,
            octave: 4,
            duration: 1.2,
          });
        } else {
          await playback.playDegreeSequence(
            item.audio_degrees as DiatonicDegree[],
            { key, octave: 4, duration: 0.8 },
          );
        }
      }
      setAudioPlayed(true);
    },
    [drone, playback],
  );

  const handleAnswer = useCallback(
    (answerId: string) => {
      if (answering || !currentItem) return;
      setAnswering(true);
      setSelectedAnswer(answerId);

      const correct = answerId === currentItem.correct_answer;
      const responseTimeMs = Date.now() - startTimeRef.current;

      setTimeout(() => {
        const newState = processResponse(
          catState,
          currentItem,
          correct,
          responseTimeMs,
        );
        setCATState(newState);

        if (isComplete(newState)) {
          drone.stop();
          let placement = getPlacement(newState);
          if (quietEnvironment === false) {
            placement = applyNoisyEnvironmentAdjustment(placement);
          }
          onComplete(placement);
          return;
        }

        const nextItem = selectNextItem(newState);
        if (!nextItem) {
          drone.stop();
          let placement = getPlacement(newState);
          if (quietEnvironment === false) {
            placement = applyNoisyEnvironmentAdjustment(placement);
          }
          onComplete(placement);
          return;
        }

        setCurrentItem(nextItem);
        setSelectedAnswer(null);
        setAnswering(false);
        setAudioPlayed(false);
        startTimeRef.current = Date.now();
      }, 400);
    },
    [answering, currentItem, catState, drone, onComplete],
  );

  const handleSkip = useCallback(() => {
    if (!currentItem) return;
    // Treat skip as incorrect for faster convergence
    handleAnswer("__skip__");
  }, [currentItem, handleAnswer]);

  if (!currentItem) return null;

  const radarData = buildRadarData(catState);
  const itemNumber = catState.administered.length + 1;
  const convergedCount = catState.estimates.filter(
    (e) => e.standardError <= 0.5,
  ).length;
  const totalDimensions = catState.estimates.length;
  const isAural = currentItem.item_type === "aural";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-ivory">
          Placement Test
        </h2>
        <p className="text-silver text-sm mt-1">
          Adapts to your level as you answer
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-steel rounded-full overflow-hidden">
          <div
            className="h-full bg-violet rounded-full transition-all duration-500"
            style={{
              width: `${(convergedCount / totalDimensions) * 100}%`,
            }}
          />
        </div>
        <span className="text-[11px] font-mono text-silver/60 shrink-0">
          Q{itemNumber}
        </span>
      </div>

      {/* Compact radar */}
      <div className="rounded-lg border border-steel bg-obsidian p-2">
        <ResponsiveContainer width="100%" height={160}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
            <PolarGrid stroke={brand.steel} />
            <PolarAngleAxis
              dataKey="label"
              tick={{
                fill: brand.ash,
                fontSize: 8,
                fontFamily: typeTokens.mono,
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              dataKey="score"
              stroke={brand.violet}
              fill={brand.violet}
              fillOpacity={0.2}
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={600}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <h3 className="text-ivory font-body text-[15px] leading-relaxed">
          {currentItem.prompt}
        </h3>

        {/* Audio play button for aural items */}
        {isAural && (
          <button
            onClick={() => playAudio(currentItem)}
            disabled={playback.isPlaying}
            className={`w-full rounded-lg border p-3 text-center text-sm transition-colors ${
              audioPlayed
                ? "border-violet/40 bg-violet/5 text-violet"
                : "border-steel bg-obsidian text-silver hover:border-violet"
            } ${playback.isPlaying ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
          >
            {playback.isPlaying
              ? "Playing..."
              : audioPlayed
                ? "Play again"
                : "Listen"}
          </button>
        )}

        {/* Options */}
        {currentItem.options && (
          <div className="space-y-2">
            {currentItem.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                disabled={answering || (isAural && !audioPlayed)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                  selectedAnswer === option.id
                    ? "border-violet bg-violet/10 text-ivory"
                    : "border-steel bg-obsidian text-silver hover:border-silver"
                } ${answering || (isAural && !audioPlayed) ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Skip + navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {catState.administered.length === 0 ? (
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleSkip} disabled={answering}>
              Skip
            </Button>
          )}
        </div>
        <button
          onClick={onSkipAll}
          className="text-silver/60 text-xs hover:text-silver transition-colors font-mono"
        >
          I&apos;m a complete beginner
        </button>
      </div>
    </div>
  );
}
