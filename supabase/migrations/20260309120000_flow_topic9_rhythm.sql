-- Topic 9: Rhythm
-- 5 chains x 6 links = 30 card_templates, 30 card_instances, 30 chain_links

DO $$
DECLARE
  r RECORD;
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  CREATE TEMP TABLE _rhythm_chains (
    slug TEXT, name TEXT,
    unlock_cond JSONB,
    -- L1: "How many beats?" / note value question (select_one)
    l1_prompt TEXT, l1_params JSONB, l1_modalities JSONB,
    l1_a TEXT, l1_b TEXT, l1_c TEXT, l1_d TEXT,
    l1_fb_correct TEXT, l1_fb_incorrect TEXT,
    -- L2: Total beats in measure (select_one)
    l2_prompt TEXT, l2_params JSONB, l2_modalities JSONB,
    l2_a TEXT, l2_b TEXT, l2_c TEXT, l2_d TEXT,
    l2_fb_correct TEXT, l2_fb_incorrect TEXT,
    -- L3: Hear rhythm -> match notation (select_one, audio_select)
    l3_prompt TEXT, l3_params JSONB, l3_modalities JSONB,
    l3_a TEXT, l3_b TEXT, l3_c TEXT, l3_d TEXT,
    l3_fb_correct TEXT, l3_fb_incorrect TEXT,
    -- L4: See notation -> tap along (select_one fallback, rhythm_tap_input)
    l4_prompt TEXT, l4_params JSONB, l4_modalities JSONB, l4_modality_by_stage JSONB,
    l4_a TEXT, l4_b TEXT, l4_c TEXT, l4_d TEXT,
    l4_fb_correct TEXT, l4_fb_incorrect TEXT,
    -- L5: Dotted/tied note values (select_one)
    l5_prompt TEXT, l5_params JSONB, l5_modalities JSONB,
    l5_a TEXT, l5_b TEXT, l5_c TEXT, l5_d TEXT,
    l5_fb_correct TEXT, l5_fb_incorrect TEXT,
    -- L6: Syncopation ID (select_one, audio_select)
    l6_prompt TEXT, l6_params JSONB, l6_modalities JSONB,
    l6_a TEXT, l6_b TEXT, l6_c TEXT, l6_d TEXT,
    l6_fb_correct TEXT, l6_fb_incorrect TEXT
  );

  INSERT INTO _rhythm_chains VALUES
    -- ==============================
    -- Chain 1: 4/4 Time (cold start)
    -- ==============================
    (
      'rhythm_4_4',
      '4/4 Time',
      '{"type":"cold_start"}',
      -- L1
      'How many beats does a half note get in 4/4?',
      '{"time_signature":"4/4","note_value":"half"}',
      '["select_one"]',
      '2', '4', '1', '3',
      'A half note lasts two beats in 4/4. It fills exactly half the measure.',
      'In 4/4, a whole note gets 4 beats, a half note gets 2, and a quarter note gets 1.',
      -- L2
      'How many beats are in a measure of 4/4?',
      '{"time_signature":"4/4"}',
      '["select_one"]',
      '4', '3', '2', '6',
      'The top number tells you: 4 beats per measure, with the quarter note as the beat unit.',
      'The top number of a time signature indicates how many beats fill each measure.',
      -- L3
      'Which rhythm pattern matches what you hear?',
      '{"time_signature":"4/4","audio_ref":"rhythm_4_4_L3"}',
      '["select_one","audio_select"]',
      'Quarter, quarter, half', 'Half, half', 'Quarter, quarter, quarter, quarter', 'Whole',
      'Two quarter notes followed by a half note fills all four beats: 1 + 1 + 2 = 4.',
      'Count each note value carefully. In 4/4, all note values in a measure must add up to 4 beats.',
      -- L4
      'How would you count this rhythm?',
      '{"time_signature":"4/4","notation":"quarter, eighth, eighth, half"}',
      '["select_one","rhythm_tap_input"]',
      '{"apprentice":"select_one","adept":"rhythm_tap_input"}',
      '1, 2-and, 3-4', '1, 2, 3, 4', '1-and, 2-and, 3-4', '1, 2, 3-and-4',
      'The quarter takes beat 1, two eighths split beat 2 into "2-and," and the half sustains beats 3-4.',
      'Quarter notes land on the beat. Eighth notes split a beat into two equal parts.',
      -- L5
      'A dotted quarter note equals how many eighth notes?',
      '{"time_signature":"4/4","note_value":"dotted_quarter"}',
      '["select_one"]',
      '3', '2', '4', '1',
      'A dot adds half the note''s value. Quarter = 2 eighths, plus half of that (1 eighth) = 3 eighths.',
      'A dot adds half the original duration. A quarter note equals 2 eighth notes, so a dotted quarter equals 3.',
      -- L6
      'Which beat is syncopated in this pattern?',
      '{"time_signature":"4/4","audio_ref":"rhythm_4_4_L6","notation":"eighth-rest, eighth, quarter, quarter, quarter"}',
      '["select_one","audio_select"]',
      'Beat 1', 'Beat 2', 'Beat 3', 'Beat 4',
      'The eighth rest displaces beat 1 so the accent lands on the "and" of 1. That off-beat emphasis is syncopation.',
      'Syncopation places emphasis where you do not expect it — typically on an off-beat or weak beat.'
    ),
    -- ==============================
    -- Chain 2: 3/4 Time (cold start)
    -- ==============================
    (
      'rhythm_3_4',
      '3/4 Time',
      '{"type":"cold_start"}',
      -- L1
      'How many beats does a dotted half note get in 3/4?',
      '{"time_signature":"3/4","note_value":"dotted_half"}',
      '["select_one"]',
      '3', '2', '4', '1',
      'A dotted half note fills the entire measure in 3/4. Half note (2) plus the dot (1) = 3 beats.',
      'A dot adds half the note''s original value. A half note = 2 beats, so dotted half = 2 + 1 = 3.',
      -- L2
      'How many beats are in a measure of 3/4?',
      '{"time_signature":"3/4"}',
      '["select_one"]',
      '3', '4', '2', '6',
      'Three beats per measure with the quarter note as the beat unit. This is the foundation of waltz time.',
      'The top number of a time signature indicates how many beats fill each measure.',
      -- L3
      'Which rhythm pattern matches what you hear?',
      '{"time_signature":"3/4","audio_ref":"rhythm_3_4_L3"}',
      '["select_one","audio_select"]',
      'Half, quarter', 'Quarter, quarter, quarter', 'Dotted half', 'Quarter, half',
      'A half note takes beats 1-2, and a quarter note takes beat 3. Total: 2 + 1 = 3 beats.',
      'In 3/4, note values in each measure must add up to 3 quarter-note beats.',
      -- L4
      'How would you count this rhythm?',
      '{"time_signature":"3/4","notation":"quarter, eighth, eighth, quarter"}',
      '["select_one","rhythm_tap_input"]',
      '{"apprentice":"select_one","adept":"rhythm_tap_input"}',
      '1, 2-and, 3', '1, 2, 3', '1-and, 2, 3', '1, 2, 3-and',
      'Beat 1 is a quarter, beat 2 splits into two eighths ("2-and"), and beat 3 is a quarter.',
      'Quarter notes land on the beat. Two eighth notes divide one beat into two equal halves.',
      -- L5
      'A dotted half note in 3/4 fills how much of the measure?',
      '{"time_signature":"3/4","note_value":"dotted_half"}',
      '["select_one"]',
      'The whole measure', 'Two-thirds', 'Half', 'One-third',
      'A dotted half = 3 beats, which is exactly one full measure in 3/4.',
      'In 3/4, a measure holds 3 beats. A dotted half note lasts 3 beats (2 + 1 from the dot).',
      -- L6
      'Which beat is syncopated in this pattern?',
      '{"time_signature":"3/4","audio_ref":"rhythm_3_4_L6","notation":"eighth, eighth-rest, quarter, quarter"}',
      '["select_one","audio_select"]',
      'Beat 1', 'Beat 2', 'Beat 3', 'None',
      'The eighth note on beat 1 is cut short by the rest on the "and," shifting emphasis off the downbeat.',
      'Syncopation disrupts the expected rhythmic stress. Look for rests or ties that displace a strong beat.'
    ),
    -- ==============================
    -- Chain 3: 6/8 Compound (unlock: rhythm_3_4 L3)
    -- ==============================
    (
      'rhythm_6_8',
      '6/8 Compound Time',
      '{"type":"neighbor_mastery","requires_chain":"rhythm_3_4","min_link":3}',
      -- L1
      'What is the beat unit in 6/8?',
      '{"time_signature":"6/8","note_value":"dotted_quarter"}',
      '["select_one"]',
      'Dotted quarter', 'Quarter', 'Eighth', 'Half',
      'In 6/8, three eighth notes group into one beat, making the dotted quarter the felt pulse.',
      '6/8 is compound time. The 8 means eighth notes, but they group in threes, so each beat = dotted quarter.',
      -- L2
      'How many beats are in a measure of 6/8?',
      '{"time_signature":"6/8"}',
      '["select_one"]',
      '2', '6', '3', '4',
      'Although there are 6 eighth notes, they group into 2 sets of 3. You feel 2 main beats.',
      '6/8 is compound duple: 6 eighth notes grouped as 2 beats of 3 eighths each.',
      -- L3
      'Which rhythm pattern matches what you hear?',
      '{"time_signature":"6/8","audio_ref":"rhythm_6_8_L3"}',
      '["select_one","audio_select"]',
      'Dotted quarter, dotted quarter', 'Quarter, quarter, quarter', 'Three eighths, three eighths', 'Half, quarter',
      'Two dotted quarters each last 3 eighths, filling the full measure: 3 + 3 = 6 eighth notes.',
      'In 6/8, the main beats are dotted quarters. Each equals 3 eighth notes.',
      -- L4
      'How would you count this rhythm?',
      '{"time_signature":"6/8","notation":"dotted quarter, eighth, eighth, eighth"}',
      '["select_one","rhythm_tap_input"]',
      '{"apprentice":"select_one","adept":"rhythm_tap_input"}',
      '1-2-3, 4-5-6', '1, 2, 3, 4, 5, 6', '1-and-a, 2-and-a', '1-2, 3-4, 5-6',
      'Count all six eighth-note subdivisions: the dotted quarter spans 1-2-3, then three eighths take 4-5-6.',
      'In 6/8, count each eighth note position (1 through 6). The main beats fall on 1 and 4.',
      -- L5
      'A dotted quarter note in 6/8 equals how many eighth notes?',
      '{"time_signature":"6/8","note_value":"dotted_quarter"}',
      '["select_one"]',
      '3', '2', '4', '6',
      'Quarter = 2 eighths, plus the dot (1 eighth) = 3 eighths. This is one full beat in 6/8.',
      'A dot adds half the note''s value. Quarter = 2 eighths, plus half (1 eighth) = 3 eighths total.',
      -- L6
      'Which beat is syncopated in this pattern?',
      '{"time_signature":"6/8","audio_ref":"rhythm_6_8_L6","notation":"eighth, eighth, eighth-tied-to-eighth, eighth, eighth"}',
      '["select_one","audio_select"]',
      'Beat 2', 'Beat 1', 'Both beats', 'Neither',
      'The tie across the midpoint (eighth 3 to 4) obscures beat 2. The listener no longer feels that downbeat cleanly.',
      'Syncopation in compound time often ties across the grouping boundary — where beat 2 should land.'
    ),
    -- ==============================
    -- Chain 4: 2/4 Time (unlock: rhythm_4_4 L3)
    -- ==============================
    (
      'rhythm_2_4',
      '2/4 Time',
      '{"type":"neighbor_mastery","requires_chain":"rhythm_4_4","min_link":3}',
      -- L1
      'How many beats does a quarter note get in 2/4?',
      '{"time_signature":"2/4","note_value":"quarter"}',
      '["select_one"]',
      '1', '2', '0.5', '4',
      'A quarter note always gets 1 beat when the quarter note is the beat unit. 2/4 and 4/4 share that trait.',
      'The bottom number of the time signature tells you the beat unit. 4 means a quarter note = 1 beat.',
      -- L2
      'How many beats are in a measure of 2/4?',
      '{"time_signature":"2/4"}',
      '["select_one"]',
      '2', '4', '3', '1',
      'Two beats per measure. 2/4 is common in marches — a steady strong-weak pattern.',
      'The top number of a time signature indicates how many beats fill each measure.',
      -- L3
      'Which rhythm pattern matches what you hear?',
      '{"time_signature":"2/4","audio_ref":"rhythm_2_4_L3"}',
      '["select_one","audio_select"]',
      'Eighth, eighth, quarter', 'Quarter, quarter', 'Half', 'Eighth, eighth, eighth, eighth',
      'Two eighth notes take beat 1 and a quarter note takes beat 2: 0.5 + 0.5 + 1 = 2 beats.',
      'In 2/4, note values in each measure must add up to 2 quarter-note beats.',
      -- L4
      'How would you count this rhythm?',
      '{"time_signature":"2/4","notation":"eighth, eighth, eighth, eighth"}',
      '["select_one","rhythm_tap_input"]',
      '{"apprentice":"select_one","adept":"rhythm_tap_input"}',
      '1-and, 2-and', '1, 2, 3, 4', '1-and-2-and', '1, 2',
      'Each beat splits into two eighths: "1-and, 2-and." The comma marks the beat boundary.',
      'Two eighth notes fill one beat. Count them as "and" subdivisions between the main beats.',
      -- L5
      'A tied quarter note across the barline in 2/4 lasts how many total beats?',
      '{"time_signature":"2/4","note_value":"tied_quarter_across_barline"}',
      '["select_one"]',
      '2', '1', '3', '4',
      'A tie connects two notes into one sustained sound. Quarter (1 beat) + quarter (1 beat) = 2 beats total.',
      'A tie adds the durations of both notes together. The second note is not re-attacked.',
      -- L6
      'Which beat is syncopated in this pattern?',
      '{"time_signature":"2/4","audio_ref":"rhythm_2_4_L6","notation":"eighth-rest, eighth, eighth, eighth-rest"}',
      '["select_one","audio_select"]',
      'Beat 1', 'Beat 2', 'Both beats', 'Neither',
      'The rest on beat 1 shifts the accent to the "and" of 1. In a strong-weak meter, displacing beat 1 is immediately felt.',
      'When the downbeat is replaced by a rest, the next sounding note inherits the stress — that is syncopation.'
    ),
    -- ==============================
    -- Chain 5: 5/4 Time (unlock: rhythm_2_4 L3)
    -- ==============================
    (
      'rhythm_5_4',
      '5/4 Time',
      '{"type":"neighbor_mastery","requires_chain":"rhythm_2_4","min_link":3}',
      -- L1
      'How is 5/4 typically grouped?',
      '{"time_signature":"5/4"}',
      '["select_one"]',
      '3+2 or 2+3', '4+1', '5 equal beats', '2+2+1',
      'Performers group 5/4 as either 3+2 or 2+3. The grouping creates an asymmetric feel that defines the music.',
      '5/4 is an asymmetric meter. The 5 beats divide unevenly, most commonly as 3+2 or 2+3.',
      -- L2
      'How many beats are in a measure of 5/4?',
      '{"time_signature":"5/4"}',
      '["select_one"]',
      '5', '4', '6', '3',
      'Five quarter-note beats per measure. The asymmetry is what makes 5/4 distinctive.',
      'The top number of a time signature indicates how many beats fill each measure.',
      -- L3
      'Which rhythm pattern matches what you hear?',
      '{"time_signature":"5/4","audio_ref":"rhythm_5_4_L3"}',
      '["select_one","audio_select"]',
      'Half, dotted half', 'Dotted half, half', 'Quarter, quarter, dotted half', 'Five quarters',
      'Half (2 beats) + dotted half (3 beats) = 5 beats, grouped as 2+3.',
      'In 5/4, the note values must total 5 quarter-note beats. Listen for the internal grouping.',
      -- L4
      'How would you count this rhythm?',
      '{"time_signature":"5/4","notation":"dotted half, quarter, quarter"}',
      '["select_one","rhythm_tap_input"]',
      '{"apprentice":"select_one","adept":"rhythm_tap_input"}',
      '1-2-3, 4, 5', '1, 2, 3, 4, 5', '1-2-3-4, 5', '1-2, 3-4, 5',
      'The dotted half spans beats 1-2-3 (the group of 3), then two quarters take beats 4 and 5.',
      'In 5/4, identify the grouping first (3+2 or 2+3), then count within each group.',
      -- L5
      'A tied dotted half and quarter in 5/4 lasts how many beats?',
      '{"time_signature":"5/4","note_value":"tied_dotted_half_quarter"}',
      '["select_one"]',
      '4', '3', '5', '2',
      'Dotted half (3 beats) + quarter (1 beat) = 4 beats. One beat short of filling the whole measure.',
      'A tie adds the durations together. Dotted half = 3 beats, quarter = 1 beat, total = 4.',
      -- L6
      'Which beat is syncopated in this pattern?',
      '{"time_signature":"5/4","audio_ref":"rhythm_5_4_L6","notation":"quarter, quarter, eighth-rest, eighth, quarter, quarter"}',
      '["select_one","audio_select"]',
      'Beat 3', 'Beat 1', 'Beat 5', 'Beat 4',
      'The rest on beat 3 displaces the midpoint of the 3+2 grouping. The "and" of 3 takes the accent instead.',
      'Syncopation shifts emphasis to an unexpected part of the beat. Look for rests or ties on strong beats.'
    );

  -- Loop through each chain and create chain_definition + 6 links
  FOR r IN SELECT * FROM _rhythm_chains LOOP

    -- Insert chain_definition
    INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
    VALUES (r.slug, r.name, 'rhythm', NULL, 6, r.unlock_cond, true)
    RETURNING id INTO v_chain_id;

    -- ---- LINK 1: Beat count / note value ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_beat_count', NULL, 'declarative', 'select_one',
      r.l1_prompt,
      ARRAY['rhythm'],
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Beat count or note value identification', r.l1_modalities, '{}'::JSONB);

    -- ---- LINK 2: Total beats in measure ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_total_beats', NULL, 'declarative', 'select_one',
      r.l2_prompt,
      ARRAY['rhythm'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l2_a),
          jsonb_build_object('id', 'b', 'label', r.l2_b),
          jsonb_build_object('id', 'c', 'label', r.l2_c),
          jsonb_build_object('id', 'd', 'label', r.l2_d)
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Total beats in measure', r.l2_modalities, '{}'::JSONB);

    -- ---- LINK 3: Hear rhythm -> match notation ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_audio_match', NULL, 'declarative', 'select_one',
      r.l3_prompt,
      ARRAY['rhythm'],
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Audio rhythm to notation matching', r.l3_modalities, '{}'::JSONB);

    -- ---- LINK 4: See notation -> tap along ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_tap_rhythm', NULL, 'declarative', 'select_one',
      r.l4_prompt,
      ARRAY['rhythm'],
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Notation to rhythm counting/tapping', r.l4_modalities, r.l4_modality_by_stage);

    -- ---- LINK 5: Dotted/tied note values ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_dotted_tied', NULL, 'declarative', 'select_one',
      r.l5_prompt,
      ARRAY['rhythm'],
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Dotted and tied note value calculation', r.l5_modalities, '{}'::JSONB);

    -- ---- LINK 6: Syncopation identification ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_syncopation', NULL, 'declarative', 'select_one',
      r.l6_prompt,
      ARRAY['rhythm'],
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Syncopation identification', r.l6_modalities, '{}'::JSONB);

  END LOOP;

  DROP TABLE _rhythm_chains;
  RAISE NOTICE 'Topic 9 Rhythm: 5 chains, 30 card templates, 30 card instances, 30 chain links seeded';
END $$;
