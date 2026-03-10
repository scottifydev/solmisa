-- SCO-377: Redesign 7 broken link types across 4 topics
-- These links test fixed definitions instead of key-varying skills.
-- See: AUDIT: Card Redundancy doc
--
-- Fixed links:
--   1. Key Sigs L4 (15 chains): brightness ranking → mode-key relationship
--   2. Mode Ear ID L4 (7 chains): characteristic degree → close-pair audio discrimination
--   3. Mode Ear ID L6 (7 chains): duplicate audio-ID → parent-key identification
--   4. Intervals L4 (12 chains): wider/narrower → close-pair audio discrimination
--   5. Chord Quality L6 (6 chains): seventh type (duplicate) → chord spelling
--   6. Harmonic Function: deferred (needs separate audio + progression infrastructure)

-- =============================================
-- Section 1: Key Signatures L4 (15 chains)
-- FROM: "Which of these modes is the brightest?" (fixed: always lydian)
-- TO: "What key signature does [Root] [Mode] use?" (varies per chain)
-- =============================================

DO $$
DECLARE
  r RECORD;
BEGIN
  CREATE TEMP TABLE _keysig_l4 (
    template_slug TEXT,
    new_prompt TEXT,
    correct_label TEXT,
    opt_b TEXT, opt_c TEXT, opt_d TEXT,
    fb_correct TEXT,
    fb_incorrect TEXT
  );

  INSERT INTO _keysig_l4 VALUES
    ('flow_key_c_major_brightness',
     'What key signature does D Dorian use?',
     'C major', 'G major', 'D major', 'F major',
     'D Dorian is the 2nd mode of C major — same notes, same key signature: no sharps or flats.',
     'Dorian is built on the 2nd degree of a major scale. D is the 2nd of C major.'),
    ('flow_key_g_major_brightness',
     'What key signature does B Phrygian use?',
     'G major', 'D major', 'C major', 'E major',
     'B Phrygian is the 3rd mode of G major — one sharp (F#).',
     'Phrygian is built on the 3rd degree of a major scale. B is the 3rd of G major.'),
    ('flow_key_d_major_brightness',
     'What key signature does G Lydian use?',
     'D major', 'G major', 'A major', 'C major',
     'G Lydian is the 4th mode of D major — two sharps (F#, C#).',
     'Lydian is built on the 4th degree of a major scale. G is the 4th of D major.'),
    ('flow_key_f_major_brightness',
     'What key signature does C Mixolydian use?',
     'F major', 'C major', 'Bb major', 'G major',
     'C Mixolydian is the 5th mode of F major — one flat (Bb).',
     'Mixolydian is built on the 5th degree of a major scale. C is the 5th of F major.'),
    ('flow_key_bb_major_brightness',
     'What key signature does G Aeolian use?',
     'Bb major', 'Eb major', 'F major', 'G major',
     'G Aeolian is the 6th mode of Bb major — two flats (Bb, Eb).',
     'Aeolian is built on the 6th degree of a major scale. G is the 6th of Bb major.'),
    ('flow_key_a_major_brightness',
     'What key signature does C# Phrygian use?',
     'A major', 'E major', 'D major', 'F# major',
     'C# Phrygian is the 3rd mode of A major — three sharps (F#, C#, G#).',
     'Phrygian is built on the 3rd degree of a major scale. C# is the 3rd of A major.'),
    ('flow_key_e_major_brightness',
     'What key signature does A Lydian use?',
     'E major', 'A major', 'B major', 'D major',
     'A Lydian is the 4th mode of E major — four sharps (F#, C#, G#, D#).',
     'Lydian is built on the 4th degree of a major scale. A is the 4th of E major.'),
    ('flow_key_b_major_brightness',
     'What key signature does F# Mixolydian use?',
     'B major', 'F# major', 'E major', 'A major',
     'F# Mixolydian is the 5th mode of B major — five sharps.',
     'Mixolydian is built on the 5th degree of a major scale. F# is the 5th of B major.'),
    ('flow_key_fs_major_brightness',
     'What key signature does D# Aeolian use?',
     'F# major', 'C# major', 'B major', 'E major',
     'D# Aeolian is the 6th mode of F# major — six sharps.',
     'Aeolian is built on the 6th degree of a major scale. D# is the 6th of F# major.'),
    ('flow_key_cs_major_brightness',
     'What key signature does D# Dorian use?',
     'C# major', 'F# major', 'G# major', 'B major',
     'D# Dorian is the 2nd mode of C# major — seven sharps.',
     'Dorian is built on the 2nd degree of a major scale. D# is the 2nd of C# major.'),
    ('flow_key_eb_major_brightness',
     'What key signature does G Phrygian use?',
     'Eb major', 'Ab major', 'Bb major', 'F major',
     'G Phrygian is the 3rd mode of Eb major — three flats (Bb, Eb, Ab).',
     'Phrygian is built on the 3rd degree of a major scale. G is the 3rd of Eb major.'),
    ('flow_key_ab_major_brightness',
     'What key signature does Db Lydian use?',
     'Ab major', 'Db major', 'Eb major', 'Bb major',
     'Db Lydian is the 4th mode of Ab major — four flats (Bb, Eb, Ab, Db).',
     'Lydian is built on the 4th degree of a major scale. Db is the 4th of Ab major.'),
    ('flow_key_db_major_brightness',
     'What key signature does Ab Mixolydian use?',
     'Db major', 'Ab major', 'Gb major', 'Eb major',
     'Ab Mixolydian is the 5th mode of Db major — five flats.',
     'Mixolydian is built on the 5th degree of a major scale. Ab is the 5th of Db major.'),
    ('flow_key_gb_major_brightness',
     'What key signature does Eb Aeolian use?',
     'Gb major', 'Db major', 'Ab major', 'Eb major',
     'Eb Aeolian is the 6th mode of Gb major — six flats.',
     'Aeolian is built on the 6th degree of a major scale. Eb is the 6th of Gb major.'),
    ('flow_key_cb_major_brightness',
     'What key signature does Db Dorian use?',
     'Cb major', 'Gb major', 'Db major', 'Ab major',
     'Db Dorian is the 2nd mode of Cb major — seven flats.',
     'Dorian is built on the 2nd degree of a major scale. Db is the 2nd of Cb major.');

  FOR r IN SELECT * FROM _keysig_l4 LOOP
    -- Update card_template
    UPDATE card_templates SET
      prompt_text = r.new_prompt,
      parameters = jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.correct_label),
          jsonb_build_object('id', 'b', 'label', r.opt_b),
          jsonb_build_object('id', 'c', 'label', r.opt_c),
          jsonb_build_object('id', 'd', 'label', r.opt_d)
        )
      ),
      feedback = jsonb_build_object(
        'correct', jsonb_build_object('text', r.fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    WHERE slug = r.template_slug;

    -- Update card_instance to match
    UPDATE card_instances SET
      prompt_rendered = r.new_prompt,
      answer_data = jsonb_build_object('correct_answer', 'a'),
      options_data = jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', r.correct_label),
        jsonb_build_object('id', 'b', 'label', r.opt_b),
        jsonb_build_object('id', 'c', 'label', r.opt_c),
        jsonb_build_object('id', 'd', 'label', r.opt_d)
      )
    WHERE template_id = (SELECT id FROM card_templates WHERE slug = r.template_slug);
  END LOOP;

  -- Update chain_links: remove drag_rank, keep select_one only
  UPDATE chain_links SET
    description = 'Mode-key signature relationship',
    modalities = '["select_one"]'::jsonb,
    modality_by_stage = '{}'::jsonb
  WHERE position = 4
  AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'key_signatures');

  DROP TABLE _keysig_l4;
  RAISE NOTICE 'Section 1: Key Sig L4 — 15 templates updated to mode-key relationship';
END $$;


-- =============================================
-- Section 2: Mode Ear ID L4 (7 chains)
-- FROM: "What is the characteristic degree of [Mode]?" (fixed fact)
-- TO: Close-pair audio discrimination (hear mode, pick from 2 nearest neighbors)
-- =============================================

DO $$
DECLARE
  r RECORD;
BEGIN
  CREATE TEMP TABLE _mode_l4 (
    template_slug TEXT,
    new_prompt TEXT,
    correct_label TEXT,
    confusable_label TEXT,
    fb_correct TEXT,
    fb_incorrect TEXT
  );

  INSERT INTO _mode_l4 VALUES
    ('flow_mode_ionian_l4',
     'Listen. Is this mode Ionian or Mixolydian?',
     'Ionian', 'Mixolydian',
     'Ionian — the natural 7th creates a leading tone that pulls to the tonic. Mixolydian lowers it.',
     'Focus on the 7th degree. Ionian keeps it natural (strong resolution). Mixolydian lowers it (relaxed).'),
    ('flow_mode_aeolian_l4',
     'Listen. Is this mode Aeolian or Dorian?',
     'Aeolian', 'Dorian',
     'Aeolian — the lowered 6th gives natural minor its characteristic melancholy.',
     'Focus on the 6th degree. Aeolian keeps it low (melancholy). Dorian raises it (warmth).'),
    ('flow_mode_dorian_l4',
     'Listen. Is this mode Dorian or Aeolian?',
     'Dorian', 'Aeolian',
     'Dorian — the raised 6th adds warmth to an otherwise minor sound.',
     'Focus on the 6th degree. Dorian raises it for a jazzy warmth. Aeolian keeps it low.'),
    ('flow_mode_mixolydian_l4',
     'Listen. Is this mode Mixolydian or Ionian?',
     'Mixolydian', 'Ionian',
     'Mixolydian — the lowered 7th removes the leading tone, giving it a relaxed character.',
     'Focus on the 7th degree. Mixolydian lowers it (relaxed). Ionian keeps it natural (resolving).'),
    ('flow_mode_phrygian_l4',
     'Listen. Is this mode Phrygian or Aeolian?',
     'Phrygian', 'Aeolian',
     'Phrygian — the lowered 2nd adds exotic tension right above the tonic.',
     'Focus on the 2nd degree. Phrygian lowers it (exotic bite). Aeolian keeps it natural.'),
    ('flow_mode_lydian_l4',
     'Listen. Is this mode Lydian or Ionian?',
     'Lydian', 'Ionian',
     'Lydian — the raised 4th creates a floating brightness beyond standard major.',
     'Focus on the 4th degree. Lydian raises it (floating). Ionian keeps it natural (grounded).'),
    ('flow_mode_locrian_l4',
     'Listen. Is this mode Locrian or Phrygian?',
     'Locrian', 'Phrygian',
     'Locrian — the lowered 5th eliminates the perfect 5th, creating fundamental instability.',
     'Focus on the 5th degree. Locrian lowers it (unstable). Phrygian keeps it perfect.');

  FOR r IN SELECT * FROM _mode_l4 LOOP
    UPDATE card_templates SET
      card_category = 'aural',
      response_type = 'binary_choice',
      prompt_text = r.new_prompt,
      parameters = jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.correct_label),
          jsonb_build_object('id', 'b', 'label', r.confusable_label)
        )
      ),
      feedback = jsonb_build_object(
        'correct', jsonb_build_object('text', r.fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    WHERE slug = r.template_slug;

    UPDATE card_instances SET
      prompt_rendered = r.new_prompt,
      answer_data = jsonb_build_object('correct_answer', 'a'),
      options_data = jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', r.correct_label),
        jsonb_build_object('id', 'b', 'label', r.confusable_label)
      )
    WHERE template_id = (SELECT id FROM card_templates WHERE slug = r.template_slug);
  END LOOP;

  -- Update chain_links: change to audio binary choice
  UPDATE chain_links SET
    description = 'Close-pair mode discrimination by ear',
    modalities = '["binary_choice","audio_select"]'::jsonb,
    modality_by_stage = '{}'::jsonb
  WHERE position = 4
  AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'scale_mode_ear_id');

  DROP TABLE _mode_l4;
  RAISE NOTICE 'Section 2: Mode Ear ID L4 — 7 templates updated to close-pair audio discrimination';
END $$;


-- =============================================
-- Section 3: Mode Ear ID L6 (7 chains)
-- FROM: "Listen and identify the mode" (duplicates L2/L3)
-- TO: Parent-key identification (varies by root)
-- =============================================

DO $$
DECLARE
  r RECORD;
BEGIN
  CREATE TEMP TABLE _mode_l6 (
    template_slug TEXT,
    new_prompt TEXT,
    correct_label TEXT,
    opt_b TEXT, opt_c TEXT, opt_d TEXT,
    fb_correct TEXT,
    fb_incorrect TEXT
  );

  INSERT INTO _mode_l6 VALUES
    ('flow_mode_ionian_l6',
     'Starting on the 2nd degree of Eb major gives which mode?',
     'F Dorian', 'F Phrygian', 'F Lydian', 'F Mixolydian',
     'The 2nd degree of any major scale produces Dorian. F is the 2nd of Eb major.',
     'Each scale degree creates a specific mode: 2nd = Dorian, 3rd = Phrygian, 4th = Lydian, 5th = Mixolydian.'),
    ('flow_mode_aeolian_l6',
     'F# Aeolian uses the same notes as which major key?',
     'A major', 'D major', 'E major', 'F# major',
     'F# Aeolian is the 6th mode of A major — same notes, different home base.',
     'Aeolian starts on the 6th degree. F# is the 6th of A major.'),
    ('flow_mode_dorian_l6',
     'Bb Dorian uses the same notes as which major key?',
     'Ab major', 'Eb major', 'Bb major', 'F major',
     'Bb Dorian is the 2nd mode of Ab major — same notes, different center.',
     'Dorian starts on the 2nd degree. Bb is the 2nd of Ab major.'),
    ('flow_mode_mixolydian_l6',
     'A Mixolydian uses the same notes as which major key?',
     'D major', 'A major', 'G major', 'E major',
     'A Mixolydian is the 5th mode of D major — same notes, different home.',
     'Mixolydian starts on the 5th degree. A is the 5th of D major.'),
    ('flow_mode_phrygian_l6',
     'C Phrygian uses the same notes as which major key?',
     'Ab major', 'C major', 'Eb major', 'F major',
     'C Phrygian is the 3rd mode of Ab major — same notes, different tonal center.',
     'Phrygian starts on the 3rd degree. C is the 3rd of Ab major.'),
    ('flow_mode_lydian_l6',
     'F Lydian uses the same notes as which major key?',
     'C major', 'F major', 'Bb major', 'G major',
     'F Lydian is the 4th mode of C major — same notes, different center.',
     'Lydian starts on the 4th degree. F is the 4th of C major.'),
    ('flow_mode_locrian_l6',
     'B Locrian uses the same notes as which major key?',
     'C major', 'B major', 'G major', 'D major',
     'B Locrian is the 7th mode of C major — same notes, the most unstable center.',
     'Locrian starts on the 7th degree. B is the 7th of C major.');

  FOR r IN SELECT * FROM _mode_l6 LOOP
    UPDATE card_templates SET
      card_category = 'declarative',
      response_type = 'select_one',
      prompt_text = r.new_prompt,
      parameters = jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.correct_label),
          jsonb_build_object('id', 'b', 'label', r.opt_b),
          jsonb_build_object('id', 'c', 'label', r.opt_c),
          jsonb_build_object('id', 'd', 'label', r.opt_d)
        )
      ),
      feedback = jsonb_build_object(
        'correct', jsonb_build_object('text', r.fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    WHERE slug = r.template_slug;

    UPDATE card_instances SET
      prompt_rendered = r.new_prompt,
      answer_data = jsonb_build_object('correct_answer', 'a'),
      options_data = jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', r.correct_label),
        jsonb_build_object('id', 'b', 'label', r.opt_b),
        jsonb_build_object('id', 'c', 'label', r.opt_c),
        jsonb_build_object('id', 'd', 'label', r.opt_d)
      )
    WHERE template_id = (SELECT id FROM card_templates WHERE slug = r.template_slug);
  END LOOP;

  -- Update chain_links: remove staff_audio_select, knowledge-based now
  UPDATE chain_links SET
    description = 'Parent-key identification',
    modalities = '["select_one"]'::jsonb,
    modality_by_stage = '{}'::jsonb
  WHERE position = 6
  AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'scale_mode_ear_id');

  DROP TABLE _mode_l6;
  RAISE NOTICE 'Section 3: Mode Ear ID L6 — 7 templates updated to parent-key identification';
END $$;


-- =============================================
-- Section 4: Intervals L4 (12 chains)
-- FROM: "Is this interval wider or narrower than X?" (fixed binary per chain)
-- TO: Close-pair audio discrimination (hear interval, pick from 2 neighbors)
-- =============================================

DO $$
DECLARE
  r RECORD;
BEGIN
  CREATE TEMP TABLE _interval_l4 (
    template_slug TEXT,
    new_prompt TEXT,
    correct_label TEXT,
    confusable_label TEXT,
    half_steps INT,
    fb_correct TEXT,
    fb_incorrect TEXT
  );

  INSERT INTO _interval_l4 VALUES
    ('flow_interval_m2_compare',
     'Listen. Is this a minor 2nd or a major 2nd?',
     'Minor 2nd', 'Major 2nd', 1,
     'Minor 2nd — 1 half step. The tightest melodic distance, sharper and more biting than the whole step.',
     'Compare: minor 2nd = 1 half step (tight, biting). Major 2nd = 2 half steps (wider, gentler).'),
    ('flow_interval_M2_compare',
     'Listen. Is this a major 2nd or a minor 3rd?',
     'Major 2nd', 'Minor 3rd', 2,
     'Major 2nd — 2 half steps (one whole step). Narrower and more stepwise than a 3rd.',
     'Compare: major 2nd = 2 half steps (a step). Minor 3rd = 3 half steps (a skip). Steps feel closer.'),
    ('flow_interval_m3_compare',
     'Listen. Is this a minor 3rd or a major 3rd?',
     'Minor 3rd', 'Major 3rd', 3,
     'Minor 3rd — 3 half steps. The darker, more introspective of the two thirds.',
     'Compare: minor 3rd = 3 half steps (dark). Major 3rd = 4 half steps (bright). One half step changes the mood.'),
    ('flow_interval_M3_compare',
     'Listen. Is this a major 3rd or a perfect 4th?',
     'Major 3rd', 'Perfect 4th', 4,
     'Major 3rd — 4 half steps. Warm and bright, unlike the open hollowness of a 4th.',
     'Compare: major 3rd = 4 half steps (warm, bright). Perfect 4th = 5 half steps (open, hollow).'),
    ('flow_interval_P4_compare',
     'Listen. Is this a perfect 4th or a tritone?',
     'Perfect 4th', 'Tritone', 5,
     'Perfect 4th — 5 half steps. Clean and open, without the restless tension of the tritone.',
     'Compare: perfect 4th = 5 half steps (clean). Tritone = 6 half steps (tense, unstable).'),
    ('flow_interval_A4_compare',
     'Listen. Is this a tritone or a perfect 5th?',
     'Tritone', 'Perfect 5th', 6,
     'Tritone — 6 half steps. Restless and searching, unlike the stable perfect 5th.',
     'Compare: tritone = 6 half steps (unstable). Perfect 5th = 7 half steps (stable, consonant).'),
    ('flow_interval_P5_compare',
     'Listen. Is this a perfect 5th or a perfect 4th?',
     'Perfect 5th', 'Perfect 4th', 7,
     'Perfect 5th — 7 half steps. The widest of the two perfect intervals within the octave, with a powerful stability.',
     'Compare: perfect 5th = 7 half steps (wide, powerful). Perfect 4th = 5 half steps (narrower, more open).'),
    ('flow_interval_m6_compare',
     'Listen. Is this a minor 6th or a major 6th?',
     'Minor 6th', 'Major 6th', 8,
     'Minor 6th — 8 half steps. Bittersweet and yearning, one half step darker than the major.',
     'Compare: minor 6th = 8 half steps (bittersweet). Major 6th = 9 half steps (bright, expansive).'),
    ('flow_interval_M6_compare',
     'Listen. Is this a major 6th or a minor 7th?',
     'Major 6th', 'Minor 7th', 9,
     'Major 6th — 9 half steps. Bright and expansive, more resolved than the bluesy 7th.',
     'Compare: major 6th = 9 half steps (bright, warm). Minor 7th = 10 half steps (bluesy, unresolved).'),
    ('flow_interval_m7_compare',
     'Listen. Is this a minor 7th or a major 7th?',
     'Minor 7th', 'Major 7th', 10,
     'Minor 7th — 10 half steps. Warm and bluesy, less biting than the crystalline major 7th.',
     'Compare: minor 7th = 10 half steps (warm, bluesy). Major 7th = 11 half steps (bright, piercing).'),
    ('flow_interval_M7_compare',
     'Listen. Is this a major 7th or a perfect octave?',
     'Major 7th', 'Perfect octave', 11,
     'Major 7th — 11 half steps. Bright and piercing, one half step short of the complete octave.',
     'Compare: major 7th = 11 half steps (dissonant, yearning). Perfect octave = 12 (pure resolution).'),
    ('flow_interval_P8_compare',
     'Listen. Is this a perfect octave or a major 7th?',
     'Perfect octave', 'Major 7th', 12,
     'Perfect octave — 12 half steps. Complete resolution, the same note one register higher.',
     'Compare: perfect octave = 12 half steps (pure fusion). Major 7th = 11 (one half step short, dissonant).');

  FOR r IN SELECT * FROM _interval_l4 LOOP
    UPDATE card_templates SET
      response_type = 'binary_choice',
      prompt_text = r.new_prompt,
      parameters = jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.correct_label),
          jsonb_build_object('id', 'b', 'label', r.confusable_label)
        ),
        'half_steps', r.half_steps
      ),
      feedback = jsonb_build_object(
        'correct', jsonb_build_object('text', r.fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    WHERE slug = r.template_slug;

    UPDATE card_instances SET
      prompt_rendered = r.new_prompt,
      answer_data = jsonb_build_object('correct_answer', 'a'),
      options_data = jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', r.correct_label),
        jsonb_build_object('id', 'b', 'label', r.confusable_label)
      )
    WHERE template_id = (SELECT id FROM card_templates WHERE slug = r.template_slug);
  END LOOP;

  -- Update chain_links: audio close-pair discrimination
  UPDATE chain_links SET
    description = 'Close-pair interval discrimination by ear',
    modalities = '["binary_choice","audio_select"]'::jsonb,
    modality_by_stage = '{}'::jsonb
  WHERE position = 4
  AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'interval_recognition');

  DROP TABLE _interval_l4;
  RAISE NOTICE 'Section 4: Intervals L4 — 12 templates updated to close-pair audio discrimination';
END $$;


-- =============================================
-- Section 5: Chord Quality L6 (6 chains)
-- FROM: "Identify the type of seventh chord" (duplicates L5 concept)
-- TO: Chord spelling on a specific root (knowledge application)
-- =============================================

DO $$
DECLARE
  r RECORD;
BEGIN
  CREATE TEMP TABLE _chord_l6 (
    template_slug TEXT,
    new_prompt TEXT,
    correct_label TEXT,
    opt_b TEXT, opt_c TEXT, opt_d TEXT,
    fb_correct TEXT,
    fb_incorrect TEXT
  );

  INSERT INTO _chord_l6 VALUES
    ('flow_chord_quality_major_l6',
     'Spell an Eb major triad',
     'Eb - G - Bb', 'Eb - Gb - Bb', 'Eb - G - B', 'Eb - Ab - Bb',
     'Major triad = root + major 3rd + perfect 5th. Eb to G is a major 3rd (4 half steps), G to Bb is a minor 3rd.',
     'A major triad is built: root, up a major 3rd (4 half steps), up a minor 3rd (3 half steps). From Eb: Eb - G - Bb.'),
    ('flow_chord_quality_minor_l6',
     'Spell an F# minor triad',
     'F# - A - C#', 'F# - A# - C#', 'F# - A - C', 'F# - Ab - C#',
     'Minor triad = root + minor 3rd + perfect 5th. F# to A is a minor 3rd (3 half steps), A to C# is a major 3rd.',
     'A minor triad is built: root, up a minor 3rd (3 half steps), up a major 3rd (4 half steps). From F#: F# - A - C#.'),
    ('flow_chord_quality_dim_l6',
     'Spell an A diminished triad',
     'A - C - Eb', 'A - C - E', 'A - C# - Eb', 'A - Cb - Eb',
     'Diminished triad = root + minor 3rd + diminished 5th. Two stacked minor 3rds: A-C (3), C-Eb (3).',
     'A diminished triad stacks two minor 3rds: root up 3 half steps, then up 3 more. From A: A - C - Eb.'),
    ('flow_chord_quality_aug_l6',
     'Spell a D augmented triad',
     'D - F# - A#', 'D - F# - A', 'D - F - A#', 'D - Gb - A#',
     'Augmented triad = root + major 3rd + augmented 5th. Two stacked major 3rds: D-F# (4), F#-A# (4).',
     'An augmented triad stacks two major 3rds: root up 4 half steps, then up 4 more. From D: D - F# - A#.'),
    ('flow_chord_quality_dom7_l6',
     'Spell a Bb dominant 7th chord',
     'Bb - D - F - Ab', 'Bb - D - F - A', 'Bb - Db - F - Ab', 'Bb - D - F# - Ab',
     'Dominant 7th = major triad + minor 7th. Bb major triad (Bb-D-F) plus Ab (minor 7th from root).',
     'A dominant 7th is a major triad with a minor 7th on top. From Bb: Bb - D - F - Ab.'),
    ('flow_chord_quality_maj7_l6',
     'Spell a G major 7th chord',
     'G - B - D - F#', 'G - B - D - F', 'G - Bb - D - F#', 'G - B - D# - F#',
     'Major 7th = major triad + major 7th. G major triad (G-B-D) plus F# (major 7th from root).',
     'A major 7th chord is a major triad with a major 7th on top. From G: G - B - D - F#.');

  FOR r IN SELECT * FROM _chord_l6 LOOP
    UPDATE card_templates SET
      card_category = 'declarative',
      response_type = 'select_one',
      prompt_text = r.new_prompt,
      parameters = jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.correct_label),
          jsonb_build_object('id', 'b', 'label', r.opt_b),
          jsonb_build_object('id', 'c', 'label', r.opt_c),
          jsonb_build_object('id', 'd', 'label', r.opt_d)
        )
      ),
      feedback = jsonb_build_object(
        'correct', jsonb_build_object('text', r.fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    WHERE slug = r.template_slug;

    UPDATE card_instances SET
      prompt_rendered = r.new_prompt,
      answer_data = jsonb_build_object('correct_answer', 'a'),
      options_data = jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', r.correct_label),
        jsonb_build_object('id', 'b', 'label', r.opt_b),
        jsonb_build_object('id', 'c', 'label', r.opt_c),
        jsonb_build_object('id', 'd', 'label', r.opt_d)
      )
    WHERE template_id = (SELECT id FROM card_templates WHERE slug = r.template_slug);
  END LOOP;

  -- Update chain_links: knowledge-based spelling, no audio
  UPDATE chain_links SET
    description = 'Chord spelling on specific root',
    modalities = '["select_one"]'::jsonb,
    modality_by_stage = '{}'::jsonb
  WHERE position = 6
  AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'chord_quality_ear_id');

  DROP TABLE _chord_l6;
  RAISE NOTICE 'Section 5: Chord Quality L6 — 6 templates updated to chord spelling';
END $$;


-- =============================================
-- Section 6: Harmonic Function (deferred)
-- The 3 harmonic function chains (tonic, subdominant, dominant) need a
-- deeper redesign involving audio progressions and contextual identification.
-- This requires new audio infrastructure for chord progression playback.
-- Filed as follow-up work within SCO-377 or a separate issue.
-- =============================================

-- Summary of changes:
--   Key Sigs L4:      15 card_templates, 15 card_instances, 15 chain_links updated
--   Mode Ear ID L4:    7 card_templates,  7 card_instances,  7 chain_links updated
--   Mode Ear ID L6:    7 card_templates,  7 card_instances,  7 chain_links updated
--   Intervals L4:     12 card_templates, 12 card_instances, 12 chain_links updated
--   Chord Quality L6:  6 card_templates,  6 card_instances,  6 chain_links updated
--   Total: 47 card_templates, 47 card_instances, 47 chain_links
