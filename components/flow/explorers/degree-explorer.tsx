"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { brand, degreeColors } from "@/lib/tokens";
import {
  ensureAudio,
  playNote,
  attackNote,
  releaseNote,
} from "@/lib/audio/solmisa-piano";

const DEGREES = [
  { degree: 1, label: "Do", semitones: 0, stability: "Tonic -- most stable" },
  {
    degree: 2,
    label: "Re",
    semitones: 2,
    stability: "Active -- wants to resolve",
  },
  {
    degree: 3,
    label: "Mi",
    semitones: 4,
    stability: "Warm -- defines major quality",
  },
  {
    degree: 4,
    label: "Fa",
    semitones: 5,
    stability: "Subdominant -- moderate tension",
  },
  {
    degree: 5,
    label: "Sol",
    semitones: 7,
    stability: "Dominant -- strong pull to tonic",
  },
  { degree: 6, label: "La", semitones: 9, stability: "Relative minor color" },
  {
    degree: 7,
    label: "Ti",
    semitones: 11,
    stability: "Leading tone -- strongest pull",
  },
] as const;

const ROOT_MIDI = 60; // Middle C

export function DegreeExplorer() {
  const [activeDegree, setActiveDegree] = useState<number | null>(null);
  const [droneActive, setDroneActive] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const toggleDrone = useCallback(async () => {
    if (droneActive) {
      releaseNote(ROOT_MIDI);
      setDroneActive(false);
    } else {
      setAudioLoading(true);
      await ensureAudio();
      setAudioLoading(false);
      await attackNote(ROOT_MIDI);
      setDroneActive(true);
    }
  }, [droneActive]);

  const playDegree = useCallback(async (deg: (typeof DEGREES)[number]) => {
    setAudioLoading(true);
    await ensureAudio();
    setAudioLoading(false);
    playNote(ROOT_MIDI + deg.semitones, "4n");
    setActiveDegree(deg.degree);
    setTimeout(() => setActiveDegree(null), 500);
  }, []);

  useEffect(() => {
    return () => {
      releaseNote(ROOT_MIDI);
    };
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
        Scale Degree Explorer
      </h1>
      <p className="mb-6 text-sm" style={{ color: brand.silver }}>
        Hear how each scale degree sounds against the root. Toggle the drone,
        then tap a degree.
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

      <button
        onClick={toggleDrone}
        className="mb-8 rounded-lg px-6 py-3 text-sm font-medium transition-all"
        style={{
          backgroundColor: droneActive ? brand.violet : brand.graphite,
          color: droneActive ? brand.night : brand.ivory,
          boxShadow: droneActive ? `0 0 20px ${brand.violet}40` : "none",
        }}
      >
        {droneActive ? "Drone On (C)" : "Start Drone (C)"}
      </button>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DEGREES.map((deg) => {
          const color = degreeColors[deg.degree];
          const isActive = activeDegree === deg.degree;

          return (
            <button
              key={deg.degree}
              onClick={() => playDegree(deg)}
              className="flex flex-col items-center rounded-xl p-4 transition-all"
              style={{
                backgroundColor: brand.slate,
                border: `2px solid ${isActive ? color : brand.steel}`,
                boxShadow: isActive ? `0 0 24px ${color}50` : "none",
                minHeight: 44,
              }}
            >
              <span className="text-2xl font-bold" style={{ color }}>
                {deg.degree}
              </span>
              <span
                className="mt-1 text-sm font-medium"
                style={{ color: brand.ivory }}
              >
                {deg.label}
              </span>
              <span
                className="mt-2 text-center text-xs leading-tight"
                style={{ color: brand.ash }}
              >
                {deg.stability}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
