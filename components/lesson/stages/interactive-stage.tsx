"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { InteractiveStage as InteractiveStageType } from "@/types/lesson";
import type { NoteName, DiatonicDegree } from "@/types/audio";
import { Button } from "@/components/ui/button";
import { DegreeCircle } from "@/components/lesson/degree-circle";
import type { useDrone } from "@/hooks/use-drone";
import type { usePlayback } from "@/hooks/use-playback";

interface InteractiveStageProps {
  stage: InteractiveStageType;
  stageIndex: number;
  droneKey: string | null;
  drone: ReturnType<typeof useDrone>;
  playback: ReturnType<typeof usePlayback>;
  onComplete: () => void;
  showFeelingStates?: boolean;
}

function DegreeCircleExplore({
  stage,
  droneKey,
  drone,
  playback,
  onInteraction,
  showFeelingStates = false,
}: {
  stage: InteractiveStageType;
  droneKey: string | null;
  drone: ReturnType<typeof useDrone>;
  playback: ReturnType<typeof usePlayback>;
  onInteraction: () => void;
  showFeelingStates?: boolean;
}) {
  const [activeDegree, setActiveDegree] = useState<number | undefined>();
  const hasStarted = useRef(false);

  const key = (stage.drone_key ?? droneKey ?? "C") as NoteName;
  const degrees = (stage.config.degrees as number[]) ?? [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    void drone.start({ key });
    void drone.playCadence({ key });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDegreeClick = useCallback(
    async (degree: number) => {
      setActiveDegree(degree);
      onInteraction();
      await playback.playDegree({
        degree: degree as DiatonicDegree,
        key,
        duration: 0.8,
      });
    },
    [playback, key, onInteraction],
  );

  return (
    <div className="flex justify-center">
      <DegreeCircle
        activeDegrees={activeDegree !== undefined ? [activeDegree] : []}
        unlockedDegrees={degrees}
        onDegreeClick={(d) => void handleDegreeClick(d)}
        size={280}
        interactive
        showFeelingStates={showFeelingStates}
      />
    </div>
  );
}

function PlaceholderInteractive({
  stage,
  onInteraction,
}: {
  stage: InteractiveStageType;
  onInteraction: () => void;
}) {
  return (
    <div className="bg-obsidian border border-steel rounded-lg p-8 text-center">
      <p className="text-silver text-sm">
        Interactive type &ldquo;{stage.interactive_type}&rdquo; coming soon.
      </p>
      <Button className="mt-4" onClick={onInteraction}>
        Tap to interact
      </Button>
    </div>
  );
}

export function InteractiveStageView({
  stage,
  stageIndex: _stageIndex,
  droneKey,
  drone,
  playback,
  onComplete,
  showFeelingStates = false,
}: InteractiveStageProps) {
  const [interactions, setInteractions] = useState(0);

  const minRequired = stage.min_interactions ?? 0;
  const canContinue = interactions >= minRequired;

  const handleInteraction = useCallback(() => {
    setInteractions((n) => n + 1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-obsidian border border-steel rounded-lg p-6">
        <h2 className="font-display text-lg font-bold text-ivory mb-4">
          {stage.title}
        </h2>
        <p className="text-[15px] text-silver leading-relaxed mb-6">
          {stage.instructions}
        </p>
      </div>

      {stage.interactive_type === "degree_circle_explore" && (
        <DegreeCircleExplore
          stage={stage}
          droneKey={droneKey}
          drone={drone}
          playback={playback}
          onInteraction={handleInteraction}
          showFeelingStates={showFeelingStates}
        />
      )}

      {stage.interactive_type !== "degree_circle_explore" && (
        <PlaceholderInteractive
          stage={stage}
          onInteraction={handleInteraction}
        />
      )}

      {minRequired > 0 && !canContinue && (
        <p className="text-xs text-ash text-center font-mono">
          {interactions}/{minRequired} interactions
        </p>
      )}

      <Button fullWidth disabled={!canContinue} onClick={onComplete}>
        Continue &rarr;
      </Button>
    </div>
  );
}
