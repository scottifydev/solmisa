"use client";

import { useCallback } from "react";
import type { ParsedStandard } from "@/types/standards-lab";
import { useStandardsPlayback } from "@/hooks/use-standards-playback";
import { brand } from "@/lib/tokens";

interface PlaybackControlsProps {
  parsed: ParsedStandard | null;
}

const FONT_BODY = "'DM Sans', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

export default function PlaybackControls({ parsed }: PlaybackControlsProps) {
  const {
    play,
    pause,
    stop,
    isPlaying,
    isPaused,
    position,
    tempoRatio,
    melodyMuted,
    harmonyMuted,
    setTempoRatio,
    setMelodyMuted,
    setHarmonyMuted,
    baseBpm,
  } = useStandardsPlayback(parsed);

  const currentBpm = Math.round(baseBpm * tempoRatio);
  const tempoPercent = Math.round(tempoRatio * 100);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const handleTempoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTempoRatio(Number(e.target.value) / 100);
    },
    [setTempoRatio],
  );

  const disabled = !parsed;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "10px 16px",
        background: brand.obsidian,
        border: `1px solid ${brand.steel}`,
        borderRadius: 8,
        fontFamily: FONT_BODY,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      {/* Play/Pause */}
      <button
        onClick={handlePlayPause}
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.violet,
          color: brand.obsidian,
          border: "none",
          borderRadius: 6,
          fontSize: 16,
          cursor: "pointer",
          fontFamily: FONT_BODY,
          flexShrink: 0,
        }}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "\u23F8" : "\u25B6"}
      </button>

      {/* Stop */}
      <button
        onClick={stop}
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.steel,
          color: brand.silver,
          border: "none",
          borderRadius: 6,
          fontSize: 16,
          cursor: "pointer",
          fontFamily: FONT_BODY,
          flexShrink: 0,
        }}
        aria-label="Stop"
      >
        {"\u23F9"}
      </button>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 24,
          background: brand.steel,
          flexShrink: 0,
        }}
      />

      {/* Tempo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, color: brand.ash, fontFamily: FONT_BODY }}>
          Tempo
        </span>
        <input
          type="range"
          min={50}
          max={200}
          value={tempoPercent}
          onChange={handleTempoChange}
          style={{
            width: 100,
            accentColor: brand.violet,
            cursor: "pointer",
          }}
          aria-label="Tempo ratio"
        />
        <span
          style={{
            fontSize: 12,
            color: brand.ivory,
            fontFamily: FONT_MONO,
            minWidth: 72,
            textAlign: "right",
          }}
        >
          {tempoPercent}% ({currentBpm})
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 24,
          background: brand.steel,
          flexShrink: 0,
        }}
      />

      {/* Melody mute */}
      <button
        onClick={() => setMelodyMuted(!melodyMuted)}
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: melodyMuted ? brand.steel : brand.violet,
          color: melodyMuted ? brand.ash : brand.obsidian,
          border: "none",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: FONT_BODY,
          flexShrink: 0,
        }}
        aria-label={melodyMuted ? "Unmute melody" : "Mute melody"}
        title="Melody"
      >
        M
      </button>

      {/* Harmony mute */}
      <button
        onClick={() => setHarmonyMuted(!harmonyMuted)}
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: harmonyMuted ? brand.steel : brand.info,
          color: harmonyMuted ? brand.ash : brand.obsidian,
          border: "none",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: FONT_BODY,
          flexShrink: 0,
        }}
        aria-label={harmonyMuted ? "Unmute harmony" : "Mute harmony"}
        title="Harmony"
      >
        H
      </button>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 24,
          background: brand.steel,
          flexShrink: 0,
        }}
      />

      {/* Position display */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, color: brand.ash, fontFamily: FONT_BODY }}>
          Bar
        </span>
        <span
          style={{
            fontSize: 14,
            color: brand.ivory,
            fontFamily: FONT_MONO,
            fontWeight: 600,
            minWidth: 28,
            textAlign: "right",
          }}
        >
          {position.bar}
        </span>
        <span style={{ fontSize: 11, color: brand.ash, fontFamily: FONT_MONO }}>
          {formatTime(position.time)}
        </span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
