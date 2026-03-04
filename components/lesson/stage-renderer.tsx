"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  StageRendererProps,
  LessonRenderData,
  LessonStage,
  AuralTeachStage,
  TheoryTeachStage,
  AuralQuizStage,
  TheoryQuizStage,
  RhythmStage,
  StageQuizResult,
  LessonStageType,
} from "@/types/lesson";
import type { NoteName, DiatonicDegree } from "@/types/audio";
import { Button } from "@/components/ui/button";
import { AnswerCard } from "@/components/ui/answer-card";
import { DegreeCircle } from "@/components/lesson/degree-circle";
import { useDrone } from "@/hooks/use-drone";
import { usePlayback } from "@/hooks/use-playback";
import { brand } from "@/lib/tokens";
import { RhythmTapper } from "@/components/lesson/rhythm-tapper";

// ─── Stage Pill ─────────────────────────────────────────────

function StagePill({ stage, index, current, completed }: {
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
      <span className="text-[10px] px-2 py-[3px] rounded-sm font-mono tracking-wide uppercase text-shadow">
        {index + 1}
      </span>
    );
  }

  const styles: Record<LessonStageType, string> = {
    aural_teach: "bg-coral/10 text-coral border border-coral/40",
    aural_quiz: "bg-warning/10 text-warning border border-warning/30",
    theory_teach: "bg-info/10 text-info border border-info/30",
    theory_quiz: "bg-warning/10 text-warning border border-warning/30",
    rhythm: "bg-correct/10 text-correct border border-correct/30",
  };

  const labels: Record<LessonStageType, string> = {
    aural_teach: "listen",
    aural_quiz: "quiz",
    theory_teach: "theory",
    theory_quiz: "quiz",
    rhythm: "rhythm",
  };

  return (
    <span className={`text-[10px] px-2 py-[3px] rounded-sm font-mono tracking-wide uppercase ${styles[stage.type]}`}>
      {labels[stage.type]}
    </span>
  );
}

// ─── Aural Teach Stage ──────────────────────────────────────

function AuralTeachView({ stage, droneKey, onComplete }: {
  stage: AuralTeachStage;
  droneKey: string | null;
  onComplete: () => void;
}) {
  const drone = useDrone();
  const playback = usePlayback();
  const [contentVisible, setContentVisible] = useState(false);
  const [activeDegree, setActiveDegree] = useState<number | undefined>();
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    const play = async () => {
      const key = (droneKey ?? "C") as NoteName;
      await drone.start({ key });
      await drone.playCadence({ key });

      // Play audio degrees sequence with highlighting
      for (const deg of stage.audio_degrees) {
        setActiveDegree(deg);
        await playback.playDegree({ degree: deg as DiatonicDegree, key, duration: 0.8 });
      }
      setActiveDegree(stage.highlight_degree);

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
    await playback.playDegree({ degree: degree as DiatonicDegree, key, duration: 0.8 });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6">
      <div className="space-y-6">
        <div className="bg-obsidian border border-steel rounded-lg p-6">
          <h2 className="font-display text-lg font-bold text-ivory mb-4">{stage.title}</h2>
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
          />
        </div>
      )}
    </div>
  );
}

// ─── Theory Teach Stage ─────────────────────────────────────

function TheoryTeachView({ stage, onComplete }: {
  stage: TheoryTeachStage;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-obsidian border border-steel rounded-lg p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-ivory">{stage.title}</h2>
        <div className="text-[15px] text-silver leading-relaxed whitespace-pre-wrap">{stage.content}</div>
        {stage.notation && (
          <div className="bg-night rounded-lg p-4 font-mono text-sm text-ivory">{stage.notation}</div>
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
      <Button fullWidth onClick={onComplete}>Continue &rarr;</Button>
    </div>
  );
}

// ─── Aural Quiz Stage ───────────────────────────────────────

function AuralQuizView({ stage, stageIndex, droneKey, onComplete }: {
  stage: AuralQuizStage;
  stageIndex: number;
  droneKey: string | null;
  onComplete: (result: StageQuizResult) => void;
}) {
  const drone = useDrone();
  const playback = usePlayback();
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [startTime] = useState(Date.now());
  const hasPlayed = useRef(false);

  const key = (droneKey ?? "C") as NoteName;

  const playSequence = useCallback(async () => {
    await drone.start({ key });
    await drone.playCadence({ key });
    // Play the target degree (encoded in correct_answer option's degree)
    const correctOpt = stage.options.find((o) => o.id === stage.correct_answer);
    if (correctOpt?.degree) {
      await playback.playDegree({ degree: correctOpt.degree as DiatonicDegree, key, duration: 1 });
    }
  }, [drone, playback, key, stage]);

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;
    const timer = setTimeout(() => void playSequence(), 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (optionId: string) => {
    if (revealed) return;
    setSelected(optionId);
  };

  const handleCheck = async () => {
    if (!selected) return;
    const isCorrect = selected === stage.correct_answer;
    setRevealed(true);

    // Play resolution if enabled
    if (stage.show_resolution) {
      const correctOpt = stage.options.find((o) => o.id === stage.correct_answer);
      if (correctOpt?.degree) {
        await playback.playResolution({
          fromDegree: correctOpt.degree as DiatonicDegree,
          key,
        });
      }
    }

    const result: StageQuizResult = {
      stage_index: stageIndex,
      stage_type: "aural_quiz",
      correct: isCorrect,
      response_time_ms: Date.now() - startTime,
      seeds_card: stage.seeds_card ?? null,
      card_category: "perceptual",
    };

    setTimeout(() => onComplete(result), 1200);
  };

  const getCardState = (optionId: string) => {
    if (!revealed) return selected === optionId ? "selected" : "default";
    if (optionId === stage.correct_answer) return "correct";
    if (optionId === selected) return "incorrect";
    return "disabled";
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-bold text-ivory">{stage.prompt}</h2>

      <button
        onClick={() => void playSequence()}
        className="text-sm text-coral hover:text-coral/80 transition-colors font-mono"
      >
        &#9654; Replay
      </button>

      <div className="grid grid-cols-2 gap-3">
        {stage.options.map((opt) => (
          <AnswerCard
            key={opt.id}
            label={opt.label}
            sublabel={opt.sublabel}
            state={getCardState(opt.id)}
            degreeColor={opt.degree as 1 | 2 | 3 | 4 | 5 | 6 | 7 | undefined}
            onClick={() => handleSelect(opt.id)}
            disabled={revealed}
          />
        ))}
      </div>

      {!revealed && (
        <Button fullWidth disabled={!selected} onClick={() => void handleCheck()}>
          Check
        </Button>
      )}
    </div>
  );
}

// ─── Theory Quiz Stage ──────────────────────────────────────

function TheoryQuizView({ stage, stageIndex, onComplete }: {
  stage: TheoryQuizStage;
  stageIndex: number;
  onComplete: (result: StageQuizResult) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [startTime] = useState(Date.now());

  const handleSelect = (optionId: string) => {
    if (revealed) return;
    setSelected(optionId);
  };

  const handleCheck = () => {
    if (!selected) return;
    const isCorrect = selected === stage.correct_answer;
    setRevealed(true);

    const result: StageQuizResult = {
      stage_index: stageIndex,
      stage_type: "theory_quiz",
      correct: isCorrect,
      response_time_ms: Date.now() - startTime,
      seeds_card: stage.seeds_card ?? null,
      card_category: "declarative",
    };

    setTimeout(() => onComplete(result), 1200);
  };

  const getCardState = (optionId: string) => {
    if (!revealed) return selected === optionId ? "selected" : "default";
    if (optionId === stage.correct_answer) return "correct";
    if (optionId === selected) return "incorrect";
    return "disabled";
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-bold text-ivory">{stage.prompt}</h2>

      <div className="grid grid-cols-2 gap-3">
        {stage.options.map((opt) => (
          <AnswerCard
            key={opt.id}
            label={opt.label}
            sublabel={opt.sublabel}
            state={getCardState(opt.id)}
            degreeColor={opt.degree as 1 | 2 | 3 | 4 | 5 | 6 | 7 | undefined}
            onClick={() => handleSelect(opt.id)}
            disabled={revealed}
          />
        ))}
      </div>

      {!revealed && (
        <Button fullWidth disabled={!selected} onClick={handleCheck}>
          Check
        </Button>
      )}
    </div>
  );
}

// ─── Rhythm Stage ───────────────────────────────────────────

function RhythmView({ stage, stageIndex, onComplete }: {
  stage: RhythmStage;
  stageIndex: number;
  onComplete: (result: StageQuizResult | null) => void;
}) {
  const [done, setDone] = useState(false);
  const meterStr = `${stage.time_signature[0]}/${stage.time_signature[1]}` as "4/4" | "3/4" | "6/8" | "5/8" | "7/8";

  const handleRhythmComplete = useCallback((accuracy: number) => {
    setDone(true);
    if (stage.mode === "listen") {
      // Listen mode: no scoring, just advance
      return;
    }
    // Tap mode: score based on accuracy
    onComplete({
      stage_index: stageIndex,
      stage_type: "rhythm",
      correct: accuracy >= 0.6,
      response_time_ms: 0,
      seeds_card: stage.seeds_card ?? null,
      card_category: "rhythm",
    });
  }, [stage, stageIndex, onComplete]);

  return (
    <div className="space-y-6">
      <div className="bg-obsidian border border-steel rounded-lg p-6">
        <h2 className="font-display text-lg font-bold text-ivory mb-4">Rhythm</h2>
        <RhythmTapper
          meter={meterStr}
          bpm={stage.tempo}
          targetPattern={stage.pattern}
          mode={stage.mode === "quiz" ? "identify" : stage.mode}
          onComplete={handleRhythmComplete}
        />
      </div>
      {(done || stage.mode === "listen") && (
        <Button fullWidth onClick={() => onComplete(null)}>
          Continue &rarr;
        </Button>
      )}
    </div>
  );
}

// ─── Main Stage Renderer ────────────────────────────────────

export function StageRenderer({ lesson, onComplete }: StageRendererProps) {
  const [stageIdx, setStageIdx] = useState(0);
  const [quizResults, setQuizResults] = useState<StageQuizResult[]>([]);

  const stages = lesson.stages;
  const currentStage = stages[stageIdx];
  const progress = stages.length > 0 ? ((stageIdx + 1) / stages.length) * 100 : 0;

  const advanceStage = useCallback((result: StageQuizResult | null) => {
    if (result) {
      setQuizResults((prev) => [...prev, result]);
    }
    if (stageIdx < stages.length - 1) {
      setStageIdx((i) => i + 1);
    } else {
      // Final stage — pass all results up
      onComplete(result ? [...quizResults, result] : quizResults);
    }
  }, [stageIdx, stages.length, quizResults, onComplete]);

  if (!currentStage) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Lesson Header */}
      <div className="space-y-3">
        <div className="font-mono text-[11px] tracking-widest uppercase" style={{ color: brand.coral }}>
          {lesson.module_title} &mdash; Lesson {lesson.lesson_num} of {lesson.total_lessons}
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ivory">
          {lesson.lesson_title}
        </h1>

        {/* Progress bar */}
        <div className="w-full h-[3px] bg-steel rounded-sm overflow-hidden">
          <div
            className="h-full rounded-sm transition-all duration-400"
            style={{ width: `${progress}%`, backgroundColor: brand.coral }}
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
          stage={currentStage}
          droneKey={lesson.drone_key}
          onComplete={() => advanceStage(null)}
        />
      )}
      {currentStage.type === "theory_teach" && (
        <TheoryTeachView
          stage={currentStage}
          onComplete={() => advanceStage(null)}
        />
      )}
      {currentStage.type === "aural_quiz" && (
        <AuralQuizView
          stage={currentStage}
          stageIndex={stageIdx}
          droneKey={lesson.drone_key}
          onComplete={(r) => advanceStage(r)}
        />
      )}
      {currentStage.type === "theory_quiz" && (
        <TheoryQuizView
          stage={currentStage}
          stageIndex={stageIdx}
          onComplete={(r) => advanceStage(r)}
        />
      )}
      {currentStage.type === "rhythm" && (
        <RhythmView
          stage={currentStage}
          stageIndex={stageIdx}
          onComplete={(r) => advanceStage(r)}
        />
      )}
    </div>
  );
}
