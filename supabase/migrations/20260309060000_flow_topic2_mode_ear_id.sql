-- Topic 2: Scale/Mode Ear ID
-- 7 chains (one per mode) x 6 links = 42 card_templates, 42 card_instances, 42 chain_links

DO $$
DECLARE
  r RECORD;
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  CREATE TEMP TABLE _mode_ear_chains (
    slug TEXT, name TEXT,
    unlock_cond JSONB,
    -- L1: Major or minor? (binary_choice)
    l1_prompt TEXT,
    l1_a TEXT, l1_b TEXT,
    l1_fb_correct TEXT, l1_fb_incorrect TEXT,
    -- L2: Which mode? 3 far options (select_one)
    l2_prompt TEXT,
    l2_a TEXT, l2_b TEXT, l2_c TEXT,
    l2_fb_correct TEXT, l2_fb_incorrect TEXT,
    -- L3: Which mode? 4 close options (select_one)
    l3_prompt TEXT,
    l3_a TEXT, l3_b TEXT, l3_c TEXT, l3_d TEXT,
    l3_fb_correct TEXT, l3_fb_incorrect TEXT,
    -- L4: Characteristic degree (select_one)
    l4_prompt TEXT,
    l4_a TEXT, l4_b TEXT, l4_c TEXT, l4_d TEXT,
    l4_fb_correct TEXT, l4_fb_incorrect TEXT,
    -- L5: Feeling-state match (select_one)
    l5_prompt TEXT,
    l5_a TEXT, l5_b TEXT, l5_c TEXT, l5_d TEXT,
    l5_fb_correct TEXT, l5_fb_incorrect TEXT,
    -- L6: Graduation - staff_audio_select
    l6_prompt TEXT,
    l6_a TEXT, l6_b TEXT, l6_c TEXT, l6_d TEXT,
    l6_fb_correct TEXT, l6_fb_incorrect TEXT
  );

  INSERT INTO _mode_ear_chains VALUES
    -- ==============================
    -- Chain 1: Ionian (major) — cold start
    -- ==============================
    (
      'mode_ionian',
      'Ionian (Major)',
      '{"type":"cold_start"}',
      -- L1
      'Is this melody major or minor?',
      'Major', 'Minor',
      'Ionian is the standard major scale — all natural intervals, no alterations.',
      'Listen for the bright, resolved quality. Ionian has a natural 3rd and natural 7th, both hallmarks of major.',
      -- L2
      'What mode is this melody in?',
      'Ionian', 'Phrygian', 'Locrian',
      'Ionian is the plain major scale — the baseline from which all other modes are measured.',
      'This melody has no altered degrees relative to major. That means Ionian.',
      -- L3
      'What mode is this melody in?',
      'Ionian', 'Lydian', 'Mixolydian', 'Dorian',
      'Ionian uses all natural intervals of the major scale. No raised 4th (Lydian) or lowered 7th (Mixolydian).',
      'Compare the 4th and 7th degrees. Ionian keeps both natural — no sharpening, no flattening.',
      -- L4
      'What is the characteristic degree of Ionian?',
      'Natural 7', 'Raised 4', 'Lowered 7', 'Lowered 2',
      'The natural 7th degree is what separates Ionian from Mixolydian. It creates the leading tone that pulls to the tonic.',
      'Ionian''s defining interval is its natural 7th — the leading tone, a half step below the tonic.',
      -- L5
      'Which best describes the feeling of Ionian?',
      'Bright and stable', 'Bright and floating', 'Jazzy and warm', 'Melancholy and gentle',
      'Ionian sounds bright because of the major 3rd, and stable because the leading tone resolves cleanly to the tonic.',
      'The major 3rd gives brightness, the natural 7th gives resolution. Together: bright and stable.',
      -- L6
      'Listen and identify the mode of this excerpt',
      'Ionian', 'Lydian', 'Mixolydian', 'Aeolian',
      'Ionian — the standard major sound. No surprises, just clean resolution through the natural 7th.',
      'When a melody sounds plainly major with a strong pull to the tonic, that is Ionian.'
    ),
    -- ==============================
    -- Chain 2: Aeolian (natural minor) — cold start
    -- ==============================
    (
      'mode_aeolian',
      'Aeolian (Natural Minor)',
      '{"type":"cold_start"}',
      -- L1
      'Is this melody major or minor?',
      'Minor', 'Major',
      'Aeolian is the natural minor scale — the minor 3rd gives it that darker, more somber quality.',
      'Listen for the lowered 3rd. That interval alone shifts the sound from bright to dark — the core of minor.',
      -- L2
      'What mode is this melody in?',
      'Aeolian', 'Ionian', 'Lydian',
      'Aeolian is the natural minor — lowered 3rd, 6th, and 7th relative to major.',
      'This melody has a minor quality without any exotic intervals. That points to Aeolian.',
      -- L3
      'What mode is this melody in?',
      'Aeolian', 'Dorian', 'Phrygian', 'Locrian',
      'Aeolian has a lowered 6th, unlike Dorian. It has a natural 2nd, unlike Phrygian. And it has a natural 5th, unlike Locrian.',
      'Compare the 2nd and 6th degrees. Aeolian keeps a natural 2nd (not Phrygian) and lowers the 6th (not Dorian).',
      -- L4
      'What is the characteristic degree of Aeolian?',
      'Lowered 6', 'Lowered 7', 'Lowered 2', 'Lowered 5',
      'The lowered 6th distinguishes Aeolian from Dorian. It is the degree that defines the natural minor sound.',
      'Aeolian''s signature is the lowered 6th. Dorian raises it, giving a jazzier feel — Aeolian keeps it low.',
      -- L5
      'Which best describes the feeling of Aeolian?',
      'Melancholy and gentle', 'Dark and heavy', 'Exotic and tense', 'Unstable and dissonant',
      'Aeolian is minor but not extreme — it has sadness without the tension of Phrygian or the instability of Locrian.',
      'The natural minor is melancholy but gentle. It lacks the exotic bite of Phrygian or the warmth of Dorian.',
      -- L6
      'Listen and identify the mode of this excerpt',
      'Aeolian', 'Dorian', 'Phrygian', 'Ionian',
      'Aeolian — the natural minor. Gentle darkness, no exotic or unstable intervals.',
      'A minor sound without the raised 6th of Dorian or the lowered 2nd of Phrygian is Aeolian.'
    ),
    -- ==============================
    -- Chain 3: Dorian — unlock from Aeolian
    -- ==============================
    (
      'mode_dorian',
      'Dorian',
      '{"type":"neighbor_mastery","requires_chain":"mode_aeolian","min_link":3}',
      -- L1
      'Is this melody major or minor?',
      'Minor', 'Major',
      'Dorian is a minor mode — the lowered 3rd places it firmly in the minor family.',
      'The 3rd degree is lowered. Despite its warmer color, Dorian is still fundamentally minor.',
      -- L2
      'What mode is this melody in?',
      'Dorian', 'Ionian', 'Lydian',
      'Dorian is minor with a raised 6th — that one bright note gives it a jazzy, warm character.',
      'This melody is minor but has a lighter quality than natural minor. The raised 6th points to Dorian.',
      -- L3
      'What mode is this melody in?',
      'Dorian', 'Aeolian', 'Phrygian', 'Mixolydian',
      'Dorian differs from Aeolian by one note: the raised 6th. That single change warms the entire sound.',
      'Compare it to Aeolian — if the 6th sounds higher than expected in a minor context, it is Dorian.',
      -- L4
      'What is the characteristic degree of Dorian?',
      'Raised 6', 'Lowered 6', 'Lowered 2', 'Raised 4',
      'The raised 6th is Dorian''s signature. It is the one note that separates Dorian from Aeolian.',
      'Dorian''s defining feature is the raised 6th degree — it adds warmth to an otherwise minor sound.',
      -- L5
      'Which best describes the feeling of Dorian?',
      'Jazzy and warm', 'Melancholy and gentle', 'Bright and stable', 'Exotic and tense',
      'The raised 6th gives Dorian a warmth that natural minor lacks, which is why it shows up so often in jazz and soul.',
      'Dorian is minor but warm. The raised 6th lifts the mood just enough to feel jazzy rather than sad.',
      -- L6
      'Listen and identify the mode of this excerpt',
      'Dorian', 'Aeolian', 'Mixolydian', 'Phrygian',
      'Dorian — minor with warmth. The raised 6th is the tell.',
      'When a minor melody feels warmer than expected, check the 6th degree. If it is raised, that is Dorian.'
    ),
    -- ==============================
    -- Chain 4: Mixolydian — unlock from Ionian
    -- ==============================
    (
      'mode_mixolydian',
      'Mixolydian',
      '{"type":"neighbor_mastery","requires_chain":"mode_ionian","min_link":3}',
      -- L1
      'Is this melody major or minor?',
      'Major', 'Minor',
      'Mixolydian has a major 3rd, which places it in the major family despite its lowered 7th.',
      'The 3rd degree is natural (major). Even though the 7th is lowered, the overall quality remains major.',
      -- L2
      'What mode is this melody in?',
      'Mixolydian', 'Phrygian', 'Locrian',
      'Mixolydian is major with a lowered 7th — it has a bluesy, rock-inflected sound.',
      'This melody sounds major but lacks the strong pull to the tonic. The lowered 7th removes the leading tone.',
      -- L3
      'What mode is this melody in?',
      'Mixolydian', 'Ionian', 'Lydian', 'Dorian',
      'Mixolydian differs from Ionian by one note: the lowered 7th. That one change removes the leading-tone resolution.',
      'Compare it to standard major. If the 7th sounds lower — less pull toward the tonic — it is Mixolydian.',
      -- L4
      'What is the characteristic degree of Mixolydian?',
      'Lowered 7', 'Natural 7', 'Raised 4', 'Lowered 2',
      'The lowered 7th is Mixolydian''s signature. Without the leading tone, resolutions feel more relaxed.',
      'Mixolydian''s defining feature is the lowered 7th — it removes the half-step pull to the tonic.',
      -- L5
      'Which best describes the feeling of Mixolydian?',
      'Bright and floating', 'Bright and stable', 'Jazzy and warm', 'Melancholy and gentle',
      'Mixolydian is bright (major 3rd) but floating (no leading tone). It lacks the finality of Ionian.',
      'The major 3rd keeps things bright, but the lowered 7th removes the strong resolution — it floats.',
      -- L6
      'Listen and identify the mode of this excerpt',
      'Mixolydian', 'Ionian', 'Lydian', 'Dorian',
      'Mixolydian — major but without the strong pull home. The lowered 7th is the giveaway.',
      'When a major melody feels relaxed at the cadence rather than resolved, the lowered 7th points to Mixolydian.'
    ),
    -- ==============================
    -- Chain 5: Phrygian — unlock from Aeolian
    -- ==============================
    (
      'mode_phrygian',
      'Phrygian',
      '{"type":"neighbor_mastery","requires_chain":"mode_aeolian","min_link":3}',
      -- L1
      'Is this melody major or minor?',
      'Minor', 'Major',
      'Phrygian is a minor mode — the lowered 3rd anchors it in the minor family.',
      'Despite its exotic color, Phrygian has a minor 3rd. That makes it fundamentally minor.',
      -- L2
      'What mode is this melody in?',
      'Phrygian', 'Ionian', 'Lydian',
      'Phrygian is minor with a lowered 2nd — that half step above the tonic creates its distinctive tension.',
      'The lowered 2nd produces an exotic, Spanish-influenced sound. That interval is Phrygian''s fingerprint.',
      -- L3
      'What mode is this melody in?',
      'Phrygian', 'Aeolian', 'Dorian', 'Locrian',
      'Phrygian differs from Aeolian by one note: the lowered 2nd. That semitone above the root creates immediate tension.',
      'If a minor melody has an unusually dark, tense opening interval, check the 2nd degree. Lowered = Phrygian.',
      -- L4
      'What is the characteristic degree of Phrygian?',
      'Lowered 2', 'Lowered 6', 'Lowered 5', 'Raised 6',
      'The lowered 2nd is Phrygian''s hallmark — a half step above the tonic that creates its exotic flavor.',
      'Phrygian''s signature is the lowered 2nd degree. It sits just a semitone above the root.',
      -- L5
      'Which best describes the feeling of Phrygian?',
      'Exotic and tense', 'Dark and heavy', 'Melancholy and gentle', 'Jazzy and warm',
      'The lowered 2nd gives Phrygian an exotic, almost Spanish quality. The tension is immediate and distinctive.',
      'Phrygian''s lowered 2nd creates an exotic tension that is quite different from the gentle sadness of Aeolian.',
      -- L6
      'Listen and identify the mode of this excerpt',
      'Phrygian', 'Aeolian', 'Locrian', 'Dorian',
      'Phrygian — that exotic, tense minor sound. The lowered 2nd is unmistakable once you learn to hear it.',
      'When a minor melody has an exotic, Spanish-tinged quality, the lowered 2nd points to Phrygian.'
    ),
    -- ==============================
    -- Chain 6: Lydian — unlock from Ionian
    -- ==============================
    (
      'mode_lydian',
      'Lydian',
      '{"type":"neighbor_mastery","requires_chain":"mode_ionian","min_link":3}',
      -- L1
      'Is this melody major or minor?',
      'Major', 'Minor',
      'Lydian is a major mode — the natural 3rd places it in the major family. In fact, it is the brightest mode of all.',
      'The 3rd degree is major (natural). Lydian is major, and then some — the raised 4th makes it even brighter.',
      -- L2
      'What mode is this melody in?',
      'Lydian', 'Aeolian', 'Locrian',
      'Lydian is major with a raised 4th — a tritone above the root that adds a dreamy, floating brightness.',
      'The raised 4th gives Lydian a shimmering quality. No other major mode has that particular sparkle.',
      -- L3
      'What mode is this melody in?',
      'Lydian', 'Ionian', 'Mixolydian', 'Dorian',
      'Lydian differs from Ionian by one note: the raised 4th. That single change lifts the entire mode brighter.',
      'Compare to standard major. If the 4th sounds higher than expected — almost floating — it is Lydian.',
      -- L4
      'What is the characteristic degree of Lydian?',
      'Raised 4', 'Natural 7', 'Lowered 7', 'Raised 6',
      'The raised 4th is Lydian''s signature — a tritone above the root that gives it an otherworldly brightness.',
      'Lydian''s defining feature is the raised 4th degree. It creates a tritone with the root.',
      -- L5
      'Which best describes the feeling of Lydian?',
      'Bright and floating', 'Bright and stable', 'Jazzy and warm', 'Exotic and tense',
      'Lydian is the brightest mode — the raised 4th removes the grounding pull of the perfect 4th, creating a floating sensation.',
      'Lydian is bright (major 3rd) and floating (raised 4th removes gravity). It feels dreamy and unanchored.',
      -- L6
      'Listen and identify the mode of this excerpt',
      'Lydian', 'Ionian', 'Mixolydian', 'Aeolian',
      'Lydian — the brightest of all modes. The raised 4th gives it that unmistakable floating quality.',
      'When a major melody sounds brighter than expected and slightly dreamy, the raised 4th signals Lydian.'
    ),
    -- ==============================
    -- Chain 7: Locrian — unlock from Phrygian
    -- ==============================
    (
      'mode_locrian',
      'Locrian',
      '{"type":"neighbor_mastery","requires_chain":"mode_phrygian","min_link":3}',
      -- L1
      'Is this melody major or minor?',
      'Minor', 'Major',
      'Locrian is minor — and the darkest mode of all. The lowered 5th removes even the stability of a perfect fifth.',
      'The minor 3rd places Locrian in the minor family, but the lowered 5th makes it uniquely unstable.',
      -- L2
      'What mode is this melody in?',
      'Locrian', 'Ionian', 'Lydian',
      'Locrian is the darkest mode — lowered 2nd, 3rd, 5th, 6th, and 7th. The diminished 5th is its calling card.',
      'No other mode has a diminished 5th above the root. That instability is Locrian''s unmistakable signature.',
      -- L3
      'What mode is this melody in?',
      'Locrian', 'Phrygian', 'Aeolian', 'Dorian',
      'Locrian differs from Phrygian by one note: the lowered 5th. That removes the last anchor of stability.',
      'If a melody sounds like Phrygian but even darker and more unstable, the lowered 5th confirms Locrian.',
      -- L4
      'What is the characteristic degree of Locrian?',
      'Lowered 5', 'Lowered 2', 'Lowered 6', 'Lowered 7',
      'The lowered 5th is Locrian''s signature — it turns the perfect 5th into a diminished 5th, removing all sense of rest.',
      'Locrian''s defining feature is the lowered 5th. Without a perfect 5th, there is no stable resting point.',
      -- L5
      'Which best describes the feeling of Locrian?',
      'Unstable and dissonant', 'Exotic and tense', 'Dark and heavy', 'Melancholy and gentle',
      'The diminished 5th makes Locrian inherently unstable. It is rarely used as a tonal center because it resists resolution.',
      'Locrian''s lowered 5th creates a fundamental dissonance. The mode wants to resolve elsewhere — it cannot rest.',
      -- L6
      'Listen and identify the mode of this excerpt',
      'Locrian', 'Phrygian', 'Aeolian', 'Dorian',
      'Locrian — the most unstable mode. The diminished 5th prevents any sense of resolution.',
      'When a minor melody feels fundamentally restless and dissonant at its core, the lowered 5th points to Locrian.'
    );

  FOR r IN SELECT * FROM _mode_ear_chains LOOP

    -- Insert chain_definition
    INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
    VALUES (r.slug, r.name, 'scale_mode_ear_id', NULL, 6, r.unlock_cond, true)
    RETURNING id INTO v_chain_id;

    -- ---- LINK 1: Major or minor? (binary_choice) ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l1', NULL, 'aural', 'binary_choice',
      r.l1_prompt,
      ARRAY['mode_ear_id'],
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
    VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Major or minor classification',
      '["binary_choice"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 2: Which mode? 3 far options ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l2', NULL, 'aural', 'select_one',
      r.l2_prompt,
      ARRAY['mode_ear_id'],
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
    VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Mode identification — 3 distant options',
      '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 3: Which mode? 4 close options ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l3', NULL, 'aural', 'select_one',
      r.l3_prompt,
      ARRAY['mode_ear_id'],
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
    VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Mode identification — 4 close options',
      '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 4: Characteristic degree ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l4', NULL, 'declarative', 'select_one',
      r.l4_prompt,
      ARRAY['mode_ear_id'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l4_a),
          jsonb_build_object('id', 'b', 'label', r.l4_b),
          jsonb_build_object('id', 'c', 'label', r.l4_c),
          jsonb_build_object('id', 'd', 'label', r.l4_d)
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
    VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Characteristic degree identification',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 5: Feeling-state match ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l5', NULL, 'declarative', 'select_one',
      r.l5_prompt,
      ARRAY['mode_ear_id'],
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
    VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Feeling-state association',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 6: Graduation — staff_audio_select ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l6', NULL, 'aural', 'select_one',
      r.l6_prompt,
      ARRAY['mode_ear_id'],
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
    VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Graduation — full mode identification',
      '["select_one","staff_audio_select"]'::JSONB,
      '{"apprentice":"select_one","adept":"staff_audio_select"}'::JSONB);

  END LOOP;

  DROP TABLE _mode_ear_chains;
  RAISE NOTICE 'Topic 2 Scale/Mode Ear ID: 7 chains, 42 card templates, 42 card instances, 42 chain links seeded';
END $$;
