"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { ParsedStandard, AnalyzedChord } from "@/types/standards-lab";
import { useStandardsStore } from "@/lib/stores/standards-store";
import { useStandardsPlayback } from "@/hooks/use-standards-playback";
import { PianoDock } from "./PianoDock";
import { playNote } from "@/lib/audio/solmisa-piano";
import {
  CHORD_TONES,
  AVAILABLE_TENSIONS,
  AVOID_NOTES,
} from "@/lib/midi/voicing-templates";

// ─── Colors ──────────────────────────────────────────────────

const AMBER = "#f0c97a";
const BG = "#0a0a10";
const BORDER = "#1e1e28";
const DIM = "#555";
const SILVER = "#a09bb3";
const VIOLET = "#b794f6";
const BLUE = "#60a5fa";
const TEAL = "#5DCAA5";

// ─── Component ───────────────────────────────────────────────

interface BottomDockProps {
  parsed: ParsedStandard | null;
  chords: AnalyzedChord[];
  currentBar: number;
  playbackPosition: number;
}

export function BottomDock({
  parsed,
  chords,
  currentBar,
  playbackPosition,
}: BottomDockProps) {
  const {
    play,
    pause,
    stop,
    isPlaying,
    isPaused,
    tempoRatio,
    setTempoRatio,
    melodyMuted,
    setMelodyMuted,
    harmonyMuted,
    setHarmonyMuted,
    position,
    baseBpm,
    continuousTime,
  } = useStandardsPlayback(parsed);

  const [showScale, setShowScale] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const scrubberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () =>
      setIsLandscape(
        window.innerHeight < window.innerWidth && window.innerHeight < 500,
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeBar = isPlaying || isPaused ? position.bar - 1 : currentBar;
  const activeTime = isPlaying || isPaused ? position.time : playbackPosition;
  const setCurrentBar = useStandardsStore((s) => s.setCurrentBar);

  // Sync playback bar to store so NotationView can highlight it
  useEffect(() => {
    if (isPlaying || isPaused) {
      setCurrentBar(activeBar);
    }
  }, [activeBar, isPlaying, isPaused, setCurrentBar]);

  // Find active chord at current position
  const activeChord = useMemo(() => {
    if (chords.length === 0) return null;
    let active: AnalyzedChord | null = null;
    for (const chord of chords) {
      if (chord.time <= activeTime + 0.05) active = chord;
      else break;
    }
    return active;
  }, [chords, activeTime]);

  // Find next chord for ghost preview
  const nextChord = useMemo(() => {
    if (!activeChord || chords.length === 0) return null;
    const idx = chords.indexOf(activeChord);
    return idx >= 0 && idx < chords.length - 1 ? chords[idx + 1]! : null;
  }, [chords, activeChord]);

  // Compute piano key states from active chord
  const pianoState = useMemo(() => {
    if (!activeChord) {
      return {
        melodyMidi: null as number | null,
        voicingMidis: [] as number[],
        rootPc: 0,
        scalePcs: [] as number[],
        avoidPcs: [] as number[],
        ghostMidis: [] as number[],
        commonToneMidis: [] as number[],
      };
    }

    const rootPc = activeChord.rootMidi % 12;

    // Scale/avoid are template-derived — only shown when Scale toggle is ON
    const scalePcs = showScale
      ? [
          ...(CHORD_TONES[activeChord.quality]?.map((i) => (rootPc + i) % 12) ??
            []),
          ...(AVAILABLE_TENSIONS[activeChord.quality]?.map(
            (i) => (rootPc + i) % 12,
          ) ?? []),
        ]
      : [];
    const avoidPcs = showScale
      ? (AVOID_NOTES[activeChord.quality]?.map((i) => (rootPc + i) % 12) ?? [])
      : [];

    // Ghost and common tones — from actual MIDI notes only
    let ghostMidis: number[] = [];
    let commonToneMidis: number[] = [];
    if (nextChord) {
      const currentSet = new Set(activeChord.notes);
      ghostMidis = nextChord.notes.filter((n) => !currentSet.has(n));
      commonToneMidis = nextChord.notes.filter((n) => currentSet.has(n));
    }

    return {
      melodyMidi: position.melodyMidi,
      voicingMidis: activeChord.notes, // actual MIDI notes from LH track
      rootPc,
      scalePcs,
      avoidPcs,
      ghostMidis,
      commonToneMidis,
    };
  }, [activeChord, nextChord, showScale]);

  // Tempo
  const effectiveBpm = Math.round(baseBpm * tempoRatio);

  // Time formatting
  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const totalDuration = parsed?.durationSeconds ?? 0;
  // Use continuousTime (rAF-driven) for smooth scrubber, activeTime for chord/note tracking
  const scrubberTime = isPlaying ? continuousTime : activeTime;
  const progress = totalDuration > 0 ? scrubberTime / totalDuration : 0;

  // Scale info for chord info strip
  const scaleLabel = activeChord?.compatibleScales[0] ?? "";
  const functionLabel = activeChord?.function.romanNumeral ?? "";
  const keyLabel = activeChord?.function.keyCenter ?? "";

  const handleKeyClick = useCallback((midi: number) => {
    playNote(midi, "8n", 0.7);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: BG,
        borderTop: `1px solid ${BORDER}`,
        zIndex: 100,
      }}
    >
      {/* Transport + Scrubber — merged in landscape */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isLandscape ? 8 : 12,
          padding: isLandscape ? "4px 12px" : "8px 16px",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <button
          onClick={() => {
            if (isPlaying) pause();
            else play();
          }}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            border: `1.5px solid ${isPlaying ? AMBER : DIM}`,
            background: isPlaying ? `${AMBER}22` : "transparent",
            color: isPlaying ? AMBER : SILVER,
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isPlaying ? "\u23F8" : "\u25B6"}
        </button>
        <button
          onClick={stop}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            border: `1.5px solid ${DIM}`,
            background: "transparent",
            color: SILVER,
            fontSize: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {"\u25A0"}
        </button>
        <button
          onClick={() => setMelodyMuted(!melodyMuted)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            border: `1px solid ${melodyMuted ? DIM : VIOLET}`,
            background: melodyMuted ? "transparent" : `${VIOLET}22`,
            color: melodyMuted ? DIM : VIOLET,
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
        >
          M
        </button>
        <button
          onClick={() => setHarmonyMuted(!harmonyMuted)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            border: `1px solid ${harmonyMuted ? DIM : BLUE}`,
            background: harmonyMuted ? "transparent" : `${BLUE}22`,
            color: harmonyMuted ? DIM : BLUE,
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
        >
          H
        </button>

        {/* Scrubber inline in landscape */}
        {isLandscape && (
          <div style={{ flex: 1, margin: "0 8px" }}>
            <div
              style={{
                height: 6,
                background: "#1a1a24",
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress * 100}%`,
                  background: `linear-gradient(90deg, ${AMBER}88, ${AMBER})`,
                  borderRadius: 3,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `${progress * 100}%`,
                  top: -4,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: AMBER,
                  boxShadow: `0 0 6px ${AMBER}66`,
                  transform: "translateX(-6px)",
                }}
              />
            </div>
          </div>
        )}

        {!isLandscape && (
          <span
            style={{
              fontSize: 11,
              color: DIM,
              fontFamily: "'DM Sans', sans-serif",
              marginLeft: 8,
            }}
          >
            Tempo
          </span>
        )}
        <input
          type="range"
          min={25}
          max={150}
          value={Math.round(tempoRatio * 100)}
          onChange={(e) => setTempoRatio(Number(e.target.value) / 100)}
          style={{ width: isLandscape ? 60 : 100, accentColor: AMBER }}
        />
        <span
          style={{
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            color: AMBER,
            minWidth: 30,
          }}
        >
          {effectiveBpm}
        </span>
        <div
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontFamily: "'IBM Plex Mono', monospace",
            color: SILVER,
          }}
        >
          Bar {activeBar + 1} · {formatTime(scrubberTime)}
        </div>
      </div>

      {/* Scrubber — separate row in portrait only */}
      {!isLandscape && (
        <div
          ref={scrubberRef}
          style={{ padding: "6px 16px", borderBottom: `1px solid ${BORDER}` }}
        >
          <div
            style={{
              height: 8,
              background: "#1a1a24",
              borderRadius: 4,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, ${AMBER}88, ${AMBER})`,
                borderRadius: 4,
                transition: isPlaying ? "none" : "width 0.2s",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${progress * 100}%`,
                top: -3,
                width: 14,
                height: 14,
                borderRadius: 7,
                background: AMBER,
                boxShadow: `0 0 8px ${AMBER}66`,
                transform: "translateX(-7px)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: DIM,
              fontFamily: "'IBM Plex Mono', monospace",
              marginTop: 2,
            }}
          >
            <span>{formatTime(activeTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      )}

      {/* Chord Info Strip */}
      {activeChord && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "6px 16px",
            borderBottom: `1px solid ${BORDER}`,
            fontSize: 13,
          }}
        >
          <span
            style={{
              color: AMBER,
              fontWeight: 700,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.85rem",
            }}
          >
            {activeChord.symbol}
          </span>
          <span style={{ color: SILVER, fontFamily: "'DM Sans', sans-serif" }}>
            {functionLabel}
          </span>
          <span style={{ color: DIM }}>·</span>
          <span style={{ color: DIM, fontFamily: "'DM Sans', sans-serif" }}>
            Key: {keyLabel}
          </span>
          {scaleLabel && (
            <span
              style={{
                padding: "1px 8px",
                borderRadius: 4,
                background: `${BLUE}22`,
                color: BLUE,
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {scaleLabel}
            </span>
          )}
          <button
            onClick={() => setShowScale(!showScale)}
            style={{
              marginLeft: "auto",
              padding: "2px 10px",
              borderRadius: 4,
              border: `1px solid ${showScale ? TEAL : DIM}`,
              background: showScale ? `${TEAL}22` : "transparent",
              color: showScale ? TEAL : DIM,
              fontSize: 11,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
            }}
          >
            Scale
          </button>
        </div>
      )}

      {/* Piano */}
      <PianoDock
        melodyMidi={pianoState.melodyMidi}
        voicingMidis={pianoState.voicingMidis}
        rootPc={pianoState.rootPc}
        scalePcs={pianoState.scalePcs}
        avoidPcs={pianoState.avoidPcs}
        ghostMidis={pianoState.ghostMidis}
        commonToneMidis={pianoState.commonToneMidis}
        showScale={showScale}
        onKeyClick={handleKeyClick}
        compact={isLandscape}
      />
    </div>
  );
}
