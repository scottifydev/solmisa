# solmisa

Open-source music ear training, built on research.

## About

solmisa is an ear training app that combines three proven but rarely unified ideas:

- **Edwin Gordon's Music Learning Theory** — audiation-based learning where sound comprehension precedes notation, compressed for adult self-learners
- **Functional ear training** — learn to hear scale degrees in tonal context rather than identifying isolated intervals
- **FSRS spaced repetition** — adapted for music with session-based scheduling, context variation across keys and timbres, and progressive response modes

No existing app occupies this niche. Most ear training tools either test without teaching, rely on isolated interval identification, or ignore rhythm entirely. solmisa addresses all three.

## Try it

[solmisa.vercel.app](https://solmisa.vercel.app)

## Tech stack

- [Next.js](https://nextjs.org) 15 (App Router)
- [Supabase](https://supabase.com) (auth + database)
- [Tailwind CSS](https://tailwindcss.com) 3.4
- TypeScript (strict)
- FSRS-inspired spaced repetition engine

## Getting started

```bash
pnpm install
```

Create `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

```bash
pnpm dev
```

## Project structure

```
app/
  (app)/          # Authenticated app routes (dashboard, learn, review, profile)
  (auth)/         # Auth routes (login, signup, reset-password)
  framework/      # Public pedagogical framework page
components/
  landing/        # Anonymous landing page components
  lesson/         # Lesson player and stage renderer
  review/         # Review session components
  ui/             # Design system primitives (Button, StatCard, etc.)
lib/
  actions/        # Server actions (dashboard, lessons, review, profile)
  data/           # Static data (demo content)
  srs/            # FSRS-inspired spaced repetition engine
  supabase/       # Supabase client/server/middleware
  tokens.ts       # Design tokens (colors, labels)
types/            # TypeScript type definitions
```

## Pedagogical framework

The research foundation behind solmisa's curriculum design is published at [/framework](https://solmisa.vercel.app/framework). It covers Gordon's Music Learning Theory, the audiation-vs-theory debate, functional ear training methodology, SRS adaptation for music, curriculum sequencing analysis, and the full module map.

## Contributing

Contributions are welcome. Open an issue to discuss what you'd like to change before submitting a PR.

## License

MIT
