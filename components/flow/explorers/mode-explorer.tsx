"use client";

import { useState, useCallback } from "react";
import * as Tone from "tone";
import Link from "next/link";
import { brand } from "@/lib/tokens";
import { ensureAudio } from "@/lib/audio/solmisa-piano";

interface ModeDef {
  name: string;
  intervals: number[];
  characteristicDegree: number;
  characteristicNote: string;
  color: string;
}

const MODES: ModeDef[] = [
  {
    name: "Lydian",
    intervals: [0, 2, 4, 6, 7, 9, 11, 12],
    characteristicDegree: 4,
    characteristicNote: "#4 -- raised fourth gives a bright, floating quality",
    color: "#fbbf24",
  },
  {
    name: "Ionian",
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    characteristicDegree: 7,
    characteristicNote: "Natural 7 -- standard major scale",
    color: "#f59e0b",
  },
  {
    name: "Mixolydian",
    intervals: [0, 2, 4, 5, 7, 9, 10, 12],
    characteristicDegree: 7,
    characteristicNote: "b7 -- dominant flavor, bluesy brightness",
    color: "#34d399",
  },
  {
    name: "Dorian",
    intervals: [0, 2, 3, 5, 7, 9, 10, 12],
    characteristicDegree: 6,
    characteristicNote: "Natural 6 -- minor with a bright sixth",
    color: "#60a5fa",
  },
  {
    name: "Aeolian",
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    characteristicDegree: 6,
    characteristicNote: "b6 -- natural minor, melancholic center",
    color: "#a78bfa",
  },
  {
    name: "Phrygian",
    intervals: [0, 1, 3, 5, 7, 8, 10, 12],
    characteristicDegree: 2,
    characteristicNote: "b2 -- dark, Spanish flavor from the flat second",
    color: "#c084fc",
  },
  {
    name: "Locrian",
    intervals: [0, 1, 3, 5, 6, 8, 10, 12],
    characteristicDegree: 5,
    characteristicNote: "b5 -- diminished, most unstable mode",
    color: "#ef4444",
  },
];

const ROOT_MIDI = 60;

export function ModeExplorer() {
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  const playMode = useCallback(async (mode: ModeDef) => {
    setAudioLoading(true);
    const s = await ensureAudio();
    setAudioLoading(false);
    setActiveMode(mode.name);

    const now = Tone.now();
    mode.intervals.forEach((semitone, idx) => {
      s.triggerAttackRelease(ROOT_MIDI + semitone, "8n", now + idx * 0.2);
    });

    setTimeout(() => setActiveMode(null), mode.intervals.length * 200 + 300);
  }, []);

  return (
    <div
      className="min-h-screen px-4 py-6"
      style={{ backgroundColor: brand.night, color: brand.ivory }}
    >
      <Link
        href="/flow"
        className="mb-6 inline-block text-sm"
        style={{ color: brand.silver }}
      >
        Back to Flow
      </Link>

      <h1 className="mb-2 text-2xl font-bold" style={{ color: brand.ivory }}>
        Mode Explorer
      </h1>
      <p className="mb-4 text-sm" style={{ color: brand.silver }}>
        Ordered from brightest (Lydian) to darkest (Locrian). Tap to hear the
        scale. The characteristic degree is what gives each mode its unique
        color.
      </p>

      {audioLoading && (
        <span
          style={{
            fontSize: 11,
            color: "#a09bb3",
            fontFamily: "'IBM Plex Mono',monospace",
          }}
        >
          Loading piano...
        </span>
      )}

      <div className="flex flex-col gap-3">
        {MODES.map((mode, idx) => {
          const isActive = activeMode === mode.name;
          const brightness = 1 - idx / (MODES.length - 1);
          const bgOpacity = 0.05 + brightness * 0.1;

          return (
            <button
              key={mode.name}
              onClick={() => playMode(mode)}
              className="flex flex-col rounded-xl p-4 text-left transition-all"
              style={{
                backgroundColor: `rgba(${parseInt(mode.color.slice(1, 3), 16)}, ${parseInt(mode.color.slice(3, 5), 16)}, ${parseInt(mode.color.slice(5, 7), 16)}, ${bgOpacity})`,
                border: `2px solid ${isActive ? mode.color : brand.steel}`,
                boxShadow: isActive ? `0 0 24px ${mode.color}50` : "none",
                minHeight: 44,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-lg font-bold"
                  style={{ color: mode.color }}
                >
                  {mode.name}
                </span>
                <span className="text-xs" style={{ color: brand.ash }}>
                  {idx === 0
                    ? "Brightest"
                    : idx === MODES.length - 1
                      ? "Darkest"
                      : ""}
                </span>
              </div>
              <span className="mt-1 text-xs" style={{ color: brand.silver }}>
                Characteristic: {mode.characteristicNote}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
