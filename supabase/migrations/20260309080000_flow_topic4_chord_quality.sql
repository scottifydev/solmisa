-- Topic 4: Chord Quality Ear ID
-- 6 chains x 6 links = 36 card_templates, 36 card_instances, 36 chain_links

DO $$
DECLARE
  r RECORD;
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  CREATE TEMP TABLE _cq_chains (
    slug TEXT, name TEXT,
    unlock_cond JSONB,
    -- L1: Major or minor? (binary_choice)
    l1_a TEXT, l1_b TEXT,
    l1_fb_correct TEXT, l1_fb_incorrect TEXT,
    -- L2: What quality? 3 options (select_one)
    l2_a TEXT, l2_b TEXT, l2_c TEXT,
    l2_fb_correct TEXT, l2_fb_incorrect TEXT,
    -- L3: What quality? 4 options (select_one)
    l3_a TEXT, l3_b TEXT, l3_c TEXT, l3_d TEXT,
    l3_fb_correct TEXT, l3_fb_incorrect TEXT,
    -- L4: Triad or seventh? (binary_choice)
    l4_a TEXT, l4_b TEXT,
    l4_fb_correct TEXT, l4_fb_incorrect TEXT,
    -- L5: Chord in progression (select_one)
    l5_a TEXT, l5_b TEXT, l5_c TEXT, l5_d TEXT,
    l5_fb_correct TEXT, l5_fb_incorrect TEXT,
    -- L6: Type of seventh (select_one)
    l6_a TEXT, l6_b TEXT, l6_c TEXT, l6_d TEXT,
    l6_fb_correct TEXT, l6_fb_incorrect TEXT
  );

  INSERT INTO _cq_chains VALUES
    -- ==============================
    -- Chain 1: Major Triad (cold start)
    -- ==============================
    (
      'chord_quality_major',
      'Major Triad',
      '{"type":"cold_start"}',
      -- L1
      'Major-type', 'Minor-type',
      'The major third on the bottom gives this chord its bright, stable character.',
      'Listen for the wider interval at the bottom — major triads have a major third from root to third.',
      -- L2
      'Major', 'Minor', 'Augmented',
      'The major triad combines a major third and a perfect fifth — the most common chord quality in Western music.',
      'A major triad has a major third (4 half steps) on the bottom and a minor third (3 half steps) on top.',
      -- L3
      'Major', 'Minor', 'Augmented', 'Diminished',
      'Major triads sound resolved and stable. The root, major third, and perfect fifth create a consonant foundation.',
      'Compare the intervals: major triad = major 3rd + minor 3rd. That wider bottom interval is the key.',
      -- L4
      'Triad', 'Seventh chord',
      'Three notes stacked in thirds — root, third, and fifth. No seventh is present.',
      'Count the distinct pitch classes. A triad has three; a seventh chord has four.',
      -- L5
      'Major', 'Minor', 'Diminished', 'Dominant 7th',
      'In a progression, the major chord often functions as I, IV, or V — points of stability and motion.',
      'The highlighted chord has a bright, stable quality. Major triads are built from a major third plus a minor third.',
      -- L6
      'Major 7th', 'Dominant 7th', 'Minor 7th', 'Half-diminished 7th',
      'Adding a major seventh to a major triad creates the major 7th chord — lush and open.',
      'A major triad plus a major seventh interval from the root produces a major 7th chord.'
    ),
    -- ==============================
    -- Chain 2: Minor Triad (cold start)
    -- ==============================
    (
      'chord_quality_minor',
      'Minor Triad',
      '{"type":"cold_start"}',
      -- L1
      'Minor-type', 'Major-type',
      'The minor third on the bottom gives this chord its darker, more introspective quality.',
      'Listen for the narrower interval at the bottom — minor triads have a minor third from root to third.',
      -- L2
      'Minor', 'Major', 'Diminished',
      'The minor triad has a minor third and a perfect fifth — a stable but darker sonority.',
      'A minor triad has a minor third (3 half steps) on the bottom and a major third (4 half steps) on top.',
      -- L3
      'Minor', 'Major', 'Diminished', 'Augmented',
      'Minor triads have a more somber character. The narrower bottom third is what distinguishes them.',
      'Minor triad = minor 3rd + major 3rd. The smaller interval on the bottom darkens the sound.',
      -- L4
      'Triad', 'Seventh chord',
      'Three pitch classes — root, minor third, and perfect fifth. No seventh present.',
      'Count the distinct pitch classes. A triad has three; a seventh chord has four.',
      -- L5
      'Minor', 'Major', 'Augmented', 'Dominant 7th',
      'Minor chords often function as ii, iii, or vi in major keys — they add depth and contrast.',
      'The highlighted chord has a darker, more subdued quality. Minor triads are built from a minor third plus a major third.',
      -- L6
      'Minor 7th', 'Dominant 7th', 'Major 7th', 'Half-diminished 7th',
      'Adding a minor seventh to a minor triad creates the minor 7th chord — warm and commonly found in jazz and pop.',
      'A minor triad plus a minor seventh interval from the root produces a minor 7th chord.'
    ),
    -- ==============================
    -- Chain 3: Diminished Triad (unlock: minor mastery)
    -- ==============================
    (
      'chord_quality_dim',
      'Diminished Triad',
      '{"type":"neighbor_mastery","requires_chain":"chord_quality_minor","min_link":3}',
      -- L1
      'Minor-type', 'Major-type',
      'Diminished chords share the minor third on the bottom with minor chords, giving them a minor-type character.',
      'Both minor and diminished triads start with a minor third. The diminished fifth is what sets them apart.',
      -- L2
      'Diminished', 'Minor', 'Augmented',
      'Two stacked minor thirds produce the diminished triad — tense and unstable, pulling toward resolution.',
      'A diminished triad has two minor thirds stacked (3 + 3 half steps), creating a tritone between root and fifth.',
      -- L3
      'Diminished', 'Minor', 'Major', 'Augmented',
      'The tritone between root and fifth gives the diminished triad its restless, tense quality.',
      'Diminished = minor 3rd + minor 3rd. The tritone (6 half steps from root to fifth) is the distinctive sound.',
      -- L4
      'Triad', 'Seventh chord',
      'Three pitch classes — root, minor third, and diminished fifth. No seventh is present.',
      'Count the distinct pitch classes. A triad has three; a seventh chord has four.',
      -- L5
      'Diminished', 'Minor', 'Major', 'Dominant 7th',
      'Diminished chords typically function as vii° — a leading-tone chord that resolves strongly to the tonic.',
      'The highlighted chord sounds tense and unstable. Diminished triads contain a tritone that demands resolution.',
      -- L6
      'Half-diminished 7th', 'Dominant 7th', 'Minor 7th', 'Major 7th',
      'Adding a minor seventh to a diminished triad creates the half-diminished 7th — common as ii in minor keys.',
      'A diminished triad plus a minor seventh from the root produces a half-diminished 7th (also called minor 7 flat 5).'
    ),
    -- ==============================
    -- Chain 4: Augmented Triad (unlock: major mastery)
    -- ==============================
    (
      'chord_quality_aug',
      'Augmented Triad',
      '{"type":"neighbor_mastery","requires_chain":"chord_quality_major","min_link":3}',
      -- L1
      'Major-type', 'Minor-type',
      'Augmented chords share the major third on the bottom with major chords, giving them a major-type character.',
      'Both major and augmented triads start with a major third. The raised fifth is what distinguishes augmented.',
      -- L2
      'Augmented', 'Major', 'Minor',
      'Two stacked major thirds produce the augmented triad — bright and unstable, with a sense of upward expansion.',
      'An augmented triad has two major thirds stacked (4 + 4 half steps), raising the fifth by a half step.',
      -- L3
      'Augmented', 'Major', 'Minor', 'Diminished',
      'The raised fifth gives augmented triads their ethereal, unresolved quality — neither major nor minor resolves this way.',
      'Augmented = major 3rd + major 3rd. The widened fifth (8 half steps from root) is the telltale sign.',
      -- L4
      'Triad', 'Seventh chord',
      'Three pitch classes — root, major third, and augmented fifth. No seventh is present.',
      'Count the distinct pitch classes. A triad has three; a seventh chord has four.',
      -- L5
      'Augmented', 'Major', 'Diminished', 'Dominant 7th',
      'Augmented chords often appear as altered dominant chords — V+ resolving to I with a chromatic voice leading.',
      'The highlighted chord has a bright but unstable quality. The raised fifth creates tension that wants to resolve.',
      -- L6
      'Major 7th', 'Dominant 7th', 'Minor 7th', 'Half-diminished 7th',
      'Adding a major seventh to an augmented triad creates the augmented major 7th — rare but striking in jazz harmony.',
      'An augmented triad plus a major seventh from the root produces an augmented major 7th chord.'
    ),
    -- ==============================
    -- Chain 5: Dominant 7th (unlock: major mastery)
    -- ==============================
    (
      'chord_quality_dom7',
      'Dominant 7th',
      '{"type":"neighbor_mastery","requires_chain":"chord_quality_major","min_link":3}',
      -- L1
      'Major-type', 'Minor-type',
      'The dominant 7th is built on a major triad, so the bottom third is major — giving it a major-type foundation.',
      'Listen to the bottom interval. A major third from root to third places this firmly in the major-type family.',
      -- L2
      'Dominant 7th', 'Major', 'Minor',
      'A major triad plus a minor seventh — the dominant 7th is the engine of harmonic motion in tonal music.',
      'The dominant 7th combines the brightness of a major triad with the tension of a minor seventh interval.',
      -- L3
      'Dominant 7th', 'Major 7th', 'Minor 7th', 'Major',
      'The minor seventh added to a major triad creates a unique tension — bright yet unstable, pulling toward resolution.',
      'Dominant 7th = major 3rd + minor 3rd + minor 3rd. The tritone between the 3rd and 7th drives the resolution.',
      -- L4
      'Seventh chord', 'Triad',
      'Four pitch classes — root, major third, perfect fifth, and minor seventh. The added seventh is what defines it.',
      'Count the distinct pitch classes. A seventh chord has four notes; a triad has only three.',
      -- L5
      'Dominant 7th', 'Major', 'Minor', 'Major 7th',
      'The dominant 7th typically functions as V7, creating the strongest pull back to the tonic in tonal harmony.',
      'The highlighted chord has a bright but tense quality. The tritone between the 3rd and 7th is the giveaway.',
      -- L6
      'Dominant 7th', 'Major 7th', 'Minor 7th', 'Half-diminished 7th',
      'The dominant 7th is the most common seventh chord — a major triad with a minor seventh, central to V-I motion.',
      'Major triad + minor seventh = dominant 7th. The tritone between 3rd and b7 is what drives resolution.'
    ),
    -- ==============================
    -- Chain 6: Major 7th (unlock: dom7 mastery)
    -- ==============================
    (
      'chord_quality_maj7',
      'Major 7th',
      '{"type":"neighbor_mastery","requires_chain":"chord_quality_dom7","min_link":3}',
      -- L1
      'Major-type', 'Minor-type',
      'The major 7th is built on a major triad — the major third on the bottom defines its bright character.',
      'Listen to the bottom interval. A major third from root to third places this in the major-type family.',
      -- L2
      'Major 7th', 'Dominant 7th', 'Major',
      'A major triad plus a major seventh — lush, open, and more restful than the dominant 7th.',
      'The major 7th chord replaces the dominant 7th''s minor seventh with a major seventh, removing the tritone tension.',
      -- L3
      'Major 7th', 'Dominant 7th', 'Minor 7th', 'Augmented',
      'The major seventh interval gives this chord a dreamy, sophisticated quality — no tritone, no strong pull to resolve.',
      'Major 7th = major 3rd + minor 3rd + major 3rd. The leading tone sits a half step below the octave.',
      -- L4
      'Seventh chord', 'Triad',
      'Four pitch classes — root, major third, perfect fifth, and major seventh.',
      'Count the distinct pitch classes. A seventh chord has four notes; a triad has only three.',
      -- L5
      'Major 7th', 'Dominant 7th', 'Minor', 'Minor 7th',
      'Major 7th chords often function as I or IV in jazz and pop — resting points with a touch of color.',
      'The highlighted chord sounds lush and open. The major seventh interval creates warmth without the tension of a dominant 7th.',
      -- L6
      'Major 7th', 'Dominant 7th', 'Minor 7th', 'Half-diminished 7th',
      'The half step between the major seventh and the octave gives this chord its characteristic shimmer.',
      'Major triad + major seventh = major 7th chord. Compare to dominant 7th: same triad, different seventh.'
    );

  -- Loop through each chain and create chain_definition + 6 links
  FOR r IN SELECT * FROM _cq_chains LOOP

    INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
    VALUES (r.slug, r.name, 'chord_quality_ear_id', NULL, 6, r.unlock_cond, true)
    RETURNING id INTO v_chain_id;

    -- ---- LINK 1: Major or minor? (binary_choice) ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l1', NULL, 'ear_training', 'select_one',
      'Is this chord major or minor in character?',
      ARRAY['chord_quality'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l1_a),
          jsonb_build_object('id', 'b', 'label', r.l1_b)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l1_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l1_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Binary major/minor character identification',
      '["binary_choice","audio_select"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 2: What quality? 3 options ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l2', NULL, 'ear_training', 'select_one',
      'What is the quality of this chord?',
      ARRAY['chord_quality'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l2_a),
          jsonb_build_object('id', 'b', 'label', r.l2_b),
          jsonb_build_object('id', 'c', 'label', r.l2_c)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l2_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l2_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Chord quality from 3 distant options',
      '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 3: What quality? 4 close options ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l3', NULL, 'ear_training', 'select_one',
      'Identify the chord quality',
      ARRAY['chord_quality'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l3_a),
          jsonb_build_object('id', 'b', 'label', r.l3_b),
          jsonb_build_object('id', 'c', 'label', r.l3_c),
          jsonb_build_object('id', 'd', 'label', r.l3_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l3_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l3_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Chord quality from 4 close options',
      '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 4: Triad or seventh? (binary_choice) ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l4', NULL, 'ear_training', 'select_one',
      'Is this a triad or a seventh chord?',
      ARRAY['chord_quality'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l4_a),
          jsonb_build_object('id', 'b', 'label', r.l4_b)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l4_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l4_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Triad vs seventh chord identification',
      '["binary_choice","audio_select"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 5: Chord in progression (select_one) ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l5', NULL, 'ear_training', 'select_one',
      'What is the quality of the highlighted chord in this progression?',
      ARRAY['chord_quality'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l5_a),
          jsonb_build_object('id', 'b', 'label', r.l5_b),
          jsonb_build_object('id', 'c', 'label', r.l5_c),
          jsonb_build_object('id', 'd', 'label', r.l5_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l5_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l5_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Chord quality in real progression context',
      '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 6: Type of seventh (select_one) ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l6', NULL, 'ear_training', 'select_one',
      'Identify the type of seventh chord',
      ARRAY['chord_quality'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l6_a),
          jsonb_build_object('id', 'b', 'label', r.l6_b),
          jsonb_build_object('id', 'c', 'label', r.l6_c),
          jsonb_build_object('id', 'd', 'label', r.l6_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l6_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l6_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Seventh chord type identification',
      '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  END LOOP;

  DROP TABLE _cq_chains;
  RAISE NOTICE 'Topic 4 Chord Quality Ear ID: 6 chains, 36 card templates, 36 card instances, 36 chain links seeded';
END $$;
