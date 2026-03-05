/**
 * Sample Generation Script
 *
 * Generates 140 audio samples: 5 timbres × 7 degrees × 4 keys
 *
 * Prerequisites:
 *   - FluidSynth installed (brew install fluidsynth / choco install fluidsynth)
 *   - SoundFont files in ./soundfonts/ directory:
 *     - piano.sf2 (e.g. FluidR3_GM)
 *     - guitar.sf2
 *     - flute.sf2
 *     - voice.sf2 (choir/vocal pad)
 *     - organ.sf2
 *   - ffmpeg installed for OGG conversion
 *
 * Usage:
 *   npx tsx scripts/generate-samples.ts
 *
 * Output: public/audio/samples/{timbre}_{key}_{degree}.ogg
 */

import { execSync } from "child_process";
import { mkdirSync, existsSync } from "fs";
import path from "path";

const TIMBRES = ["piano", "guitar", "flute", "voice", "organ"] as const;
const KEYS = ["C", "G", "F", "D"] as const;
const DEGREES = [1, 2, 3, 4, 5, 6, 7] as const;

// Major scale semitone offsets
const DEGREE_SEMITONES: Record<number, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
};

// Root note MIDI numbers (octave 4)
const KEY_MIDI: Record<string, number> = {
  C: 60,
  D: 62,
  F: 65,
  G: 67,
};

// SoundFont program numbers per timbre
const TIMBRE_PROGRAMS: Record<string, { bank: number; program: number }> = {
  piano: { bank: 0, program: 0 }, // Acoustic Grand Piano
  guitar: { bank: 0, program: 24 }, // Nylon Guitar
  flute: { bank: 0, program: 73 }, // Flute
  voice: { bank: 0, program: 52 }, // Choir Aahs
  organ: { bank: 0, program: 19 }, // Church Organ
};

const OUTPUT_DIR = path.resolve("public/audio/samples");
const SOUNDFONT = process.env.SOUNDFONT ?? "./soundfonts/FluidR3_GM.sf2";
const DURATION_SECS = 2.5;

function midiForDegree(key: string, degree: number): number {
  const root = KEY_MIDI[key];
  if (root === undefined) throw new Error(`Unknown key: ${key}`);
  const offset = DEGREE_SEMITONES[degree];
  if (offset === undefined) throw new Error(`Unknown degree: ${degree}`);
  return root + offset;
}

function generateMidiFile(
  midi: number,
  program: number,
  outputMidi: string,
): void {
  // Create a simple MIDI file using python3 (midiutil)
  const script = `
from midiutil import MIDIFile
m = MIDIFile(1)
m.addTempo(0, 0, 60)
m.addProgramChange(0, 0, 0, ${program})
m.addNote(0, 0, ${midi}, 0, ${DURATION_SECS}, 100)
with open("${outputMidi.replace(/\\/g, "/")}", "wb") as f:
    m.writeFile(f)
`;
  execSync(`python3 -c '${script}'`);
}

function renderToWav(midiFile: string, wavFile: string): void {
  execSync(
    `fluidsynth -ni "${SOUNDFONT}" "${midiFile}" -F "${wavFile}" -r 44100`,
  );
}

function convertToOgg(wavFile: string, oggFile: string): void {
  execSync(
    `ffmpeg -y -i "${wavFile}" -c:a libvorbis -q:a 6 "${oggFile}" 2>/dev/null`,
  );
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const tmpDir = path.resolve(".tmp-samples");
  mkdirSync(tmpDir, { recursive: true });

  let generated = 0;
  const total = TIMBRES.length * KEYS.length * DEGREES.length;

  for (const timbre of TIMBRES) {
    const prog = TIMBRE_PROGRAMS[timbre];
    if (!prog) continue;

    for (const key of KEYS) {
      for (const degree of DEGREES) {
        const midi = midiForDegree(key, degree);
        const name = `${timbre}_${key}_${degree}`;
        const midiFile = path.join(tmpDir, `${name}.mid`);
        const wavFile = path.join(tmpDir, `${name}.wav`);
        const oggFile = path.join(OUTPUT_DIR, `${name}.ogg`);

        if (existsSync(oggFile)) {
          generated++;
          continue;
        }

        try {
          generateMidiFile(midi, prog.program, midiFile);
          renderToWav(midiFile, wavFile);
          convertToOgg(wavFile, oggFile);
          generated++;
          process.stdout.write(`\r[${generated}/${total}] ${name}.ogg`);
        } catch (err) {
          console.error(`\nFailed to generate ${name}:`, err);
        }
      }
    }
  }

  console.log(`\nGenerated ${generated}/${total} samples in ${OUTPUT_DIR}`);

  // Cleanup
  try {
    execSync(`rm -rf "${tmpDir}"`);
  } catch {
    // ignore cleanup errors
  }
}

if (!existsSync(SOUNDFONT)) {
  console.error(`SoundFont not found: ${SOUNDFONT}`);
  console.error(
    "Set SOUNDFONT env var or place FluidR3_GM.sf2 in ./soundfonts/",
  );
  console.error(
    "\nTo download: curl -o soundfonts/FluidR3_GM.sf2 https://keymusician01.s3.amazonaws.com/FluidR3_GM.sf2",
  );
  process.exit(1);
}

main();
