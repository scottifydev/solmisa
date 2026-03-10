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
  speedKeyframes: SpeedKeyframe[];
}

// 2/4 pattern (LOCKED — REF doc)
const PATTERN_2_4: PatternData = {
  numBeats: 2,
  anchors: [
    {
      x: 0.5181,
      y: 0.9043,
      hIn: { x: -0.1846, y: -0.0356 },
      hOut: { x: 0.1903, y: 0.0367 },
    },
    {
      x: 0.8954,
      y: 0.565,
      hIn: { x: -0.039, y: 0.2285 },
      hOut: { x: -0.073, y: 0.086 },
    },
    {
      x: 0.6883,
      y: 0.6904,
      hIn: { x: 0.0797, y: -0.0106 },
      hOut: { x: -0.2859, y: 0.0381 },
    },
    {
      x: 0.173,
      y: 0.0526,
      hIn: { x: 0.0294, y: 0.1309 },
      hOut: { x: -0.0266, y: 0.5309 },
    },
  ],
  speedKeyframes: [
    { t: 0.0026, speed: 4.35 },
    { t: 0.1722, speed: 0.65 },
    { t: 0.2657, speed: 1.1 },
    { t: 0.3004, speed: 4.75 },
    { t: 0.6483, speed: 0.8 },
    { t: 0.6743, speed: 4.75 },
  ],
};

// 3/4 pattern (LOCKED — REF doc)
const PATTERN_3_4: PatternData = {
  numBeats: 3,
  anchors: [
    { x: 0.2104, y: 0.481, hIn: { x: 0, y: -0.075 }, hOut: { x: 0, y: 0.075 } },
    {
      x: 0.2064,
      y: 0.626,
      hIn: { x: 0.0038, y: -0.1152 },
      hOut: { x: -0.006, y: 0.18 },
    },
    {
      x: 0.1124,
      y: 0.796,
      hIn: { x: 0.0341, y: 0.0504 },
      hOut: { x: -0.11, y: -0.1625 },
    },
    {
      x: 0.6524,
      y: 0.8435,
      hIn: { x: -0.2496, y: -0.2545 },
      hOut: { x: 0.076, y: 0.0775 },
    },
    {
      x: 0.8844,
      y: 0.5835,
      hIn: { x: -0.048, y: 0.315 },
      hOut: { x: -0.342, y: 0.4425 },
    },
    {
      x: 0.2044,
      y: 0.0885,
      hIn: { x: 0.104, y: 0.0275 },
      hOut: { x: 0.012, y: 0.105 },
    },
  ],
  speedKeyframes: [
    { t: 0, speed: 4.5 },
    { t: 0.1548, speed: 0.29 },
    { t: 0.3396, speed: 4.04 },
    { t: 0.4526, speed: 0.34 },
    { t: 0.5113, speed: 0.29 },
    { t: 0.5265, speed: 4.24 },
    { t: 0.8787, speed: 0.49 },
    { t: 0.907, speed: 4.39 },
  ],
};

// 4/4 pattern (LOCKED — REF doc)
const PATTERN_4_4: PatternData = {
  numBeats: 4,
  anchors: [
    {
      x: 0.4984,
      y: 0.5385,
      hIn: { x: 0.0011, y: -0.0269 },
      hOut: { x: -0.006, y: 0.145 },
    },
    { x: 0.4944, y: 0.866, hIn: { x: 0, y: 0 }, hOut: { x: 0, y: 0 } },
    {
      x: 0.3624,
      y: 0.741,
      hIn: { x: 0.1422, y: 0 },
      hOut: { x: -0.062, y: 0 },
    },
    {
      x: 0.0444,
      y: 0.8835,
      hIn: { x: 0.1, y: 0.135 },
      hOut: { x: -0.1067, y: -0.144 },
    },
    {
      x: 0.7164,
      y: 0.846,
      hIn: { x: -0.392, y: -0.3375 },
      hOut: { x: 0.1236, y: 0.1064 },
    },
    {
      x: 0.9904,
      y: 0.646,
      hIn: { x: -0.006, y: 0.2375 },
      hOut: { x: -0.158, y: 0.4775 },
    },
    {
      x: 0.5164,
      y: 0.106,
      hIn: { x: 0.008, y: 0.0525 },
      hOut: { x: -0.008, y: -0.0525 },
    },
  ],
  speedKeyframes: [
    { t: 0, speed: 4.9 },
    { t: 0.0939, speed: 5 },
    { t: 0.1309, speed: 1.05 },
    { t: 0.1896, speed: 1.05 },
    { t: 0.2461, speed: 4.7 },
    { t: 0.2983, speed: 4.7 },
    { t: 0.3461, speed: 1.25 },
    { t: 0.4135, speed: 1.8 },
    { t: 0.4504, speed: 3.85 },
    { t: 0.5483, speed: 4.35 },
    { t: 0.5743, speed: 0.8 },
    { t: 0.6396, speed: 0.7 },
    { t: 0.6722, speed: 4.35 },
    { t: 0.7178, speed: 4.45 },
    { t: 0.8743, speed: 0.95 },
    { t: 0.8961, speed: 4.65 },
  ],
};

const PATTERNS: Record<TimeSignature, PatternData> = {
  "2/4": PATTERN_2_4,
  "3/4": PATTERN_3_4,
  "4/4": PATTERN_4_4,
  "6/8": PATTERN_4_4, // deferred — falls back to 4/4
};

const NUM_SAMPLES = 500;
const TRAIL_FRACTION = 0.4; // trail covers 40% of one measure
const TRAIL_POINTS = 60;

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
  const idx = Math.min(
    Math.floor(t * (speedRemap.length - 1)),
    speedRemap.length - 2,
  );
  const frac = t * (speedRemap.length - 1) - idx;
  const arcFrac =
    speedRemap[idx]! + frac * (speedRemap[idx + 1]! - speedRemap[idx]!);

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

// --- Pre-compute ---

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

  const patternData = PATTERNS[pattern] ?? PATTERNS["4/4"];
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
    const beatDurationMs = (60 / bpm) * 1000;
    const strongDecayMs = 350;
    const weakDecayMs = 250;

    // Track beat flash state
    let lastBeatFlash = 0;
    let beatFlashIntensity = 0;
    let isStrongBeat = false;

    const draw = (timestamp: number) => {
      const w = size * dpr;
      const h = size * dpr;
      const cycleT = (timestamp % cycleDuration) / cycleDuration;

      // --- Beat flash: pure metronome math at t = n/numBeats ---
      for (let n = 0; n < patternData.numBeats; n++) {
        const beatT = n / patternData.numBeats;
        // Check if we just crossed this beat
        const beatTimeInCycle = beatT * cycleDuration;
        const timeInCycle = timestamp % cycleDuration;
        const timeSinceBeat = timeInCycle - beatTimeInCycle;
        if (timeSinceBeat >= 0 && timeSinceBeat < beatDurationMs * 0.5) {
          if (timestamp - lastBeatFlash > beatDurationMs * 0.6) {
            lastBeatFlash = timestamp;
            beatFlashIntensity = 1;
            isStrongBeat = n === 0;
          }
        }
      }

      // Decay beat flash
      const decayMs = isStrongBeat ? strongDecayMs : weakDecayMs;
      const elapsed = timestamp - lastBeatFlash;
      beatFlashIntensity = Math.max(0, 1 - elapsed / decayMs);
      // Ease out
      beatFlashIntensity = beatFlashIntensity * beatFlashIntensity;

      const pos = getPosition(
        cycleT,
        computed.speedRemap,
        computed.points,
        computed.arcLengths,
      );

      ctx.clearRect(0, 0, w, h);

      // --- Comet trail ---
      const trailStep = TRAIL_FRACTION / TRAIL_POINTS;
      ctx.lineCap = "round";
      for (let i = TRAIL_POINTS - 1; i >= 1; i--) {
        const t0 = (((cycleT - (i + 1) * trailStep) % 1) + 1) % 1;
        const t1 = (((cycleT - i * trailStep) % 1) + 1) % 1;
        const p0 = getPosition(
          t0,
          computed.speedRemap,
          computed.points,
          computed.arcLengths,
        );
        const p1 = getPosition(
          t1,
          computed.speedRemap,
          computed.points,
          computed.arcLengths,
        );

        // Speed at trail point — thicker/brighter when fast
        const speedAtT = interpolateSpeed(patternData.speedKeyframes, t1);
        const speedNorm = Math.min(speedAtT / 5, 1); // normalize to 0-1

        const ageFrac = i / TRAIL_POINTS; // 0 = head, 1 = tail
        const alpha = (1 - ageFrac) * 0.35 * (0.3 + 0.7 * speedNorm);
        const lineWidth =
          (w * 0.02 + w * 0.03 * speedNorm) * (1 - ageFrac * 0.7);

        ctx.strokeStyle = `rgba(${DOT_R}, ${DOT_G}, ${DOT_B}, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(p0.x * w, p0.y * h);
        ctx.lineTo(p1.x * w, p1.y * h);
        ctx.stroke();
      }

      const px = pos.x * w;
      const py = pos.y * h;
      const baseR = w * 0.06;
      const flashScale = isStrongBeat ? 1.8 : 1.4;
      const radius = baseR * (1 + beatFlashIntensity * (flashScale - 1));

      // Glow
      const glowR = radius * 3;
      const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
      const glowA = 0.15 + beatFlashIntensity * 0.3;
      glow.addColorStop(0, `rgba(${DOT_R}, ${DOT_G}, ${DOT_B}, ${glowA})`);
      glow.addColorStop(1, `rgba(${DOT_R}, ${DOT_G}, ${DOT_B}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Dot — shifts toward white on beat
      const r = Math.round(DOT_R + beatFlashIntensity * (255 - DOT_R));
      const g = Math.round(DOT_G + beatFlashIntensity * (255 - DOT_G));
      const b = Math.round(DOT_B + beatFlashIntensity * (255 - DOT_B));
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
