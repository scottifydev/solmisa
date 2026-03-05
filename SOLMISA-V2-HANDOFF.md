# Solmisa v2 Migration — Claude Code Handoff (Ralph Loop)

> **This is the PRD for Ralph.** Each checkbox is a discrete task. Run until all boxes are checked. Read the full context section before starting any work.

---

## Context: What Happened

Solmisa's architecture has been redesigned under **Pedagogical Framework v2**. The old model was a single linear lesson path where lessons contained quizzes that seeded SRS cards. The new model has three layers and four parallel tracks.

### Three-Layer Architecture

- **Learn** — Lessons expose concepts. NO quizzes, NO scoring. Completion unlocks drills and seeds SRS cards.
- **Practice** — Replayable drills with zero stakes. NEVER feeds SRS. Also recommends external tools (Sonofield, instruments, singing).
- **Review** — Blended SRS queue (FSRS). The ONLY place answers are scored. Feeds the skills radar.

### Four Skill Tracks (independent progression)

1. **Ear Training** — degree recognition, intervals, chord quality (the core track)
2. **Theory** — key signatures, scales, chords, Roman numerals
3. **Rhythm** — beat, meter, subdivision, syncopation
4. **Sight-Reading** — staff reading, clef fluency, notation

### Key Design Decisions

- WGU competency model: practice anywhere, assess in Solmisa
- Skills radar driven by SRS review performance (time-decay model, not hard rolling window)
- Adaptive CAT placement test replaces old onboarding
- Lessons no longer contain `aural_quiz` or `theory_quiz` stages — replaced by `interactive` and `guided_practice`
- Card seeding is completion-based (lesson declares `unlocks_cards`), not quiz-result-based
- Built-in practice drills are ABSOLUTELY isolated from SRS (Rule 16)
- Guided practice engagement can influence initial card difficulty tier but NOT FSRS scheduling

---

## Where Everything Lives

### Linear Documents (read these for full specs)

- **REF: Pedagogical Framework v2** — https://linear.app/scottify/document/ref-pedagogical-framework-v2-d29d01030127
  - 20 non-negotiable design rules, module maps, stage types, convergence milestones, navigation architecture
- **REF: Interactive Component Registry** — https://linear.app/scottify/document/ref-interactive-component-registry-5bbb45fe4c06
  - All 13 interactive component types with configs and priority tiers
- **REF: Database Schema SQL** — https://linear.app/scottify/document/ref-database-schema-sql-ce4016117e84
  - Current schema (pre-v2). The migration tasks below update this.
- **REF: Integration Flows** — https://linear.app/scottify/document/ref-integration-flows-9bcb8c06a8e6
  - Current data flow wiring (pre-v2). Will be rewritten after infrastructure is built.

### Linear Issues

- All v2 work is labeled **"v2 Migration"** in the Solmisa project under the Scottify team
- 10 epics: SCO-184 through SCO-193
- 34 sub-tasks: SCO-194 through SCO-227
- 3 refinement trackers: SCO-225, SCO-230, SCO-231
- **Read the epic description for full context before starting any sub-task**

### Existing Codebase

- Next.js 15 (App Router), React 19, TailwindCSS 3.4, Supabase, TypeScript 5.5 strict
- Audio engine: Tone.js drone (SCO-38), playback (SCO-39), audio provider (SCO-58)
- Rhythm tapping: SCO-55/SCO-182 (big tap button, pointer events) — PRESERVE THIS
- Drone sound: 3 oscillators at -7, 0, +7 cents detuning + octave sub layer (SCO-167) — PRESERVE THIS
- FSRS scheduler: `lib/srs/scheduler.ts` — core algorithm PRESERVED, wiring changes only
- Degree circle: SCO-24 — reused by interactive stages and drills
- Supabase migrations: `supabase/migrations/`

---

## Phase 0: Audit (Do This First)

**Issue: SCO-194 — Audit existing SCO issues for v2 migration**

Before writing any migration code, read through the existing issues and extract technical decisions that must be preserved. The goal is to prevent knowledge loss.

- [ ] Read SCO-167 (drone sound architecture) — extract oscillator config, detuning values, octave layers. Post findings as comment on SCO-184.
- [ ] Read SCO-55 + SCO-182 (rhythm tapping) — extract tap button implementation, pointer event handling, motion events. Note what must be preserved in SCO-186.
- [ ] Read SCO-36 (FSRS scheduler) — extract algorithm parameters, stage definitions, `schedulePerceptual()` vs `scheduleDeclarative()` details. Confirm `lib/srs/scheduler.ts` location and interface.
- [ ] Read SCO-146 (stage JSONB standardization) — extract the current stage schema that the v2 types must be compatible with during migration.
- [ ] Read SCO-141 (difficulty_tiers schema) — extract the resolution (array vs object) so v2 doesn't reintroduce the bug.
- [ ] Read SCO-169 (key change stuck state fix) — understand the fix so review queue changes don't regress it.
- [ ] Read SCO-172 (piano-like FM synthesis tone) — extract the synth parameters so timbre work doesn't lose this.
- [ ] Verify current source code matches issue descriptions — spot check 3-4 key files (`lib/srs/scheduler.ts`, `components/lesson/stage-renderer.tsx`, `hooks/use-drone.ts`, `hooks/use-playback.ts`)
- [ ] Disposition all 13 non-Done issues:
  - SCO-177, 178-181: Cancel (superseded by SCO-191/219). Extract lesson review feedback first.
  - SCO-145: Move under SCO-191 (sing cards still relevant)
  - SCO-21: Review remaining sub-issues, close if complete
  - SCO-35, 29, 34, 51, 52, 53: Keep as-is (independent of v2)
- [ ] Post summary comments on each v2 epic listing absorbed technical details

---

## Phase 1: Database Schema Migration

**Epic: SCO-184 — v2 Database Schema Migration**

Execute these migrations IN ORDER. Each depends on the previous. All migrations are non-destructive — add alongside existing, never drop.

### Step 1: Foundation table

- [ ] **SCO-195** — Create `skill_tracks` table and seed 4 tracks
  ```sql
  CREATE TABLE skill_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL CHECK (slug IN ('ear_training', 'theory', 'rhythm', 'sight_reading')),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  INSERT INTO skill_tracks (slug, name, description, display_order) VALUES
    ('ear_training', 'Ear Training', 'Degree recognition, interval identification, chord quality discrimination.', 1),
    ('theory', 'Theory', 'Key signatures, scale construction, chord construction, Roman numeral analysis.', 2),
    ('rhythm', 'Rhythm', 'Beat subdivision, meter, polyrhythm, rhythmic dictation.', 3),
    ('sight_reading', 'Sight-Reading', 'Staff reading, clef fluency, note identification, rhythmic notation reading.', 4);
  -- RLS: authenticated read-only
  -- Indexes on slug and display_order
  ```

  - File: `supabase/migrations/YYYYMMDDHHMMSS_create_skill_tracks.sql`
  - Verify: table exists, 4 rows, RLS enabled, indexes created

### Step 2: Link content to tracks (depends on Step 1)

- [ ] **SCO-196** — Add `track_id` FK to modules and lessons, backfill to ear_training
  - Add `track_id UUID REFERENCES skill_tracks(id)` to both tables
  - Backfill all existing rows to ear_training track
  - ALTER to NOT NULL after backfill
  - Update modules unique constraint: `(track_id, module_order)` replaces global `module_order`
  - Add indexes: `idx_modules_track`, `idx_lessons_track`
  - Verify: no NULL track_ids, constraint updated, existing data preserved

### Step 3: Lesson content columns (depends on Step 2)

- [ ] **SCO-197** — Add `unlocks_cards`, `unlocks_drills`, and `soft_prerequisites` to lessons
  - Add `unlocks_cards TEXT[] DEFAULT '{}'`
  - Add `unlocks_drills TEXT[] DEFAULT '{}'`
  - Add `soft_prerequisites JSONB DEFAULT '[]'`
  - Backfill `unlocks_cards` from existing `card_templates.lesson_id` relationships
  - Verify: existing lessons have their card template slugs populated

### Step 4: Progress tracking (depends on Step 1)

- [ ] **SCO-198** — Create `track_progress` table + deprecate `lesson_progress.score`
  - Create `track_progress` with `(user_id, track_id)` unique constraint
  - RLS: own data only
  - Auto-update trigger for `updated_at`
  - Add deprecation COMMENT on `lesson_progress.score` (don't DROP)
  - Verify: table exists, RLS works, trigger fires

### Step 5: Practice + radar infrastructure (depends on Step 1)

- [ ] **SCO-199** — Create `drills` table + add `radar_dimensions` to `card_templates`
  - Create `drills` table with `track_id` FK and `drill_type` CHECK constraint
  - Add `radar_dimensions TEXT[] DEFAULT '{}'` to `card_templates`
  - Add GIN index on `radar_dimensions`
  - Verify: drills table accepts valid drill_types, GIN index exists

### Step 6: Onboarding + recommendations (depends on Step 1)

- [ ] **SCO-200** — Create `onboarding_results` + `practice_recommendations` tables + `profiles.cat_state`
  - Create `onboarding_results` with `(user_id, track_id, dimension)` unique
  - Create `practice_recommendations` with starter seed data
  - Add `profiles.cat_state JSONB DEFAULT NULL` for resumable CAT
  - Verify: tables exist, RLS correct, seed data present

### Step 7: Radar cache (new from round 3 refinements)

- [ ] Create `radar_cache` table for materialized radar scores
  ```sql
  CREATE TABLE radar_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    dimension TEXT NOT NULL,
    score REAL NOT NULL DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, dimension)
  );
  ALTER TABLE radar_cache ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "own_data" ON radar_cache FOR ALL USING (auth.uid() = user_id);
  ```

  - Add `radar_dimensions TEXT[] DEFAULT '{}'` to `review_records` (for denormalized dimension tracking)
  - Add GIN index on `review_records.radar_dimensions`

### Step 8: Rewrite seeding RPC (depends on Steps 3, 4)

- [ ] **SCO-201** — Rewrite `seed_lesson_cards()` RPC for completion-based seeding
  - Create `seed_lesson_cards_v2(p_user_id UUID, p_lesson_id UUID, p_initial_interval_override INTERVAL DEFAULT NULL)`
  - Reads `unlocks_cards` from lesson (not function parameters)
  - Initial interval: 4h perceptual/rhythm, 8h declarative (overridable via parameter for engagement-modulated seeding)
  - Updates `track_progress.lessons_completed`
  - Idempotent: ON CONFLICT DO NOTHING, COALESCE on completed_at
  - Preserve old `seed_lesson_cards()` temporarily
  - Verify: complete a lesson → cards appear in user_card_state with correct intervals

### Step 9: Reconciliation job

- [ ] **SCO-226** — Create `reconcile_lesson_cards()` RPC
  - Checks for missing cards when `unlocks_cards` is updated after lesson completion
  - Idempotent, safe to run repeatedly
  - Verify: add a new slug to a completed lesson's unlocks_cards → run reconciliation → card appears

### Step 10: Types + docs (depends on all above)

- [ ] **SCO-202** — Update TypeScript types and regenerate Supabase types
  - New types: `SkillTrack`, `TrackProgress`, `Drill`, `OnboardingResult`, `PracticeRecommendation`, `RadarCache`
  - Modified types: `Module` (+track_id), `Lesson` (+track_id, +unlocks_cards, +unlocks_drills, +soft_prerequisites), `CardTemplate` (+radar_dimensions)
  - Remove `AuralQuizStage` and `TheoryQuizStage` from `LessonStage` union
  - Add `InteractiveStage` and `GuidedPracticeStage` to `LessonStage` union
  - Simplify `LessonCompletionResult` (remove quiz data) and create `StageCompletionResult`
  - Run `supabase gen types typescript`
  - Verify: `tsc --noEmit` passes with zero errors
  - Update REF: Database Schema SQL doc in Linear with full v2 schema

---

## Verification Checklist (run after all Phase 1 tasks)

- [ ] All new tables exist with correct columns, constraints, and indexes
- [ ] All RLS policies enforce correct access patterns
- [ ] All existing data is preserved (no rows lost, no columns dropped)
- [ ] `skill_tracks` has exactly 4 rows
- [ ] All existing modules and lessons have `track_id` pointing to ear_training
- [ ] All existing lessons have `unlocks_cards` populated from their card_templates
- [ ] `seed_lesson_cards_v2()` works end-to-end: complete lesson → cards appear → track_progress updates
- [ ] `reconcile_lesson_cards()` works: add new card slug → run → card appears for completed users
- [ ] `tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] Supabase types regenerated and match schema
- [ ] REF: Database Schema SQL doc updated in Linear

---

## What NOT To Do

- Do NOT drop any existing columns or tables
- Do NOT modify the FSRS scheduler algorithm (`lib/srs/scheduler.ts`)
- Do NOT change the drone sound (3 oscillators at -7/0/+7 cents + octave sub)
- Do NOT change the rhythm tapping component behavior
- Do NOT modify `process_review_answer()` RPC yet (that's Phase 2: SCO-188/210)
- Do NOT create UI components yet (that's Phase 2+)
- Do NOT touch lesson content / stages JSONB yet (that's Phase 3: SCO-191/219/220)

---

## After Phase 1 Completes

The next Ralph loop should target **Phase 2: Core Pipes** — three epics that can run in parallel:

- **SCO-186** (Stage Types) — build InteractiveStage + GuidedPracticeStage, refactor StageRenderer
- **SCO-185** (Multi-Track Lesson System) — TrackSelector, per-track gating, completion flow
- **SCO-188** (Review Queue v2) — blended multi-track queue, radar_dimensions wiring, per-track summary

Each epic has full sub-task breakdowns in Linear. Read the epic description for context before starting.

---

## Reference: Issue Map

```
PRE-WORK
  SCO-194  Audit existing issues (THIS PHASE)

PHASE 1: SCHEMA (THIS PHASE)
  SCO-184  [Epic] v2 Database Schema Migration
    SCO-195  Create skill_tracks
    SCO-196  Add track_id to modules/lessons
    SCO-197  Add unlocks_cards/unlocks_drills/soft_prerequisites
    SCO-198  Create track_progress + deprecate score
    SCO-199  Create drills + radar_dimensions on card_templates
    SCO-200  Create onboarding_results + practice_recommendations + cat_state
    (new)    Create radar_cache + review_records.radar_dimensions
    SCO-201  Rewrite seed_lesson_cards RPC
    SCO-226  Create reconcile_lesson_cards RPC
    SCO-202  Update TypeScript types + Supabase types + Schema doc

PHASE 2: CORE PIPES (next loop)
  SCO-186  [Epic] Revised Lesson Stage Types
    SCO-203  InteractiveStage component
    SCO-204  GuidedPracticeStage component
    SCO-205  Refactor StageRenderer
  SCO-185  [Epic] Multi-Track Lesson System
    SCO-206  TrackSelector component
    SCO-207  Per-track module/lesson list
    SCO-208  Lesson completion flow + summary
  SCO-188  [Epic] Review Queue v2
    SCO-209  Blended multi-track queue API
    SCO-210  radar_dimensions through answer pipeline
    SCO-211  Per-track session summary

PHASE 3: ET END-TO-END (later loop)
  SCO-187  Practice Layer (SCO-212, 213, 214)
  SCO-190  Skills Radar (SCO-215, 216)
  SCO-191  Lesson Content (SCO-219, 220)
  SCO-193  Navigation Shell (SCO-217, 218)

PHASE 4: POLISH (later loop)
  SCO-189  Adaptive Onboarding (SCO-221, 222)
  SCO-192  Integration Flows (SCO-223, 224)
  SCO-227  Timbre sample pack

REFINEMENT TRACKERS (apply when touching related issues)
  SCO-225  Round 1 refinements
  SCO-230  Round 2 refinements
  SCO-231  Round 3 refinements
```
