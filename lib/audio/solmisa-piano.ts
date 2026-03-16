import * as Tone from "tone";

// ─── Salamander Grand Piano V3 ──────────────────────────────
// Public domain (Alexander Holm, 2022). Hosted on Tone.js CDN.

const SALAMANDER_BASE_URL = "https://tonejs.github.io/audio/salamander/";

const SALAMANDER_URLS: Record<string, string> = {
  A0: "A0.mp3",
  C1: "C1.mp3",
  "D#1": "Ds1.mp3",
  "F#1": "Fs1.mp3",
  A1: "A1.mp3",
  C2: "C2.mp3",
  "D#2": "Ds2.mp3",
  "F#2": "Fs2.mp3",
  A2: "A2.mp3",
  C3: "C3.mp3",
  "D#3": "Ds3.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
  "D#5": "Ds5.mp3",
  "F#5": "Fs5.mp3",
  A5: "A5.mp3",
  C6: "C6.mp3",
  "D#6": "Ds6.mp3",
  "F#6": "Fs6.mp3",
  A6: "A6.mp3",
  C7: "C7.mp3",
  "D#7": "Ds7.mp3",
  "F#7": "Fs7.mp3",
  A7: "A7.mp3",
  C8: "C8.mp3",
};

// ─── Singleton state ────────────────────────────────────────

let sampler: Tone.Sampler | null = null;
let reverbNode: Tone.Reverb | null = null;
let ready = false;
let loadingPromise: Promise<Tone.Sampler> | null = null;

// ─── Core lifecycle ─────────────────────────────────────────

export async function ensureAudio(): Promise<Tone.Sampler> {
  if (sampler && ready) return sampler;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    await Tone.start();

    reverbNode = new Tone.Reverb({ decay: 2.0, wet: 0.2 }).toDestination();
    await reverbNode.ready;

    sampler = new Tone.Sampler({
      urls: SALAMANDER_URLS,
      baseUrl: SALAMANDER_BASE_URL,
      release: 1.2,
      volume: -6,
    }).connect(reverbNode);

    await Tone.loaded();
    ready = true;
    return sampler;
  })();

  return loadingPromise;
}

export function isReady(): boolean {
  return ready;
}

export function setReverbWet(wet: number): void {
  if (reverbNode) reverbNode.wet.value = wet;
}

// ─── Playback API ────────────────────────────────────────────

type NoteArg = string | number;

export async function playNote(
  note: NoteArg,
  duration = "8n",
  velocity = 0.8,
): Promise<void> {
  const s = await ensureAudio();
  s.triggerAttackRelease(note as string, duration, Tone.now(), velocity);
}

export async function playChord(
  notes: NoteArg[],
  duration = "4n",
  velocity = 0.7,
): Promise<void> {
  const s = await ensureAudio();
  s.triggerAttackRelease(notes as string[], duration, Tone.now(), velocity);
}

export async function attackNote(note: NoteArg, velocity = 0.8): Promise<void> {
  const s = await ensureAudio();
  s.triggerAttack(note as string, Tone.now(), velocity);
}

export function releaseNote(note: NoteArg): void {
  sampler?.triggerRelease(note as string, Tone.now());
}

export function releaseAll(): void {
  sampler?.releaseAll();
}

// ─── Cadence ─────────────────────────────────────────────────

export async function playCadence(key = "C", tempo = 100): Promise<void> {
  const s = await ensureAudio();
  const now = Tone.now();
  const beat = 60 / tempo;

  // Transpose simple I-IV-V7-I to the given key
  const rootOffset =
    Tone.Frequency(`${key}4`).toMidi() - Tone.Frequency("C4").toMidi();

  function shiftNotes(midiNotes: number[]): string[] {
    return midiNotes.map((m) =>
      Tone.Frequency(m + rootOffset, "midi").toNote(),
    );
  }

  const I = shiftNotes([60, 64, 67]);
  const IV = shiftNotes([60, 65, 69]);
  const V7 = shiftNotes([59, 62, 65, 67]);
  const I2 = [...I];

  s.triggerAttackRelease(I, "4n", now, 0.5);
  s.triggerAttackRelease(IV, "4n", now + beat, 0.5);
  s.triggerAttackRelease(V7, "4n", now + beat * 2, 0.5);
  s.triggerAttackRelease(I2, "2n", now + beat * 3, 0.5);

  return new Promise<void>((resolve) => setTimeout(resolve, beat * 4.5 * 1000));
}
