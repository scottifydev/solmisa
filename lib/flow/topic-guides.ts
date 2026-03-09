import type { AudioConfig } from "@/lib/audio/audio-config-types";

export interface TopicGuide {
  topic: string;
  displayName: string;
  oneLiner: string;
  paragraph: string;
  audioConfig: AudioConfig;
  explorerEnabled: boolean;
}

export const TOPIC_GUIDES: TopicGuide[] = [
  {
    topic: "key_signatures",
    displayName: "Key Signatures",
    oneLiner: "The DNA of every key — which notes are sharp or flat.",
    paragraph:
      "A key signature tells you which notes are consistently raised or lowered throughout a piece. Rather than writing accidentals on every note, the signature gathers them at the start of each line. Knowing key signatures by sight means you can read any passage and immediately understand its tonal landscape — which notes will feel stable, which will pull, and where the half-steps fall.",
    audioConfig: {
      mode: "scale_bare",
      root: "G4",
      scaleType: "major",
      direction: "ascending",
      tempo: 132,
    },
    explorerEnabled: true,
  },
  {
    topic: "mode_ear_id",
    displayName: "Mode Ear Training",
    oneLiner: "Modes are the colors between major and minor.",
    paragraph:
      "Each mode rearranges the half-steps and whole-steps of a scale, producing a distinct emotional quality from the same set of notes. Dorian sounds bittersweet, Lydian floats, Phrygian bites. Training your ear to recognize modes means hearing the subtle shift in character that one altered degree creates — a skill that deepens how you listen to everything from folk melodies to film scores.",
    audioConfig: {
      mode: "scale_with_vamp",
      root: "D4",
      scaleType: "dorian",
      tempo: 112,
      vamp: { chords: ["D3", "G3", "B3"], pattern: "block" },
    },
    explorerEnabled: true,
  },
  {
    topic: "interval_recognition",
    displayName: "Interval Recognition",
    oneLiner:
      "The distance between two notes — the building blocks of melody and harmony.",
    paragraph:
      "Every melody is a sequence of intervals; every chord is a stack of them. When you can hear the difference between a perfect fourth and a perfect fifth, or between a minor third and a major third, you stop guessing and start understanding. Interval recognition is the foundation that makes every other ear-training skill faster to develop.",
    audioConfig: {
      mode: "interval_melodic",
      root: "C4",
      intervals: [7],
    },
    explorerEnabled: true,
  },
  {
    topic: "chord_quality",
    displayName: "Chord Quality",
    oneLiner: "Major, minor, diminished, augmented — the flavors of harmony.",
    paragraph:
      "Chord quality describes the sonic character of a chord: bright and open (major), dark and warm (minor), tense and unstable (diminished), or wide and unsettled (augmented). Learning to identify quality by ear lets you follow harmonic motion in real time — you hear not just that the chord changed, but how the emotional weight shifted.",
    audioConfig: {
      mode: "chord_arpeggiated",
      root: "C4",
      intervals: [0, 4, 7],
    },
    explorerEnabled: true,
  },
  {
    topic: "chord_inversions",
    displayName: "Chord Inversions",
    oneLiner: "Same chord, different voicing — which note is on the bottom.",
    paragraph:
      "An inversion changes which chord tone sits in the bass. Root position sounds grounded, first inversion sounds lighter, second inversion sounds suspended. The notes are identical — only the order changes — yet the effect on voice leading and harmonic flow is significant. Hearing inversions accurately is essential for understanding how composers create smooth bass lines.",
    audioConfig: {
      mode: "chord_blocked",
      root: "C4",
      intervals: [0, 4, 7],
    },
    explorerEnabled: true,
  },
  {
    topic: "chord_spelling",
    displayName: "Chord Spelling",
    oneLiner: "Naming every note in a chord from memory.",
    paragraph:
      "Spelling a chord means knowing its exact pitch content without a reference. Given 'Bb major 7,' you produce Bb-D-F-A instantly. This fluency connects theory to practice: it speeds up sight-reading, simplifies transposition, and makes analyzing harmonic progressions second nature. The goal is recall so automatic it feels like reading words, not sounding out letters.",
    audioConfig: {
      mode: "chord_arpeggiated",
      root: "Bb3",
      intervals: [0, 4, 7, 11],
      tempo: 100,
    },
    explorerEnabled: false,
  },
  {
    topic: "scale_degree_feeling",
    displayName: "Scale Degree Feeling",
    oneLiner:
      "Each degree of the scale has a personality — stable, restless, or pulling.",
    paragraph:
      "Do feels like home. Ti leans hard toward Do. Fa drifts toward Mi. Every scale degree carries a unique tension relative to the tonic, and that tension is what gives melody its emotional arc. Training this sense lets you hear a note in context and know where it sits in the key — not by calculating, but by feeling the pull.",
    audioConfig: {
      mode: "degree_with_drone",
      root: "C4",
      drone: { pitch: "C3" },
      notes: [{ pitch: "B4", duration: 1.5, start: 0 }],
    },
    explorerEnabled: true,
  },
  {
    topic: "note_reading",
    displayName: "Note Reading",
    oneLiner: "Translating staff notation into note names.",
    paragraph:
      "Reading notes on the staff is a translation skill: lines and spaces map to pitches. Speed and accuracy come from pattern recognition, not counting up from a reference note every time. Consistent practice builds the instant recognition that makes sight-reading feel fluent rather than laborious.",
    audioConfig: {
      mode: "melody_excerpt",
      notes: [
        { pitch: "C4", duration: 1, start: 0 },
        { pitch: "E4", duration: 1, start: 1 },
        { pitch: "G4", duration: 1, start: 2 },
        { pitch: "C5", duration: 2, start: 3 },
      ],
      tempo: 120,
    },
    explorerEnabled: false,
  },
  {
    topic: "rhythm",
    displayName: "Rhythm",
    oneLiner:
      "How music moves through time — beats, subdivisions, and patterns.",
    paragraph:
      "Rhythm is the skeleton of music. It determines not just when notes happen, but how they group, where the accents fall, and what kind of forward motion the listener feels. Training rhythmic accuracy means internalizing subdivisions so that your sense of pulse stays steady whether the pattern is simple quarter notes or syncopated sixteenths.",
    audioConfig: {
      mode: "rhythm_percussion",
      notes: [
        { pitch: "C4", duration: 0.5, start: 0 },
        { pitch: "C4", duration: 0.5, start: 1 },
        { pitch: "C4", duration: 0.25, start: 2 },
        { pitch: "C4", duration: 0.25, start: 2.5 },
        { pitch: "C4", duration: 0.5, start: 3 },
      ],
      tempo: 100,
    },
    explorerEnabled: true,
  },
  {
    topic: "cadence_recognition",
    displayName: "Cadence Recognition",
    oneLiner: "The punctuation of music — how phrases end.",
    paragraph:
      "A cadence is the harmonic gesture that closes a musical phrase. An authentic cadence feels final, like a period. A half cadence pauses, like a comma. A deceptive cadence redirects expectation. Recognizing cadences by ear helps you follow the architecture of a piece in real time — you sense when a section resolves, when it holds back, and when it surprises.",
    audioConfig: {
      mode: "progression_block",
      root: "C3",
      notes: [
        { pitch: "G3,B3,D4", duration: 2, start: 0 },
        { pitch: "C3,E3,G3", duration: 2, start: 2 },
      ],
      tempo: 80,
    },
    explorerEnabled: true,
  },
  {
    topic: "harmonic_function",
    displayName: "Harmonic Function",
    oneLiner: "Tonic, dominant, subdominant — the roles chords play.",
    paragraph:
      "Harmonic function describes not what a chord is, but what it does. Tonic chords provide rest. Dominant chords create tension that demands resolution. Subdominant chords set up the dominant. Hearing function means you track the push and pull of harmony rather than just identifying chord names — you understand why the music moves, not just where.",
    audioConfig: {
      mode: "progression_block",
      root: "C3",
      notes: [
        { pitch: "C3,E3,G3", duration: 2, start: 0 },
        { pitch: "F3,A3,C4", duration: 2, start: 2 },
        { pitch: "G3,B3,D4", duration: 2, start: 4 },
        { pitch: "C3,E3,G3", duration: 2, start: 6 },
      ],
      tempo: 80,
    },
    explorerEnabled: true,
  },
  {
    topic: "circle_of_fifths",
    displayName: "Circle of Fifths",
    oneLiner: "The map connecting all 12 keys.",
    paragraph:
      "The circle of fifths arranges all major and minor keys by the number of sharps or flats they contain. Moving clockwise adds a sharp; counterclockwise adds a flat. It is the quickest way to see how keys relate to each other, predict key signatures, and understand why certain modulations sound smooth while others jolt. It is less a rule to memorize than a map to internalize.",
    audioConfig: {
      mode: "scale_bare",
      root: "C4",
      scaleType: "major",
      direction: "ascending",
      tempo: 160,
    },
    explorerEnabled: false,
  },
  {
    topic: "modal_mixture",
    displayName: "Modal Mixture",
    oneLiner: "Borrowing chords from parallel keys for color.",
    paragraph:
      "Modal mixture — sometimes called borrowed chords — means taking a chord from the parallel minor (or major) and dropping it into the current key. A bVI chord in a major key, for example, darkens the sound without actually changing key. Recognizing borrowed chords sharpens your harmonic ear and reveals how composers add emotional nuance with a single unexpected harmony.",
    audioConfig: {
      mode: "progression_block",
      root: "C3",
      notes: [
        { pitch: "C3,E3,G3", duration: 2, start: 0 },
        { pitch: "Ab3,C4,Eb4", duration: 2, start: 2 },
        { pitch: "Bb3,D4,F4", duration: 2, start: 4 },
        { pitch: "C3,E3,G3", duration: 2, start: 6 },
      ],
      tempo: 80,
    },
    explorerEnabled: true,
  },
];
