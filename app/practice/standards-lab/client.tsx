"use client";

import { useEffect } from "react";
import { useStandardsStore } from "@/lib/stores/standards-store";
import { NotationView } from "@/components/standards-lab/NotationView";
import PlaybackControls from "@/components/standards-lab/PlaybackControls";
import { AnalysisPanel } from "@/components/standards-lab/AnalysisPanel";
import { playNote } from "@/lib/audio/solmisa-piano";
import { brand } from "@/lib/tokens";

export function StandardsLabClient() {
  const {
    catalog,
    selectedTuneId,
    selectTune,
    parsedStandard,
    parseStatus,
    parseError,
    detectedChords,
    notation,
    currentBar,
    activeChordIndex,
    setActiveChordIndex,
  } = useStandardsStore();

  // Load default tune on mount
  useEffect(() => {
    if (!selectedTuneId && catalog.length > 0) {
      selectTune(catalog[0]!.id);
    }
  }, [selectedTuneId, catalog, selectTune]);

  const activeChord = detectedChords[activeChordIndex] ?? null;

  function handleKeyClick(midi: number) {
    playNote(midi, "8n", 0.7);
  }

  function handleChordClick(index: number) {
    setActiveChordIndex(index);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: brand.night,
        color: brand.ivory,
        padding: "16px 24px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          Standards Lab
        </h1>

        {/* Tune Selector */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {catalog.map((tune) => (
            <button
              key={tune.id}
              onClick={() => selectTune(tune.id)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: `1px solid ${tune.id === selectedTuneId ? brand.violet : brand.steel}`,
                background:
                  tune.id === selectedTuneId ? brand.graphite : "transparent",
                color: tune.id === selectedTuneId ? brand.violet : brand.silver,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tune.title}
              <span style={{ marginLeft: 5, fontSize: 10, color: brand.ash }}>
                {tune.key}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
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

        {/* Main content: notation + analysis side by side */}
        {notation && (
          <>
            {/* Playback controls */}
            <PlaybackControls parsed={parsedStandard} />

            {/* Layout: notation (left) + analysis (right) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 320px",
                gap: 16,
                marginTop: 12,
              }}
            >
              {/* Notation */}
              <div>
                <NotationView notation={notation} currentBar={currentBar} />

                {/* Chord progression bar */}
                {detectedChords.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 3,
                      marginTop: 12,
                      padding: 10,
                      background: brand.obsidian,
                      border: `1px solid ${brand.steel}`,
                      borderRadius: 8,
                    }}
                  >
                    {detectedChords.map((chord, i) => (
                      <button
                        key={i}
                        onClick={() => handleChordClick(i)}
                        style={{
                          padding: "2px 7px",
                          borderRadius: 4,
                          border: `1px solid ${i === activeChordIndex ? brand.violet : brand.steel}`,
                          background:
                            i === activeChordIndex
                              ? "rgba(183,148,246,0.15)"
                              : "transparent",
                          fontSize: 11,
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontWeight: 600,
                          color:
                            i === activeChordIndex
                              ? brand.violet
                              : brand.silver,
                          cursor: "pointer",
                          transition: "all 0.1s",
                        }}
                      >
                        {chord.symbol}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Analysis panel */}
              <AnalysisPanel chord={activeChord} onKeyClick={handleKeyClick} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
