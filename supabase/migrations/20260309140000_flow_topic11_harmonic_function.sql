-- Topic 11: Harmonic Function
-- 3 chains x 6 links = 18 card_templates, 18 card_instances, 18 chain_links

DO $$
DECLARE
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  -- =============================================
  -- Chain 1: Tonic Function (I, iii, vi)
  -- =============================================

  INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
  VALUES ('hf_tonic', 'Tonic Function', 'harmonic_function', NULL, 6, '{"type":"cold_start"}', true)
  RETURNING id INTO v_chain_id;

  -- L1: "This chord feels like..." (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_tonic_l1', NULL, 'declarative', 'select_one',
    'This chord feels like...',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Home (stability, arrival)'),
        jsonb_build_object('id', 'b', 'label', 'Tension (needs resolution)'),
        jsonb_build_object('id', 'c', 'label', 'Departure (moving away from tonic)')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Tonic function provides stability and home. I is the primary tonic chord, but iii and vi share enough tones to serve as substitutes.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Tonic chords feel like arriving home. I, iii, and vi all share that quality of rest and resolution.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Identify tonic function by feel',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L2: Which Roman numeral has tonic function? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_tonic_l2', NULL, 'declarative', 'select_one',
    'Which of these chords has tonic function?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'vi'),
        jsonb_build_object('id', 'b', 'label', 'V'),
        jsonb_build_object('id', 'c', 'label', 'IV'),
        jsonb_build_object('id', 'd', 'label', 'ii')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'I, iii, and vi all have tonic function. vi shares two of three tones with I, giving it that sense of home.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Tonic function belongs to I, iii, and vi. These chords share enough tones with the tonic triad to feel stable.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Identify chord with tonic function',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L3: Harmonic cycle — what comes after tonic? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_tonic_l3', NULL, 'declarative', 'select_one',
    'In the typical harmonic cycle, what comes after tonic?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Subdominant'),
        jsonb_build_object('id', 'b', 'label', 'Dominant'),
        jsonb_build_object('id', 'c', 'label', 'Tonic again'),
        jsonb_build_object('id', 'd', 'label', 'Any function')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The harmonic cycle flows T to S to D to T. After tonic, subdominant moves the harmony away from home.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'The standard cycle is tonic, then subdominant, then dominant, then back to tonic. T-S-D-T.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Harmonic cycle direction from tonic',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L4: Tension increasing or resolving? (binary_choice)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_tonic_l4', NULL, 'declarative', 'binary_choice',
    'Is tension increasing or resolving in this chord pair: I to IV?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Increasing'),
        jsonb_build_object('id', 'b', 'label', 'Resolving')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Moving from tonic to subdominant increases tension — you are departing from home toward the dominant region.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'T to S moves away from stability. Tension increases whenever harmony moves from tonic toward subdominant or dominant.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Tension direction from tonic',
    '["binary_choice"]'::JSONB, '{}'::JSONB);

  -- L5: Why can vi substitute for I? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_tonic_l5', NULL, 'declarative', 'select_one',
    'Why can vi substitute for I?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'They share 2 of 3 tones'),
        jsonb_build_object('id', 'b', 'label', 'They have the same root'),
        jsonb_build_object('id', 'c', 'label', 'They are both major chords'),
        jsonb_build_object('id', 'd', 'label', 'They are a tritone apart')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'In C major, I = C-E-G and vi = A-C-E. Two shared tones (C and E) give vi enough of tonic''s character to substitute.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Shared tones are the key. I and vi overlap on 2 of 3 pitches, which is why vi can stand in for I at cadence points.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Theory — tonic substitution reasoning',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L6: Label full progression's functions (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_tonic_l6', NULL, 'declarative', 'select_one',
    'Label the harmonic function of each chord: I-IV-V-I',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'T-S-D-T'),
        jsonb_build_object('id', 'b', 'label', 'T-D-S-T'),
        jsonb_build_object('id', 'c', 'label', 'S-D-T-S'),
        jsonb_build_object('id', 'd', 'label', 'T-S-T-D')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'I is tonic, IV is subdominant, V is dominant, I is tonic. T-S-D-T is the most common harmonic cycle.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'I = tonic (home), IV = subdominant (departure), V = dominant (tension), I = tonic (resolution). T-S-D-T.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Label harmonic functions of full progression',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- =============================================
  -- Chain 2: Dominant Function (V, vii°)
  -- =============================================

  INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
  VALUES ('hf_dominant', 'Dominant Function', 'harmonic_function', NULL, 6, '{"type":"cold_start"}', true)
  RETURNING id INTO v_chain_id;

  -- L1: "This chord feels like..." (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_dominant_l1', NULL, 'declarative', 'select_one',
    'This chord feels like...',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Tension (needs resolution)'),
        jsonb_build_object('id', 'b', 'label', 'Home (stability, arrival)'),
        jsonb_build_object('id', 'c', 'label', 'Departure (moving away from tonic)')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Dominant function creates tension that demands resolution. V and vii° both contain the leading tone — that half-step pull to tonic.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'V and vii° share the leading tone — that half-step pull to tonic is what creates dominant function.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Identify dominant function by feel',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L2: Which Roman numeral has dominant function? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_dominant_l2', NULL, 'declarative', 'select_one',
    'Which of these chords has dominant function?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'vii°'),
        jsonb_build_object('id', 'b', 'label', 'vi'),
        jsonb_build_object('id', 'c', 'label', 'ii'),
        jsonb_build_object('id', 'd', 'label', 'IV')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'V and vii° both have dominant function. The leading tone they share is the defining ingredient of dominant pull.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Dominant function belongs to V and vii°. Both contain the leading tone, which creates the strongest pull back to tonic.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Identify chord with dominant function',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L3: Harmonic cycle — what comes after dominant? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_dominant_l3', NULL, 'declarative', 'select_one',
    'In the typical harmonic cycle, what comes after dominant?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Tonic'),
        jsonb_build_object('id', 'b', 'label', 'Subdominant'),
        jsonb_build_object('id', 'c', 'label', 'Dominant again'),
        jsonb_build_object('id', 'd', 'label', 'Any function')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Dominant resolves to tonic. This D-to-T motion is the strongest pull in tonal harmony — the authentic cadence.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'The cycle flows T-S-D-T. After dominant, the tension resolves back to tonic. This is the foundation of cadential motion.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Harmonic cycle direction from dominant',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L4: Tension increasing or resolving? V to I (binary_choice)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_dominant_l4', NULL, 'declarative', 'binary_choice',
    'Is tension increasing or resolving in this chord pair: V to I?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Resolving'),
        jsonb_build_object('id', 'b', 'label', 'Increasing')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Dominant to tonic is the quintessential resolution. The leading tone resolves up, the tension dissolves into stability.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'D to T always resolves tension. The leading tone in V pulls up a half step to the tonic note, releasing the tension.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Tension direction from dominant',
    '["binary_choice"]'::JSONB, '{}'::JSONB);

  -- L5: Why can vii° substitute for V? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_dominant_l5', NULL, 'declarative', 'select_one',
    'Why can vii° substitute for V?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'They share the leading tone'),
        jsonb_build_object('id', 'b', 'label', 'They have the same root'),
        jsonb_build_object('id', 'c', 'label', 'They are both major chords'),
        jsonb_build_object('id', 'd', 'label', 'They are inversions of each other')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'vii° is essentially V7 without the root. Both contain the leading tone and the tritone that drives resolution to tonic.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'The leading tone is what defines dominant function. vii° shares this critical tone with V, plus the tritone that pulls toward resolution.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Theory — dominant substitution reasoning',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L6: Label full progression's functions (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_dominant_l6', NULL, 'declarative', 'select_one',
    'Label the harmonic function of each chord: I-IV-V-I',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'T-S-D-T'),
        jsonb_build_object('id', 'b', 'label', 'T-D-S-T'),
        jsonb_build_object('id', 'c', 'label', 'S-D-T-S'),
        jsonb_build_object('id', 'd', 'label', 'T-S-T-D')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'I is tonic, IV is subdominant, V is dominant, I is tonic. The cycle completes with dominant resolving home.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'I = tonic (home), IV = subdominant (departure), V = dominant (tension), I = tonic (resolution). T-S-D-T.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Label harmonic functions of full progression',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- =============================================
  -- Chain 3: Subdominant Function (ii, IV)
  -- =============================================

  INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
  VALUES ('hf_subdominant', 'Subdominant Function', 'harmonic_function', NULL, 6, '{"type":"cold_start"}', true)
  RETURNING id INTO v_chain_id;

  -- L1: "This chord feels like..." (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_subdominant_l1', NULL, 'declarative', 'select_one',
    'This chord feels like...',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Departure (moving away from tonic)'),
        jsonb_build_object('id', 'b', 'label', 'Home (stability, arrival)'),
        jsonb_build_object('id', 'c', 'label', 'Tension (needs resolution)')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Subdominant function creates a sense of departure — moving away from home but not yet at full tension. ii and IV share this quality.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Subdominant chords (ii, IV) move the harmony away from tonic. They create gentle motion, not the urgent pull of dominant.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Identify subdominant function by feel',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L2: Which Roman numeral has subdominant function? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_subdominant_l2', NULL, 'declarative', 'select_one',
    'Which of these chords has subdominant function?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'ii'),
        jsonb_build_object('id', 'b', 'label', 'V'),
        jsonb_build_object('id', 'c', 'label', 'iii'),
        jsonb_build_object('id', 'd', 'label', 'vi')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'ii and IV both have subdominant function. They set up the dominant by moving harmony away from tonic.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Subdominant function belongs to ii and IV. These chords prepare the way for dominant, creating the S-D-T flow.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Identify chord with subdominant function',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L3: Harmonic cycle — what comes after subdominant? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_subdominant_l3', NULL, 'declarative', 'select_one',
    'In the typical harmonic cycle, what comes after subdominant?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Dominant'),
        jsonb_build_object('id', 'b', 'label', 'Tonic'),
        jsonb_build_object('id', 'c', 'label', 'Subdominant again'),
        jsonb_build_object('id', 'd', 'label', 'Any function')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Subdominant moves to dominant. S-to-D builds tension that then resolves to tonic, completing the T-S-D-T cycle.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'The cycle flows T-S-D-T. After subdominant, dominant takes over to create maximum tension before resolving home.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Harmonic cycle direction from subdominant',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L4: Tension increasing or resolving? IV to V (binary_choice)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_subdominant_l4', NULL, 'declarative', 'binary_choice',
    'Is tension increasing or resolving in this chord pair: IV to V?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Increasing'),
        jsonb_build_object('id', 'b', 'label', 'Resolving')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Subdominant to dominant increases tension. S-to-D is the buildup phase — tension peaks at dominant before resolving to tonic.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Moving from S to D pushes tension higher. Resolution only happens when dominant finally moves to tonic.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Tension direction from subdominant',
    '["binary_choice"]'::JSONB, '{}'::JSONB);

  -- L5: Why can ii substitute for IV? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_subdominant_l5', NULL, 'declarative', 'select_one',
    'Why can ii substitute for IV?',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'They share 2 of 3 tones'),
        jsonb_build_object('id', 'b', 'label', 'They have the same root'),
        jsonb_build_object('id', 'c', 'label', 'They are both minor chords'),
        jsonb_build_object('id', 'd', 'label', 'They are a fifth apart')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'In C major, IV = F-A-C and ii = D-F-A. Two shared tones (F and A) give ii the same subdominant character as IV.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Shared tones define functional equivalence. ii and IV overlap on 2 of 3 pitches, which is why ii can replace IV in progressions.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Theory — subdominant substitution reasoning',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L6: Label full progression's functions (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_hf_subdominant_l6', NULL, 'declarative', 'select_one',
    'Label the harmonic function of each chord: I-IV-V-I',
    ARRAY['harmonic_function'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'T-S-D-T'),
        jsonb_build_object('id', 'b', 'label', 'T-D-S-T'),
        jsonb_build_object('id', 'c', 'label', 'S-D-T-S'),
        jsonb_build_object('id', 'd', 'label', 'T-S-T-D')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'I is tonic, IV is subdominant, V is dominant, I is tonic. This T-S-D-T cycle is the engine of tonal harmony.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'I = tonic (home), IV = subdominant (departure), V = dominant (tension), I = tonic (resolution). T-S-D-T.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Label harmonic functions of full progression',
    '["select_one"]'::JSONB, '{}'::JSONB);

  RAISE NOTICE 'Topic 11 Harmonic Function: 3 chains, 18 card templates, 18 card instances, 18 chain links seeded';
END $$;
