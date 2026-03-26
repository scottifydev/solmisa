"use client";

// ─── Mini Piano Keyboard (2 octaves C3–B4) ─────────────────

const NOTE_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

const BLACK_KEY_INDICES = new Set([1, 3, 6, 8, 10]);

const START_MIDI = 48; // C3
const END_MIDI = 71; // B4
const KEY_COUNT = END_MIDI - START_MIDI + 1;

const WHITE_KEY_W = 26;
const WHITE_KEY_H = 80;
const BLACK_KEY_W = 16;
const BLACK_KEY_H = 48;

// Black key X-offsets relative to each white key's left edge (by pitch class)
const BLACK_KEY_OFFSETS: Record<number, number> = {
  1: -BLACK_KEY_W / 2, // Db: offset from D's white key position
  3: -BLACK_KEY_W / 2, // Eb
  6: -BLACK_KEY_W / 2, // Gb
  8: -BLACK_KEY_W / 2, // Ab
  10: -BLACK_KEY_W / 2, // Bb
};

interface MiniKeyboardProps {
  chordTones: number[];
  rootPc: number;
  tensions: number[];
  avoidNotes: number[];
  onKeyClick?: (midi: number) => void;
}

interface KeyLayout {
  midi: number;
  pc: number;
  isBlack: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

function buildKeyLayout(): KeyLayout[] {
  const keys: KeyLayout[] = [];
  let whiteIndex = 0;

  // First pass: build white keys
  for (let midi = START_MIDI; midi <= END_MIDI; midi++) {
    const pc = midi % 12;
    if (!BLACK_KEY_INDICES.has(pc)) {
      keys.push({
        midi,
        pc,
        isBlack: false,
        x: whiteIndex * WHITE_KEY_W,
        y: 0,
        w: WHITE_KEY_W,
        h: WHITE_KEY_H,
      });
      whiteIndex++;
    }
  }

  // Second pass: build black keys positioned relative to neighboring whites
  const whiteKeys = keys.filter((k) => !k.isBlack);
  for (let midi = START_MIDI; midi <= END_MIDI; midi++) {
    const pc = midi % 12;
    if (!BLACK_KEY_INDICES.has(pc)) continue;

    // Find the next white key to the right
    const nextWhiteMidi = midi + 1;
    const nextWhite = whiteKeys.find((k) => k.midi === nextWhiteMidi);
    if (nextWhite) {
      const offset = BLACK_KEY_OFFSETS[pc] ?? 0;
      keys.push({
        midi,
        pc,
        isBlack: true,
        x: nextWhite.x + offset,
        y: 0,
        w: BLACK_KEY_W,
        h: BLACK_KEY_H,
      });
    }
  }

  return keys;
}

const KEY_LAYOUT = buildKeyLayout();

const whiteKeyCount = Array.from(
  { length: KEY_COUNT },
  (_, i) => START_MIDI + i,
).filter((m) => !BLACK_KEY_INDICES.has(m % 12)).length;

const SVG_WIDTH = whiteKeyCount * WHITE_KEY_W;
const SVG_HEIGHT = WHITE_KEY_H;

function getKeyFill(
  pc: number,
  isBlack: boolean,
  rootPc: number,
  chordTones: Set<number>,
  tensions: Set<number>,
  avoidNotes: Set<number>,
): { fill: string; opacity: number; highlighted: boolean } {
  if (pc === rootPc) {
    return { fill: "#f87171", opacity: 1, highlighted: true };
  }
  if (chordTones.has(pc)) {
    return { fill: "#60a5fa", opacity: 1, highlighted: true };
  }
  if (tensions.has(pc)) {
    return { fill: "#2dd4bf", opacity: 1, highlighted: true };
  }
  if (avoidNotes.has(pc)) {
    return { fill: "#ef4444", opacity: 0.4, highlighted: false };
  }
  return {
    fill: isBlack ? "#0a0a14" : "#1a1a2e",
    opacity: 1,
    highlighted: false,
  };
}

export function MiniKeyboard({
  chordTones,
  rootPc,
  tensions,
  avoidNotes,
  onKeyClick,
}: MiniKeyboardProps) {
  const chordSet = new Set(chordTones);
  const tensionSet = new Set(tensions);
  const avoidSet = new Set(avoidNotes);

  const whiteKeys = KEY_LAYOUT.filter((k) => !k.isBlack);
  const blackKeys = KEY_LAYOUT.filter((k) => k.isBlack);

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      width={SVG_WIDTH * (400 / SVG_WIDTH)}
      height={SVG_HEIGHT * (400 / SVG_WIDTH)}
      style={{ display: "block", cursor: "pointer" }}
    >
      {whiteKeys.map((key) => {
        const { fill, opacity, highlighted } = getKeyFill(
          key.pc,
          false,
          rootPc,
          chordSet,
          tensionSet,
          avoidSet,
        );
        return (
          <g key={key.midi} onClick={() => onKeyClick?.(key.midi)}>
            <rect
              x={key.x}
              y={key.y}
              width={key.w}
              height={key.h}
              rx={2}
              fill={fill}
              opacity={opacity}
              stroke="#2e2e3e"
              strokeWidth={1}
            />
            {highlighted && (
              <text
                x={key.x + key.w / 2}
                y={key.h - 6}
                textAnchor="middle"
                fontSize={8}
                fontFamily="'DM Sans', sans-serif"
                fill="#eae8e4"
              >
                {NOTE_NAMES[key.pc]}
              </text>
            )}
          </g>
        );
      })}
      {blackKeys.map((key) => {
        const { fill, opacity } = getKeyFill(
          key.pc,
          true,
          rootPc,
          chordSet,
          tensionSet,
          avoidSet,
        );
        return (
          <rect
            key={key.midi}
            x={key.x}
            y={key.y}
            width={key.w}
            height={key.h}
            rx={2}
            fill={fill}
            opacity={opacity}
            stroke="#1a1a2e"
            strokeWidth={1}
            onClick={() => onKeyClick?.(key.midi)}
          />
        );
      })}
    </svg>
  );
}
