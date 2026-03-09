-- Topic 13: Circle of Fifths Navigation
-- 2 chains (clockwise/counterclockwise) × 6 links = 12 card_templates, 12 card_instances, 12 chain_links

DO $$
DECLARE
  r RECORD;
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  CREATE TEMP TABLE _cof_chains (
    slug TEXT, name TEXT,
    -- L1
    l1_prompt TEXT, l1_a TEXT, l1_b TEXT, l1_c TEXT, l1_d TEXT,
    l1_fb_correct TEXT, l1_fb_incorrect TEXT,
    -- L2
    l2_prompt TEXT, l2_a TEXT, l2_b TEXT, l2_c TEXT, l2_d TEXT,
    l2_fb_correct TEXT, l2_fb_incorrect TEXT,
    -- L3
    l3_prompt TEXT, l3_a TEXT, l3_b TEXT, l3_c TEXT, l3_d TEXT,
    l3_fb_correct TEXT, l3_fb_incorrect TEXT,
    -- L4
    l4_prompt TEXT, l4_a TEXT, l4_b TEXT, l4_c TEXT, l4_d TEXT,
    l4_fb_correct TEXT, l4_fb_incorrect TEXT,
    -- L5
    l5_prompt TEXT, l5_a TEXT, l5_b TEXT, l5_c TEXT, l5_d TEXT,
    l5_fb_correct TEXT, l5_fb_incorrect TEXT,
    -- L6
    l6_prompt TEXT, l6_a TEXT, l6_b TEXT, l6_c TEXT, l6_d TEXT,
    l6_fb_correct TEXT, l6_fb_incorrect TEXT
  );

  INSERT INTO _cof_chains VALUES
    (
      'cof_clockwise',
      'Circle of Fifths — Clockwise',
      -- L1
      'A fifth above C is...?',
      'G', 'D', 'F', 'A',
      'Each step clockwise adds a fifth — the fundamental interval of tonal organization.',
      'A perfect fifth up from C is G. The circle moves by fifths clockwise.',
      -- L2
      'Going clockwise from G, the next key is...?',
      'D', 'A', 'E', 'C',
      'G to D is another perfect fifth. Each clockwise step adds one sharp.',
      'From G, count up a perfect fifth. G-A-B-C-D — the answer is D.',
      -- L3
      'Two steps clockwise from D lands on...?',
      'E', 'A', 'B', 'F#',
      'D to A to E — two fifths clockwise. Each step is predictable once you know the pattern.',
      'D goes to A (one fifth), then A goes to E (another fifth). Two steps: E.',
      -- L4
      'How many clockwise steps from C to reach F#?',
      '6', '5', '7', '4',
      'C-G-D-A-E-B-F# is six steps. F# sits at the bottom of the circle, opposite C.',
      'Count: C to G (1), D (2), A (3), E (4), B (5), F# (6). Six steps.',
      -- L5
      'On either side of A on the circle sit...?',
      'D and E', 'G and B', 'E and B', 'C and F',
      'D is one fifth below A, E is one fifth above. Neighboring keys share the most accidentals.',
      'A sits between D (counterclockwise) and E (clockwise) on the circle.',
      -- L6
      'The tritone opposite of C on the circle is...?',
      'F#/Gb', 'B', 'Db', 'E',
      'Six steps in either direction from any key reaches its tritone opposite — the most distant key.',
      'Count six steps clockwise or counterclockwise — you always land on the tritone opposite.'
    ),
    (
      'cof_counterclockwise',
      'Circle of Fifths — Counterclockwise',
      -- L1
      'A fourth above C (or fifth below) is...?',
      'F', 'Bb', 'G', 'Eb',
      'Each step counterclockwise adds a fourth (or descends a fifth) — this direction accumulates flats.',
      'A perfect fourth up from C is F. Counterclockwise on the circle moves by fourths.',
      -- L2
      'Going counterclockwise from F, the next key is...?',
      'Bb', 'Eb', 'Ab', 'C',
      'F to Bb is a perfect fourth. Each counterclockwise step adds one flat.',
      'From F, count up a perfect fourth. F-G-A-Bb — the answer is Bb.',
      -- L3
      'Two steps counterclockwise from Bb lands on...?',
      'Eb', 'Ab', 'Db', 'F',
      'Bb to Eb is one fourth, and that second step completes the move. The flat side mirrors the sharp side.',
      'Bb goes to Eb (one fourth). Two steps counterclockwise from Bb: Eb.',
      -- L4
      'How many counterclockwise steps from C to Gb?',
      '6', '5', '7', '4',
      'C-F-Bb-Eb-Ab-Db-Gb is six steps. Gb is the enharmonic twin of F#, opposite C.',
      'Count: C to F (1), Bb (2), Eb (3), Ab (4), Db (5), Gb (6). Six steps.',
      -- L5
      'On either side of Eb on the circle sit...?',
      'Bb and Ab', 'F and Ab', 'Ab and Db', 'Bb and F',
      'Bb is one step clockwise from Eb, Ab is one step counterclockwise. Neighbors share most accidentals.',
      'Eb sits between Bb (clockwise) and Ab (counterclockwise) on the circle.',
      -- L6
      'The tritone opposite of Gb on the circle is...?',
      'C', 'F', 'B', 'Db',
      'Six steps in either direction from Gb reaches C — the same tritone pair, viewed from the other side.',
      'Count six steps from Gb in either direction. You land on C — the tritone opposite.'
    );

  FOR r IN SELECT * FROM _cof_chains LOOP

    -- Insert chain_definition
    INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
    VALUES (r.slug, r.name, 'circle_of_fifths', NULL, 6, '{"type":"cold_start"}', true)
    RETURNING id INTO v_chain_id;

    -- ---- LINK 1 ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l1', NULL, 'declarative', 'select_one',
      r.l1_prompt,
      ARRAY['circle_of_fifths'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l1_a),
          jsonb_build_object('id', 'b', 'label', r.l1_b),
          jsonb_build_object('id', 'c', 'label', r.l1_c),
          jsonb_build_object('id', 'd', 'label', r.l1_d)
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
    VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Fifth above/below identification',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 2 ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l2', NULL, 'declarative', 'select_one',
      r.l2_prompt,
      ARRAY['circle_of_fifths'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l2_a),
          jsonb_build_object('id', 'b', 'label', r.l2_b),
          jsonb_build_object('id', 'c', 'label', r.l2_c),
          jsonb_build_object('id', 'd', 'label', r.l2_d)
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
    VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Next key in circle direction',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 3 ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l3', NULL, 'declarative', 'select_one',
      r.l3_prompt,
      ARRAY['circle_of_fifths'],
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
    VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Two steps in circle direction',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 4 ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l4', NULL, 'declarative', 'select_one',
      r.l4_prompt,
      ARRAY['circle_of_fifths'],
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
    VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Count steps to distant key',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 5 ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l5', NULL, 'declarative', 'select_one',
      r.l5_prompt,
      ARRAY['circle_of_fifths'],
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
    VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Neighbor keys identification',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 6 ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l6', NULL, 'declarative', 'select_one',
      r.l6_prompt,
      ARRAY['circle_of_fifths'],
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
    VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Tritone opposite identification',
      '["select_one"]'::JSONB, '{}'::JSONB);

  END LOOP;

  DROP TABLE _cof_chains;
  RAISE NOTICE 'Topic 13 Circle of Fifths: 2 chains, 12 card templates, 12 card instances, 12 chain links seeded';
END $$;
