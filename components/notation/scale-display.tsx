"use client";

import { useRef, useEffect, useMemo } from "react";
import type { NotationData } from "@/lib/notation/types";
import { renderScale } from "@/lib/notation/vexflow-renderer";
import { degreeColors as defaultDegreeColors } from "@/lib/tokens";

const SCALE_INTERVALS: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

const NOTE_NAMES = ["c", "d", "e", "f", "g", "a", "b"];
const CHROMATIC = [
  "c",
  "c#",
  "d",
  "d#",
  "e",
  "f",
  "f#",
  "g",
  "g#",
  "a",
  "a#",
  "b",
];
const FLAT_CHROMATIC = [
  "c",
  "db",
  "d",
  "eb",
  "e",
  "f",
  "gb",
  "g",
  "ab",
  "a",
  "bb",
  "b",
];

function rootToSemitone(root: string): { semitone: number; useFlats: boolean } {
  const lower = root.toLowerCase();
  const sharpIdx = CHROMATIC.indexOf(lower);
  if (sharpIdx >= 0) return { semitone: sharpIdx, useFlats: false };
  const flatIdx = FLAT_CHROMATIC.indexOf(lower);
  if (flatIdx >= 0) return { semitone: flatIdx, useFlats: true };
  return { semitone: 0, useFlats: false };
}

function semitoneToKey(
  semitone: number,
  useFlats: boolean,
): { noteName: string; accidental?: string } {
  const s = ((semitone % 12) + 12) % 12;
  const table = useFlats ? FLAT_CHROMATIC : CHROMATIC;
  const name = table[s] ?? "c";
  if (name.length === 1) {
    return { noteName: name };
  }
  return {
    noteName: name.charAt(0),
    accidental: name.charAt(1) === "#" ? "#" : "b",
  };
}

function noteNameToLine(noteName: string): number {
  return NOTE_NAMES.indexOf(noteName.toLowerCase());
}

interface ScaleDisplayProps {
  root: string;
  scaleType: string;
  highlightDegree?: number;
  className?: string;
}

export function ScaleDisplay({
  root,
  scaleType,
  highlightDegree,
  className,
}: ScaleDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scaleData = useMemo((): NotationData => {
    const intervals = SCALE_INTERVALS[scaleType] ?? SCALE_INTERVALS.major!;
    const { semitone: rootSemitone, useFlats } = rootToSemitone(root);

    let octave = 4;
    const rootLine = noteNameToLine(root.charAt(0));

    const notes = intervals.map((interval, i) => {
      const sem = (rootSemitone + (interval ?? 0)) % 12;
      const { noteName, accidental } = semitoneToKey(sem, useFlats);

      const line = noteNameToLine(noteName);
      if (i > 0 && line < rootLine) {
        octave = 5;
      }

      return {
        keys: [`${noteName}/${octave}`],
        duration: "q" as const,
        accidental,
        annotations: { degree: i + 1 },
      };
    });

    // Add octave at top
    const { noteName: topName, accidental: topAcc } = semitoneToKey(
      rootSemitone,
      useFlats,
    );
    notes.push({
      keys: [`${topName}/5`],
      duration: "q",
      accidental: topAcc,
      annotations: { degree: 1 },
    });

    return {
      clef: "treble",
      key: root,
      measures: [{ notes }],
    };
  }, [root, scaleType]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const result = renderScale(
      container,
      scaleData,
      highlightDegree,
      defaultDegreeColors,
    );

    if (result.svg) {
      result.svg.setAttribute(
        "viewBox",
        `0 0 ${result.totalWidth} ${result.totalHeight}`,
      );
      result.svg.style.width = "100%";
      result.svg.style.height = "auto";
    }
  }, [scaleData, highlightDegree]);

  return <div ref={containerRef} className={className} />;
}
