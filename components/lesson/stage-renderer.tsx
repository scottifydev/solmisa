"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type {
  StageRendererProps,
  LessonStage,
  AuralTeachStage,
  TheoryTeachStage,
  AuralQuizStage,
  TheoryQuizStage,
  RhythmStage,
  InteractiveStage,
  GuidedPracticeStage,
  StageQuizResult,
  LessonStageType,
  DrillConfig,
  QuizOption,
} from "@/types/lesson";
import { isOptionsQuiz } from "@/types/lesson";
import type { NoteName, DiatonicDegree } from "@/types/audio";
import { Button } from "@/components/ui/button";
import { AnswerCard } from "@/components/ui/answer-card";
import { DegreeCircle } from "@/components/lesson/degree-circle";
import { useDrone } from "@/hooks/use-drone";
import { usePlayback } from "@/hooks/use-playback";
import { brand } from "@/lib/tokens";
import { RhythmTapper } from "@/components/lesson/rhythm-tapper";
import { useMetronome } from "@/hooks/use-metronome";
import { InteractiveStageView } from "@/components/lesson/stages/interactive-stage";
import { GuidedPracticeStageView } from "@/components/lesson/stages/guided-practice-stage";

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
      <span className="text-[10px] px-2 py-[3px] rounded-sm font-mono tracking-wide uppercase text-shadow">
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
  };

  const labels: Record<LessonStageType, string> = {
    aural_teach: "listen",
    aural_quiz: "quiz",
    theory_teach: "theory",
    theory_quiz: "quiz",
    rhythm: "rhythm",
    interactive: "interact",
    guided_practice: "practice",
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
}: {
  stage: AuralTeachStage;
  droneKey: string | null;
  drone: ReturnType<typeof useDrone>;
  playback: ReturnType<typeof usePlayback>;
  onComplete: () => void;
}) {
  const [contentVisible, setContentVisible] = useState(false);
  const [activeDegree, setActiveDegree] = useState<number | undefined>();
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

// ─── Drill Helpers ──────────────────────────────────────────

const SOLFEGE: Record<number | string, { label: string; sublabel: string }> = {
  1: { label: "Do", sublabel: "degree 1" },
  2: { label: "Re", sublabel: "degree 2" },
  3: { label: "Mi", sublabel: "degree 3" },
  4: { label: "Fa", sublabel: "degree 4" },
  5: { label: "Sol", sublabel: "degree 5" },
  6: { label: "La", sublabel: "degree 6" },
  7: { label: "Ti", sublabel: "degree 7" },
  b3: { label: "Me", sublabel: "flat 3" },
  b6: { label: "Le", sublabel: "flat 6" },
  b7: { label: "Te", sublabel: "flat 7" },
};

const INTERVALS: Record<string, { label: string; sublabel: string }> = {
  P1: { label: "Unison", sublabel: "P1" },
  m2: { label: "Minor 2nd", sublabel: "m2" },
  M2: { label: "Major 2nd", sublabel: "M2" },
  m3: { label: "Minor 3rd", sublabel: "m3" },
  M3: { label: "Major 3rd", sublabel: "M3" },
  P4: { label: "Perfect 4th", sublabel: "P4" },
  TT: { label: "Tritone", sublabel: "TT" },
  P5: { label: "Perfect 5th", sublabel: "P5" },
  m6: { label: "Minor 6th", sublabel: "m6" },
  M6: { label: "Major 6th", sublabel: "M6" },
  m7: { label: "Minor 7th", sublabel: "m7" },
  M7: { label: "Major 7th", sublabel: "M7" },
  P8: { label: "Octave", sublabel: "P8" },
};

const ALL_13_INTERVALS = [
  "m2",
  "M2",
  "m3",
  "M3",
  "P4",
  "TT",
  "P5",
  "m6",
  "M6",
  "m7",
  "M7",
  "P8",
  "P1",
];

const CHORD_QUALITIES: QuizOption[] = [
  { id: "major", label: "Major", sublabel: "1–3–5" },
  { id: "minor", label: "Minor", sublabel: "1–b3–5" },
  { id: "diminished", label: "Diminished", sublabel: "1–b3–b5" },
  { id: "augmented", label: "Augmented", sublabel: "1–3–#5" },
];

const METER_PRESETS: Record<string, QuizOption> = {
  "2/4": { id: "2/4", label: "2/4", sublabel: "simple duple" },
  "3/4": { id: "3/4", label: "3/4", sublabel: "simple triple" },
  "4/4": { id: "4/4", label: "4/4", sublabel: "simple quadruple" },
  "5/4": { id: "5/4", label: "5/4", sublabel: "asymmetric" },
  "6/8": { id: "6/8", label: "6/8", sublabel: "compound duple" },
  "7/8": { id: "7/8", label: "7/8", sublabel: "asymmetric" },
  "5/8": { id: "5/8", label: "5/8", sublabel: "asymmetric" },
};

const MINOR_FORMS: QuizOption[] = [
  { id: "natural", label: "Natural Minor", sublabel: "aeolian" },
  { id: "harmonic", label: "Harmonic Minor", sublabel: "raised 7th" },
  { id: "melodic_asc", label: "Melodic Minor", sublabel: "raised 6th & 7th" },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateOptionsForDrill(drill: DrillConfig): {
  options: QuizOption[];
  correctAnswer: string;
} {
  switch (drill.type) {
    case "degree_id":
    case "select_degree":
    case "minor_degree_id":
    case "degree_sequence": {
      const degrees = Array.isArray(drill.degrees) ? drill.degrees : [1, 3, 5];
      const target = pickRandom(degrees);
      const options: QuizOption[] = degrees.map((d) => ({
        id: String(d),
        label: SOLFEGE[d]?.label ?? `Degree ${d}`,
        sublabel: SOLFEGE[d]?.sublabel ?? `degree ${d}`,
        degree: typeof d === "number" ? d : undefined,
      }));
      return { options, correctAnswer: String(target) };
    }

    case "interval_id": {
      const intervals =
        drill.intervals === "all_13"
          ? ALL_13_INTERVALS
          : Array.isArray(drill.intervals)
            ? drill.intervals
            : ["P5", "P8"];
      const target = pickRandom(intervals);
      const options: QuizOption[] = intervals.map((iv) => ({
        id: iv,
        label: INTERVALS[iv]?.label ?? iv,
        sublabel: INTERVALS[iv]?.sublabel ?? iv,
      }));
      return { options, correctAnswer: target };
    }

    case "degree_discrimination": {
      const pair = drill.pair ?? [3, 4];
      const target = pickRandom(pair);
      const options: QuizOption[] = pair.map((p) => ({
        id: String(p),
        label: typeof p === "string" ? p : (SOLFEGE[p]?.label ?? `Degree ${p}`),
        sublabel:
          typeof p === "string" ? "" : (SOLFEGE[p]?.sublabel ?? `degree ${p}`),
        degree: typeof p === "number" ? p : undefined,
      }));
      return { options, correctAnswer: String(target) };
    }

    case "select_chord": {
      const target = pickRandom(CHORD_QUALITIES);
      return { options: CHORD_QUALITIES, correctAnswer: target.id };
    }

    case "meter_id": {
      const meters = drill.meters ?? ["3/4", "6/8"];
      const target = pickRandom(meters);
      const options: QuizOption[] = meters.map(
        (m) => METER_PRESETS[m] ?? { id: m, label: m, sublabel: "meter" },
      );
      return { options, correctAnswer: target };
    }

    case "mode_form_id":
    case "minor_form_id": {
      const forms = drill.forms ?? ["natural", "harmonic", "melodic_asc"];
      const target = pickRandom(forms);
      const options: QuizOption[] = forms.map((f) => {
        const preset = MINOR_FORMS.find((mf) => mf.id === f);
        return preset ?? { id: f, label: f, sublabel: "" };
      });
      return { options, correctAnswer: target };
    }

    case "select_one":
    case "theory_recall":
    case "integration":
    case "mixed":
    case "rhythm_mixed": {
      if (drill.options && drill.options.length > 0) {
        const target = pickRandom(drill.options);
        return { options: drill.options, correctAnswer: target.id };
      }
      // Fallback: generic Yes/No if no options configured
      const fallbackOpts: QuizOption[] = [
        { id: "a", label: "Option A", sublabel: "" },
        { id: "b", label: "Option B", sublabel: "" },
      ];
      return { options: fallbackOpts, correctAnswer: "a" };
    }

    default: {
      // For any unhandled type with degrees, use degree options
      if (Array.isArray(drill.degrees) && drill.degrees.length > 0) {
        const degrees = drill.degrees;
        const target = pickRandom(degrees);
        const options: QuizOption[] = degrees.map((d) => ({
          id: String(d),
          label: SOLFEGE[d]?.label ?? `Degree ${d}`,
          sublabel: SOLFEGE[d]?.sublabel ?? `degree ${d}`,
          degree: typeof d === "number" ? d : undefined,
        }));
        return { options, correctAnswer: String(target) };
      }
      // Last resort fallback
      const fallback: QuizOption[] = [
        { id: "1", label: "Do", sublabel: "degree 1", degree: 1 },
        { id: "3", label: "Mi", sublabel: "degree 3", degree: 3 },
        { id: "5", label: "Sol", sublabel: "degree 5", degree: 5 },
      ];
      return { options: fallback, correctAnswer: "1" };
    }
  }
}

// ─── Aural Quiz Stage ───────────────────────────────────────

function AuralQuizView({
  stage,
  stageIndex,
  droneKey,
  drone,
  playback,
  onComplete,
}: {
  stage: AuralQuizStage;
  stageIndex: number;
  droneKey: string | null;
  drone: ReturnType<typeof useDrone>;
  playback: ReturnType<typeof usePlayback>;
  onComplete: (result: StageQuizResult) => void;
}) {
  const optionsMode = isOptionsQuiz(stage);

  // For drill mode, generate options and target on mount
  const drillState = useRef(
    !optionsMode && "drill" in stage
      ? generateOptionsForDrill(stage.drill)
      : null,
  );

  const options = useMemo(
    () => (optionsMode ? stage.options : (drillState.current?.options ?? [])),
    [optionsMode, stage],
  );
  const correctAnswer = optionsMode
    ? stage.correct_answer
    : (drillState.current?.correctAnswer ?? "1");
  const showResolution = optionsMode ? stage.show_resolution : true;

  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [startTime] = useState(Date.now());
  const hasPlayed = useRef(false);

  const key = (droneKey ?? "C") as NoteName;
  const hasDegreeOptions = options.some((o) => o.degree !== undefined);

  const playSequence = useCallback(async () => {
    if (hasDegreeOptions) {
      await drone.start({ key });
      await drone.playCadence({ key });
      const targetOpt = options.find((o) => o.id === correctAnswer);
      if (targetOpt?.degree) {
        await playback.playDegree({
          degree: targetOpt.degree as DiatonicDegree,
          key,
          duration: 1,
        });
      }
    }
  }, [drone, playback, key, options, correctAnswer, hasDegreeOptions]);

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
    const isCorrect = selected === correctAnswer;
    setRevealed(true);

    if (showResolution) {
      const correctOpt = options.find((o) => o.id === correctAnswer);
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
    if (optionId === correctAnswer) return "correct";
    if (optionId === selected) return "incorrect";
    return "disabled";
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-bold text-ivory">
        {stage.prompt}
      </h2>

      {hasDegreeOptions && (
        <button
          onClick={() => void playSequence()}
          className="text-sm text-violet hover:text-violet/80 transition-colors font-mono"
        >
          &#9654; Replay
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
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
        <Button
          fullWidth
          disabled={!selected}
          onClick={() => void handleCheck()}
        >
          Check
        </Button>
      )}
    </div>
  );
}

// ─── Theory Quiz Stage ──────────────────────────────────────

function TheoryQuizView({
  stage,
  stageIndex,
  onComplete,
}: {
  stage: TheoryQuizStage;
  stageIndex: number;
  onComplete: (result: StageQuizResult) => void;
}) {
  const optionsMode = isOptionsQuiz(stage);

  const drillState = useRef(
    !optionsMode && "drill" in stage
      ? generateOptionsForDrill(stage.drill)
      : null,
  );

  const options = optionsMode
    ? stage.options
    : (drillState.current?.options ?? []);
  const correctAnswer = optionsMode
    ? stage.correct_answer
    : (drillState.current?.correctAnswer ?? "1");

  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [startTime] = useState(Date.now());

  const handleSelect = (optionId: string) => {
    if (revealed) return;
    setSelected(optionId);
  };

  const handleCheck = () => {
    if (!selected) return;
    const isCorrect = selected === correctAnswer;
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
    if (optionId === correctAnswer) return "correct";
    if (optionId === selected) return "incorrect";
    return "disabled";
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-bold text-ivory">
        {stage.prompt}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
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

function RhythmView({
  stage,
  stageIndex,
  onComplete,
}: {
  stage: RhythmStage;
  stageIndex: number;
  onComplete: (result: StageQuizResult | null) => void;
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

  const handleContinue = () => {
    if (stage.mode === "listen" || lastAccuracy === null) {
      onComplete(null);
      return;
    }
    onComplete({
      stage_index: stageIndex,
      stage_type: "rhythm",
      correct: lastAccuracy >= 0.6,
      response_time_ms: 0,
      seeds_card: stage.seeds_card ?? null,
      card_category: "rhythm",
    });
  };

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
        <Button fullWidth onClick={handleContinue}>
          Continue &rarr;
        </Button>
      )}
    </div>
  );
}

// ─── Main Stage Renderer ────────────────────────────────────

export function StageRenderer({ lesson, onComplete }: StageRendererProps) {
  const drone = useDrone();
  const playback = usePlayback();
  const metronome = useMetronome();
  const [stageIdx, setStageIdx] = useState(0);
  const [quizResults, setQuizResults] = useState<StageQuizResult[]>([]);

  // Check if any stage uses pitch content (degrees or degree-based options)
  const lessonHasPitchContent = useMemo(
    () =>
      lesson.stages.some((s) => {
        if (
          "audio_degrees" in s &&
          Array.isArray(s.audio_degrees) &&
          s.audio_degrees.length > 0
        )
          return true;
        if (
          "options" in s &&
          Array.isArray(s.options) &&
          s.type !== "guided_practice" &&
          s.options.some((o: QuizOption) => o.degree !== undefined)
        )
          return true;
        if (s.type === "guided_practice") return true;
        if ("drill" in s) return true;
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

  const advanceStage = useCallback(
    (result: StageQuizResult | null) => {
      if (result) {
        setQuizResults((prev) => [...prev, result]);
      }
      if (stageIdx < stages.length - 1) {
        setStageIdx((i) => i + 1);
      } else {
        // Final stage — pass all results up
        onComplete(result ? [...quizResults, result] : quizResults);
      }
    },
    [stageIdx, stages.length, quizResults, onComplete],
  );

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
          onComplete={() => advanceStage(null)}
        />
      )}
      {currentStage.type === "theory_teach" && (
        <TheoryTeachView
          key={stageIdx}
          stage={currentStage}
          onComplete={() => advanceStage(null)}
        />
      )}
      {currentStage.type === "aural_quiz" && (
        <AuralQuizView
          key={stageIdx}
          stage={currentStage}
          stageIndex={stageIdx}
          droneKey={lesson.drone_key}
          drone={drone}
          playback={playback}
          onComplete={(r) => advanceStage(r)}
        />
      )}
      {currentStage.type === "theory_quiz" && (
        <TheoryQuizView
          key={stageIdx}
          stage={currentStage}
          stageIndex={stageIdx}
          onComplete={(r) => advanceStage(r)}
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
          onComplete={() => advanceStage(null)}
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
          onComplete={() => advanceStage(null)}
        />
      )}
      {currentStage.type === "rhythm" && (
        <RhythmView
          key={stageIdx}
          stage={currentStage}
          stageIndex={stageIdx}
          onComplete={(r) => advanceStage(r)}
        />
      )}
    </div>
  );
}
