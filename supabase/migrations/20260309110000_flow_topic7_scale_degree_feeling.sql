-- Topic 7: Scale Degree Feeling
-- 7 chains x 6 links = 42 card_templates, 42 card_instances, 42 chain_links

DO $$
DECLARE
  r RECORD;
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  CREATE TEMP TABLE _sdf_chains (
    slug TEXT, name TEXT,
    unlock_cond JSONB,
    degree_num INT,
    degree_label TEXT,
    -- L1: Tonic or not? (binary_choice)
    l1_answer TEXT,
    l1_fb_correct TEXT, l1_fb_incorrect TEXT,
    -- L2: Which degree? 3 far options (select_one)
    l2_opt_b TEXT, l2_opt_c TEXT, l2_opt_d TEXT,
    l2_fb_correct TEXT, l2_fb_incorrect TEXT,
    -- L3: Which degree? 4 close options (select_one)
    l3_opt_b TEXT, l3_opt_c TEXT, l3_opt_d TEXT,
    l3_fb_correct TEXT, l3_fb_incorrect TEXT,
    -- L4: Tendency (select_one)
    l4_tendency TEXT,
    l4_opt_b TEXT, l4_opt_c TEXT, l4_opt_d TEXT,
    l4_fb_correct TEXT, l4_fb_incorrect TEXT,
    -- L5: Where does it resolve? (select_one)
    l5_prompt TEXT, l5_answer TEXT,
    l5_opt_b TEXT, l5_opt_c TEXT, l5_opt_d TEXT,
    l5_fb_correct TEXT, l5_fb_incorrect TEXT,
    -- L6: Two degrees (select_one)
    l6_pair TEXT,
    l6_opt_b TEXT, l6_opt_c TEXT, l6_opt_d TEXT,
    l6_fb_correct TEXT, l6_fb_incorrect TEXT
  );

  INSERT INTO _sdf_chains VALUES
    -- ==============================
    -- Chain 1: Tonic (1) — cold start
    -- ==============================
    (
      'degree_1', 'Tonic (1)',
      '{"type":"cold_start"}',
      1, '1',
      -- L1
      'Tonic',
      'The tonic is home base — every melody gravitates back to it.',
      'This is the tonic. It is the resting point of the scale, the note everything resolves to.',
      -- L2: far options
      '5', '4', '7',
      'The tonic sits at the bottom of the scale. It has no pull — it is the destination.',
      'The tonic is scale degree 1. It is where phrases begin and end.',
      -- L3: close options
      '2', '3', '7',
      'Degree 1 is the tonic. The neighboring degrees (2 and 7) pull toward it.',
      'The tonic is the most stable note. Listen for the sense of arrival.',
      -- L4
      'Stable / home',
      'Resolve up', 'Resolve down', 'Floaty',
      'The tonic is pure stability. It has no urge to move anywhere.',
      'The tonic is the resting point. It does not need to resolve — it is the resolution.',
      -- L5
      'Does the tonic (1) need to resolve?',
      'No — it is already home',
      'Yes — up to 2', 'Yes — down to 7', 'Sometimes',
      'The tonic is the point of resolution itself. Nothing pulls it elsewhere.',
      'Scale degree 1 is the destination. Other degrees resolve to it, not the other way around.',
      -- L6
      '1 and 5',
      '2 and 6', '3 and 7', '4 and 1',
      'The tonic (1) and dominant (5) form the strongest axis in tonal music.',
      'Listen for the two most stable reference points. 1 and 5 anchor the key.'
    ),
    -- ==============================
    -- Chain 2: Dominant (5) — cold start
    -- ==============================
    (
      'degree_5', 'Dominant (5)',
      '{"type":"cold_start"}',
      5, '5',
      -- L1
      'Not tonic',
      'The dominant is not the tonic, but it is the second most stable degree.',
      'This is not the tonic. The dominant (5) sounds stable but carries a pull toward 1.',
      -- L2
      '1', '3', '2',
      'The dominant is the 5th degree — it anchors the upper half of the scale.',
      'Scale degree 5 is the dominant. It has a strong, open quality.',
      -- L3
      '4', '6', '3',
      'The dominant sits between 4 and 6. It sounds grounded but not as final as the tonic.',
      'Degree 5 is the dominant. It sounds stable but not conclusive.',
      -- L4
      'Stable',
      'Resolve up', 'Resolve down', 'Floaty',
      'The dominant is stable — the second pillar of the key alongside the tonic.',
      'Scale degree 5 does not urgently resolve. It supports the key from above.',
      -- L5
      'Does the dominant (5) need to resolve?',
      'No — it is stable on its own',
      'Yes — up to 6', 'Yes — down to 4', 'Sometimes',
      'The dominant can rest comfortably. It does not demand resolution the way 7 or 4 does.',
      'Scale degree 5 is inherently stable. It serves as an anchor alongside the tonic.',
      -- L6
      '5 and 1',
      '4 and 7', '6 and 2', '3 and 5',
      'Degrees 5 and 1 define the tonic-dominant axis — the backbone of tonal music.',
      'The two most stable degrees are 1 and 5. Together they outline the key.'
    ),
    -- ==============================
    -- Chain 3: Mediant (3) — cold start
    -- ==============================
    (
      'degree_3', 'Mediant (3)',
      '{"type":"cold_start"}',
      3, '3',
      -- L1
      'Not tonic',
      'The mediant is not the tonic. It sits a third above, giving the scale its major or minor color.',
      'This is not the tonic. The mediant (3) defines whether the key sounds major or minor.',
      -- L2
      '6', '1', '7',
      'The mediant is the 3rd degree — it colors the mode. A major 3rd sounds bright, a minor 3rd sounds dark.',
      'Scale degree 3 is the mediant. It sits between tonic and dominant.',
      -- L3
      '2', '4', '1',
      'The mediant neighbors 2 below and 4 above. It is the pivot between tonic and dominant territory.',
      'Degree 3 is the mediant. It defines the major/minor quality of the key.',
      -- L4
      'Stable',
      'Resolve up', 'Resolve down', 'Floaty',
      'The mediant is relatively stable — it forms part of the tonic triad (1-3-5).',
      'Scale degree 3 belongs to the tonic triad, giving it a settled quality.',
      -- L5
      'Does the mediant (3) need to resolve?',
      'No — it is part of the tonic triad',
      'Yes — down to 2', 'Yes — up to 4', 'Sometimes',
      'As a member of the tonic triad (1-3-5), the mediant rests comfortably.',
      'Scale degree 3 is stable because it belongs to the tonic chord. It does not need to move.',
      -- L6
      '3 and 1',
      '4 and 6', '2 and 7', '5 and 2',
      'Degrees 3 and 1 outline the lower third of the tonic triad — the interval that defines major or minor.',
      'The mediant and tonic together reveal the mode. A major 3rd = major key, minor 3rd = minor key.'
    ),
    -- ==============================
    -- Chain 4: Subdominant (4) — unlock after degree_3 L3
    -- ==============================
    (
      'degree_4', 'Subdominant (4)',
      '{"type":"neighbor_mastery","requires_chain":"degree_3","min_link":3}',
      4, '4',
      -- L1
      'Not tonic',
      'The subdominant is not the tonic. It sits just below the dominant, creating gentle downward pull.',
      'This is not the tonic. The subdominant (4) leans downward toward 3.',
      -- L2
      '1', '7', '6',
      'The subdominant is the 4th degree — it has a warm, slightly restless quality.',
      'Scale degree 4 is the subdominant. It sits one step above the mediant.',
      -- L3
      '3', '5', '2',
      'The subdominant sits between 3 and 5. It leans toward 3 rather than continuing up.',
      'Degree 4 neighbors the stable mediant (3) below and dominant (5) above.',
      -- L4
      'Resolve down',
      'Stable / home', 'Resolve up', 'Floaty',
      'The subdominant pulls downward to 3. That half step in minor (or whole step in major) creates gentle tension.',
      'Scale degree 4 tends to resolve down to 3. It wants to settle into the tonic triad.',
      -- L5
      'Where does the subdominant (4) naturally resolve?',
      'Down to 3',
      'Up to 5', 'Down to 1', 'Up to 6',
      'The subdominant resolves down to the mediant — settling into the tonic triad.',
      'Scale degree 4 resolves downward to 3. The pull is gentle but consistent.',
      -- L6
      '4 and 3',
      '5 and 1', '6 and 2', '7 and 5',
      'Degrees 4 and 3 are neighbors — the subdominant naturally falls to the mediant.',
      'When 4 resolves to 3, you hear the tension release into the stable tonic triad.'
    ),
    -- ==============================
    -- Chain 5: Supertonic (2) — unlock after degree_1 L3
    -- ==============================
    (
      'degree_2', 'Supertonic (2)',
      '{"type":"neighbor_mastery","requires_chain":"degree_1","min_link":3}',
      2, '2',
      -- L1
      'Not tonic',
      'The supertonic is not the tonic. It sits one step above, always leaning back toward 1.',
      'This is not the tonic. The supertonic (2) is restless — it wants to step back down to 1.',
      -- L2
      '5', '6', '4',
      'The supertonic is the 2nd degree — it has a gentle forward motion, leaning toward 1.',
      'Scale degree 2 is the supertonic. It sits just above the tonic.',
      -- L3
      '1', '3', '4',
      'The supertonic sits between 1 and 3. Its proximity to the tonic gives it a restless quality.',
      'Degree 2 neighbors the tonic (1) below and the mediant (3) above.',
      -- L4
      'Resolve down',
      'Stable / home', 'Resolve up', 'Floaty',
      'The supertonic resolves down to the tonic. That one-step descent is one of the most natural motions in music.',
      'Scale degree 2 leans downward. It wants to step down to 1.',
      -- L5
      'Where does the supertonic (2) naturally resolve?',
      'Down to 1',
      'Up to 3', 'Down to 7', 'Up to 5',
      'The supertonic resolves down to the tonic — a simple, satisfying step.',
      'Scale degree 2 resolves down to 1. The proximity creates a gentle but clear pull.',
      -- L6
      '2 and 1',
      '3 and 5', '4 and 6', '7 and 3',
      'Degrees 2 and 1 are immediate neighbors — the supertonic stepping down to the tonic.',
      'The supertonic-to-tonic motion (2 to 1) is one of the most common melodic resolutions.'
    ),
    -- ==============================
    -- Chain 6: Submediant (6) — unlock after degree_5 L3
    -- ==============================
    (
      'degree_6', 'Submediant (6)',
      '{"type":"neighbor_mastery","requires_chain":"degree_5","min_link":3}',
      6, '6',
      -- L1
      'Not tonic',
      'The submediant is not the tonic. It floats above the dominant with an open, unresolved quality.',
      'This is not the tonic. The submediant (6) has a floating, somewhat wistful character.',
      -- L2
      '2', '4', '1',
      'The submediant is the 6th degree — it has a floating quality, neither strongly stable nor strongly pulled.',
      'Scale degree 6 is the submediant. It sits above the dominant.',
      -- L3
      '5', '7', '4',
      'The submediant sits between 5 and 7. It has a lighter, more floating character than either neighbor.',
      'Degree 6 is the submediant. It is less grounded than 5 but less urgent than 7.',
      -- L4
      'Floaty',
      'Stable / home', 'Resolve up', 'Resolve down',
      'The submediant floats — it is not strongly pulled in either direction. It drifts more than it resolves.',
      'Scale degree 6 has a suspended, floating quality. It is the least directional of the active degrees.',
      -- L5
      'Where does the submediant (6) tend to move?',
      'Down to 5',
      'Up to 7', 'Down to 4', 'Up to 1',
      'The submediant drifts downward to the dominant. The motion is gentle, not urgent.',
      'Scale degree 6 tends to settle down to 5, the nearest stable degree.',
      -- L6
      '6 and 5',
      '7 and 1', '4 and 3', '2 and 3',
      'Degrees 6 and 5 are neighbors — the submediant gently settling to the dominant.',
      'The submediant (6) drifting to the dominant (5) is a soft, natural motion.'
    ),
    -- ==============================
    -- Chain 7: Leading tone (7) — unlock after degree_6 L3
    -- ==============================
    (
      'degree_7', 'Leading tone (7)',
      '{"type":"neighbor_mastery","requires_chain":"degree_6","min_link":3}',
      7, '7',
      -- L1
      'Not tonic',
      'The leading tone is not the tonic, but it is the closest note to it — a half step below.',
      'This is not the tonic. The leading tone (7) sits a half step below 1, creating the strongest pull in the scale.',
      -- L2
      '3', '1', '5',
      'The leading tone is the 7th degree — it has the most tension of any scale degree.',
      'Scale degree 7 is the leading tone. Its proximity to 1 creates powerful upward pull.',
      -- L3
      '6', '1', '5',
      'The leading tone sits between 6 and 1. That half-step distance to the tonic defines its urgent character.',
      'Degree 7 is the leading tone. It is the most restless degree in the scale.',
      -- L4
      'Resolve up',
      'Stable / home', 'Resolve down', 'Floaty',
      'The leading tone resolves upward to the tonic. That half-step pull is the strongest tendency in tonal music.',
      'Scale degree 7 pulls upward. The half step to 1 creates an almost magnetic attraction.',
      -- L5
      'Where does the leading tone (7) naturally resolve?',
      'Up to 1',
      'Down to 6', 'Up to 2', 'Down to 5',
      'The leading tone resolves up to the tonic. That half step is the strongest pull in the entire scale.',
      'Scale degree 7 resolves up to 1. The half-step proximity creates the most urgent tendency tone.',
      -- L6
      '7 and 1',
      '6 and 5', '4 and 3', '2 and 5',
      'Degrees 7 and 1 are the tightest pair — the leading tone pulling up to the tonic.',
      'The leading tone to tonic resolution (7 to 1) is the most powerful melodic pull in tonal music.'
    );

  -- Loop through each chain and create chain_definition + 6 links
  FOR r IN SELECT * FROM _sdf_chains LOOP

    -- Insert chain_definition
    INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
    VALUES (r.slug, r.name, 'scale_degree_feeling', NULL, 6, r.unlock_cond, true)
    RETURNING id INTO v_chain_id;

    -- ---- LINK 1: Tonic or not? (binary_choice) ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_tonic_or_not', NULL, 'aural', 'binary_choice',
      'Is this note the tonic?',
      ARRAY['scale_degree'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l1_answer),
          jsonb_build_object('id', 'b', 'label', CASE WHEN r.l1_answer = 'Tonic' THEN 'Not tonic' ELSE 'Tonic' END)
        ),
        'audio_config', jsonb_build_object('type', 'drone_and_note', 'degree', r.degree_num)
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Tonic or not — binary choice',
      '["binary_choice"]'::JSONB);

    -- ---- LINK 2: Which degree? 3 far options ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_far_id', NULL, 'aural', 'select_one',
      'Which scale degree is this?',
      ARRAY['scale_degree'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.degree_label),
          jsonb_build_object('id', 'b', 'label', r.l2_opt_b),
          jsonb_build_object('id', 'c', 'label', r.l2_opt_c),
          jsonb_build_object('id', 'd', 'label', r.l2_opt_d)
        ),
        'audio_config', jsonb_build_object('type', 'drone_and_note', 'degree', r.degree_num)
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Identify degree — 3 distant distractors',
      '["select_one","audio_select"]'::JSONB);

    -- ---- LINK 3: Which degree? 4 close options ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_close_id', NULL, 'aural', 'select_one',
      'Identify the scale degree',
      ARRAY['scale_degree'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.degree_label),
          jsonb_build_object('id', 'b', 'label', r.l3_opt_b),
          jsonb_build_object('id', 'c', 'label', r.l3_opt_c),
          jsonb_build_object('id', 'd', 'label', r.l3_opt_d)
        ),
        'audio_config', jsonb_build_object('type', 'drone_and_note', 'degree', r.degree_num)
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Identify degree — neighboring distractors',
      '["select_one","audio_select"]'::JSONB);

    -- ---- LINK 4: Tendency of this degree ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_tendency', NULL, 'declarative', 'select_one',
      'What is the tendency of scale degree ' || r.degree_label || '?',
      ARRAY['scale_degree'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l4_tendency),
          jsonb_build_object('id', 'b', 'label', r.l4_opt_b),
          jsonb_build_object('id', 'c', 'label', r.l4_opt_c),
          jsonb_build_object('id', 'd', 'label', r.l4_opt_d)
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Tendency / feeling of degree',
      '["select_one"]'::JSONB);

    -- ---- LINK 5: Where does it resolve? ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_resolve', NULL, 'declarative', 'select_one',
      r.l5_prompt,
      ARRAY['scale_degree'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l5_answer),
          jsonb_build_object('id', 'b', 'label', r.l5_opt_b),
          jsonb_build_object('id', 'c', 'label', r.l5_opt_c),
          jsonb_build_object('id', 'd', 'label', r.l5_opt_d)
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Resolution target of degree',
      '["select_one"]'::JSONB);

    -- ---- LINK 6: Two degrees, name both ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_pair', NULL, 'aural', 'select_one',
      'Name both scale degrees you hear',
      ARRAY['scale_degree'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l6_pair),
          jsonb_build_object('id', 'b', 'label', r.l6_opt_b),
          jsonb_build_object('id', 'c', 'label', r.l6_opt_c),
          jsonb_build_object('id', 'd', 'label', r.l6_opt_d)
        ),
        'audio_config', jsonb_build_object('type', 'drone_and_two_notes', 'degree', r.degree_num)
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Identify two degrees simultaneously',
      '["select_one"]'::JSONB);

  END LOOP;

  DROP TABLE _sdf_chains;
  RAISE NOTICE 'Topic 7 Scale Degree Feeling: 7 chains, 42 card templates, 42 card instances, 42 chain links seeded';
END $$;
