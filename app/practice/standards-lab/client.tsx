"use client";

import { useEffect } from "react";
import { useStandardsStore } from "@/lib/stores/standards-store";
import { NotationView } from "@/components/standards-lab/NotationView";
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
    chordDetectionStatus,
    notation,
    currentBar,
  } = useStandardsStore();

  // Load default tune on mount
  useEffect(() => {
    if (!selectedTuneId && catalog.length > 0) {
      selectTune(catalog[0]!.id);
    }
  }, [selectedTuneId, catalog, selectTune]);

  const selectedTune = catalog.find((t) => t.id === selectedTuneId);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: brand.night,
        color: brand.ivory,
        padding: "24px",
      }}
    >
      {/* Tune Selector */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Standards Lab
        </h1>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          {catalog.map((tune) => (
            <button
              key={tune.id}
              onClick={() => selectTune(tune.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: `1px solid ${tune.id === selectedTuneId ? brand.violet : brand.steel}`,
                background:
                  tune.id === selectedTuneId ? brand.graphite : brand.obsidian,
                color: tune.id === selectedTuneId ? brand.violet : brand.silver,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tune.title}
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  color: brand.ash,
                }}
              >
                {tune.key}
              </span>
            </button>
          ))}
        </div>

        {/* Status */}
        {parseStatus === "loading" && (
          <div
            style={{
              color: brand.silver,
              fontSize: 13,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Loading MIDI...
          </div>
        )}

        {parseStatus === "error" && (
          <div style={{ color: brand.incorrect, fontSize: 13 }}>
            Error: {parseError}
          </div>
        )}

        {/* Notation */}
        {notation && (
          <div style={{ marginBottom: 24 }}>
            <NotationView notation={notation} currentBar={currentBar} />
          </div>
        )}

        {/* Parse results (debug view) */}
        {parseStatus === "ready" && parsedStandard && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <StatCard label="Title" value={parsedStandard.title} />
              <StatCard label="Key" value={parsedStandard.keySignature} />
              <StatCard
                label="Time"
                value={`${parsedStandard.timeSignature.numerator}/${parsedStandard.timeSignature.denominator}`}
              />
              <StatCard label="Bars" value={String(parsedStandard.totalBars)} />
              <StatCard
                label="Tempo"
                value={
                  parsedStandard.tempoEvents[0]
                    ? `${Math.round(parsedStandard.tempoEvents[0].bpm)} BPM`
                    : "—"
                }
              />
              <StatCard
                label="Duration"
                value={`${Math.round(parsedStandard.durationSeconds)}s`}
              />
              <StatCard
                label="Melody notes"
                value={String(parsedStandard.tracks.melody.length)}
              />
              <StatCard
                label="Harmony notes"
                value={String(parsedStandard.tracks.harmony.length)}
              />
            </div>

            {/* Text events (may contain chord info) */}
            {parsedStandard.textEvents.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: brand.silver,
                    marginBottom: 8,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  MIDI Text Events
                </h3>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: brand.ash,
                    background: brand.obsidian,
                    border: `1px solid ${brand.steel}`,
                    borderRadius: 8,
                    padding: 12,
                    maxHeight: 120,
                    overflow: "auto",
                  }}
                >
                  {parsedStandard.textEvents.map((t, i) => (
                    <div key={i}>{t}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Melody note range debug */}
            <TrackSummary
              label="Melody"
              notes={parsedStandard.tracks.melody}
              color={brand.violet}
            />
            <TrackSummary
              label="Harmony"
              notes={parsedStandard.tracks.harmony}
              color={brand.info}
            />

            {/* Detected Chords */}
            {chordDetectionStatus === "ready" && detectedChords.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: brand.silver,
                    marginBottom: 8,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Detected Chords ({detectedChords.length})
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    background: brand.obsidian,
                    border: `1px solid ${brand.steel}`,
                    borderRadius: 8,
                    padding: 12,
                    maxHeight: 240,
                    overflow: "auto",
                  }}
                >
                  {detectedChords.map((chord, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        background:
                          chord.function.functionType === "dominant"
                            ? "rgba(248,113,113,0.15)"
                            : chord.function.functionType === "subdominant"
                              ? "rgba(96,165,250,0.15)"
                              : chord.function.functionType === "tonic"
                                ? "rgba(74,222,128,0.15)"
                                : "rgba(160,155,179,0.1)",
                        border: `1px solid ${brand.steel}`,
                        fontSize: 12,
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: brand.ivory,
                        lineHeight: 1.4,
                      }}
                      title={`Bar ${chord.bar + 1} · ${chord.function.romanNumeral} · ${chord.voicingType} · conf ${(chord.confidence * 100).toFixed(0)}%`}
                    >
                      <span style={{ fontWeight: 700 }}>{chord.symbol}</span>
                      <span
                        style={{
                          marginLeft: 4,
                          fontSize: 10,
                          color: brand.ash,
                        }}
                      >
                        {chord.function.romanNumeral}
                      </span>
                    </div>
                  ))}
                </div>
                {detectedChords[0] && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: brand.ash,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    Key center: {detectedChords[0].function.keyCenter}
                  </div>
                )}
              </div>
            )}
            {chordDetectionStatus === "running" && (
              <div style={{ color: brand.silver, fontSize: 13, marginTop: 12 }}>
                Detecting chords...
              </div>
            )}

            {/* Sections from catalog */}
            {selectedTune?.sections && (
              <div style={{ marginTop: 16 }}>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: brand.silver,
                    marginBottom: 8,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Form: {selectedTune.form}
                </h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {selectedTune.sections.map((s) => (
                    <div
                      key={s.label}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 6,
                        background: brand.graphite,
                        border: `1px solid ${brand.steel}`,
                        fontSize: 12,
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: brand.silver,
                      }}
                    >
                      {s.label}: bars {s.startBar + 1}–{s.endBar + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: brand.obsidian,
        border: `1px solid ${brand.steel}`,
        borderRadius: 8,
        padding: "10px 14px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: brand.ash,
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "'Outfit', sans-serif",
          color: brand.ivory,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TrackSummary({
  label,
  notes,
  color,
}: {
  label: string;
  notes: { midi: number; bar: number }[];
  color: string;
}) {
  if (notes.length === 0) return null;
  const midis = notes.map((n) => n.midi);
  const lowest = Math.min(...midis);
  const highest = Math.max(...midis);
  const bars = new Set(notes.map((n) => n.bar));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 0",
        borderBottom: `1px solid ${brand.steel}`,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          background: color,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          color: brand.silver,
          width: 70,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          fontFamily: "'IBM Plex Mono', monospace",
          color: brand.ash,
        }}
      >
        {notes.length} notes · MIDI {lowest}–{highest} · {bars.size} bars
      </div>
    </div>
  );
}
