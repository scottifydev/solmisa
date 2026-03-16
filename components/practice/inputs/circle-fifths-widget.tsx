"use client";

import { useState, useRef, useEffect } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const CIRCLE = [
  { pos: 0, major: "C", minor: "Am", sharps: 0, flats: 0 },
  { pos: 1, major: "G", minor: "Em", sharps: 1, flats: 0 },
  { pos: 2, major: "D", minor: "Bm", sharps: 2, flats: 0 },
  { pos: 3, major: "A", minor: "F♯m", sharps: 3, flats: 0 },
  { pos: 4, major: "E", minor: "C♯m", sharps: 4, flats: 0 },
  { pos: 5, major: "B", minor: "G♯m", sharps: 5, flats: 0 },
  { pos: 6, major: "F♯", minor: "D♯m", sharps: 6, flats: 0 },
  { pos: 7, major: "D♭", minor: "B♭m", sharps: 0, flats: 5 },
  { pos: 8, major: "A♭", minor: "Fm", sharps: 0, flats: 4 },
  { pos: 9, major: "E♭", minor: "Cm", sharps: 0, flats: 3 },
  { pos: 10, major: "B♭", minor: "Gm", sharps: 0, flats: 2 },
  { pos: 11, major: "F", minor: "Dm", sharps: 0, flats: 1 },
] as const;

type CircleEntry = (typeof CIRCLE)[number];

const SLIDE_NOTES = [
  "C",
  "C♯",
  "D♭",
  "D",
  "D♯",
  "E♭",
  "E",
  "F",
  "F♯",
  "G♭",
  "G",
  "G♯",
  "A♭",
  "A",
  "A♯",
  "B♭",
  "B",
  "C♭",
];
const SLIDE_SIGS = [
  "7♭",
  "6♭",
  "5♭",
  "4♭",
  "3♭",
  "2♭",
  "1♭",
  "0",
  "1♯",
  "2♯",
  "3♯",
  "4♯",
  "5♯",
  "6♯",
  "7♯",
];
const SLIDE_NUMERALS = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];

const SHARP_POSITIONS = [8, 5, 9, 6, 3, 7, 4];
const FLAT_POSITIONS = [4, 7, 3, 6, 2, 5, 1];

const SCALE_DEGREES = [
  { numeral: "V", steps: 1 },
  { numeral: "IV", steps: 11 },
  { numeral: "ii", steps: 2 },
  { numeral: "vi", steps: 3 },
  { numeral: "iii", steps: 4 },
];

function parseSig(s: string): {
  count: number;
  type: "sharp" | "flat" | "none";
} {
  if (s === "0") return { count: 0, type: "none" };
  const count = parseInt(s);
  return { count, type: s.includes("♯") ? "sharp" : "flat" };
}

function correctSigFor(pos: number): string {
  const e = CIRCLE[pos]!;
  if (e.sharps > 0) return `${e.sharps}♯`;
  if (e.flats > 0) return `${e.flats}♭`;
  return "0";
}

function parallelMinorPos(majorPos: number) {
  return (majorPos + 9) % 12;
}
function parallelMajorPos(minorPos: number) {
  return (minorPos + 3) % 12;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Ring = "major" | "minor";
type WheelType = "notes" | "sigs" | "numerals";
type QType =
  | "keysig_to_major"
  | "keysig_to_minor"
  | "set_sig"
  | "scale_degree"
  | "chord_function"
  | "parallel_key"
  | "relative_minor"
  | "relative_major";

interface Question {
  prompt: string;
  targetPos: number;
  targetRing: Ring;
  correctAnswer: string;
  glowPos: number | null;
  glowRing: Ring | null;
  wheelType: WheelType;
  centerKeySig?: { sharps: number; flats: number };
  refPos?: number;
  refRing?: Ring;
  forceSlide?: boolean;
}

interface AnswerResult {
  correct: boolean;
  tappedPos?: number;
  tappedRing?: Ring;
  note?: string;
  feedback?: string;
}

interface Display {
  majors: Set<number>;
  minors: Set<number>;
  sigs: Set<number>;
  landmarks: Set<number>;
  mode: "tap" | "slide";
}

interface SegStyle {
  fill: string;
  stroke: string;
  sw: number;
  op?: number;
  shadow?: string;
  dropShadow?: string;
}

// ─── genQuestion ─────────────────────────────────────────────────────────────

function genQuestion(type: QType, mode: "tap" | "slide"): Question {
  const randPos = () => Math.floor(Math.random() * 12);
  const suppressGlow = mode === "slide";

  switch (type) {
    case "keysig_to_major": {
      const pos = randPos();
      const e = CIRCLE[pos]!;
      return {
        prompt: "What major key?",
        targetPos: pos,
        targetRing: "major",
        correctAnswer: e.major,
        glowPos: null,
        glowRing: null,
        wheelType: "notes",
        centerKeySig: { sharps: e.sharps, flats: e.flats },
      };
    }
    case "keysig_to_minor": {
      const pos = randPos();
      const e = CIRCLE[pos]!;
      return {
        prompt: "What minor key?",
        targetPos: pos,
        targetRing: "minor",
        correctAnswer: e.minor.replace("m", ""),
        glowPos: null,
        glowRing: null,
        wheelType: "notes",
        centerKeySig: { sharps: e.sharps, flats: e.flats },
      };
    }
    case "set_sig": {
      const pos = randPos();
      return {
        prompt: `Accidentals in ${CIRCLE[pos]!.major}?`,
        targetPos: pos,
        targetRing: "major",
        correctAnswer: correctSigFor(pos),
        glowPos: pos,
        glowRing: "major",
        wheelType: "sigs",
        forceSlide: true,
      };
    }
    case "scale_degree": {
      const pos = randPos();
      const e = CIRCLE[pos]!;
      const deg =
        SCALE_DEGREES[Math.floor(Math.random() * SCALE_DEGREES.length)]!;
      const targetPos = (pos + deg.steps) % 12;
      return {
        prompt: `${deg.numeral} of ${e.major}?`,
        targetPos,
        targetRing: "major",
        correctAnswer: CIRCLE[targetPos]!.major,
        refPos: pos,
        refRing: "major",
        glowPos: null,
        glowRing: null,
        wheelType: "notes",
      };
    }
    case "chord_function": {
      const pos = randPos();
      const e = CIRCLE[pos]!;
      const deg =
        SCALE_DEGREES[Math.floor(Math.random() * SCALE_DEGREES.length)]!;
      const chordPos = (pos + deg.steps) % 12;
      return {
        prompt: `${CIRCLE[chordPos]!.major} is the ___ of ${e.major}`,
        targetPos: chordPos,
        targetRing: "major",
        correctAnswer: deg.numeral,
        refPos: pos,
        refRing: "major",
        glowPos: suppressGlow ? null : chordPos,
        glowRing: suppressGlow ? null : "major",
        wheelType: "numerals",
        forceSlide: true,
      };
    }
    case "parallel_key": {
      const toMinor = Math.random() > 0.5;
      if (toMinor) {
        const pos = randPos();
        const minorPos = parallelMinorPos(pos);
        return {
          prompt: `Parallel minor of ${CIRCLE[pos]!.major}?`,
          targetPos: minorPos,
          targetRing: "minor",
          correctAnswer: CIRCLE[minorPos]!.minor.replace("m", ""),
          refPos: pos,
          refRing: "major",
          glowPos: null,
          glowRing: null,
          wheelType: "notes",
        };
      } else {
        const pos = randPos();
        const majorPos = parallelMajorPos(pos);
        return {
          prompt: `Parallel major of ${CIRCLE[pos]!.minor}?`,
          targetPos: majorPos,
          targetRing: "major",
          correctAnswer: CIRCLE[majorPos]!.major,
          refPos: pos,
          refRing: "minor",
          glowPos: null,
          glowRing: null,
          wheelType: "notes",
        };
      }
    }
    case "relative_minor": {
      const pos = randPos();
      return {
        prompt: `Relative minor of ${CIRCLE[pos]!.major}?`,
        targetPos: pos,
        targetRing: "minor",
        correctAnswer: CIRCLE[pos]!.minor.replace("m", ""),
        glowPos: null,
        glowRing: null,
        refPos: pos,
        refRing: "major",
        wheelType: "notes",
      };
    }
    case "relative_major": {
      const pos = randPos();
      return {
        prompt: `Relative major of ${CIRCLE[pos]!.minor}?`,
        targetPos: pos,
        targetRing: "major",
        correctAnswer: CIRCLE[pos]!.major,
        glowPos: null,
        glowRing: null,
        refPos: pos,
        refRing: "minor",
        wheelType: "notes",
      };
    }
  }
}

// ─── CenterKeySig ────────────────────────────────────────────────────────────

function CenterKeySig({
  keySig,
}: {
  keySig: { sharps: number; flats: number };
}) {
  const W = 110,
    H = 58,
    sp = 8,
    staffTop = 8;
  const lY = (i: number) => staffTop + i * sp;
  const posToY = (pos: number) => lY(4) - (pos * sp) / 2;
  const isSharp = keySig.sharps > 0;
  const count = isSharp ? keySig.sharps : keySig.flats;
  const positions = isSharp ? SHARP_POSITIONS : FLAT_POSITIONS;
  const sym = isSharp ? "♯" : "♭";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={6}
          y1={lY(i)}
          x2={W - 6}
          y2={lY(i)}
          stroke="#3a3a4e"
          strokeWidth="0.7"
        />
      ))}
      <text
        x={8}
        y={lY(3) + sp * 0.3}
        fontSize={sp * 3}
        fill="#ede9fe"
        opacity="0.5"
        fontFamily="'Bravura','Academico','Noto Music',serif"
        style={{ userSelect: "none" }}
      >
        𝄞
      </text>
      {count > 0 &&
        Array.from({ length: count }, (_, i) => (
          <text
            key={i}
            x={32 + i * 8}
            y={posToY(positions[i]!) + (isSharp ? 3 : 4)}
            fontSize={isSharp ? 11 : 13}
            fill="#ede9fe"
            opacity="0.85"
            fontFamily="'Bravura','Academico','Noto Music',serif"
            style={{ userSelect: "none" }}
          >
            {sym}
          </text>
        ))}
      {count === 0 && (
        <text
          x={W / 2}
          y={lY(2) + 3}
          textAnchor="middle"
          fontSize={8}
          fill="#65607a"
          fontFamily="'DM Sans',sans-serif"
        >
          no ♯/♭
        </text>
      )}
    </svg>
  );
}

// ─── CircleFifthsWidget ───────────────────────────────────────────────────────

const Q_TYPES: { id: QType; label: string }[] = [
  { id: "keysig_to_major", label: "Sig → Major" },
  { id: "keysig_to_minor", label: "Sig → Minor" },
  { id: "set_sig", label: "Set Accidentals" },
  { id: "scale_degree", label: "Scale Degrees" },
  { id: "chord_function", label: "Chord Function" },
  { id: "parallel_key", label: "Parallel Key" },
  { id: "relative_minor", label: "Rel. Minor" },
  { id: "relative_major", label: "Rel. Major" },
];

const LEVELS = [
  { n: 1, desc: "All labeled + sigs" },
  { n: 2, desc: "All labeled, no sigs" },
  { n: 3, desc: "C landmark, slide" },
  { n: 4, desc: "Blank, slide" },
];

interface CircleFifthsWidgetProps {
  onAnswer: (correct: boolean) => void;
}

export function CircleFifthsWidget({ onAnswer }: CircleFifthsWidgetProps) {
  const ALL_POS = new Set<number>(Array.from({ length: 12 }, (_, i) => i));
  const NONE = new Set<number>();

  function getDisplay(lv: number): Display {
    switch (lv) {
      case 1:
        return {
          majors: ALL_POS,
          minors: ALL_POS,
          sigs: ALL_POS,
          landmarks: NONE,
          mode: "tap",
        };
      case 2:
        return {
          majors: ALL_POS,
          minors: ALL_POS,
          sigs: NONE,
          landmarks: NONE,
          mode: "tap",
        };
      case 3:
        return {
          majors: NONE,
          minors: NONE,
          sigs: NONE,
          landmarks: new Set([0]),
          mode: "slide",
        };
      case 4:
        return {
          majors: NONE,
          minors: NONE,
          sigs: NONE,
          landmarks: NONE,
          mode: "slide",
        };
      default:
        return {
          majors: ALL_POS,
          minors: ALL_POS,
          sigs: ALL_POS,
          landmarks: NONE,
          mode: "tap",
        };
    }
  }

  const [qType, setQType] = useState<QType>("keysig_to_major");
  const [level, setLevel] = useState(1);
  const display = getDisplay(level);

  const [question, setQuestion] = useState<Question | null>(null);
  const [answered, setAnswered] = useState<AnswerResult | null>(null);

  const [activePos, setActivePos] = useState<number | null>(null);
  const [activeRing, setActiveRing] = useState<Ring | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [slideFloat, setSlideFloat] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [glowAngle, setGlowAngle] = useState<number | null>(null);
  const [glowRingType, setGlowRingType] = useState<Ring | null>(null);
  const [overCancel, setOverCancel] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragStartAngle = useRef<number | null>(null);
  const dragStartIdx = useRef(0);

  const cx = 220,
    cy = 220,
    size = 440;
  const outerR = 174,
    outerInner = 132;
  const innerR = 128,
    innerInner = 88;
  const centerR = 80;
  const segStep = (2 * Math.PI) / 12;

  function newQuestion() {
    setQuestion(genQuestion(qType, display.mode));
    setActivePos(null);
    setActiveRing(null);
    setAnswered(null);
    setSlideIdx(0);
    setSlideFloat(0);
    setGlowAngle(null);
    setGlowRingType(null);
  }

  useEffect(() => {
    newQuestion();
  }, [qType, level]);

  // ── Geometry ────────────────────────────────────────────────────────────────

  function segPath(pos: number, rO: number, rI: number): string {
    const s = -Math.PI / 2 + pos * segStep - segStep / 2;
    const e = s + segStep;
    const g = 0.02;
    return `M ${cx + rO * Math.cos(s + g)} ${cy + rO * Math.sin(s + g)} A ${rO} ${rO} 0 0 1 ${cx + rO * Math.cos(e - g)} ${cy + rO * Math.sin(e - g)} L ${cx + rI * Math.cos(e - g)} ${cy + rI * Math.sin(e - g)} A ${rI} ${rI} 0 0 0 ${cx + rI * Math.cos(s + g)} ${cy + rI * Math.sin(s + g)} Z`;
  }

  function labelXY(pos: number, r: number): { x: number; y: number } {
    const a = -Math.PI / 2 + pos * segStep;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function clientToAngle(clientX: number, clientY: number): number {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * size;
    const sy = ((clientY - rect.top) / rect.height) * size;
    return Math.atan2(sy - cy, sx - cx);
  }

  function clientToSegment(
    clientX: number,
    clientY: number,
  ): { pos: number; ring: Ring } | null {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * size;
    const sy = ((clientY - rect.top) / rect.height) * size;
    const dist = Math.sqrt((sx - cx) ** 2 + (sy - cy) ** 2);
    let ring: Ring | null = null;
    if (dist >= outerInner && dist <= outerR) ring = "major";
    else if (dist >= innerInner && dist <= innerR) ring = "minor";
    else return null;
    const angle = Math.atan2(sy - cy, sx - cx);
    const normAngle = (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
    const pos = Math.floor((normAngle + segStep / 2) / segStep) % 12;
    return { pos, ring };
  }

  // ── Proximity glow ──────────────────────────────────────────────────────────

  function segProximity(pos: number, ring: Ring): number {
    if (glowAngle === null || !dragging || overCancel) return 0;
    const isTapDrag = display.mode === "tap" && !question?.forceSlide;
    if (!isTapDrag) return 0;
    if (glowRingType && ring !== glowRingType) return 0;
    if (!glowRingType) return 0;
    const segAngle = -Math.PI / 2 + pos * segStep;
    let delta = glowAngle - segAngle;
    delta = (((delta % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    delta = Math.abs(delta);
    const halfSeg = segStep / 2;
    if (delta > halfSeg) return 0;
    const edgeZone = halfSeg * 0.4;
    const innerZone = halfSeg - edgeZone;
    if (delta < innerZone) return 1;
    return 1 - ((delta - innerZone) / edgeZone) * 0.5;
  }

  // ── Segment style ───────────────────────────────────────────────────────────

  function segStyle(pos: number, ring: Ring): SegStyle {
    const isActive = activePos === pos && activeRing === ring;
    const isGlow = question?.glowPos === pos && question?.glowRing === ring;
    const isRef = question?.refPos === pos && question?.refRing === ring;
    const isCorrect =
      answered?.correct &&
      question?.targetPos === pos &&
      question?.targetRing === ring;
    const isWrong =
      answered &&
      !answered.correct &&
      answered.tappedPos === pos &&
      answered.tappedRing === ring;
    const isLabeled =
      ring === "major" ? display.majors.has(pos) : display.minors.has(pos);
    const isLandmark = ring === "major" && display.landmarks.has(pos);

    if (isCorrect)
      return {
        fill: "rgba(74,222,128,0.15)",
        stroke: "#4ade80",
        sw: 2.5,
        shadow: "rgba(74,222,128,0.3)",
      };
    if (isWrong)
      return {
        fill: "rgba(248,113,113,0.1)",
        stroke: "#f87171",
        sw: 2.5,
        shadow: "rgba(248,113,113,0.3)",
      };

    const prox = segProximity(pos, ring);
    if (prox > 0) {
      return {
        fill: `rgba(139,92,246,${(0.18 * prox).toFixed(3)})`,
        stroke: `rgba(139,92,246,${(0.7 * prox).toFixed(3)})`,
        sw: 1 + 2 * prox,
        dropShadow: `drop-shadow(0 0 ${Math.round(6 + 8 * prox)}px rgba(139,92,246,${(0.3 + 0.4 * prox).toFixed(2)}))`,
      };
    }

    const isTapDrag = display.mode === "tap" && !question?.forceSlide;
    if (isActive && !answered && !isTapDrag)
      return {
        fill: "rgba(139,92,246,0.14)",
        stroke: "#8b5cf6",
        sw: 2.5,
        shadow: "rgba(139,92,246,0.3)",
      };
    if (isRef)
      return {
        fill: "rgba(139,92,246,0.08)",
        stroke: "rgba(139,92,246,0.6)",
        sw: 1.5,
      };
    if (isGlow && !isActive)
      return {
        fill: "rgba(139,92,246,0.07)",
        stroke: "rgba(139,92,246,0.5)",
        sw: 1.5,
        shadow: "rgba(139,92,246,0.3)",
      };

    if (isLabeled) {
      const d = Math.min(pos, 12 - pos);
      const op = 1 - d * 0.015;
      if (ring === "major")
        return {
          fill: "rgba(35,28,55,1)",
          stroke: "rgba(80,65,120,0.5)",
          sw: 1,
          op,
        };
      return {
        fill: "rgba(25,28,50,1)",
        stroke: "rgba(55,65,115,0.5)",
        sw: 1,
        op,
      };
    }
    if (isLandmark)
      return {
        fill: "rgba(40,32,62,1)",
        stroke: "rgba(100,80,150,0.6)",
        sw: 1,
      };
    if (ring === "major")
      return {
        fill: "rgba(30,24,50,1)",
        stroke: "rgba(80,65,120,0.5)",
        sw: 0.8,
      };
    return {
      fill: "rgba(22,24,45,1)",
      stroke: "rgba(65,70,115,0.45)",
      sw: 0.8,
    };
  }

  function textCol(pos: number, ring: Ring): string {
    const isGlow = question?.glowPos === pos && question?.glowRing === ring;
    const isRef = question?.refPos === pos && question?.refRing === ring;
    const isLabeled =
      ring === "major" ? display.majors.has(pos) : display.minors.has(pos);
    const isLandmark = ring === "major" && display.landmarks.has(pos);
    const prox = segProximity(pos, ring);
    if (prox > 0.5) return "#eae8e4";
    if (prox > 0) return "#a09bb3";
    if (isRef) return "#8b5cf6";
    if (isGlow) return "#8b5cf6";
    if (isLabeled) {
      const d = Math.min(pos, 12 - pos);
      if (ring === "major") return d <= 2 ? "#e8e4f0" : "#a89ec0";
      return d <= 2 ? "#b4b0cc" : "#807c9e";
    }
    if (isLandmark) return "#4a4568";
    return "transparent";
  }

  // ── Pointer handlers ────────────────────────────────────────────────────────

  function handleSegPointerDown(
    pos: number,
    ring: Ring,
    e: React.PointerEvent,
  ) {
    if (answered) return;
    if (
      ring === "major" &&
      display.landmarks.has(pos) &&
      !display.majors.has(pos)
    )
      return;

    const isTargetLocked =
      question?.glowPos !== null && question?.glowPos !== undefined;
    if (
      isTargetLocked &&
      (pos !== question?.glowPos || ring !== question?.glowRing)
    )
      return;

    e.preventDefault();
    e.stopPropagation();

    if (display.mode === "tap" && !question?.forceSlide) {
      setActivePos(pos);
      setActiveRing(ring);
      setDragging(true);
      return;
    }

    // Slide mode
    setActivePos(pos);
    setActiveRing(ring);
    const initIdx = question?.wheelType === "sigs" ? 7 : 0;
    setSlideIdx(initIdx);
    setSlideFloat(0);
    setDragging(true);
    dragStartAngle.current = clientToAngle(e.clientX, e.clientY);
    dragStartIdx.current = initIdx;
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging || answered) return;

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * size;
      const sy = ((e.clientY - rect.top) / rect.height) * size;
      const dist = Math.sqrt((sx - cx) ** 2 + (sy - cy) ** 2);
      setOverCancel(dist < centerR);
    }

    if (display.mode === "tap" && !question?.forceSlide) {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * size;
      const sy = ((e.clientY - rect.top) / rect.height) * size;
      const dist = Math.sqrt((sx - cx) ** 2 + (sy - cy) ** 2);
      const angle = Math.atan2(sy - cy, sx - cx);
      setGlowAngle(angle);
      let ring: Ring | null = null;
      if (dist >= innerInner && dist <= outerR) {
        ring = dist >= outerInner ? "major" : "minor";
      }
      setGlowRingType(ring);
      const seg = clientToSegment(e.clientX, e.clientY);
      if (seg) {
        const isTargetLocked =
          question?.glowPos !== null && question?.glowPos !== undefined;
        const isLandmarkOnly =
          seg.ring === "major" &&
          display.landmarks.has(seg.pos) &&
          !display.majors.has(seg.pos);
        if (
          !isLandmarkOnly &&
          (!isTargetLocked ||
            (seg.pos === question?.glowPos && seg.ring === question?.glowRing))
        ) {
          setActivePos(seg.pos);
          setActiveRing(seg.ring);
        }
      }
      return;
    }

    // Slide mode
    if (activePos === null) return;
    const currentAngle = clientToAngle(e.clientX, e.clientY);
    let delta = currentAngle - (dragStartAngle.current ?? currentAngle);
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    const noteStep = segStep / 1.6;
    const floatSteps = -delta / noteStep;
    setSlideFloat(floatSteps);
    const wheel =
      question?.wheelType === "sigs"
        ? SLIDE_SIGS
        : question?.wheelType === "numerals"
          ? SLIDE_NUMERALS
          : SLIDE_NOTES;
    const steps = Math.round(floatSteps);
    const newIdx =
      (((dragStartIdx.current + steps) % wheel.length) + wheel.length) %
      wheel.length;
    setSlideIdx(newIdx);
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging) return;
    const wasCancelling = overCancel;
    setDragging(false);
    setSlideFloat(0);
    setOverCancel(false);
    setGlowAngle(null);
    setGlowRingType(null);
    dragStartAngle.current = null;

    if (answered) {
      setActivePos(null);
      setActiveRing(null);
      return;
    }
    if (wasCancelling) {
      setActivePos(null);
      setActiveRing(null);
      return;
    }

    if (display.mode === "tap" && !question?.forceSlide) {
      if (activePos === null || activeRing === null) return;
      const correct =
        activePos === question?.targetPos &&
        activeRing === question?.targetRing;
      const note =
        activeRing === "major"
          ? CIRCLE[activePos]!.major
          : CIRCLE[activePos]!.minor;
      const result: AnswerResult = {
        correct,
        tappedPos: activePos,
        tappedRing: activeRing,
        note,
      };
      setAnswered(result);
      onAnswer(correct);
      setTimeout(newQuestion, correct ? 1000 : 2000);
      return;
    }

    // Slide mode confirm
    if (activePos === null || activeRing === null) return;
    const wheel =
      question?.wheelType === "sigs"
        ? SLIDE_SIGS
        : question?.wheelType === "numerals"
          ? SLIDE_NUMERALS
          : SLIDE_NOTES;
    const selectedItem =
      wheel[((slideIdx % wheel.length) + wheel.length) % wheel.length]!;
    const rightSeg =
      activePos === question?.targetPos && activeRing === question?.targetRing;
    const rightAnswer = selectedItem === question?.correctAnswer;
    const correct = rightSeg && rightAnswer;

    let feedback = "";
    if (!correct && rightSeg && !rightAnswer)
      feedback = "right position, wrong name";
    if (!correct && !rightSeg && rightAnswer)
      feedback = "right name, wrong position";

    const result: AnswerResult = {
      correct,
      tappedPos: activePos,
      tappedRing: activeRing,
      note: selectedItem,
      feedback,
    };
    setAnswered(result);
    onAnswer(correct);
    setTimeout(newQuestion, correct ? 1000 : 2200);
  }

  // ── Slide rule renderer ──────────────────────────────────────────────────────

  function renderSlideRule() {
    if (activePos === null || activeRing === null) return null;
    const isTapDrag = display.mode === "tap" && !question?.forceSlide;
    if (isTapDrag) return null;

    const isOuter = activeRing === "major";
    const rO = isOuter ? outerR : innerR;
    const rI = isOuter ? outerInner : innerInner;
    const midR = (rO + rI) / 2;
    const centerAngle = -Math.PI / 2 + activePos * segStep;
    const noteArcStep = segStep / 1.6;
    const visibleRange = 5;
    const wheel =
      question?.wheelType === "sigs"
        ? SLIDE_SIGS
        : question?.wheelType === "numerals"
          ? SLIDE_NUMERALS
          : SLIDE_NOTES;
    const fractionalOffset = slideFloat - Math.round(slideFloat);
    const clipId = `slideClip${activePos}${activeRing}`;
    const clipHalfArc = segStep / 2;
    const clipStart = centerAngle - clipHalfArc;
    const clipEnd = centerAngle + clipHalfArc;
    const g = 0.02;
    const arcPath = (rOuter: number, rInner: number) =>
      `M ${cx + rOuter * Math.cos(clipStart + g)} ${cy + rOuter * Math.sin(clipStart + g)} A ${rOuter} ${rOuter} 0 0 1 ${cx + rOuter * Math.cos(clipEnd - g)} ${cy + rOuter * Math.sin(clipEnd - g)} L ${cx + rInner * Math.cos(clipEnd - g)} ${cy + rInner * Math.sin(clipEnd - g)} A ${rInner} ${rInner} 0 0 0 ${cx + rInner * Math.cos(clipStart + g)} ${cy + rInner * Math.sin(clipStart + g)} Z`;

    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <path d={arcPath(rO, rI)} />
          </clipPath>
        </defs>

        {/* Dark backing */}
        <path
          d={arcPath(rO, rI)}
          fill={overCancel ? "#22222f" : "#08080c"}
          opacity={overCancel ? 0.95 : 0.92}
        />

        {/* Rotating items */}
        <g
          clipPath={`url(#${clipId})`}
          opacity={overCancel ? 0.15 : 1}
          style={{ transition: "opacity 0.1s" }}
        >
          {Array.from({ length: visibleRange * 2 + 1 }, (_, i) => {
            const offset = i - visibleRange;
            const itemIdx =
              (((slideIdx + offset) % wheel.length) + wheel.length) %
              wheel.length;
            const item = wheel[itemIdx]!;
            const angle =
              centerAngle + (offset - fractionalOffset) * noteArcStep;
            const x = cx + midR * Math.cos(angle);
            const y = cy + midR * Math.sin(angle);
            const isCenter = offset === 0;
            const distFade =
              1 - Math.abs(offset - fractionalOffset) / (visibleRange + 1);
            let fill = isCenter ? "#8b5cf6" : "#a09bb3";
            if (answered && isCenter)
              fill = answered.correct ? "#4ade80" : "#f87171";
            return (
              <text
                key={`sn${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isCenter ? 16 : 11}
                fontWeight={isCenter ? 800 : 400}
                fontFamily="'Outfit',sans-serif"
                fill={fill}
                opacity={Math.max(0, distFade) * (isCenter ? 1 : 0.7)}
                style={{
                  userSelect: "none",
                  pointerEvents: "none",
                  filter: isCenter
                    ? `drop-shadow(0 0 6px ${answered ? (answered.correct ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)") : "rgba(139,92,246,0.3)"})`
                    : "none",
                }}
              >
                {item}
              </text>
            );
          })}
        </g>

        {/* Selection brackets */}
        {!answered && (
          <g opacity={overCancel ? 0.1 : 1}>
            {[rO - 2, rI + 2].map((bracketR, bi) => {
              const bw = noteArcStep * 0.4;
              const a1 = centerAngle - bw;
              const a2 = centerAngle + bw;
              return (
                <path
                  key={bi}
                  d={`M ${cx + bracketR * Math.cos(a1)} ${cy + bracketR * Math.sin(a1)} A ${bracketR} ${bracketR} 0 0 1 ${cx + bracketR * Math.cos(a2)} ${cy + bracketR * Math.sin(a2)}`}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  opacity="0.6"
                />
              );
            })}
          </g>
        )}
      </g>
    );
  }

  // ── Center content ──────────────────────────────────────────────────────────

  function renderCenter() {
    const targetEntry =
      question?.targetPos != null ? CIRCLE[question.targetPos] : null;
    const feedbackKeySig = targetEntry
      ? { sharps: targetEntry.sharps, flats: targetEntry.flats }
      : null;

    if (answered) {
      return (
        <div
          style={{
            textAlign: "center",
            lineHeight: 1.3,
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          {answered.correct ? (
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#4ade80",
                textShadow: "0 0 12px rgba(74,222,128,0.3)",
              }}
            >
              ✓ {answered.note || question?.correctAnswer}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f87171" }}>
                ✗
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#4ade80",
                  marginTop: 2,
                  textShadow: "0 0 10px rgba(74,222,128,0.3)",
                }}
              >
                → {question?.correctAnswer}
              </div>
              {answered.feedback && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#65607a",
                    marginTop: 2,
                  }}
                >
                  {answered.feedback}
                </div>
              )}
            </>
          )}
          {feedbackKeySig && question?.wheelType !== "sigs" && (
            <div style={{ marginTop: 4 }}>
              <CenterKeySig keySig={feedbackKeySig} />
            </div>
          )}
          {feedbackKeySig &&
            question?.wheelType === "sigs" &&
            answered.correct && (
              <div style={{ marginTop: 4 }}>
                <CenterKeySig keySig={feedbackKeySig} />
              </div>
            )}
        </div>
      );
    }

    // Live key sig preview when scrolling sig wheel
    if (activePos !== null && question?.wheelType === "sigs") {
      const currentItem =
        SLIDE_SIGS[
          ((slideIdx % SLIDE_SIGS.length) + SLIDE_SIGS.length) %
            SLIDE_SIGS.length
        ]!;
      const parsed = parseSig(currentItem);
      const liveKeySig =
        parsed.type === "sharp"
          ? { sharps: parsed.count, flats: 0 }
          : parsed.type === "flat"
            ? { sharps: 0, flats: parsed.count }
            : { sharps: 0, flats: 0 };
      return (
        <>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#eae8e4",
              fontFamily: "'Outfit',sans-serif",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            {question?.prompt}
          </div>
          <div style={{ marginTop: 4 }}>
            <CenterKeySig keySig={liveKeySig} />
          </div>
        </>
      );
    }

    return (
      <>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#eae8e4",
            fontFamily: "'Outfit',sans-serif",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {question?.prompt}
        </div>
        {question?.centerKeySig &&
          (activePos === null || display.mode === "tap") && (
            <div style={{ marginTop: 4 }}>
              <CenterKeySig keySig={question.centerKeySig} />
            </div>
          )}
        {activePos === null && !question?.centerKeySig && (
          <div
            style={{
              fontSize: 11,
              color: "#65607a",
              fontFamily: "'DM Sans',sans-serif",
              marginTop: 6,
              textAlign: "center",
            }}
          >
            {display.mode === "tap" && !question?.forceSlide
              ? "Tap the key"
              : "Drag a segment"}
          </div>
        )}
        {activePos !== null && question?.wheelType !== "sigs" && (
          <div
            style={{
              fontSize: 10,
              color: "#65607a",
              fontFamily: "'DM Sans',sans-serif",
              marginTop: 6,
              textAlign: "center",
            }}
          >
            Scroll · release to confirm
          </div>
        )}
      </>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const showCorrectPos =
    answered && !answered.correct ? (question?.targetPos ?? null) : null;
  const showCorrectRing =
    answered && !answered.correct ? (question?.targetRing ?? null) : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      {/* Question type tabs */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          maxWidth: 440,
          justifyContent: "center",
        }}
      >
        {Q_TYPES.map((qt) => (
          <button
            key={qt.id}
            onClick={() => setQType(qt.id)}
            style={{
              padding: "4px 9px",
              borderRadius: 7,
              border: `1px solid ${qType === qt.id ? "#8b5cf6" : "#2e2e3e"}`,
              background: qType === qt.id ? "rgba(139,92,246,0.08)" : "#0f0f16",
              color: qType === qt.id ? "#8b5cf6" : "#a09bb3",
              fontSize: 10,
              fontWeight: 600,
              fontFamily: "'DM Sans',sans-serif",
              cursor: "pointer",
            }}
          >
            {qt.label}
          </button>
        ))}
      </div>

      {/* Level selector */}
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        <span
          style={{
            fontSize: 10,
            color: "#65607a",
            fontFamily: "'DM Sans',sans-serif",
            marginRight: 4,
          }}
        >
          Level:
        </span>
        {LEVELS.map((lv) => (
          <button
            key={lv.n}
            onClick={() => setLevel(lv.n)}
            title={lv.desc}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: `1px solid ${level === lv.n ? "#8b5cf6" : "#2e2e3e"}`,
              background: level === lv.n ? "rgba(139,92,246,0.08)" : "#0f0f16",
              color: level === lv.n ? "#8b5cf6" : "#a09bb3",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Outfit',sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {lv.n}
          </button>
        ))}
        <span
          style={{
            fontSize: 9,
            color: "#65607a",
            fontFamily: "'DM Sans',sans-serif",
            marginLeft: 6,
          }}
        >
          {LEVELS.find((l) => l.n === level)?.desc}
        </span>
      </div>

      {/* Circle SVG */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          overflow: "visible",
          touchAction: "none",
          width: "100%",
          maxWidth: size,
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={(e) => {
          if (dragging) handlePointerUp(e);
          setOverCancel(false);
        }}
      >
        <defs />

        {/* Ring separator */}
        <circle
          cx={cx}
          cy={cy}
          r={(outerInner + innerR) / 2}
          fill="none"
          stroke="rgba(100,80,140,0.2)"
          strokeWidth="0.5"
        />

        {/* Outer (major) ring */}
        {CIRCLE.map((e) => {
          const s = segStyle(e.pos, "major");
          const lp = labelXY(e.pos, (outerR + outerInner) / 2);
          const tc = textCol(e.pos, "major");
          const labeled = display.majors.has(e.pos);
          const isLandmark = display.landmarks.has(e.pos) && !labeled;
          const hasSig = display.sigs.has(e.pos);
          const isRef =
            question?.refPos === e.pos && question?.refRing === "major";
          const isCorrReveal =
            showCorrectPos === e.pos && showCorrectRing === "major";
          const isTargetLocked =
            question?.glowPos !== null && question?.glowPos !== undefined;
          const isInteractive =
            !answered &&
            !isLandmark &&
            (!isTargetLocked ||
              (e.pos === question?.glowPos && question?.glowRing === "major"));
          return (
            <g
              key={`o${e.pos}`}
              onPointerDown={(evt) => handleSegPointerDown(e.pos, "major", evt)}
              style={{ cursor: isInteractive ? "pointer" : "default" }}
            >
              <path
                d={segPath(e.pos, outerR, outerInner)}
                fill={isCorrReveal ? "rgba(74,222,128,0.08)" : s.fill}
                stroke={isCorrReveal ? "#4ade80" : s.stroke}
                strokeWidth={isCorrReveal ? 2 : s.sw}
                opacity={s.op ?? 1}
                style={
                  isCorrReveal
                    ? { filter: "drop-shadow(0 0 8px rgba(74,222,128,0.3))" }
                    : s.dropShadow
                      ? { filter: s.dropShadow }
                      : s.shadow
                        ? { filter: `drop-shadow(0 0 10px ${s.shadow})` }
                        : isLandmark
                          ? { strokeDasharray: "4 3" }
                          : {}
                }
              />
              {(labeled || isLandmark || isRef || isCorrReveal) &&
                tc !== "transparent" && (
                  <text
                    x={lp.x}
                    y={lp.y + (hasSig ? -4 : 1)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isLandmark ? 11 : 13}
                    fontWeight={isLandmark ? 400 : 600}
                    fontFamily="'Outfit',sans-serif"
                    fill={isCorrReveal ? "#4ade80" : tc}
                    opacity={isLandmark ? 0.5 : 1}
                    style={{
                      pointerEvents: "none",
                      userSelect: "none",
                      fontStyle: isLandmark ? "italic" : "normal",
                    }}
                  >
                    {e.major}
                  </text>
                )}
              {hasSig &&
                !(
                  question?.wheelType === "sigs" &&
                  question?.targetPos === e.pos
                ) && (
                  <text
                    x={lp.x}
                    y={lp.y + 11}
                    textAnchor="middle"
                    fontSize={8}
                    fill="#65607a"
                    opacity="0.7"
                    fontFamily="'IBM Plex Mono',monospace"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {e.sharps > 0
                      ? `${e.sharps}♯`
                      : e.flats > 0
                        ? `${e.flats}♭`
                        : "0"}
                  </text>
                )}
              {!labeled &&
                !isLandmark &&
                !isRef &&
                !(activePos === e.pos && activeRing === "major") && (
                  <circle
                    cx={lp.x}
                    cy={lp.y}
                    r={3}
                    fill="#2e2e3e"
                    opacity={0.3}
                    style={{ pointerEvents: "none" }}
                  />
                )}
            </g>
          );
        })}

        {/* Inner (minor) ring */}
        {CIRCLE.map((e) => {
          const s = segStyle(e.pos, "minor");
          const lp = labelXY(e.pos, (innerR + innerInner) / 2);
          const tc = textCol(e.pos, "minor");
          const labeled = display.minors.has(e.pos);
          const isRef =
            question?.refPos === e.pos && question?.refRing === "minor";
          const isCorrReveal =
            showCorrectPos === e.pos && showCorrectRing === "minor";
          const isTargetLocked =
            question?.glowPos !== null && question?.glowPos !== undefined;
          const isInteractive =
            !answered &&
            (!isTargetLocked ||
              (e.pos === question?.glowPos && question?.glowRing === "minor"));
          return (
            <g
              key={`i${e.pos}`}
              onPointerDown={(evt) => handleSegPointerDown(e.pos, "minor", evt)}
              style={{ cursor: isInteractive ? "pointer" : "default" }}
            >
              <path
                d={segPath(e.pos, innerR, innerInner)}
                fill={isCorrReveal ? "rgba(74,222,128,0.08)" : s.fill}
                stroke={isCorrReveal ? "#4ade80" : s.stroke}
                strokeWidth={isCorrReveal ? 2 : s.sw}
                opacity={s.op ?? 1}
                style={
                  isCorrReveal
                    ? { filter: "drop-shadow(0 0 8px rgba(74,222,128,0.3))" }
                    : s.dropShadow
                      ? { filter: s.dropShadow }
                      : s.shadow
                        ? { filter: `drop-shadow(0 0 10px ${s.shadow})` }
                        : {}
                }
              />
              {(labeled || isRef || isCorrReveal) && tc !== "transparent" && (
                <text
                  x={lp.x}
                  y={lp.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={500}
                  fontFamily="'Outfit',sans-serif"
                  fill={isCorrReveal ? "#4ade80" : tc}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {e.minor}
                </text>
              )}
              {!labeled &&
                !isRef &&
                !(activePos === e.pos && activeRing === "minor") && (
                  <circle
                    cx={lp.x}
                    cy={lp.y}
                    r={2.5}
                    fill="#2e2e3e"
                    opacity={0.2}
                    style={{ pointerEvents: "none" }}
                  />
                )}
            </g>
          );
        })}

        {/* Slide rule (on top) */}
        {renderSlideRule()}

        {/* Center circle */}
        <circle
          cx={cx}
          cy={cy}
          r={centerR}
          fill={overCancel ? "rgba(248,113,113,0.06)" : "rgba(12,10,20,1)"}
          stroke={
            overCancel
              ? "#f87171"
              : activePos !== null
                ? "rgba(100,80,140,0.4)"
                : "rgba(70,60,100,0.3)"
          }
          strokeWidth={overCancel ? 2 : 1}
          strokeDasharray={activePos !== null && dragging ? "6 3" : "none"}
        />

        {/* Center content via foreignObject */}
        <foreignObject
          x={cx - centerR + 4}
          y={cy - centerR + 4}
          width={centerR * 2 - 8}
          height={centerR * 2 - 8}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              position: "relative",
              opacity: overCancel ? 0.15 : 1,
              transition: "opacity 0.1s",
            }}
          >
            {overCancel && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  zIndex: 10,
                  opacity: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    color: "#f87171",
                    opacity: 0.8,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "#f87171",
                    fontFamily: "'DM Sans',sans-serif",
                    marginTop: 2,
                    opacity: 0.7,
                  }}
                >
                  cancel
                </div>
              </div>
            )}
            {renderCenter()}
          </div>
        </foreignObject>
      </svg>

      {/* I don't know yet */}
      {!answered && question && (
        <button
          onClick={() => {
            setAnswered({
              correct: false,
              feedback: `→ ${question.correctAnswer}`,
            });
            onAnswer(false);
            setTimeout(newQuestion, 2200);
          }}
          style={{
            marginTop: 2,
            background: "none",
            border: "none",
            color: "#3d3852",
            fontSize: 12,
            fontFamily: "'DM Sans',sans-serif",
            cursor: "pointer",
          }}
        >
          I don&apos;t know yet
        </button>
      )}
    </div>
  );
}
