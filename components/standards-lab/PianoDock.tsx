"use client";

import { type CSSProperties, useMemo } from "react";
import { brand, type as typeTokens } from "@/lib/tokens";

// ─── Constants ───────────────────────────────────────────────

const START_MIDI = 36; // C2
const END_MIDI = 83; // B5

const WHITE_KEY_W = 24;
const WHITE_KEY_H = 80;
const BLACK_KEY_W = 14;
const BLACK_KEY_H = 50;

const BLACK_PCS = new Set([1, 3, 6, 8, 10]);

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

const LH_RH_SPLIT_MIDI = 60; // C4

// ─── Color Palette (SCO-470) ────────────────────────────────

const COLORS = {
  melody: "#f0c97a",
  voicing: "#3C3489",
  root: "#993C1D",
  scale: "#0F6E56",
  avoid: "#791F1F",
  ghostBorder: "#7F77DD55",
  commonTone: "#5DCAA5",
  whiteKey: "#1a1a1f",
  whiteKeyBorder: "#333",
  blackKey: "#0a0a0e",
  separator: "#f0c97a",
} as const;

// ─── Types ───────────────────────────────────────────────────

interface PianoDockProps {
  melodyMidi: number | null;
  voicingMidis: number[];
  rootPc: number;
  scalePcs: number[];
  avoidPcs: number[];
  ghostMidis: number[];
  commonToneMidis: number[];
  showScale: boolean;
  onKeyClick?: (midi: number) => void;
  compact?: boolean;
}

interface KeyDef {
  midi: number;
  pc: number;
  isBlack: boolean;
  x: number;
}

// ─── Key Layout ──────────────────────────────────────────────

function buildLayout(): { keys: KeyDef[]; totalWidth: number } {
  const keys: KeyDef[] = [];
  let whiteIdx = 0;

  // White keys first
  for (let midi = START_MIDI; midi <= END_MIDI; midi++) {
    const pc = midi % 12;
    if (!BLACK_PCS.has(pc)) {
      keys.push({ midi, pc, isBlack: false, x: whiteIdx * WHITE_KEY_W });
      whiteIdx++;
    }
  }

  const totalWidth = whiteIdx * WHITE_KEY_W;

  // Black keys positioned between whites
  const whites = keys.filter((k) => !k.isBlack);
  for (let midi = START_MIDI; midi <= END_MIDI; midi++) {
    const pc = midi % 12;
    if (!BLACK_PCS.has(pc)) continue;

    const nextWhite = whites.find((k) => k.midi === midi + 1);
    if (nextWhite) {
      keys.push({
        midi,
        pc,
        isBlack: true,
        x: nextWhite.x - BLACK_KEY_W / 2,
      });
    }
  }

  return { keys, totalWidth };
}

const LAYOUT = buildLayout();

// ─── Separator X position (left edge of first RH white key, C4) ─

const separatorX = (() => {
  const c4Key = LAYOUT.keys.find(
    (k) => k.midi === LH_RH_SPLIT_MIDI && !k.isBlack,
  );
  return c4Key ? c4Key.x : 0;
})();

// ─── Key Styling ─────────────────────────────────────────────

type KeyRole =
  | "melody"
  | "voicing"
  | "root"
  | "scale"
  | "avoid"
  | "ghost"
  | "commonTone"
  | "default";

function resolveRole(
  midi: number,
  _pc: number,
  melodyMidi: number | null,
  voicingSet: Set<number>,
  rootPc: number,
  scaleSet: Set<number>,
  avoidSet: Set<number>,
  ghostSet: Set<number>,
  commonSet: Set<number>,
  showScale: boolean,
): KeyRole {
  if (melodyMidi !== null && midi === melodyMidi) return "melody";
  if (voicingSet.has(midi)) return "voicing";
  // Root: only highlight if this specific MIDI note is in the voicing AND is the root pitch class
  if (voicingSet.size > 0 && midi % 12 === rootPc && voicingSet.has(midi))
    return "root";
  if (ghostSet.has(midi)) return "ghost";
  if (commonSet.has(midi)) return "commonTone";
  // Scale/avoid: only in RH range (above split), only when toggle is on
  if (showScale && midi >= LH_RH_SPLIT_MIDI && scaleSet.has(midi % 12))
    return "scale";
  if (showScale && midi >= LH_RH_SPLIT_MIDI && avoidSet.has(midi % 12))
    return "avoid";
  return "default";
}

function keyStyle(role: KeyRole, isBlack: boolean): CSSProperties {
  const base = isBlack ? COLORS.blackKey : COLORS.whiteKey;

  switch (role) {
    case "melody":
      return {
        background: COLORS.melody,
        boxShadow: `0 0 12px 4px ${COLORS.melody}88`,
        border: "1px solid " + COLORS.melody,
      };
    case "voicing":
      return {
        background: COLORS.voicing,
        border: "1px solid #5548b5",
      };
    case "root":
      return {
        background: COLORS.root,
        border: "1px solid #c44e2a",
      };
    case "scale":
      return {
        background: COLORS.scale,
        border: "1px solid #139172",
      };
    case "avoid":
      return {
        background: COLORS.avoid,
        border: "1px solid #a12b2b",
      };
    case "ghost":
      return {
        background: "transparent",
        border: `2px dotted ${COLORS.ghostBorder}`,
      };
    case "commonTone":
      return {
        background: base,
        border: `2px solid ${COLORS.commonTone}`,
      };
    default:
      return {
        background: base,
        border: `1px solid ${COLORS.whiteKeyBorder}`,
      };
  }
}

// ─── Legend ───────────────────────────────────────────────────

const LEGEND: { label: string; color: string; outline?: boolean }[] = [
  { label: "Melody", color: COLORS.melody },
  { label: "Voicing", color: COLORS.voicing },
  { label: "Scale", color: COLORS.scale },
  { label: "Root", color: COLORS.root },
  { label: "Next", color: "transparent", outline: true },
];

// ─── Component ───────────────────────────────────────────────

export function PianoDock({
  melodyMidi,
  voicingMidis,
  rootPc,
  scalePcs,
  avoidPcs,
  ghostMidis,
  commonToneMidis,
  showScale,
  onKeyClick,
  compact = false,
}: PianoDockProps) {
  const keyH = compact ? 48 : WHITE_KEY_H;
  const blackH = compact ? 30 : BLACK_KEY_H;
  const voicingSet = useMemo(() => new Set(voicingMidis), [voicingMidis]);
  const scaleSet = useMemo(() => new Set(scalePcs), [scalePcs]);
  const avoidSet = useMemo(() => new Set(avoidPcs), [avoidPcs]);
  const ghostSet = useMemo(() => new Set(ghostMidis), [ghostMidis]);
  const commonSet = useMemo(() => new Set(commonToneMidis), [commonToneMidis]);

  const whiteKeys = LAYOUT.keys.filter((k) => !k.isBlack);
  const blackKeys = LAYOUT.keys.filter((k) => k.isBlack);

  return (
    <div style={{ width: "100%", background: brand.night }}>
      {/* Zone labels — hidden in compact/landscape */}
      {!compact && (
        <div
          style={{
            position: "relative",
            width: LAYOUT.totalWidth,
            margin: "0 auto",
            height: 20,
            fontFamily: typeTokens.body,
            fontSize: 10,
            letterSpacing: "0.05em",
            color: brand.ash,
            userSelect: "none",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: separatorX / 2,
              top: 2,
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            &larr; VOICING (LH)
          </span>
          <span
            style={{
              position: "absolute",
              left: separatorX + (LAYOUT.totalWidth - separatorX) / 2,
              top: 2,
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            SCALE (RH) &rarr;
          </span>
        </div>
      )}

      {/* Scrollable keyboard */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          style={{
            position: "relative",
            width: LAYOUT.totalWidth,
            height: keyH,
            margin: "0 auto",
          }}
        >
          {/* White keys */}
          {whiteKeys.map((key) => {
            const role = resolveRole(
              key.midi,
              key.pc,
              melodyMidi,
              voicingSet,
              rootPc,
              scaleSet,
              avoidSet,
              ghostSet,
              commonSet,
              showScale,
            );
            const style = keyStyle(role, false);
            const showLabel = role !== "default" && role !== "ghost";
            const octave = Math.floor(key.midi / 12) - 1;

            return (
              <div
                key={key.midi}
                role="button"
                tabIndex={0}
                aria-label={`${NOTE_NAMES[key.pc]}${octave}`}
                onClick={() => onKeyClick?.(key.midi)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    onKeyClick?.(key.midi);
                }}
                style={{
                  position: "absolute",
                  left: key.x,
                  top: 0,
                  width: WHITE_KEY_W,
                  height: keyH,
                  borderRadius: "0 0 3px 3px",
                  cursor: "pointer",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 4,
                  boxSizing: "border-box",
                  transition: "all 0.3s ease",
                  ...style,
                }}
              >
                {showLabel && (
                  <span
                    style={{
                      fontSize: 8,
                      fontFamily: typeTokens.mono,
                      color: role === "melody" ? brand.night : brand.ivory,
                      lineHeight: 1,
                    }}
                  >
                    {NOTE_NAMES[key.pc]}
                  </span>
                )}
              </div>
            );
          })}

          {/* Black keys */}
          {blackKeys.map((key) => {
            const role = resolveRole(
              key.midi,
              key.pc,
              melodyMidi,
              voicingSet,
              rootPc,
              scaleSet,
              avoidSet,
              ghostSet,
              commonSet,
              showScale,
            );
            const style = keyStyle(role, true);
            const octave = Math.floor(key.midi / 12) - 1;

            return (
              <div
                key={key.midi}
                role="button"
                tabIndex={0}
                aria-label={`${NOTE_NAMES[key.pc]}${octave}`}
                onClick={() => onKeyClick?.(key.midi)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    onKeyClick?.(key.midi);
                }}
                style={{
                  position: "absolute",
                  left: key.x,
                  top: 0,
                  width: BLACK_KEY_W,
                  height: blackH,
                  borderRadius: "0 0 2px 2px",
                  cursor: "pointer",
                  zIndex: 2,
                  boxSizing: "border-box",
                  transition: "all 0.3s ease",
                  ...style,
                }}
              />
            );
          })}

          {/* Gold octave separator */}
          <div
            style={{
              position: "absolute",
              left: separatorX - 1,
              top: 0,
              width: 2,
              height: keyH,
              background: COLORS.separator,
              zIndex: 3,
              pointerEvents: "none",
              opacity: 0.7,
            }}
          />
        </div>
      </div>

      {/* Legend row — hidden in compact/landscape */}
      {!compact && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 14,
            padding: "6px 0 8px",
            fontFamily: typeTokens.body,
            fontSize: 10,
            color: brand.silver,
            userSelect: "none",
          }}
        >
          {LEGEND.map((item) => (
            <span
              key={item.label}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: item.outline ? "transparent" : item.color,
                  border: item.outline
                    ? `2px dotted ${COLORS.ghostBorder}`
                    : `1px solid ${item.color}`,
                  boxSizing: "border-box",
                }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
