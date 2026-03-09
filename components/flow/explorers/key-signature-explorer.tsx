"use client";

import { useState } from "react";
import Link from "next/link";
import { brand } from "@/lib/tokens";

interface KeyDef {
  name: string;
  accidentals: number;
  type: "sharps" | "flats" | "none";
  order: string;
}

const KEYS_CIRCLE_OF_FIFTHS: KeyDef[] = [
  { name: "C", accidentals: 0, type: "none", order: "" },
  { name: "G", accidentals: 1, type: "sharps", order: "F#" },
  { name: "D", accidentals: 2, type: "sharps", order: "F# C#" },
  { name: "A", accidentals: 3, type: "sharps", order: "F# C# G#" },
  { name: "E", accidentals: 4, type: "sharps", order: "F# C# G# D#" },
  { name: "B", accidentals: 5, type: "sharps", order: "F# C# G# D# A#" },
  { name: "F#/Gb", accidentals: 6, type: "sharps", order: "F# C# G# D# A# E#" },
  { name: "Db", accidentals: 5, type: "flats", order: "Bb Eb Ab Db Gb" },
  { name: "Ab", accidentals: 4, type: "flats", order: "Bb Eb Ab Db" },
  { name: "Eb", accidentals: 3, type: "flats", order: "Bb Eb Ab" },
  { name: "Bb", accidentals: 2, type: "flats", order: "Bb Eb" },
  { name: "F", accidentals: 1, type: "flats", order: "Bb" },
];

export function KeySignatureExplorer() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selected = KEYS_CIRCLE_OF_FIFTHS.find((k) => k.name === selectedKey);

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
        Key Signature Explorer
      </h1>
      <p className="mb-6 text-sm" style={{ color: brand.silver }}>
        Keys arranged in circle-of-fifths order. Tap a key to see its
        accidentals.
      </p>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
        {KEYS_CIRCLE_OF_FIFTHS.map((key) => {
          const isSelected = selectedKey === key.name;
          const accentColor =
            key.type === "sharps"
              ? "#34d399"
              : key.type === "flats"
                ? "#60a5fa"
                : brand.violet;

          return (
            <button
              key={key.name}
              onClick={() => setSelectedKey(key.name)}
              className="flex flex-col items-center rounded-xl p-3 transition-all"
              style={{
                backgroundColor: isSelected ? brand.graphite : brand.slate,
                border: `2px solid ${isSelected ? accentColor : brand.steel}`,
                boxShadow: isSelected ? `0 0 20px ${accentColor}40` : "none",
                minHeight: 44,
              }}
            >
              <span
                className="text-lg font-bold"
                style={{ color: isSelected ? accentColor : brand.ivory }}
              >
                {key.name}
              </span>
              <span className="mt-1 text-xs" style={{ color: brand.ash }}>
                {key.accidentals === 0
                  ? "None"
                  : `${key.accidentals}${key.type === "sharps" ? "#" : "b"}`}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="mt-8 rounded-xl p-5"
          style={{
            backgroundColor: brand.slate,
            border: `1px solid ${brand.steel}`,
          }}
        >
          <h2
            className="mb-2 text-lg font-bold"
            style={{ color: brand.violet }}
          >
            {selected.name} Major
          </h2>
          <div className="space-y-2">
            <div>
              <span className="text-sm" style={{ color: brand.silver }}>
                Accidentals:{" "}
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: brand.ivory }}
              >
                {selected.accidentals === 0
                  ? "None"
                  : `${selected.accidentals} ${selected.type}`}
              </span>
            </div>
            {selected.order && (
              <div>
                <span className="text-sm" style={{ color: brand.silver }}>
                  Order:{" "}
                </span>
                <span
                  className="font-mono text-sm font-medium"
                  style={{ color: brand.ivory }}
                >
                  {selected.order}
                </span>
              </div>
            )}
            <div>
              <span className="text-sm" style={{ color: brand.silver }}>
                Mnemonic:{" "}
              </span>
              <span className="text-sm italic" style={{ color: brand.ash }}>
                {selected.type === "sharps"
                  ? "Father Charles Goes Down And Ends Battle"
                  : selected.type === "flats"
                    ? "Battle Ends And Down Goes Charles' Father"
                    : "No accidentals -- the natural key"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
