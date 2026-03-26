"use client";

import { useEffect } from "react";
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
