"use client";

import { useEffect, useMemo } from "react";
import { useStandardsStore } from "@/lib/stores/standards-store";
import { NotationView } from "@/components/standards-lab/NotationView";
import { BottomDock } from "@/components/standards-lab/BottomDock";
import { brand } from "@/lib/tokens";

export function StandardsLabClient() {
  const {
    catalog,
    selectedTuneId,
    selectTune,
    parseStatus,
    parseError,
    parsedStandard,
    detectedChords,
    notation,
    currentBar,
    playbackPosition,
  } = useStandardsStore();

  useEffect(() => {
    if (!selectedTuneId && catalog.length > 0) {
      selectTune(catalog[0]!.id);
    }
  }, [selectedTuneId, catalog, selectTune]);

  const selectedTune = catalog.find((t) => t.id === selectedTuneId);

  // Compute cursor progress within current bar (0-1)
  const cursorProgress = useMemo(() => {
    if (!parsedStandard || !notation) return undefined;
    const bpm = parsedStandard.tempoEvents[0]?.bpm ?? 120;
    const beatsPerBar = parsedStandard.timeSignature.numerator;
    const barDuration = (60 / bpm) * beatsPerBar;
    if (barDuration <= 0) return undefined;
    const barStart = currentBar * barDuration;
    const offset = playbackPosition - barStart;
    return Math.max(0, Math.min(1, offset / barDuration));
  }, [parsedStandard, notation, currentBar, playbackPosition]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: brand.night,
        color: brand.ivory,
        paddingBottom: 260,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px" }}>
        {/* Tune selector — dropdown + header (SCO-471 #2) */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#e0ddd4",
              }}
            >
              {selectedTune?.title ?? "Standards Lab"}
            </span>
            <select
              value={selectedTuneId ?? ""}
              onChange={(e) => selectTune(e.target.value)}
              style={{
                background: brand.graphite,
                border: `1px solid ${brand.steel}`,
                borderRadius: 4,
                color: brand.silver,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                padding: "3px 8px",
                cursor: "pointer",
              }}
            >
              {catalog.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          {selectedTune && (
            <div
              style={{
                fontSize: "0.55rem",
                fontFamily: "'IBM Plex Mono', monospace",
                color: "#666",
                marginTop: 2,
              }}
            >
              {selectedTune.key} · {selectedTune.form} · {selectedTune.style} ·{" "}
              {selectedTune.composer}
            </div>
          )}
        </div>

        {parseStatus === "loading" && (
          <div
            style={{
              color: brand.silver,
              fontSize: 13,
              fontFamily: "'IBM Plex Mono', monospace",
              padding: "40px 0",
            }}
          >
            Loading MIDI...
          </div>
        )}
        {parseStatus === "error" && (
          <div
            style={{ color: brand.incorrect, fontSize: 13, padding: "40px 0" }}
          >
            {parseError}
          </div>
        )}

        {notation && (
          <NotationView
            notation={notation}
            chords={detectedChords}
            currentBar={currentBar}
            cursorProgress={cursorProgress}
            parsedBpm={parsedStandard?.tempoEvents[0]?.bpm}
            barStartTimes={parsedStandard?.barStartTimes}
          />
        )}
      </div>

      <BottomDock
        parsed={parsedStandard}
        chords={detectedChords}
        currentBar={currentBar}
        playbackPosition={playbackPosition}
      />
    </div>
  );
}
