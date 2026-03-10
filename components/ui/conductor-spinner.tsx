"use client";

import { useRef, useEffect } from "react";

type TimeSignature = "2/4" | "3/4" | "4/4" | "6/8";

interface ConductorSpinnerProps {
  pattern?: TimeSignature;
  bpm?: number;
  size?: number;
  className?: string;
}

interface Anchor {
  x: number;
  y: number;
  hIn: { x: number; y: number };
  hOut: { x: number; y: number };
}

interface SpeedKeyframe {
  t: number;
  speed: number;
}

interface PatternData {
  numBeats: number;
  anchors: Anchor[];
  beatIndices: number[];
  speedKeyframes: SpeedKeyframe[];
}

// 2/4 pattern data (locked — from REF doc)
const PATTERN_2_4: PatternData = {
  numBeats: 2,
  anchors: [
    {
      x: 0.1621,
      y: 0.0768,
      hIn: { x: 0, y: 0 },
      hOut: { x: 0, y: 0 },
    },
    {
      x: 0.5014,
      y: 0.925,
      hIn: { x: -0.3679, y: 0 },
      hOut: { x: 0.275, y: 0.0018 },
    },
    {
      x: 0.7623,
      y: 0.5254,
      hIn: { x: 0.0022, y: -0.0276 },
      hOut: { x: -0.0139, y: 0.1756 },
    },
    {
      x: 0.535,
      y: 0.7476,
      hIn: { x: 0.1062, y: 0.0257 },
      hOut: { x: -0.2925, y: -0.0707 },
    },
  ],
  beatIndices: [1, 3],
  speedKeyframes: [
    { t: 0.0004, speed: 0.75 },
    { t: 0.2461, speed: 4.55 },
    { t: 0.5113, speed: 0.75 },
    { t: 0.6787, speed: 4.15 },
  ],
};

// All patterns fall back to 2/4 until path data is drawn in editor
const PATTERNS: Record<TimeSignature, PatternData> = {
  "2/4": PATTERN_2_4,
  "3/4": PATTERN_2_4,
  "4/4": PATTERN_2_4,
  "6/8": PATTERN_2_4,
};

const NUM_SAMPLES = 500;

// --- Bezier math ---

function cubicBezier(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
): number {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

function samplePath(anchors: Anchor[]): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const n = anchors.length;
  const samplesPerSeg = Math.ceil(NUM_SAMPLES / n);

  for (let i = 0; i < n; i++) {
    const a0 = anchors[i]!;
    const a1 = anchors[(i + 1) % n]!;
    const p0x = a0.x,
      p0y = a0.y;
    const p1x = a0.x + a0.hOut.x,
      p1y = a0.y + a0.hOut.y;
    const p2x = a1.x + a1.hIn.x,
      p2y = a1.y + a1.hIn.y;
    const p3x = a1.x,
      p3y = a1.y;

    for (let j = 0; j < samplesPerSeg; j++) {
      const t = j / samplesPerSeg;
      points.push({
        x: cubicBezier(p0x, p1x, p2x, p3x, t),
        y: cubicBezier(p0y, p1y, p2y, p3y, t),
      });
    }
  }

  return points;
}

function buildArcLengths(points: { x: number; y: number }[]): number[] {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i]!.x - points[i - 1]!.x;
    const dy = points[i]!.y - points[i - 1]!.y;
    lengths.push(lengths[i - 1]! + Math.sqrt(dx * dx + dy * dy));
  }
  return lengths;
}

// --- Speed remapping ---

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function interpolateSpeed(keyframes: SpeedKeyframe[], t: number): number {
  if (keyframes.length === 0) return 1;
  if (t <= keyframes[0]!.t) return keyframes[0]!.speed;
  if (t >= keyframes[keyframes.length - 1]!.t)
    return keyframes[keyframes.length - 1]!.speed;

  for (let i = 0; i < keyframes.length - 1; i++) {
    const kf = keyframes[i]!;
    const kfNext = keyframes[i + 1]!;
    if (t >= kf.t && t <= kfNext.t) {
      const local = (t - kf.t) / (kfNext.t - kf.t);
      return kf.speed + smoothstep(local) * (kfNext.speed - kf.speed);
    }
  }
  return 1;
}

function buildSpeedRemap(keyframes: SpeedKeyframe[]): number[] {
  // Extend to cover [0, 1] by wrapping
  const extended = [...keyframes];
  if (extended.length > 0 && extended[extended.length - 1]!.t < 1) {
    extended.push({ t: 1, speed: extended[0]!.speed });
  }
  if (extended.length > 0 && extended[0]!.t > 0) {
    extended.unshift({ t: 0, speed: extended[extended.length - 1]!.speed });
  }

  const dt = 1 / NUM_SAMPLES;
  const cumulative = [0];

  for (let i = 1; i <= NUM_SAMPLES; i++) {
    const speed = interpolateSpeed(extended, i * dt);
    cumulative.push(cumulative[i - 1]! + speed * dt);
  }

  const total = cumulative[NUM_SAMPLES]!;
  return cumulative.map((v) => v / total);
}

// --- Position lookup ---

function getPosition(
  t: number,
  speedRemap: number[],
  points: { x: number; y: number }[],
  arcLengths: number[],
): { x: number; y: number } {
  // Uniform time -> speed-remapped arc fraction
  const idx = Math.min(
    Math.floor(t * (speedRemap.length - 1)),
    speedRemap.length - 2,
  );
  const frac = t * (speedRemap.length - 1) - idx;
  const arcFrac =
    speedRemap[idx]! + frac * (speedRemap[idx + 1]! - speedRemap[idx]!);

  // Arc fraction -> point on path
  const totalLen = arcLengths[arcLengths.length - 1]!;
  const target = arcFrac * totalLen;

  let lo = 0;
  let hi = arcLengths.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (arcLengths[mid]! < target) lo = mid;
    else hi = mid;
  }

  const segLen = arcLengths[hi]! - arcLengths[lo]! || 1;
  const segFrac = (target - arcLengths[lo]!) / segLen;
  const pLo = points[lo]!;
  const pHi = points[hi % points.length]!;
  return {
    x: pLo.x + segFrac * (pHi.x - pLo.x),
    y: pLo.y + segFrac * (pHi.y - pLo.y),
  };
}

// --- Pre-compute all pattern data ---

function precomputePattern(data: PatternData) {
  const points = samplePath(data.anchors);
  const arcLengths = buildArcLengths(points);
  const speedRemap = buildSpeedRemap(data.speedKeyframes);
  return { points, arcLengths, speedRemap };
}

const computedCache = new Map<
  PatternData,
  ReturnType<typeof precomputePattern>
>();

function getComputed(data: PatternData) {
  let cached = computedCache.get(data);
  if (!cached) {
    cached = precomputePattern(data);
    computedCache.set(data, cached);
  }
  return cached;
}

// --- Component ---

// violet: rgb(183, 148, 246)
const DOT_R = 183,
  DOT_G = 148,
  DOT_B = 246;

export function ConductorSpinner({
  pattern = "4/4",
  bpm = 100,
  size = 48,
  className,
}: ConductorSpinnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  const patternData = PATTERNS[pattern] ?? PATTERNS["2/4"];
  const computed = getComputed(patternData);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cycleDuration = (60 / bpm) * patternData.numBeats * 1000;

    const draw = (timestamp: number) => {
      const w = size * dpr;
      const h = size * dpr;
      const cycleT = (timestamp % cycleDuration) / cycleDuration;

      const pos = getPosition(
        cycleT,
        computed.speedRemap,
        computed.points,
        computed.arcLengths,
      );

      // Check beat proximity for flash
      let beatProx = 0;
      let isStrong = false;
      for (let i = 0; i < patternData.beatIndices.length; i++) {
        const ba = patternData.anchors[patternData.beatIndices[i]!]!;
        const dx = pos.x - ba.x;
        const dy = pos.y - ba.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.08) {
          const prox = 1 - dist / 0.08;
          if (prox > beatProx) {
            beatProx = prox;
            isStrong = i === 0;
          }
        }
      }

      ctx.clearRect(0, 0, w, h);

      const px = pos.x * w;
      const py = pos.y * h;
      const baseR = w * 0.06;
      const flashScale = isStrong ? 1.8 : 1.4;
      const radius = baseR * (1 + beatProx * (flashScale - 1));

      // Glow
      const glowR = radius * 3;
      const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
      const glowA = 0.15 + beatProx * 0.3;
      glow.addColorStop(0, `rgba(${DOT_R}, ${DOT_G}, ${DOT_B}, ${glowA})`);
      glow.addColorStop(1, `rgba(${DOT_R}, ${DOT_G}, ${DOT_B}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Dot — shifts toward white on beat
      const r = Math.round(DOT_R + beatProx * (255 - DOT_R));
      const g = Math.round(DOT_G + beatProx * (255 - DOT_G));
      const b = Math.round(DOT_B + beatProx * (255 - DOT_B));
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size, bpm, patternData, computed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
