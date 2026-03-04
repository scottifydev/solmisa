# Solmisa — M1: Foundation Implementation Plan

> Music ear training web app built on Gordon's Music Learning Theory.
> Tech: Next.js 15 (App Router) + Supabase + TailwindCSS 3.4 + Tone.js + pnpm

---

## Phase 1: Project Scaffold (SCO-5 Epic)

Dependencies: None (starting from empty repo)

### 1.1 — SCO-6: Scaffold Next.js 15 project [P1]

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*" --use-pnpm
```

**Files created:**
- `app/layout.tsx` — Root layout with `<html lang="en">`, body with font classes
- `app/page.tsx` — Placeholder: "Solmisa" centered text
- `app/globals.css` — Tailwind directives
- `next.config.ts`
- `tsconfig.json`
- `package.json`

**Also create empty directories:**
- `components/` `lib/` `hooks/` `types/` `public/`

### 1.2 — SCO-7: Configure TailwindCSS 3.4 with design tokens [P2]

> **IMPORTANT:** Pin `tailwindcss@3.4` — do NOT use v4.

```bash
pnpm add tailwindcss@3.4 postcss autoprefixer
```

**File:** `tailwind.config.ts`

**Design tokens to configure:**

| Category | Token | Value |
|----------|-------|-------|
| **Backgrounds** | night | `#0A0A0F` |
| | obsidian | `#141420` |
| | charcoal | `#1E1E2E` |
| | steel | `#2A2A3D` |
| **Text** | silver | `#9999AA` |
| | ivory | `#F5F5F0` |
| **Accent** | coral | `#FF6B6B` |
| | amber | `#FFB347` |
| **Degree colors** | degree-1 | `#FF6B6B` (tonic, coral) |
| | degree-2 | `#FFB347` (amber) |
| | degree-3 | `#4ECDC4` (teal) |
| | degree-4 | `#45B7D1` (sky) |
| | degree-5 | `#96E6A1` (green) |
| | degree-6 | `#DDA0DD` (plum) |
| | degree-7 | `#F7DC6F` (gold) |
| **SRS stages** | apprentice | `#4ECDC4` |
| | journeyman | `#45B7D1` |
| | adept | `#96E6A1` |
| | virtuoso | `#DDA0DD` |
| | mastered | `#FFD700` |
| **Semantic** | correct | `#4ECDC4` |
| | incorrect | `#FF6B6B` |
| | warning | `#FFB347` |
| **Fonts** | display | Outfit |
| | body | DM Sans |
| | mono | IBM Plex Mono |

**Font loading** in `app/layout.tsx` using `next/font/google`:
```typescript
import { Outfit, DM_Sans, IBM_Plex_Mono } from 'next/font/google';
```

### 1.3 — SCO-8: Set up Supabase [P1]

```bash
pnpm add @supabase/supabase-js @supabase/ssr
npx supabase init
```

**Files to create:**

| File | Purpose |
|------|---------|
| `lib/supabase/client.ts` | Browser client (`createBrowserClient`) |
| `lib/supabase/server.ts` | Server component client (`createServerClient`) |
| `lib/supabase/middleware.ts` | Auth middleware helper |
| `middleware.ts` | Next.js middleware (root) — calls Supabase middleware |
| `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

### 1.4 — SCO-9: Vercel config [P2]

**File:** `vercel.json` — minimal config for Next.js

### 1.5 — SCO-10: GitHub CI/CD [P3]

**File:** `.github/workflows/ci.yml`
- Lint, type-check, build on push/PR to main
- Uses pnpm, Node 20

---

## Phase 2: Shared Types & Design Tokens

Dependencies: Phase 1 complete

Create TypeScript type contracts that all components and features will import. These act as the shared interface between frontend and backend.

### 2.1 — `types/database.ts`
Placeholder for Supabase-generated types. Define key table interfaces manually:
- `Profile` (id, name, instrument, experience_level, etc.)
- `Module`, `Lesson`, `LessonStage`
- `SrsCard`, `SrsReview`
- `SkillAxis`, `AssessmentQuestion`, `ActivityLog`

### 2.2 — `types/audio.ts`
```typescript
DroneOptions, CadenceOptions, RandomKeyOptions, UseDroneReturn
PlaybackOptions, ResolutionOptions, UsePlaybackReturn
AudioPlayerProps
```

### 2.3 — `types/srs.ts`
```typescript
SrsStage = 'apprentice' | 'journeyman' | 'adept' | 'virtuoso' | 'mastered'
ReviewQueueItem, ReviewQueueResponse
ReviewAnswerRequest, ReviewAnswerResponse
ReviewStatsResponse
SrsStageGroup
```

### 2.4 — `types/lesson.ts`
```typescript
Module, Lesson, ModuleProgress, LessonProgress
LessonRenderData, LessonStage
AuralTeachStage, TheoryTeachStage, AuralQuizStage, TheoryQuizStage, PracticeStage
StageRendererProps
```

### 2.5 — `lib/tokens.ts`
Exported design token constants (degree colors, SRS stage colors, etc.) for use in components that need programmatic access.

---

## Phase 3: Design System Components (SCO-11 Epic)

Dependencies: Phase 2 complete. **All components in this phase are independent and can be built in parallel.**

### 3.1 — SCO-12: Button [P2]
**File:** `components/ui/button.tsx`
- Variants: primary, secondary, outline, ghost, correct, warning, incorrect
- Sizes: sm, md, lg
- Props: loading, fullWidth, extends `ButtonHTMLAttributes`

### 3.2 — SCO-14: Logo [P2]
**File:** `components/ui/logo.tsx`
- SVG notched gradient ring
- Props: size (default 32), glow, bgOverride, withWordmark, wordmarkSize, layout (horizontal/stacked)

### 3.3 — SCO-13: Answer Card [P2]
**File:** `components/ui/answer-card.tsx`
- States: default, hover, selected, correct, incorrect, disabled
- Props: label, sublabel, state, degreeColor (1-7), onClick, disabled

### 3.4 — SCO-54: Stat Card [P3]
**File:** `components/ui/stat-card.tsx`
- Props: label, value, sub, color, children

### 3.5 — SCO-15: Audio Player [P3]
**File:** `components/ui/audio-player.tsx`
- Two variants: standalone and inline
- Props: src, onPlay, onStop, label, sublabel, variant
- States: idle, playing

### 3.6 — SCO-16: SRS Stage Badges & Progress [P3]
**Files:** `components/ui/srs-badge.tsx`, `components/ui/progress-bar.tsx`
- Badge props: stage, substage, showInterval, showIcon, size, variant
- Progress bar: value, max, color, showLabel

### 3.7 — SCO-60: Loading, Error, Empty, Toast [P2]
**Files:**
- `components/ui/skeleton.tsx` — SkeletonText, SkeletonCircle, SkeletonRect
- `components/ui/error-boundary.tsx` — React error boundary with retry
- `components/ui/empty-state.tsx` — Centered placeholder
- `components/ui/toast.tsx` — Lightweight notification
- `components/skeletons/dashboard-skeleton.tsx`
- `components/skeletons/learn-skeleton.tsx`
- `components/skeletons/review-skeleton.tsx`

### 3.8 — SCO-17: App Shell & Navigation [P2]
**Files:**
- `app/(app)/layout.tsx` — Authenticated layout wrapping all app pages
- `components/ui/app-shell.tsx` — Shell component
- `components/ui/nav-bar.tsx` — Navigation component

**Desktop (≥640px):** Sticky header with glass effect, nav links (Dashboard, Learn, Review)
**Mobile (<640px):** Bottom tab bar with icons

---

## Phase 4: Database Schema (SCO-19)

Dependencies: SCO-8 (Supabase setup)

**File:** `supabase/migrations/00001_initial_schema.sql`

Key tables:
- `profiles` — extends auth.users with name, instrument, experience, preferences
- `modules` — 7 curriculum modules
- `lessons` — lessons within modules
- `lesson_stages` — individual stages (aural teach, theory teach, quiz, etc.)
- `srs_cards` — flashcards with card_category (perceptual/declarative)
- `srs_reviews` — review history with FSRS fields
- `skill_axes` — 12-axis skill radar data per user
- `assessment_questions` — OKCupid-style questions with axis weight mappings
- `assessment_responses` — user answers
- `activity_log` — real-world activity tracking
- `user_lesson_progress` — tracks completed lessons

Plus: RLS policies, indexes, triggers, RPC functions.

After migration: `npx supabase gen types typescript --local > types/database.ts`

---

## Phase 5: Authentication (SCO-18 Epic)

Dependencies: Phase 1 (Supabase), Phase 3 (UI components)

### 5.1 — SCO-42: Auth Pages [P2]
**Files:**
- `app/(auth)/layout.tsx` — Centered auth layout
- `app/(auth)/login/page.tsx` — Email/password + magic link + Google OAuth
- `app/(auth)/signup/page.tsx` — Registration form
- `app/(auth)/reset-password/page.tsx` — Password reset

All use Supabase Auth + `@supabase/ssr`. Dark theme with Logo component.

### 5.2 — SCO-43: Onboarding Flow [P3]
**Files:**
- `app/(app)/onboarding/page.tsx`
- `components/onboarding/welcome-step.tsx`
- `components/onboarding/name-step.tsx`
- `components/onboarding/instrument-step.tsx`
- `components/onboarding/experience-step.tsx`

Steps: Welcome → Name → Instrument (searchable select) → Experience Level
On completion: insert into `profiles` table, redirect to dashboard.

---

## Parallelization Strategy

```
Phase 1 (sequential)
  SCO-6 → SCO-7 → SCO-8 (+ SCO-9, SCO-10 parallel)
        ↓
Phase 2 (can parallelize types)
  types/database.ts ─┐
  types/audio.ts ────┤
  types/srs.ts ──────┤── all parallel
  types/lesson.ts ───┤
  lib/tokens.ts ─────┘
        ↓
Phase 3 (all parallel)    Phase 4 (parallel w/ Phase 3)
  SCO-12: Button     ─┐     SCO-19: DB Schema
  SCO-14: Logo       ─┤
  SCO-13: Answer card ┤
  SCO-54: Stat card  ─┤
  SCO-15: Audio player┤
  SCO-16: SRS badges ─┤
  SCO-60: Loading etc ─┤
  SCO-17: App shell  ─┘
        ↓
Phase 5 (sequential)
  SCO-42: Auth pages
  SCO-43: Onboarding
```

---

## Execution Checklist

| # | Issue | Phase | Depends On | Status |
|---|-------|-------|------------|--------|
| 1 | SCO-6: Scaffold Next.js 15 | 1 | — | Pending |
| 2 | SCO-7: TailwindCSS 3.4 + tokens | 1 | SCO-6 | Pending |
| 3 | SCO-8: Supabase setup | 1 | SCO-6 | Pending |
| 4 | SCO-9: Vercel config | 1 | SCO-6 | Pending |
| 5 | SCO-10: GitHub CI/CD | 1 | SCO-6 | Pending |
| 6 | Shared types: database.ts | 2 | Phase 1 | Pending |
| 7 | Shared types: audio.ts | 2 | Phase 1 | Pending |
| 8 | Shared types: srs.ts | 2 | Phase 1 | Pending |
| 9 | Shared types: lesson.ts | 2 | Phase 1 | Pending |
| 10 | Design tokens: lib/tokens.ts | 2 | Phase 1 | Pending |
| 11 | SCO-12: Button | 3 | Phase 2 | Pending |
| 12 | SCO-14: Logo | 3 | Phase 2 | Pending |
| 13 | SCO-13: Answer card | 3 | Phase 2 | Pending |
| 14 | SCO-54: Stat card | 3 | Phase 2 | Pending |
| 15 | SCO-15: Audio player | 3 | Phase 2 | Pending |
| 16 | SCO-16: SRS badges + progress | 3 | Phase 2 | Pending |
| 17 | SCO-60: Loading/error/empty/toast | 3 | Phase 2 | Pending |
| 18 | SCO-17: App shell + nav | 3 | Phase 2 | Pending |
| 19 | SCO-19: Database schema | 4 | SCO-8 | Pending |
| 20 | SCO-42: Auth pages | 5 | SCO-8, Phase 3 | Pending |
| 21 | SCO-43: Onboarding flow | 5 | SCO-42, SCO-19 | Pending |

---

## Notes

- **No external services needed for code:** Supabase client setup, components, types, and schema SQL can all be written without running services. Only `supabase start` and actual deployment need external access.
- **TailwindCSS v3.4 is mandatory** — all Linear issue specs reference v3 config format and utility classes.
- **Types-first approach** — Creating shared type contracts in Phase 2 prevents drift between components and backend.
- **Component parallelism** — Phase 3's 8 components are fully independent. Use agent teams to build them simultaneously.
