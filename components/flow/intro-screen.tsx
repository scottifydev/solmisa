"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";

interface IntroScreenProps {
  topicName: string;
  concept: string;
  explanation: string;
  example?: string;
  onReady: () => void;
}

export function IntroScreen({
  topicName,
  concept,
  explanation,
  example,
  onReady,
}: IntroScreenProps) {
  const [step, setStep] = useState(0);

  const steps = [
    { title: topicName, body: concept },
    ...(example ? [{ title: "For example", body: example }] : []),
    { title: "Your turn", body: "See if you can identify it." },
  ];

  const current = steps[step]!;
  const isLast = step === steps.length - 1;

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8">
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all"
            style={{
              width: i === step ? 24 : 8,
              backgroundColor: i <= step ? brand.violet : brand.steel,
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-3 max-w-sm">
        <h2 className="text-lg font-semibold" style={{ color: brand.ivory }}>
          {current.title}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: brand.silver }}>
          {current.body}
        </p>
      </div>

      <button
        onClick={isLast ? onReady : () => setStep((s) => s + 1)}
        className="mt-4 rounded-xl px-8 py-3 text-sm font-semibold transition-colors"
        style={{
          backgroundColor: brand.violet,
          color: brand.night,
        }}
      >
        {isLast ? "Let\u2019s go" : "Next"}
      </button>
    </div>
  );
}

// Per-topic intro content — brief, teaches the concept before the first quiz
interface TopicIntro {
  topicName: string;
  concept: string;
  example?: string;
}

const TOPIC_INTROS: Record<string, TopicIntro> = {
  key: {
    topicName: "Key Signatures",
    concept:
      "A key signature tells you which notes are sharp or flat throughout a piece. It sits at the beginning of every staff line, right after the clef.",
    example:
      "One sharp means G major — that sharp is always F#. Two sharps means D major — F# and C#. The sharps and flats follow a specific order.",
  },
  modes: {
    topicName: "Modes by Ear",
    concept:
      "Modes are scales built on different degrees of a major scale. Each has a distinct color — Dorian sounds minor but warm, Mixolydian sounds major but bluesy, Lydian sounds bright and floating.",
    example:
      "Play a C major scale starting from D and you get D Dorian. Same notes, different home base, completely different feeling.",
  },
  interval: {
    topicName: "Intervals",
    concept:
      "An interval is the distance between two notes. Each interval has its own sound — a perfect fifth sounds open and stable, a minor second sounds tense and close.",
    example:
      'A perfect fifth is the first two notes of "Twinkle Twinkle." A perfect fourth is the start of "Here Comes the Bride."',
  },
  chord: {
    topicName: "Chord Quality",
    concept:
      "Chord quality describes the character of a chord — major sounds bright, minor sounds dark, diminished sounds tense, augmented sounds unsettled.",
    example:
      "A major triad has a major third on bottom and minor third on top. Flip those and you get minor. Stack two minor thirds for diminished.",
  },
  cadence: {
    topicName: "Cadences",
    concept:
      "A cadence is how a musical phrase ends. It creates resolution, tension, or surprise depending on the chord movement.",
    example:
      'V to I (authentic) sounds like coming home. IV to I (plagal) sounds like "Amen." V to vi (deceptive) sounds like a plot twist.',
  },
  progression: {
    topicName: "Chord Progressions",
    concept:
      "A chord progression is a sequence of chords that creates harmonic movement. Certain patterns appear everywhere in music because they resolve satisfyingly.",
    example:
      "I-V-vi-IV is in hundreds of pop songs. ii-V-I is the backbone of jazz. Recognizing these patterns helps you understand and play music faster.",
  },
  note_treble: {
    topicName: "Treble Clef Notes",
    concept:
      "The treble clef marks notes in the upper range. Lines from bottom to top spell E-G-B-D-F. Spaces spell F-A-C-E.",
    example:
      "Middle C sits on a ledger line just below the staff. The higher a note sits on the staff, the higher it sounds.",
  },
  note_bass: {
    topicName: "Bass Clef Notes",
    concept:
      "The bass clef marks notes in the lower range. Lines from bottom to top spell G-B-D-F-A. Spaces spell A-C-E-G.",
    example:
      "Middle C sits on a ledger line just above the bass staff — the same note as in treble clef, just written differently.",
  },
  note_alto: {
    topicName: "Alto Clef Notes",
    concept:
      "The alto clef centers middle C on the third line. Violas use this clef. The line reading is different from treble or bass.",
  },
  chord_inv: {
    topicName: "Chord Inversions",
    concept:
      "An inversion changes which note of a chord is in the bass. Root position has the root on bottom. First inversion puts the third on bottom. Second inversion puts the fifth on bottom.",
    example:
      "C major root position: C-E-G. First inversion: E-G-C. Second inversion: G-C-E. Same chord, different voicing, different sound.",
  },
  rhythm: {
    topicName: "Rhythm",
    concept:
      "Rhythm is the pattern of sound and silence in time. Each note value tells you how long to hold it relative to others.",
    example:
      "A whole note lasts 4 beats. A half note lasts 2. A quarter note lasts 1. An eighth note lasts half a beat. Dots add half the note's value.",
  },
  scale: {
    topicName: "Scale Degrees",
    concept:
      "Each note in a scale has a degree number and a function. The 1st degree (tonic) is home. The 5th (dominant) pulls you back to it. The 7th (leading tone) creates urgency to resolve.",
    example:
      "In C major: C is 1 (tonic), D is 2 (supertonic), E is 3 (mediant), F is 4 (subdominant), G is 5 (dominant), A is 6 (submediant), B is 7 (leading tone).",
  },
};

export function getTopicIntro(chainSlug: string): TopicIntro | null {
  // Extract topic prefix from chain slug (e.g., "key_c_major" -> "key")
  for (const prefix of Object.keys(TOPIC_INTROS)) {
    if (chainSlug.startsWith(prefix)) {
      return TOPIC_INTROS[prefix]!;
    }
  }
  return null;
}
