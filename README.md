# solmisa

Browser tools for reading a jazz lead sheet, and a lab that opens a real standard and shows you how it works.

**[solmisa.vercel.app](https://solmisa.vercel.app)** — no account, nothing to install.

## What's here

Four tools cover the fundamentals, and the Standards Lab is where you apply them.

| Tool                                                               | What you do                                                     |
| ------------------------------------------------------------------ | --------------------------------------------------------------- |
| [Notes](https://solmisa.vercel.app/practice/notes)                 | Name a note on the staff, or find it on the keyboard            |
| [Keys](https://solmisa.vercel.app/practice/keys)                   | Read a key signature, or write one from the key name            |
| [Scales](https://solmisa.vercel.app/practice/scales)               | Build a scale from its name, or alter a major scale into a mode |
| [Circle of fifths](https://solmisa.vercel.app/practice/circle)     | Move between keys and see how they relate                       |
| [Standards Lab](https://solmisa.vercel.app/practice/standards-lab) | Open a jazz standard, play it back, see every note's role       |

All five run entirely in the browser. No backend, no account, no seeded data.

## How the Standards Lab works

Everything happens client-side, starting from a MIDI file in `public/midi`:

1. **Parse** (`lib/midi/parser.ts`) — read the file with `@tonejs/midi`, score each track to find the piano part, then split it into melody and accompaniment by grouping note onsets inside a 50 ms window and looking at the spread of each group.
2. **Detect chords** (`lib/midi/chord-detector.ts`) — match each left-hand group against a template library (`lib/midi/voicing-templates.ts`) that knows rootless A/B and shell jazz voicings, scoring every root candidate on bass note, completeness, and extra tones.
3. **Engrave** (`lib/midi/quantizer.ts`) — group notes into the bars the parser derived from ticks, snap onsets to a beat grid, fill the gaps with rests that add up exactly, spell each pitch for the current key signature, and classify every melody note as a root, chord tone, tension, or avoid note against the chord underneath.
4. **Render and play** (`components/standards-lab/`) — draw the result with VexFlow, color the noteheads by classification, and play it through a sampled grand piano scheduled on the Web Audio clock.

Note spelling is key-aware rather than a fixed sharp table: accidentals are emitted only when a note differs from what the key signature or an earlier accidental in the same bar already put in force. `__tests__/note-spelling.test.ts` pins that down.

## One clock

Three things have to agree on where a bar starts: the audio, the engraved score, and the playhead. Getting them to agree turned out to be the interesting part.

The obvious approach is to divide elapsed time by the tempo. That drifts. Several of these files change tempo partway through, so a single beats-per-minute figure is wrong from the first tempo change onward, and everything derived from it lands in the wrong bar.

The fix is to stop deriving time from tempo at all. Bar boundaries are precomputed once at parse time by converting MIDI ticks to seconds through the file's own tempo map, which is correct no matter how many tempo changes there are:

```ts
// lib/midi/parser.ts
const barStartTimes: number[] = [];
const ticksPerBar = header.ppq * timeSignature.numerator;
for (let bar = 0; bar < totalBars; bar++) {
  barStartTimes.push(header.ticksToSeconds(bar * ticksPerBar));
}
```

Both consumers read from that one map. The engraver groups notes by the bar the parser assigned rather than by wall-clock windows, so a tempo change cannot shift a note into the wrong measure. The cursor runs its own animation frame loop, reads the audio clock directly rather than React state, finds its bar by scanning the same boundaries, and interpolates within it.

Keeping the cursor out of React is what makes it smooth: no re-render happens per frame, and the transport is the single source of truth for time. Its one piece of real complexity is that VexFlow engraves into a fixed coordinate space that is then scaled to the container, so positions have to be converted from user units into CSS pixels. That conversion lives in `lib/notation/cursor-position.ts` as pure functions with the DOM measurement injected, which is what makes it testable.

Two invariants are pinned by tests: every engraved bar sums to the time signature, and a note's measure does not change when the reported starting tempo does.

## Also in the repo

The public tools grew out of a larger ear-training app that is still in development and sits behind authentication. It is not part of the demo, but two pieces of it are the most interesting code here:

- **`lib/srs/scheduler.ts`** — a spaced-repetition scheduler adapted for music. Eleven sub-stages across five named groups, separate handling for perceptual and declarative material, difficulty tiers that gate progression, and ease adjusted by the learner's self-reported confidence. It is a pure function: the clock is a parameter, which is what lets `__tests__/srs-scheduler.test.ts` assert intervals exactly. Persistence happens in a Postgres routine that writes the review record and card state together.
- **`lib/cat/engine.ts`** — an adaptive placement test using a Rasch (one-parameter logistic) model. Item difficulty maps to a logit scale, each question is the one carrying the most Fisher information at the current ability estimate, and ability is tracked independently across twelve dimensions. Under a one-parameter model that selection rule reduces to picking the difficulty nearest the current estimate; it is written as information maximisation because that is the actual criterion, and because the two diverge if the model ever gains a discrimination parameter. Covered by `__tests__/cat-engine.test.ts`.

## Project structure

```
app/
  page.tsx           Home
  practice/          Public tools: notes, keys, scales, circle, standards-lab
  (app)/             Authenticated trainer: dashboard, learn, review, flow, onboarding
  (auth)/            Sign in, sign up, password reset
components/
  standards-lab/     Notation view, transport, chord chart, piano dock
  practice/          Drill runners and gesture inputs
  flow/              Review card modalities and topic explorers
  notation/          Shared VexFlow views
  ui/                Design system primitives
lib/
  midi/              Parse, chord detection, quantization, voicing templates
  notation/          VexFlow renderer
  audio/             Sampled piano, drone, playback scheduling
  srs/               Spaced repetition scheduler and stage table
  cat/               Adaptive placement engine and item bank
  chains/            Review stream construction and unlock rules
  supabase/          Browser, server, and middleware clients
supabase/migrations/ Schema and authored lesson content
```

## Running locally

```bash
pnpm install
pnpm dev
```

The public tools need no configuration. The authenticated trainer additionally needs a `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

```bash
pnpm test         # vitest
pnpm type-check   # tsc --noEmit
pnpm build
```

## Built with

Next.js 15 with the App Router, React 19, TypeScript in strict mode with `noUncheckedIndexedAccess`, Tailwind CSS, Tone.js for audio, VexFlow for engraving, `@tonejs/midi` for parsing, and Supabase for the authenticated side.

## License

MIT
