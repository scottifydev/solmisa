-- Topic 5: Chord Inversions (Sight + Ear)
-- 4 chains x 6 links = 24 card_templates, 24 card_instances, 24 chain_links

DO $$
DECLARE
  r RECORD;
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  CREATE TEMP TABLE _ci_chains (
    slug TEXT, name TEXT,
    unlock_cond JSONB,
    -- L1: See stacked notes -> name inversion (select_one)
    l1_prompt TEXT, l1_params JSONB, l1_modalities JSONB,
    l1_a TEXT, l1_b TEXT, l1_c TEXT, l1_d TEXT,
    l1_fb_correct TEXT, l1_fb_incorrect TEXT,
    -- L2: Hear chord arpeggiated then blocked -> root or inverted? (binary_choice)
    l2_prompt TEXT, l2_params JSONB, l2_modalities JSONB,
    l2_a TEXT, l2_b TEXT, l2_c TEXT, l2_d TEXT,
    l2_fb_correct TEXT, l2_fb_incorrect TEXT,
    -- L3: Hear chord blocked only -> which inversion? (select_one)
    l3_prompt TEXT, l3_params JSONB, l3_modalities JSONB,
    l3_a TEXT, l3_b TEXT, l3_c TEXT, l3_d TEXT,
    l3_fb_correct TEXT, l3_fb_incorrect TEXT,
    -- L4: See figured bass -> name inversion (select_one)
    l4_prompt TEXT, l4_params JSONB, l4_modalities JSONB,
    l4_a TEXT, l4_b TEXT, l4_c TEXT, l4_d TEXT,
    l4_fb_correct TEXT, l4_fb_incorrect TEXT,
    -- L5: Theory — which tone is in the bass? (select_one)
    l5_prompt TEXT, l5_params JSONB, l5_modalities JSONB,
    l5_a TEXT, l5_b TEXT, l5_c TEXT, l5_d TEXT,
    l5_fb_correct TEXT, l5_fb_incorrect TEXT,
    -- L6: Staff notes shown -> name chord AND inversion (select_one)
    l6_prompt TEXT, l6_params JSONB, l6_modalities JSONB,
    l6_a TEXT, l6_b TEXT, l6_c TEXT, l6_d TEXT,
    l6_fb_correct TEXT, l6_fb_incorrect TEXT
  );

  INSERT INTO _ci_chains VALUES
    -- ==============================
    -- Chain 1: Major Triads (cold start)
    -- ==============================
    (
      'inv_major_triads',
      'Major Triads',
      '{"type":"cold_start"}',
      -- L1
      'Name the inversion of this chord',
      '{"chord":"C_major","voicing":"E4-G4-C5"}',
      '["select_one"]',
      '1st inversion', 'Root position', '2nd inversion', 'Open voicing',
      'When the 3rd is in the bass, the triad is in 1st inversion. Here E (the 3rd of C major) is the lowest note.',
      'Look at which chord tone is in the bass. The 3rd in the bass means 1st inversion.',
      -- L2
      'Is this chord in root position or inverted?',
      '{"chord":"G_major","voicing":"B3-D4-G4","playback":"arpeggiated_then_blocked"}',
      '["binary_choice","audio_select"]',
      'Inverted', 'Root position', '', '',
      'The bass note is B, the 3rd of G major. Any time the root is not in the bass, the chord is inverted.',
      'Listen to the lowest note of the arpeggio. If it is not the root of the chord, the chord is inverted.',
      -- L3
      'Identify the inversion',
      '{"chord":"F_major","voicing":"C4-F4-A4","playback":"blocked"}',
      '["select_one","audio_select"]',
      '2nd inversion', 'Root position', '1st inversion', 'Open voicing',
      'The 5th (C) is in the bass, which places this F major chord in 2nd inversion.',
      'Identify the bass note and determine which chord tone it is. The 5th in the bass means 2nd inversion.',
      -- L4
      'What inversion does this figured bass indicate?',
      '{"figured_bass":"6/3"}',
      '["select_one"]',
      '1st inversion', 'Root position', '2nd inversion', 'Open voicing',
      '6/3 indicates 1st inversion. The intervals above the bass are a 6th and a 3rd.',
      'For triads: 5/3 = root position, 6/3 = 1st inversion, 6/4 = 2nd inversion.',
      -- L5
      'In first inversion of a major triad, which chord tone is in the bass?',
      '{"chord_type":"major_triad"}',
      '["select_one"]',
      'The 3rd', 'The root', 'The 5th', 'The 7th',
      'First inversion places the 3rd in the bass. The root and 5th are rearranged above it.',
      'Inversion is defined by which chord tone is in the bass. 1st inversion always puts the 3rd lowest.',
      -- L6
      'Name the chord and its inversion',
      '{"chord":"D_major","voicing":"F#4-A4-D5"}',
      '["select_one"]',
      'D major, 1st inversion', 'D major, root position', 'D major, 2nd inversion', 'F# minor, root position',
      'The notes are F#, A, and D — a D major triad. F# (the 3rd) is in the bass, so it is 1st inversion.',
      'First identify the root by rearranging notes into stacked 3rds, then check which tone is in the bass.'
    ),
    -- ==============================
    -- Chain 2: Minor Triads (cold start)
    -- ==============================
    (
      'inv_minor_triads',
      'Minor Triads',
      '{"type":"cold_start"}',
      -- L1
      'Name the inversion of this chord',
      '{"chord":"A_minor","voicing":"E4-A4-C5"}',
      '["select_one"]',
      '2nd inversion', 'Root position', '1st inversion', 'Open voicing',
      'E is the 5th of A minor. When the 5th is in the bass, the triad is in 2nd inversion.',
      'Look at which chord tone is in the bass. The 5th in the bass means 2nd inversion.',
      -- L2
      'Is this chord in root position or inverted?',
      '{"chord":"D_minor","voicing":"D3-F3-A3","playback":"arpeggiated_then_blocked"}',
      '["binary_choice","audio_select"]',
      'Root position', 'Inverted', '', '',
      'The bass note is D, the root of D minor. When the root is in the bass, the chord is in root position.',
      'Listen to the lowest note of the arpeggio. If it matches the root, the chord is in root position.',
      -- L3
      'Identify the inversion',
      '{"chord":"E_minor","voicing":"G3-B3-E4","playback":"blocked"}',
      '["select_one","audio_select"]',
      '1st inversion', 'Root position', '2nd inversion', 'Open voicing',
      'G is the 3rd of E minor. The 3rd in the bass places this chord in 1st inversion.',
      'Identify the bass note and determine which chord tone it is. The 3rd in the bass means 1st inversion.',
      -- L4
      'What inversion does this figured bass indicate?',
      '{"figured_bass":"6/4"}',
      '["select_one"]',
      '2nd inversion', 'Root position', '1st inversion', 'Open voicing',
      '6/4 indicates 2nd inversion. The intervals above the bass are a 6th and a 4th.',
      'For triads: 5/3 = root position, 6/3 = 1st inversion, 6/4 = 2nd inversion.',
      -- L5
      'In first inversion of a minor triad, which chord tone is in the bass?',
      '{"chord_type":"minor_triad"}',
      '["select_one"]',
      'The 3rd', 'The root', 'The 5th', 'The 7th',
      'First inversion always places the 3rd in the bass, whether the triad is major or minor.',
      'Inversion is defined by which chord tone is in the bass. 1st inversion always puts the 3rd lowest.',
      -- L6
      'Name the chord and its inversion',
      '{"chord":"C_minor","voicing":"G3-C4-Eb4"}',
      '["select_one"]',
      'C minor, 2nd inversion', 'C minor, root position', 'C minor, 1st inversion', 'Eb major, root position',
      'The notes are G, C, and Eb — a C minor triad. G (the 5th) is in the bass, so it is 2nd inversion.',
      'First identify the root by rearranging notes into stacked 3rds, then check which tone is in the bass.'
    ),
    -- ==============================
    -- Chain 3: Dominant 7th (unlock after inv_major_triads L3)
    -- ==============================
    (
      'inv_dom7',
      'Dominant 7th',
      '{"type":"neighbor_mastery","requires_chain":"inv_major_triads","min_link":3}',
      -- L1
      'Name the inversion of this chord',
      '{"chord":"G7","voicing":"B3-D4-F4-G4"}',
      '["select_one"]',
      '1st inversion', 'Root position', '2nd inversion', '3rd inversion',
      'B is the 3rd of G7. When the 3rd is in the bass, a 7th chord is in 1st inversion.',
      'Look at which chord tone is in the bass. The 3rd in the bass means 1st inversion.',
      -- L2
      'Is this chord in root position or inverted?',
      '{"chord":"C7","voicing":"E3-G3-Bb3-C4","playback":"arpeggiated_then_blocked"}',
      '["binary_choice","audio_select"]',
      'Inverted', 'Root position', '', '',
      'The bass note is E, the 3rd of C7. Since the root is not in the bass, the chord is inverted.',
      'Listen to the lowest note of the arpeggio. If it is not the root, the chord is inverted.',
      -- L3
      'Identify the inversion',
      '{"chord":"D7","voicing":"C4-D4-F#4-A4","playback":"blocked"}',
      '["select_one","audio_select"]',
      '3rd inversion', 'Root position', '1st inversion', '2nd inversion',
      'C is the 7th of D7. When the 7th is in the bass, a 7th chord is in 3rd inversion.',
      'Identify the bass note and determine which chord tone it is. The 7th in the bass means 3rd inversion.',
      -- L4
      'What inversion does this figured bass indicate?',
      '{"figured_bass":"4/3"}',
      '["select_one"]',
      '2nd inversion', 'Root position', '1st inversion', '3rd inversion',
      '4/3 indicates 2nd inversion of a 7th chord. The 5th is in the bass.',
      'For 7th chords: 7 = root position, 6/5 = 1st inversion, 4/3 = 2nd inversion, 4/2 = 3rd inversion.',
      -- L5
      'In first inversion of a dominant 7th chord, which chord tone is in the bass?',
      '{"chord_type":"dominant_7th"}',
      '["select_one"]',
      'The 3rd', 'The root', 'The 5th', 'The 7th',
      'First inversion places the 3rd in the bass. This applies to all chord types, including 7th chords.',
      'Inversion is defined by which chord tone is in the bass. 1st inversion always puts the 3rd lowest.',
      -- L6
      'Name the chord and its inversion',
      '{"chord":"F7","voicing":"A3-C4-Eb4-F4"}',
      '["select_one"]',
      'F7, 1st inversion', 'F7, root position', 'F7, 2nd inversion', 'F7, 3rd inversion',
      'The notes are A, C, Eb, and F — an F dominant 7th. A (the 3rd) is in the bass, so it is 1st inversion.',
      'First identify the root by rearranging notes into stacked 3rds, then check which tone is in the bass.'
    ),
    -- ==============================
    -- Chain 4: Major 7th (unlock after inv_dom7 L3)
    -- ==============================
    (
      'inv_maj7',
      'Major 7th',
      '{"type":"neighbor_mastery","requires_chain":"inv_dom7","min_link":3}',
      -- L1
      'Name the inversion of this chord',
      '{"chord":"Cmaj7","voicing":"G3-B3-C4-E4"}',
      '["select_one"]',
      '2nd inversion', 'Root position', '1st inversion', '3rd inversion',
      'G is the 5th of Cmaj7. When the 5th is in the bass, a 7th chord is in 2nd inversion.',
      'Look at which chord tone is in the bass. The 5th in the bass means 2nd inversion.',
      -- L2
      'Is this chord in root position or inverted?',
      '{"chord":"Fmaj7","voicing":"F3-A3-C4-E4","playback":"arpeggiated_then_blocked"}',
      '["binary_choice","audio_select"]',
      'Root position', 'Inverted', '', '',
      'The bass note is F, the root of Fmaj7. When the root is in the bass, the chord is in root position.',
      'Listen to the lowest note of the arpeggio. If it matches the root, the chord is in root position.',
      -- L3
      'Identify the inversion',
      '{"chord":"Bbmaj7","voicing":"A3-Bb3-D4-F4","playback":"blocked"}',
      '["select_one","audio_select"]',
      '3rd inversion', 'Root position', '1st inversion', '2nd inversion',
      'A is the 7th of Bbmaj7. When the 7th is in the bass, a 7th chord is in 3rd inversion.',
      'Identify the bass note and determine which chord tone it is. The 7th in the bass means 3rd inversion.',
      -- L4
      'What inversion does this figured bass indicate?',
      '{"figured_bass":"6/5"}',
      '["select_one"]',
      '1st inversion', 'Root position', '2nd inversion', '3rd inversion',
      '6/5 indicates 1st inversion of a 7th chord. The 3rd is in the bass.',
      'For 7th chords: 7 = root position, 6/5 = 1st inversion, 4/3 = 2nd inversion, 4/2 = 3rd inversion.',
      -- L5
      'In first inversion of a major 7th chord, which chord tone is in the bass?',
      '{"chord_type":"major_7th"}',
      '["select_one"]',
      'The 3rd', 'The root', 'The 5th', 'The 7th',
      'First inversion places the 3rd in the bass. This principle is the same across all chord types.',
      'Inversion is defined by which chord tone is in the bass. 1st inversion always puts the 3rd lowest.',
      -- L6
      'Name the chord and its inversion',
      '{"chord":"Gmaj7","voicing":"F#3-G3-B3-D4"}',
      '["select_one"]',
      'Gmaj7, 3rd inversion', 'Gmaj7, root position', 'Gmaj7, 1st inversion', 'Gmaj7, 2nd inversion',
      'The notes are F#, G, B, and D — a G major 7th. F# (the 7th) is in the bass, so it is 3rd inversion.',
      'First identify the root by rearranging notes into stacked 3rds, then check which tone is in the bass.'
    );

  -- Loop through each chain and create chain_definition + 6 links
  FOR r IN SELECT * FROM _ci_chains LOOP

    -- Insert chain_definition
    INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
    VALUES (r.slug, r.name, 'chord_inversions', NULL, 6, r.unlock_cond, true)
    RETURNING id INTO v_chain_id;

    -- ---- LINK 1: See stacked notes -> name inversion ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_visual_inv', NULL, 'declarative', 'select_one',
      r.l1_prompt,
      ARRAY['chord_inversions'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l1_a),
          jsonb_build_object('id', 'b', 'label', r.l1_b),
          jsonb_build_object('id', 'c', 'label', r.l1_c),
          jsonb_build_object('id', 'd', 'label', r.l1_d)
        )
      ) || r.l1_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l1_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l1_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'See stacked notes, name inversion', r.l1_modalities);

    -- ---- LINK 2: Hear arpeggiated then blocked -> root or inverted? ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_aural_binary', NULL, 'declarative', 'binary_choice',
      r.l2_prompt,
      ARRAY['chord_inversions'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l2_a),
          jsonb_build_object('id', 'b', 'label', r.l2_b)
        )
      ) || r.l2_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l2_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l2_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Hear chord, root position or inverted?', r.l2_modalities);

    -- ---- LINK 3: Hear blocked chord -> which inversion? ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_aural_inv', NULL, 'declarative', 'select_one',
      r.l3_prompt,
      ARRAY['chord_inversions'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l3_a),
          jsonb_build_object('id', 'b', 'label', r.l3_b),
          jsonb_build_object('id', 'c', 'label', r.l3_c),
          jsonb_build_object('id', 'd', 'label', r.l3_d)
        )
      ) || r.l3_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l3_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l3_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Hear blocked chord, identify inversion', r.l3_modalities);

    -- ---- LINK 4: See figured bass -> name inversion ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_figured_bass', NULL, 'declarative', 'select_one',
      r.l4_prompt,
      ARRAY['chord_inversions'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l4_a),
          jsonb_build_object('id', 'b', 'label', r.l4_b),
          jsonb_build_object('id', 'c', 'label', r.l4_c),
          jsonb_build_object('id', 'd', 'label', r.l4_d)
        )
      ) || r.l4_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l4_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l4_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Figured bass to inversion name', r.l4_modalities);

    -- ---- LINK 5: Theory — which tone is in the bass? ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_theory_bass', NULL, 'declarative', 'select_one',
      r.l5_prompt,
      ARRAY['chord_inversions'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l5_a),
          jsonb_build_object('id', 'b', 'label', r.l5_b),
          jsonb_build_object('id', 'c', 'label', r.l5_c),
          jsonb_build_object('id', 'd', 'label', r.l5_d)
        )
      ) || r.l5_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l5_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l5_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Which chord tone is in the bass?', r.l5_modalities);

    -- ---- LINK 6: Staff notes -> chord name AND inversion ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_combined', NULL, 'declarative', 'select_one',
      r.l6_prompt,
      ARRAY['chord_inversions'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l6_a),
          jsonb_build_object('id', 'b', 'label', r.l6_b),
          jsonb_build_object('id', 'c', 'label', r.l6_c),
          jsonb_build_object('id', 'd', 'label', r.l6_d)
        )
      ) || r.l6_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l6_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l6_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Name chord and inversion from staff', r.l6_modalities);

  END LOOP;

  DROP TABLE _ci_chains;
  RAISE NOTICE 'Topic 5 Chord Inversions: 4 chains, 24 card templates, 24 card instances, 24 chain links seeded';
END $$;
