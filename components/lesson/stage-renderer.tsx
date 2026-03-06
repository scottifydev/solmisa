"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type {
  StageRendererProps,
  LessonStage,
  AuralTeachStage,
  TheoryTeachStage,
  RhythmStage,
  RealMusicExampleStage,
  LessonStageType,
} from "@/types/lesson";
import type { NoteName, DiatonicDegree } from "@/types/audio";
import { Button } from "@/components/ui/button";
import { DegreeCircle } from "@/components/lesson/degree-circle";
import { useDrone } from "@/hooks/use-drone";
import { usePlayback } from "@/hooks/use-playback";
import { brand } from "@/lib/tokens";
import { RhythmTapper } from "@/components/lesson/rhythm-tapper";
import { useMetronome } from "@/hooks/use-metronome";
import { InteractiveStageView } from "@/components/lesson/stages/interactive-stage";
import { GuidedPracticeStageView } from "@/components/lesson/stages/guided-practice-stage";
import { RealMusicExampleStageView } from "@/components/lesson/stages/real-music-example-stage";
import { useRef } from "react";
import { useState as useStateAlias } from "react";

// ─── Stage Pill ─────────────────────────────────────────────

function StagePill({
  stage,
  index,
  current,
  completed,
}: {
  stage: LessonStage;
  index: number;
  current: boolean;
  completed: boolean;
}) {
  if (completed) {
    return (
      <span className="text-[10px] px-2 py-[3px] rounded-sm font-mono tracking-wide uppercase bg-correct/10 text-correct">
        &#x2713;
      </span>
    );
  }
  if (!current) {
    return (
      <span className="text-[10px] px-2 py-[3px] rounded-sm font-mono tracking-wide uppercase text-ash">
        {index + 1}
      </span>
    );
  }

  const styles: Record<LessonStageType, string> = {
    aural_teach: "bg-violet/10 text-violet border border-violet/40",
    aural_quiz: "bg-warning/10 text-warning border border-warning/30",
    theory_teach: "bg-info/10 text-info border border-info/30",
    theory_quiz: "bg-warning/10 text-warning border border-warning/30",
    rhythm: "bg-correct/10 text-correct border border-correct/30",
    interactive: "bg-violet/10 text-violet border border-violet/40",
    guided_practice: "bg-info/10 text-info border border-info/30",
    real_music_example: "bg-violet/10 text-violet border border-violet/40",
  };

  const labels: Record<LessonStageType, string> = {
    aural_teach: "listen",
    aural_quiz: "quiz",
    theory_teach: "theory",
    theory_quiz: "quiz",
    rhythm: "rhythm",
    interactive: "interact",
    guided_practice: "practice",
    real_music_example: "example",
  };

  return (
    <span
      className={`text-[10px] px-2 py-[3px] rounded-sm font-mono tracking-wide uppercase ${styles[stage.type]}`}
    >
      {labels[stage.type]}
    </span>
  );
}

// ─── Aural Teach Stage ──────────────────────────────────────

function AuralTeachView({
  stage,
  droneKey,
  drone,
  playback,
  onComplete,
  showFeelingStates = false,
}: {
  stage: AuralTeachStage;
  droneKey: string | null;
  drone: ReturnType<typeof useDrone>;
  playback: ReturnType<typeof usePlayback>;
  onComplete: () => void;
  showFeelingStates?: boolean;
}) {
  const [contentVisible, setContentVisible] = useStateAlias(false);
  const [activeDegree, setActiveDegree] = useStateAlias<number | undefined>();
  const hasPlayed = useRef(false);

  const hasPitchContent = stage.audio_degrees.length > 0;

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    const play = async () => {
      if (hasPitchContent) {
        const key = (droneKey ?? "C") as NoteName;
        await drone.start({ key });
        await drone.playCadence({ key });

        for (const deg of stage.audio_degrees) {
          setActiveDegree(deg);
          await playback.playDegree({
            degree: deg as DiatonicDegree,
            key,
            duration: 0.8,
          });
        }
        setActiveDegree(stage.highlight_degree);
      }

      // Content appears after audio (Gordon: sound before label)
      setTimeout(() => setContentVisible(true), 300);
    };

    // Brief delay for user orientation
    const timer = setTimeout(() => void play(), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDegreeClick = async (degree: number) => {
    const key = (droneKey ?? "C") as NoteName;
    setActiveDegree(degree);
    await playback.playDegree({
      degree: degree as DiatonicDegree,
      key,
      duration: 0.8,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6">
      <div className="space-y-6">
        <div className="bg-obsidian border border-steel rounded-lg p-6">
          <h2 className="font-display text-lg font-bold text-ivory mb-4">
            {stage.title}
          </h2>
          {contentVisible && (
            <p className="text-[15px] text-silver leading-relaxed mb-6">
              {stage.instructions}
            </p>
          )}
          <Button className="ml-auto" onClick={onComplete}>
            Continue &rarr;
          </Button>
        </div>
      </div>
      {stage.show_degree_circle && (
        <div className="flex items-start justify-center">
          <DegreeCircle
            activeDegrees={activeDegree !== undefined ? [activeDegree] : []}
            unlockedDegrees={stage.audio_degrees}
            onDegreeClick={(d) => void handleDegreeClick(d)}
            size={260}
            interactive
            showFeelingStates={showFeelingStates}
          />
        </div>
      )}
    </div>
  );
}

// ─── Theory Teach Stage ─────────────────────────────────────

function TheoryTeachView({
  stage,
  onComplete,
}: {
  stage: TheoryTeachStage;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-obsidian border border-steel rounded-lg p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-ivory">
          {stage.title}
        </h2>
        <div className="text-[15px] text-silver leading-relaxed whitespace-pre-wrap">
          {stage.content}
        </div>
        {stage.notation && (
          <div className="bg-night rounded-lg p-4 font-mono text-sm text-ivory">
            {stage.notation}
          </div>
        )}
      </div>
      {stage.show_degree_circle && stage.degree !== undefined && (
        <div className="flex justify-center">
          <DegreeCircle
            activeDegrees={[stage.degree]}
            size={240}
            interactive={false}
          />
        </div>
      )}
      <Button fullWidth onClick={onComplete}>
        Continue &rarr;
      </Button>
    </div>
  );
}

// ─── Rhythm Stage ───────────────────────────────────────────

function RhythmView({
  stage,
  onComplete,
}: {
  stage: RhythmStage;
  onComplete: () => void;
}) {
  const [lastAccuracy, setLastAccuracy] = useState<number | null>(null);
  const meterStr = `${stage.time_signature[0]}/${stage.time_signature[1]}` as
    | "4/4"
    | "3/4"
    | "6/8"
    | "5/8"
    | "7/8";

  const handleRhythmComplete = useCallback((accuracy: number) => {
    setLastAccuracy(accuracy);
  }, []);

  const feedback =
    lastAccuracy !== null && stage.mode !== "listen"
      ? lastAccuracy >= 0.9
        ? {
            text: "Excellent timing. Your internal pulse is solid.",
            style: "bg-correct/10 text-correct border-correct/30",
          }
        : lastAccuracy >= 0.7
          ? {
              text: "Good rhythm. A few beats were slightly off \u2014 try again or continue.",
              style: "bg-correct/10 text-correct border-correct/30",
            }
          : lastAccuracy >= 0.5
            ? {
                text: "Getting there. Focus on feeling the pulse before each tap.",
                style: "bg-warning/10 text-warning border-warning/30",
              }
            : {
                text: "Keep practicing. Try tapping along with the count-in to lock in the tempo.",
                style: "bg-incorrect/10 text-incorrect border-incorrect/30",
              }
      : null;

  return (
    <div className="space-y-6">
      <div className="bg-obsidian border border-steel rounded-lg p-6">
        <h2 className="font-display text-lg font-bold text-ivory mb-4">
          {stage.title ?? "Rhythm"}
        </h2>
        {stage.instructions && (
          <p className="text-[15px] text-silver leading-relaxed mb-4">
            {stage.instructions}
          </p>
        )}
        <RhythmTapper
          meter={meterStr}
          bpm={stage.tempo}
          targetPattern={stage.pattern}
          mode={stage.mode === "quiz" ? "identify" : stage.mode}
          onComplete={handleRhythmComplete}
        />
      </div>

      {feedback && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-body border ${feedback.style}`}
        >
          {feedback.text}
        </div>
      )}

      {(lastAccuracy !== null || stage.mode === "listen") && (
        <Button fullWidth onClick={onComplete}>
          Continue &rarr;
        </Button>
      )}
    </div>
  );
}

// ─── Main Stage Renderer ────────────────────────────────────

export function StageRenderer({
  lesson,
  onComplete,
  showFeelingStates = false,
}: StageRendererProps) {
  const drone = useDrone();
  const playback = usePlayback();
  const metronome = useMetronome();
  const [stageIdx, setStageIdx] = useState(0);

  // Check if any stage uses pitch content
  const lessonHasPitchContent = useMemo(
    () =>
      lesson.stages.some((s) => {
        if (
          "audio_degrees" in s &&
          Array.isArray(s.audio_degrees) &&
          s.audio_degrees.length > 0
        )
          return true;
        if (s.type === "guided_practice") return true;
        if (s.type === "interactive") return true;
        return false;
      }),
    [lesson.stages],
  );

  // Start drone at lesson level for pitch lessons, stop all audio on unmount
  useEffect(() => {
    if (lessonHasPitchContent && lesson.drone_key) {
      void drone.start({ key: lesson.drone_key as NoteName });
    }
    return () => {
      drone.stop();
      playback.stop();
      metronome.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manage metronome: run during non-rhythm stages in non-pitch lessons
  useEffect(() => {
    if (lessonHasPitchContent) return;
    if (currentStage?.type === "rhythm") {
      metronome.stop();
    } else {
      void metronome.start({ bpm: 100, beatsPerMeasure: 4, accentFirst: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIdx]);

  const stages = lesson.stages;
  const currentStage = stages[stageIdx];
  const progress =
    stages.length > 0 ? ((stageIdx + 1) / stages.length) * 100 : 0;

  const advanceStage = useCallback(() => {
    if (stageIdx < stages.length - 1) {
      setStageIdx((i) => i + 1);
    } else {
      onComplete(stages.length);
    }
  }, [stageIdx, stages.length, onComplete]);

  if (!currentStage) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Lesson Header */}
      <div className="space-y-3">
        <div
          className="font-mono text-[11px] tracking-widest uppercase"
          style={{ color: brand.violet }}
        >
          {lesson.module_title} &mdash; Lesson {lesson.lesson_num} of{" "}
          {lesson.total_lessons}
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ivory">
          {lesson.lesson_title}
        </h1>

        {/* Progress bar */}
        <div className="w-full h-[3px] bg-steel rounded-sm overflow-hidden">
          <div
            className="h-full rounded-sm transition-all duration-400"
            style={{ width: `${progress}%`, backgroundColor: brand.violet }}
          />
        </div>

        {/* Stage pills */}
        <div className="flex gap-[6px]">
          {stages.map((s, i) => (
            <StagePill
              key={i}
              stage={s}
              index={i}
              current={i === stageIdx}
              completed={i < stageIdx}
            />
          ))}
        </div>
      </div>

      {/* Stage Content */}
      {currentStage.type === "aural_teach" && (
        <AuralTeachView
          key={stageIdx}
          stage={currentStage}
          droneKey={lesson.drone_key}
          drone={drone}
          playback={playback}
          onComplete={advanceStage}
          showFeelingStates={showFeelingStates}
        />
      )}
      {currentStage.type === "theory_teach" && (
        <TheoryTeachView
          key={stageIdx}
          stage={currentStage}
          onComplete={advanceStage}
        />
      )}
      {currentStage.type === "interactive" && (
        <InteractiveStageView
          key={stageIdx}
          stage={currentStage}
          stageIndex={stageIdx}
          droneKey={lesson.drone_key}
          drone={drone}
          playback={playback}
          onComplete={advanceStage}
          showFeelingStates={showFeelingStates}
        />
      )}
      {currentStage.type === "guided_practice" && (
        <GuidedPracticeStageView
          key={stageIdx}
          stage={currentStage}
          stageIndex={stageIdx}
          droneKey={lesson.drone_key}
          drone={drone}
          playback={playback}
          onComplete={advanceStage}
          showFeelingStates={showFeelingStates}
        />
      )}
      {currentStage.type === "rhythm" && (
        <RhythmView
          key={stageIdx}
          stage={currentStage}
          onComplete={advanceStage}
        />
      )}
      {currentStage.type === "real_music_example" && (
        <RealMusicExampleStageView
          key={stageIdx}
          stage={currentStage as RealMusicExampleStage}
          onComplete={advanceStage}
        />
      )}
    </div>
  );
}
