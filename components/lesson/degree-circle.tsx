"use client";

import { useId, useMemo, useState, useRef, useCallback } from "react";
import { degreeColors, chromaticDegreeColors, brand } from "@/lib/tokens";

// ─── Types ──────────────────────────────────────────────────

interface DegreeCircleProps {
  activeDegrees?: number[];
  unlockedDegrees?: number[];
  onDegreeClick?: (degree: number) => void;
  size?: number;
  interactive?: boolean;
  showChromatic?: boolean;
  labelMode?: "numbers" | "solfege";
  tonality?: "major" | "minor" | "dorian" | "mixolydian" | string;
  showResolutionArrows?: boolean;
  showFeelingStates?: boolean;
}

type DegreeState = "locked" | "unlocked" | "active";

// ─── Label Maps ─────────────────────────────────────────────

const DIATONIC_NUMBER_LABELS = ["1", "2", "3", "4", "5", "6", "7"];
const DIATONIC_SOLFEGE_LABELS = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti"];
const CHROMATIC_NUMBER_LABELS = [
  "1",
  "\u266D2",
  "2",
  "\u266D3",
  "3",
  "4",
  "\u266F4",
  "5",
  "\u266D6",
  "6",
  "\u266D7",
  "7",
];
const CHROMATIC_SOLFEGE_LABELS = [
  "Do",
  "Ra",
  "Re",
  "Me",
  "Mi",
  "Fa",
  "Fi",
  "Sol",
  "Le",
  "La",
  "Te",
  "Ti",
];

// Map chromatic index to degree number for click callbacks
const CHROMATIC_DEGREE_MAP = [1, -2, 2, -3, 3, 4, -4.5, 5, -6, 6, -7, 7];

// ─── Feeling-State Labels ────────────────────────────────────

const FEELING_STATES: Record<number, string> = {
  1: "Home. Stable. Complete.",
  2: "Stepping out. Wants to move.",
  3: "Bright. Warm. Settled.",
  4: "Leaning down. Restless.",
  5: "Strong anchor. Wants to return home.",
  6: "Bittersweet. Gentle tension.",
  7: "Urgent. Pulling hard toward home.",
};

const CHROMATIC_FEELING_STATES: Record<number, string> = {
  ...FEELING_STATES,
  [-2]: "Darkened. Somber.",
  [-3]: "Darkened. Somber.",
  [-6]: "Shadowed. Heavy.",
  [-7]: "Relaxed pull. Less urgent than Ti.",
};

// ─── Color Helpers ──────────────────────────────────────────

function getDiatonicColor(degree: number): string {
  return degreeColors[degree as keyof typeof degreeColors] ?? brand.silver;
}

function getChromaticColor(index: number): string {
  // Diatonic positions: 0,2,4,5,7,9,11 -> degrees 1-7
  const diatonicMap: Record<number, number> = {
    0: 1,
    2: 2,
    4: 3,
    5: 4,
    7: 5,
    9: 6,
    11: 7,
  };
  const chromaticMap: Record<number, string> = {
    1: chromaticDegreeColors.b2,
    3: chromaticDegreeColors.b3,
    6: chromaticDegreeColors["#4"],
    8: chromaticDegreeColors.b6,
    10: chromaticDegreeColors.b7,
  };
  const diatonic = diatonicMap[index];
  if (diatonic !== undefined) return getDiatonicColor(diatonic);
  return chromaticMap[index] ?? brand.silver;
}

// ─── Component ──────────────────────────────────────────────

export function DegreeCircle({
  activeDegrees = [],
  unlockedDegrees = [1, 2, 3, 4, 5, 6, 7],
  onDegreeClick,
  size = 280,
  interactive = true,
  showChromatic = false,
  labelMode = "numbers",
  tonality = "major",
  showResolutionArrows = false,
  showFeelingStates = false,
}: DegreeCircleProps) {
  const filterId = useId();
  const glowId = `glow-${filterId}`;
  const gradientId = `bg-${filterId}`;

  const [feelingDegree, setFeelingDegree] = useState<number | null>(null);
  const [feelingOpacity, setFeelingOpacity] = useState(0);
  const feelingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeeling = useCallback(
    (degree: number) => {
      if (!showFeelingStates) return;
      if (feelingTimerRef.current) clearTimeout(feelingTimerRef.current);
      setFeelingDegree(degree);
      setFeelingOpacity(1);
      feelingTimerRef.current = setTimeout(() => {
        setFeelingOpacity(0);
        setTimeout(() => setFeelingDegree(null), 300);
      }, 3000);
    },
    [showFeelingStates],
  );

  const nodeCount = showChromatic ? 12 : 7;
  const cx = size / 2;
  const cy = size / 2;
  const orbitRadius = size * 0.38;

  const activeSet = useMemo(() => new Set(activeDegrees), [activeDegrees]);
  const unlockedSet = useMemo(
    () => new Set(unlockedDegrees),
    [unlockedDegrees],
  );

  const labels = showChromatic
    ? labelMode === "solfege"
      ? CHROMATIC_SOLFEGE_LABELS
      : CHROMATIC_NUMBER_LABELS
    : labelMode === "solfege"
      ? DIATONIC_SOLFEGE_LABELS
      : DIATONIC_NUMBER_LABELS;

  function getDegreeNumber(index: number): number {
    if (showChromatic) return CHROMATIC_DEGREE_MAP[index] ?? index + 1;
    return index + 1;
  }

  function getState(index: number): DegreeState {
    const deg = getDegreeNumber(index);
    if (activeSet.has(deg)) return "active";
    if (unlockedSet.has(deg)) return "unlocked";
    return "locked";
  }

  function getNodeRadius(state: DegreeState): number {
    switch (state) {
      case "active":
        return 22;
      case "unlocked":
        return 17;
      case "locked":
        return 14;
    }
  }

  function getColor(index: number): string {
    return showChromatic
      ? getChromaticColor(index)
      : getDiatonicColor(index + 1);
  }

  function nodePosition(index: number): { x: number; y: number } {
    const angle = (index / nodeCount) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * orbitRadius,
      y: cy + Math.sin(angle) * orbitRadius,
    };
  }

  // Resolution arrow: small curved arc near a degree node pointing toward tonic
  function renderResolutionArrow(index: number, state: DegreeState) {
    if (!showResolutionArrows || state === "locked" || showChromatic)
      return null;
    const deg = index + 1;
    if (deg === 1) return null; // tonic has no resolution arrow

    const pos = nodePosition(index);
    const r = 30;
    const color = getColor(index);

    // Arrow direction: degrees 2-4 curve toward tonic (clockwise/down), 5-7 curve up
    const resolveDown = deg <= 4;
    const nodeAngle = (index / 7) * Math.PI * 2 - Math.PI / 2;

    // Small arc offset from node
    const startAngle = nodeAngle + (resolveDown ? -0.15 : 0.15);
    const endAngle = nodeAngle + (resolveDown ? -0.45 : 0.45);

    const x1 = pos.x + Math.cos(startAngle) * r;
    const y1 = pos.y + Math.sin(startAngle) * r;
    const x2 = pos.x + Math.cos(endAngle) * r;
    const y2 = pos.y + Math.sin(endAngle) * r;

    // Arrowhead
    const tipAngle = endAngle + (resolveDown ? -0.2 : 0.2);
    const ax = x2 + Math.cos(tipAngle) * 5;
    const ay = y2 + Math.sin(tipAngle) * 5;

    return (
      <g key={`arrow-${index}`} opacity={0.25}>
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 0 ${resolveDown ? 0 : 1} ${x2} ${y2}`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
        />
        <line
          x1={x2}
          y1={y2}
          x2={ax}
          y2={ay}
          stroke={color}
          strokeWidth={1.5}
        />
      </g>
    );
  }

  function handleClick(index: number) {
    if (!interactive) return;
    const state = getState(index);
    if (state === "locked") return;
    const deg = getDegreeNumber(index);
    onDegreeClick?.(deg);
    showFeeling(deg);
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      overflow="visible"
      style={{ maxWidth: size }}
      role="img"
      aria-label={`Degree circle showing ${tonality} scale`}
    >
      <defs>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor="rgba(183,148,246,0.04)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Layer 1: Background glow */}
      <circle cx={cx} cy={cy} r={size * 0.46} fill={`url(#${gradientId})`} />

      {/* Layer 2: Center label */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize={11}
        letterSpacing={1.5}
        fill={brand.ash}
      >
        {tonality.toUpperCase()}
      </text>

      {/* Layer 3: Radial lines */}
      {Array.from({ length: nodeCount }, (_, i) => {
        const state = getState(i);
        if (state === "locked") return null;
        const color = getColor(i);
        const innerR = orbitRadius * 0.35;
        const outerR = orbitRadius - 22;
        const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * outerR;
        const y2 = cy + Math.sin(angle) * outerR;
        return (
          <line
            key={`line-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={1}
            opacity={state === "active" ? 0.5 : 0.08}
          />
        );
      })}

      {/* Layer 4: Resolution arrows */}
      {!showChromatic &&
        Array.from({ length: 7 }, (_, i) =>
          renderResolutionArrow(i, getState(i)),
        )}

      {/* Layer 5-7: Nodes */}
      {Array.from({ length: nodeCount }, (_, i) => {
        const state = getState(i);
        const pos = nodePosition(i);
        const color = getColor(i);
        const r = getNodeRadius(state);
        const label = labels[i] ?? "";

        const fillOpacity =
          state === "active" ? 0.25 : state === "unlocked" ? 0.08 : 0;
        const strokeWidth =
          state === "active" ? 2 : state === "locked" ? 0.5 : 1;
        const isClickable = interactive && state !== "locked";

        return (
          <g
            key={`node-${i}`}
            onClick={() => handleClick(i)}
            style={{ cursor: isClickable ? "pointer" : "default" }}
            role={isClickable ? "button" : undefined}
            aria-label={
              isClickable ? `Play degree ${getDegreeNumber(i)}` : undefined
            }
          >
            {/* Active outer ring with glow */}
            {state === "active" && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r + 10}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                opacity={0.2}
                filter={`url(#${glowId})`}
              />
            )}

            {/* Node circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={r}
              fill={state === "locked" ? "none" : color}
              fillOpacity={fillOpacity}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={state === "locked" ? "3 3" : undefined}
              opacity={state === "locked" ? 0.3 : 1}
            />

            {/* Label */}
            {state !== "locked" && (
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'DM Sans', sans-serif"
                fontSize={15}
                fontWeight={state === "active" ? 800 : 600}
                fill={color}
                fillOpacity={state === "active" ? 1 : 0.88}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}

      {/* Layer 8: Feeling-state label */}
      {feelingDegree !== null &&
        (() => {
          const stateMap = showChromatic
            ? CHROMATIC_FEELING_STATES
            : FEELING_STATES;
          const text = stateMap[feelingDegree];
          if (!text) return null;
          return (
            <text
              x={cx}
              y={cy + 16}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="'DM Sans', sans-serif"
              fontSize={10}
              fill={brand.silver}
              opacity={feelingOpacity}
              style={{ transition: "opacity 0.3s ease" }}
            >
              {text}
            </text>
          );
        })()}
    </svg>
  );
}
