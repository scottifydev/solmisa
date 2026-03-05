# v2 Audit Findings — SCO-194

> Audit of existing SCO issues before v2 migration. Preserves technical knowledge, dispositions non-Done issues.

---

## Technical Contracts to Preserve

### Drone Sound (SCO-167)

- 8 PAD_VOICES: unison detuned oscillators (±12, ±6, ±18 cents spread)
- Sub-octave sine layer (quiet, warmth)
- Upper-octave filtered sine (very quiet, shimmer)
- Signal chain: lowpass filter → chorus → reverb → compressor
- Constraint: tonic-only — no fifths, thirds, or other scale degrees
- File: `lib/audio/drone.ts`

### Rhythm Tapping (SCO-55, SCO-182)

- Three modes: listen, tap, identify
- Beat grid visual with metronome click (downbeat accent)
- BPM-scaled tolerance window (±80ms slow, ±50ms fast)
- onPointerDown for low-latency mobile input
- Big tap button during recording phase
- File: `components/lesson/rhythm-tapper.tsx`

### FSRS Scheduler (SCO-36)

- 11 sub-stages across 5 named groups: Apprentice (1-4), Journeyman (1-2), Adept (1-2), Virtuoso (1-2), Mastered (1)
- Dual scheduling: declarative (per-item) vs perceptual (session-based)
- CardCategory: `'perceptual' | 'declarative' | 'rhythm'`
- Perceptual promotion thresholds: >=90% advance, 70-89% hold, <70% regress
- Perceptual floor: never below Apprentice stage 2 on single bad session
- Leech detection at >8 reviews with regression
- Files: `lib/srs/fsrs.ts`, `lib/srs/scheduler.ts`

### Stage JSONB Schema (SCO-146)

- Module 1 stages match TypeScript interfaces
- Modules 2-7 use inconsistent field names (body/content vs instructions/content)
- v2 eliminates quiz stages entirely — replaced by interactive + guided_practice
- Field standardization deferred to v2 content rewrite (SCO-219)

### FM Synth / Playback (SCO-172)

- Piano-like FMSynth with bright hammer attack, warm decay
- Replaced raw fmtriangle oscillator
- File: `lib/audio/playback.ts`

### difficulty_tiers Format (SCO-141)

- DB stores as array: `[{tier: 1, key: "C"}, {tier: 2, key: "G"}]`
- TypeScript expects: `Record<DifficultyTier, DifficultyTierConfig>`
- Decision: migrate data to match spec (not vice versa)
- 402 cards across 36 lessons affected

### Review Session (SCO-169)

- Key change stuck state: wrap drone.changeKey() in try/finally
- Removed dead skill_group tracking code
- File: `components/review/review-session.tsx`

---

## Issue Dispositions

### Canceled (superseded by v2 epics)

| Issue   | Title                   | Reason                                    |
| ------- | ----------------------- | ----------------------------------------- |
| SCO-177 | Review Module 1 content | Superseded by SCO-191 (Content Migration) |
| SCO-178 | Review Lesson 1.1       | Content absorbed into SCO-219             |
| SCO-179 | Review Lesson 1.2       | Content absorbed into SCO-219             |
| SCO-180 | Review Lesson 1.3       | Content absorbed into SCO-219             |
| SCO-181 | Review Lesson 1.4       | Content absorbed into SCO-219             |

### Moved (still relevant, re-parented)

| Issue   | Title                   | New Parent          |
| ------- | ----------------------- | ------------------- |
| SCO-145 | Add sing response cards | Moved under SCO-191 |

### Kept (independent of v2)

| Issue  | Title              | Reason                                                        |
| ------ | ------------------ | ------------------------------------------------------------- |
| SCO-21 | Audio Engine epic  | Mostly done, review remaining sub-issues                      |
| SCO-29 | Curriculum Content | Audio pipeline sub-issues (SCO-34, 51, 52, 53) still relevant |
| SCO-35 | Launch Prep        | Independent of v2                                             |

---

## Phase 1 Schema Migrations Applied

All 9 migrations verified and deployed:

1. `skill_tracks` — 4 tracks seeded, RLS, CHECK constraint
2. `track_id` FK — on modules + lessons, backfilled ear_training, NOT NULL
3. `unlocks_cards/drills/soft_prerequisites` — on lessons, backfilled from card_templates
4. `track_progress` — table + trigger + lesson_progress.score deprecation
5. `drills + radar_dimensions` — drills table, GIN index on card_templates.radar_dimensions
6. `onboarding + recommendations` — tables + seeds + profiles.cat_state
7. `radar_cache` — table + review_records.radar_dimensions with GIN index
8. `seed_lesson_cards_v2()` — RPC with category-based intervals, engagement override
9. `reconcile_lesson_cards()` — idempotent reconciliation RPC
