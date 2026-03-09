"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { brand, degreeColors } from "@/lib/tokens";
import * as Tone from "tone";

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const SOLFEGE = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti"];
const SWIPE_THRESHOLD = 20;

interface ScaleSculptorProps {
  root: string;
  startMode: string;
  targetMode: string;
  prompt: string;
  hintDegrees?: number[];
  onAnswer: (correct: boolean) => void;
}

type Alteration = -1 | 0 | 1; // flat, natural, sharp

interface PillState {
  degree: number;
  baseSemitone: number;
  alteration: Alteration;
  touching: boolean;
  displacement: number;
}

const MODE_INTERVALS: Record<string, number[]> = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11],
};

function noteToMidi(note: string): number {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return 60;
  const idx = NOTE_NAMES.indexOf(match[1]!);
  const octave = parseInt(match[2]!, 10);
  return (octave + 1) * 12 + idx;
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function midiToNoteName(midi: number): string {
  const idx = ((midi % 12) + 12) % 12;
  return NOTE_NAMES[idx]!;
}

function getStartIntervals(mode: string): number[] {
  return MODE_INTERVALS[mode] ?? MODE_INTERVALS.ionian!;
}

function getTargetIntervals(mode: string): number[] {
  return MODE_INTERVALS[mode] ?? MODE_INTERVALS.ionian!;
}

export function ScaleSculptor({
  root,
  startMode,
  targetMode,
  prompt,
  hintDegrees,
  onAnswer,
}: ScaleSculptorProps) {
  const rootMidi = noteToMidi(root);
  const startIntervals = getStartIntervals(startMode);
  const targetIntervals = getTargetIntervals(targetMode);

  const [pills, setPills] = useState<PillState[]>(() =>
    startIntervals.map((semitone, i) => ({
      degree: i + 1,
      baseSemitone: semitone,
      alteration: 0 as Alteration,
      touching: false,
      displacement: 0,
    })),
  );
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const synthRef = useRef<Tone.Synth | null>(null);
  const touchStartY = useRef<Map<number, { index: number; y: number }>>(
    new Map(),
  );

  const getSynth = useCallback(() => {
    if (!synthRef.current) {
      synthRef.current = new Tone.Synth({
        oscillator: { type: "fmsine" },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.5 },
      }).toDestination();
    }
    return synthRef.current;
  }, []);

  useEffect(() => {
    return () => {
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  const currentMidi = useCallback(
    (pill: PillState) => rootMidi + pill.baseSemitone + pill.alteration,
    [rootMidi],
  );

  const playNote = useCallback(
    async (midi: number, duration = "8n") => {
      await Tone.start();
      const synth = getSynth();
      synth.triggerAttackRelease(midiToFreq(midi), duration);
    },
    [getSynth],
  );

  const handlePillTouchStart = useCallback(
    (index: number, clientY: number, identifier: number) => {
      touchStartY.current.set(identifier, { index, y: clientY });
      setPills((prev) =>
        prev.map((p, i) => (i === index ? { ...p, touching: true } : p)),
      );
      const pill = pills[index]!;
      playNote(currentMidi(pill));
    },
    [pills, currentMidi, playNote],
  );

  const handlePillTouchMove = useCallback(
    (clientY: number, identifier: number) => {
      const start = touchStartY.current.get(identifier);
      if (!start) return;
      const { index, y: startY } = start;
      const dy = startY - clientY; // positive = up = sharpen
      const clampedDy = Math.max(-40, Math.min(40, dy));

      setPills((prev) =>
        prev.map((p, i) => {
          if (i !== index) return p;
          let newAlt = p.alteration;
          if (dy > SWIPE_THRESHOLD && p.alteration < 1) {
            newAlt = (p.alteration + 1) as Alteration;
          } else if (dy < -SWIPE_THRESHOLD && p.alteration > -1) {
            newAlt = (p.alteration - 1) as Alteration;
          }
          if (newAlt !== p.alteration) {
            touchStartY.current.set(identifier, { index, y: clientY });
            const newMidi = rootMidi + p.baseSemitone + newAlt;
            playNote(newMidi);
            if (navigator.vibrate) navigator.vibrate(15);
          }
          return {
            ...p,
            displacement: clampedDy,
            alteration: newAlt !== p.alteration ? newAlt : p.alteration,
          };
        }),
      );
    },
    [rootMidi, playNote],
  );

  const handlePillTouchEnd = useCallback((identifier: number) => {
    const start = touchStartY.current.get(identifier);
    if (!start) return;
    touchStartY.current.delete(identifier);
    setPills((prev) =>
      prev.map((p, i) =>
        i === start.index ? { ...p, touching: false, displacement: 0 } : p,
      ),
    );
  }, []);

  const handleCheck = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);

    const currentIntervals = pills.map((p) => p.baseSemitone + p.alteration);
    const isCorrect = targetIntervals.every(
      (t, i) => currentIntervals[i] === t,
    );
    setResult(isCorrect ? "correct" : "incorrect");

    await Tone.start();
    const synth = getSynth();
    for (let i = 0; i < pills.length; i++) {
      setPlayingIndex(i);
      const midi = rootMidi + currentIntervals[i]!;
      synth.triggerAttackRelease(midiToFreq(midi), "8n");
      await new Promise((r) => setTimeout(r, 200));
    }
    setPlayingIndex(null);

    if (!isCorrect) {
      await new Promise((r) => setTimeout(r, 400));
      for (let i = 0; i < targetIntervals.length; i++) {
        setPlayingIndex(i);
        const midi = rootMidi + targetIntervals[i]!;
        synth.triggerAttackRelease(midiToFreq(midi), "8n");
        await new Promise((r) => setTimeout(r, 200));
      }
      setPlayingIndex(null);
    }

    setTimeout(() => onAnswer(isCorrect), isCorrect ? 800 : 2000);
  }, [submitted, pills, targetIntervals, rootMidi, getSynth, onAnswer]);

  return (
    <div className="flex flex-col gap-5">
      {/* Prompt */}
      <p
        className="text-center text-sm font-medium"
        style={{ color: brand.silver }}
      >
        {prompt}
      </p>

      {/* Staff lines background + pills */}
      <div className="relative mx-auto w-full max-w-[360px]">
        {/* Faint staff lines */}
        <div className="absolute inset-0 flex flex-col justify-center gap-[6px] px-2 opacity-20">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-px w-full"
              style={{ backgroundColor: brand.steel }}
            />
          ))}
        </div>

        {/* Pills row */}
        <div
          className="relative flex items-center justify-center gap-2 py-8"
          onTouchMove={(e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
              const t = e.changedTouches[i]!;
              handlePillTouchMove(t.clientY, t.identifier);
            }
          }}
          onTouchEnd={(e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
              handlePillTouchEnd(e.changedTouches[i]!.identifier);
            }
          }}
        >
          {pills.map((pill, index) => {
            const degreeColor =
              degreeColors[pill.degree as keyof typeof degreeColors] ??
              brand.silver;
            const midi = currentMidi(pill);
            const noteName = midiToNoteName(midi);
            const altSymbol =
              pill.alteration === 1 ? "#" : pill.alteration === -1 ? "b" : "";

            const isPlaying = playingIndex === index;
            const isHinted = hintDegrees?.includes(pill.degree) && !submitted;

            let pillBg = brand.graphite;
            let borderColor = degreeColor + "60";
            let glowRadius = 4;
            let glowOpacity = 0.3;

            if (pill.touching) {
              glowRadius = 12;
              glowOpacity = 0.6;
            }
            if (isPlaying) {
              glowRadius = 16;
              glowOpacity = 0.8;
              borderColor = degreeColor;
            }
            if (result === "correct") {
              glowRadius = 12;
              glowOpacity = 0.7;
            }
            if (result === "incorrect" && submitted) {
              const currentInterval = pill.baseSemitone + pill.alteration;
              const targetInterval = targetIntervals[index]!;
              if (currentInterval !== targetInterval) {
                borderColor = brand.incorrect;
                pillBg = brand.incorrect + "15";
              }
            }
            if (isHinted) {
              glowRadius = 10;
              glowOpacity = 0.5;
            }

            const tintColor =
              pill.alteration === 1
                ? "#fbbf24" // warm amber for sharps
                : pill.alteration === -1
                  ? "#60a5fa" // cool blue for flats
                  : degreeColor;

            return (
              <div
                key={pill.degree}
                className="flex flex-col items-center gap-1 select-none"
                style={{
                  transform: `translateY(${-pill.displacement * 0.25}px)`,
                  transition: pill.touching
                    ? "none"
                    : "transform 0.15s ease-out",
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const t = e.touches[0]!;
                  handlePillTouchStart(index, t.clientY, t.identifier);
                }}
                onMouseDown={(e) => {
                  handlePillTouchStart(index, e.clientY, -1);
                  const onMove = (ev: MouseEvent) =>
                    handlePillTouchMove(ev.clientY, -1);
                  const onUp = () => {
                    handlePillTouchEnd(-1);
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                  };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
              >
                {/* Pill */}
                <div
                  className="flex h-14 w-10 flex-col items-center justify-center rounded-xl text-xs font-bold"
                  style={{
                    backgroundColor: pillBg,
                    border: `1.5px solid ${borderColor}`,
                    color: tintColor,
                    cursor: submitted ? "default" : "grab",
                    boxShadow: `0 0 ${glowRadius}px rgba(${hexToRgb(tintColor)}, ${glowOpacity})`,
                    transition: pill.touching
                      ? "box-shadow 0.05s"
                      : "all 0.2s ease-out",
                    userSelect: "none",
                    touchAction: "none",
                  }}
                >
                  <span className="text-[10px] opacity-70">
                    {SOLFEGE[index]}
                  </span>
                  <span className="text-sm font-bold">
                    {noteName}
                    {altSymbol}
                  </span>
                  <span className="text-[9px] opacity-50">{pill.degree}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Result label */}
      {result && (
        <p
          className="text-center text-sm font-semibold"
          style={{
            color: result === "correct" ? brand.correct : brand.incorrect,
          }}
        >
          {result === "correct"
            ? `${targetMode.charAt(0).toUpperCase() + targetMode.slice(1)} — correct.`
            : `Not quite. The correct scale played for comparison.`}
        </p>
      )}

      {/* Check button */}
      {!submitted && (
        <button
          onClick={handleCheck}
          className="mx-auto w-full max-w-[360px] rounded-xl py-3 text-sm font-semibold transition-colors"
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

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "").slice(0, 6);
  if (clean.length !== 6) return "183, 148, 246";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
