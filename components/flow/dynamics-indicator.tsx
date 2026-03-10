"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import * as Tone from "tone";
import { brand } from "@/lib/tokens";

// ─── Types ──────────────────────────────────────────────────

type DynamicMarking = "pp" | "p" | "mp" | "mf" | "f" | "ff" | "fff";

type TempoMarking =
  | "Largo"
  | "Andante"
  | "Moderato"
  | "Allegro"
  | "Vivace"
  | "Presto";

type ArticulationType = "staccato" | "tenuto" | "fermata" | "accent";

interface LastAnswerResult {
  correct: boolean;
  timeMs: number;
  wasRecovery: boolean;
}

interface DynamicsIndicatorProps {
  streak: number;
  tempo: number;
  lastAnswerResult: LastAnswerResult | null;
  audioEnabled?: boolean;
  children: ReactNode;
}

// ─── Streak to dynamics mapping ─────────────────────────────

function getDynamicMarking(streak: number): DynamicMarking | null {
  if (streak <= 0) return null;
  if (streak <= 2) return "pp";
  if (streak <= 4) return "p";
  if (streak <= 6) return "mp";
  if (streak <= 9) return "mf";
  if (streak <= 14) return "f";
  if (streak <= 19) return "ff";
  return "fff";
}

function getGlowIntensity(streak: number): number {
  if (streak <= 0) return 0;
  if (streak <= 2) return 0.15;
  if (streak <= 4) return 0.3;
  if (streak <= 6) return 0.45;
  if (streak <= 9) return 0.6;
  if (streak <= 14) return 0.75;
  if (streak <= 19) return 0.9;
  return 1;
}

// ─── Tempo mapping ──────────────────────────────────────────

function getTempoMarking(cardsPerMinute: number): TempoMarking {
  if (cardsPerMinute < 2) return "Largo";
  if (cardsPerMinute < 4) return "Andante";
  if (cardsPerMinute < 6) return "Moderato";
  if (cardsPerMinute < 9) return "Allegro";
  if (cardsPerMinute < 12) return "Vivace";
  return "Presto";
}

// ─── Articulation mapping ───────────────────────────────────

function getArticulation(result: LastAnswerResult): ArticulationType {
  if (!result.correct) return "fermata";
  if (result.wasRecovery) return "accent";
  if (result.timeMs < 2000) return "staccato";
  return "tenuto";
}

// ─── Crescendo Hairpin SVG ──────────────────────────────────

function CrescendoHairpin({
  streak,
  isBreak,
}: {
  streak: number;
  isBreak: boolean;
}) {
  const maxWidth = 80;
  const minWidth = 16;
  const progress = Math.min(streak / 20, 1);
  const width = minWidth + (maxWidth - minWidth) * progress;
  const height = 16;
  const opening = 2 + 12 * progress;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        transition: "all 0.4s ease-out",
        opacity: streak > 0 || isBreak ? 1 : 0,
      }}
    >
      {isBreak ? (
        <>
          <line
            x1={0}
            y1={height / 2 - opening / 2}
            x2={width}
            y2={height / 2}
            stroke={brand.incorrect}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <line
            x1={0}
            y1={height / 2 + opening / 2}
            x2={width}
            y2={height / 2}
            stroke={brand.incorrect}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <line
            x1={0}
            y1={height / 2}
            x2={width}
            y2={height / 2 - opening / 2}
            stroke={brand.violet}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <line
            x1={0}
            y1={height / 2}
            x2={width}
            y2={height / 2 + opening / 2}
            stroke={brand.violet}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// ─── Audio engine ───────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DYNAMICS_SYNTH_OPTIONS: Record<string, any> = {
  oscillator: { type: "fmsine" },
  envelope: { attack: 0.02, decay: 0.2, sustain: 0.1, release: 0.5 },
  modulation: { type: "sine" },
  modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3 },
};

class DynamicsAudioEngine {
  private synth: Tone.FMSynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private gain: Tone.Gain | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    await Tone.start();

    this.reverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 });
    this.gain = new Tone.Gain(0.3);
    this.synth = new Tone.FMSynth(DYNAMICS_SYNTH_OPTIONS);

    this.synth.connect(this.gain);
    this.gain.connect(this.reverb);
    this.reverb.toDestination();
    this.initialized = true;
  }

  private playNote(note: string, duration: string, time?: number) {
    if (!this.synth) return;
    this.synth.triggerAttackRelease(note, duration, time);
  }

  async playStreakSound(marking: DynamicMarking) {
    await this.init();
    if (!this.synth || !this.gain) return;

    const now = Tone.now();

    switch (marking) {
      case "pp":
      case "p": {
        this.gain.gain.setValueAtTime(0.15, now);
        this.playNote("C5", "16n", now);
        break;
      }
      case "mp": {
        this.gain.gain.setValueAtTime(0.2, now);
        this.playNote("C5", "16n", now);
        this.playNote("E5", "16n", now + 0.08);
        break;
      }
      case "mf": {
        this.gain.gain.setValueAtTime(0.25, now);
        this.playNote("C5", "16n", now);
        this.playNote("E5", "16n", now + 0.07);
        this.playNote("G5", "16n", now + 0.14);
        break;
      }
      case "f": {
        this.gain.gain.setValueAtTime(0.3, now);
        this.playNote("C5", "32n", now);
        this.playNote("E5", "32n", now + 0.05);
        this.playNote("G5", "32n", now + 0.1);
        this.playNote("C6", "8n", now + 0.15);
        break;
      }
      case "ff": {
        this.gain.gain.setValueAtTime(0.35, now);
        this.playNote("C5", "32n", now);
        this.playNote("E5", "32n", now + 0.04);
        this.playNote("G5", "32n", now + 0.08);
        this.playNote("C6", "32n", now + 0.12);
        this.playNote("E6", "8n", now + 0.16);
        break;
      }
      case "fff": {
        if (this.reverb) this.reverb.wet.setValueAtTime(0.6, now);
        this.gain.gain.setValueAtTime(0.4, now);
        this.playNote("C4", "16n", now);
        this.playNote("E4", "16n", now + 0.03);
        this.playNote("G4", "16n", now + 0.06);
        this.playNote("C5", "16n", now + 0.09);
        this.playNote("E5", "16n", now + 0.12);
        this.playNote("G5", "8n", now + 0.15);
        if (this.reverb) this.reverb.wet.setValueAtTime(0.3, now + 1);
        break;
      }
    }
  }

  async playBreakSound() {
    await this.init();
    if (!this.synth || !this.gain) return;
    const now = Tone.now();
    this.gain.gain.setValueAtTime(0.25, now);
    this.playNote("Eb4", "16n", now);
  }

  dispose() {
    this.synth?.dispose();
    this.reverb?.dispose();
    this.gain?.dispose();
    this.synth = null;
    this.reverb = null;
    this.gain = null;
    this.initialized = false;
  }
}

// ─── Component ──────────────────────────────────────────────

export function DynamicsIndicator({
  streak,
  tempo,
  lastAnswerResult,
  audioEnabled = true,
  children,
}: DynamicsIndicatorProps) {
  const [isBreak, setIsBreak] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [cardScale, setCardScale] = useState(1);
  const prevStreakRef = useRef(streak);
  const audioEngineRef = useRef<DynamicsAudioEngine | null>(null);

  const dynamicMarking = getDynamicMarking(streak);
  const glowIntensity = getGlowIntensity(streak);
  const tempoMarking = getTempoMarking(tempo);

  const articulation = useMemo(
    () => (lastAnswerResult ? getArticulation(lastAnswerResult) : null),
    [lastAnswerResult],
  );

  // Initialize audio engine
  useEffect(() => {
    if (audioEnabled) {
      audioEngineRef.current = new DynamicsAudioEngine();
    }
    return () => {
      audioEngineRef.current?.dispose();
      audioEngineRef.current = null;
    };
  }, [audioEnabled]);

  // Detect streak break
  useEffect(() => {
    const prev = prevStreakRef.current;
    prevStreakRef.current = streak;

    if (prev > 0 && streak === 0) {
      setIsBreak(true);
      setFlashColor(brand.incorrect);

      if (audioEnabled) {
        audioEngineRef.current?.playBreakSound();
      }

      const timer = setTimeout(() => {
        setIsBreak(false);
        setFlashColor(null);
      }, 400);
      return () => clearTimeout(timer);
    }

    if (streak > prev && streak > 0) {
      const marking = getDynamicMarking(streak);
      const prevMarking = getDynamicMarking(prev);

      if (audioEnabled && marking && marking !== prevMarking) {
        audioEngineRef.current?.playStreakSound(marking);
      }
    }
    return undefined;
  }, [streak, audioEnabled]);

  // Handle articulation flash effects
  useEffect(() => {
    if (!lastAnswerResult || !articulation) return;

    let duration: number;
    switch (articulation) {
      case "staccato":
        duration = 150;
        setFlashColor(brand.correct);
        break;
      case "tenuto":
        duration = 500;
        setFlashColor(brand.correct);
        break;
      case "fermata":
        duration = 800;
        setFlashColor(brand.incorrect);
        break;
      case "accent":
        duration = 300;
        setFlashColor(brand.correct);
        setCardScale(1.03);
        break;
    }

    const timer = setTimeout(() => {
      setFlashColor(null);
      setCardScale(1);
    }, duration);
    return () => clearTimeout(timer);
  }, [lastAnswerResult, articulation]);

  // Scale bump on correct at f+ levels
  const handleScaleBump = useCallback(() => {
    if (streak >= 10 && lastAnswerResult?.correct) {
      setCardScale(1.02);
      const timer = setTimeout(() => setCardScale(1), 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [streak, lastAnswerResult]);

  useEffect(() => {
    return handleScaleBump();
  }, [handleScaleBump]);

  // Glow style
  const glowStyle = useMemo(() => {
    if (isBreak) {
      return {
        boxShadow: `0 0 20px 4px ${brand.incorrect}, inset 0 0 10px 1px rgba(248,113,113,0.15)`,
      };
    }

    if (glowIntensity <= 0) return {};

    const blur = 8 + glowIntensity * 24;
    const spread = glowIntensity * 4;
    const insetBlur = 4 + glowIntensity * 12;
    const alpha = (glowIntensity * 0.3).toFixed(2);
    const insetAlpha = (glowIntensity * 0.1).toFixed(2);

    return {
      boxShadow: [
        `0 0 ${blur}px ${spread}px rgba(183,148,246,${alpha})`,
        `inset 0 0 ${insetBlur}px 1px rgba(183,148,246,${insetAlpha})`,
      ].join(", "),
    };
  }, [glowIntensity, isBreak]);

  // Flash overlay style
  const flashStyle = useMemo(() => {
    if (!flashColor) return { opacity: 0 };
    const isIncorrect = flashColor === brand.incorrect;
    return {
      opacity: isIncorrect ? 0.12 : 0.08,
      backgroundColor: flashColor,
    };
  }, [flashColor]);

  // Background glow for fff
  const bgGlowStyle = useMemo(() => {
    if (streak < 7 || isBreak) return { opacity: 0 };
    const intensity = Math.min((streak - 7) / 13, 1);
    return {
      opacity: intensity * 0.06,
      backgroundColor: brand.violet,
    };
  }, [streak, isBreak]);

  // Screen-edge glow for fff
  const screenEdgeGlowStyle = useMemo(() => {
    if (streak < 20 || isBreak) return { opacity: 0, boxShadow: "none" };
    return {
      opacity: 1,
      boxShadow: `inset 0 0 60px 20px rgba(183,148,246,0.08)`,
    };
  }, [streak, isBreak]);

  // Pulse animation for mp+
  const shouldPulse = streak >= 5 && streak <= 6 && !isBreak;

  // Dynamic marking display text
  const displayText = useMemo(() => {
    const parts: string[] = [];
    if (tempoMarking) parts.push(tempoMarking);
    if (dynamicMarking) parts.push(dynamicMarking);
    return parts.join(" ");
  }, [tempoMarking, dynamicMarking]);

  return (
    <div className="relative" style={{ isolation: "isolate" }}>
      {/* Screen-edge glow for fff */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          ...screenEdgeGlowStyle,
          transition: "all 0.6s ease-out",
        }}
      />

      {/* Card wrapper with glow and scale */}
      <div
        className="relative"
        style={{
          ...glowStyle,
          transform: `scale(${cardScale})`,
          transition: "box-shadow 0.4s ease-out, transform 0.2s ease-out",
          borderRadius: "12px",
        }}
      >
        {/* Background glow fill (mf+) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            ...bgGlowStyle,
            transition: "opacity 0.5s ease-out",
          }}
        />

        {/* Flash overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            ...flashStyle,
            transition: "opacity 0.15s ease-out",
          }}
        />

        {/* Pulse ring for mp range */}
        {shouldPulse && (
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              boxShadow: `0 0 12px 2px rgba(183,148,246,0.2)`,
              animation: "dynamics-pulse 2s ease-in-out infinite",
            }}
          />
        )}

        {/* Children (the card) */}
        <div className="relative z-10">{children}</div>
      </div>

      {/* Dynamics marking — fixed viewport overlay, bottom-right */}
      {(streak > 0 || isBreak) && displayText && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            bottom: 80,
            right: 16,
            transition: "opacity 0.3s ease-out",
          }}
        >
          <div className="flex items-center gap-1.5">
            <CrescendoHairpin streak={streak} isBreak={isBreak} />
            <span
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontStyle: "italic",
                fontSize: "13px",
                color: isBreak ? brand.incorrect : brand.silver,
                letterSpacing: "0.3px",
                opacity: 0.7,
                transition: "color 0.3s ease-out",
              }}
            >
              {displayText}
            </span>
          </div>
        </div>
      )}

      {/* Inline keyframe styles */}
      <style jsx>{`
        @keyframes dynamics-pulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
