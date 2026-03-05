import type { NoteName, DiatonicDegree, Timbre } from "@/types/audio";

export const SAMPLE_TIMBRES = [
  "piano",
  "guitar",
  "flute",
  "voice",
  "organ",
] as const;

export type SampleTimbre = (typeof SAMPLE_TIMBRES)[number];

export const SAMPLE_KEYS: readonly NoteName[] = ["C", "G", "F", "D"];

export const SAMPLE_DEGREES: readonly DiatonicDegree[] = [1, 2, 3, 4, 5, 6, 7];

const AUDIO_BASE_URL =
  process.env.NEXT_PUBLIC_AUDIO_BASE_URL ?? "/audio/samples";

export function sampleUrl(
  timbre: SampleTimbre,
  key: NoteName,
  degree: DiatonicDegree,
): string {
  return `${AUDIO_BASE_URL}/${timbre}_${key}_${degree}.ogg`;
}

export function isSampleTimbre(timbre: string): timbre is SampleTimbre {
  return (SAMPLE_TIMBRES as readonly string[]).includes(timbre);
}

export function isSynthTimbre(timbre: Timbre): boolean {
  return !isSampleTimbre(timbre);
}

export function randomSampleTimbre(): SampleTimbre {
  return SAMPLE_TIMBRES[Math.floor(Math.random() * SAMPLE_TIMBRES.length)]!;
}

export function findNearestKey(key: NoteName): NoteName {
  if ((SAMPLE_KEYS as readonly string[]).includes(key)) return key;
  // Map to nearest sampled key by circle of fifths distance
  const keyMap: Record<string, NoteName> = {
    "C#": "C",
    Db: "D",
    "D#": "D",
    Eb: "D",
    E: "C",
    "F#": "F",
    Gb: "G",
    "G#": "G",
    Ab: "G",
    A: "G",
    "A#": "F",
    Bb: "F",
    B: "C",
  };
  return keyMap[key] ?? "C";
}

// Audio buffer cache for loaded samples
const bufferCache = new Map<string, AudioBuffer>();
const loadingPromises = new Map<string, Promise<AudioBuffer>>();

export async function loadSample(
  url: string,
  audioContext: AudioContext,
): Promise<AudioBuffer> {
  const cached = bufferCache.get(url);
  if (cached) return cached;

  const existing = loadingPromises.get(url);
  if (existing) return existing;

  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load sample: ${url}`);
      return res.arrayBuffer();
    })
    .then((data) => audioContext.decodeAudioData(data))
    .then((buffer) => {
      bufferCache.set(url, buffer);
      loadingPromises.delete(url);
      return buffer;
    })
    .catch((err) => {
      loadingPromises.delete(url);
      throw err;
    });

  loadingPromises.set(url, promise);
  return promise;
}

export function clearSampleCache(): void {
  bufferCache.clear();
  loadingPromises.clear();
}
