"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as Tone from "tone";
import Link from "next/link";
import { brand, degreeColors } from "@/lib/tokens";

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

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function DegreeExplorer() {
  const [activeDegree, setActiveDegree] = useState<number | null>(null);
  const [droneActive, setDroneActive] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const droneRef = useRef<Tone.FMSynth | null>(null);
  const melodySynthRef = useRef<Tone.FMSynth | null>(null);

  const initAudio = useCallback(async () => {
    if (audioReady) return;
    await Tone.start();

    droneRef.current = new Tone.FMSynth({
      oscillator: { type: "fmsine" },
      envelope: { attack: 0.3, decay: 0.1, sustain: 0.8, release: 1 },
      volume: -18,
    }).toDestination();

    melodySynthRef.current = new Tone.FMSynth({
      oscillator: { type: "fmsine" },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 0.5 },
      volume: -8,
    }).toDestination();

    setAudioReady(true);
  }, [audioReady]);

  const toggleDrone = useCallback(async () => {
    await initAudio();
    if (droneActive) {
      droneRef.current?.triggerRelease();
      setDroneActive(false);
    } else {
      const freq = midiToFreq(ROOT_MIDI);
      droneRef.current?.triggerAttack(freq);
      setDroneActive(true);
    }
  }, [droneActive, initAudio]);

  const playDegree = useCallback(
    async (deg: (typeof DEGREES)[number]) => {
      await initAudio();
      const freq = midiToFreq(ROOT_MIDI + deg.semitones);
      melodySynthRef.current?.triggerAttackRelease(freq, "4n");
      setActiveDegree(deg.degree);
      setTimeout(() => setActiveDegree(null), 500);
    },
    [initAudio],
  );

  useEffect(() => {
    return () => {
      droneRef.current?.triggerRelease();
      droneRef.current?.dispose();
      melodySynthRef.current?.dispose();
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
