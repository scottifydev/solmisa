-- Topic 10: Cadence Recognition
-- 4 chains x 6 links = 24 card_templates, 24 card_instances, 24 chain_links

DO $$
DECLARE
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  -- =============================================
  -- Chain 1: Authentic Cadence (V->I) — cold start
  -- =============================================

  INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
  VALUES ('cadence_authentic', 'Authentic Cadence (V-I)', 'cadence_recognition', NULL, 6, '{"type":"cold_start"}', true)
  RETURNING id INTO v_chain_id;

  -- L1: Final or unfinished? (binary_choice)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_authentic_l1', NULL, 'perceptual', 'binary_choice',
    'Does this phrase ending sound final or unfinished?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Final'),
        jsonb_build_object('id', 'b', 'label', 'Unfinished')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'authentic', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'V to I — the dominant resolves to tonic. The strongest sense of arrival in tonal music.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'This phrase ends on the tonic chord. V resolving to I creates the most conclusive ending possible.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Final or unfinished — authentic cadence',
    '["binary_choice"]'::JSONB, '{}'::JSONB);

  -- L2: Which cadence? 2 options (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_authentic_l2', NULL, 'perceptual', 'select_one',
    'What type of cadence ends this phrase?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'b', 'label', 'Half (->V)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'authentic', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The phrase resolves from dominant to tonic — the hallmark of an authentic cadence.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'An authentic cadence ends on the tonic (I). A half cadence ends on the dominant (V). Listen for resolution.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Identify authentic vs half cadence',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  -- L3: Which cadence? 4 options (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_authentic_l3', NULL, 'perceptual', 'select_one',
    'Identify the cadence type',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'b', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'c', 'label', 'Half (->V)'),
        jsonb_build_object('id', 'd', 'label', 'Deceptive (V-vi)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'authentic', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'V to I — the dominant resolves to tonic. The strongest sense of arrival in tonal music.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Listen for the leading tone resolving up to the tonic. V-I is the most decisive cadence — complete harmonic closure.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Identify authentic cadence among all 4 types',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  -- L4: Staff — chord symbols -> name cadence (select_one, no audio)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_authentic_l4', NULL, 'declarative', 'select_one',
    'Based on these chord symbols, name the cadence',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'b', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'c', 'label', 'Half (->V)'),
        jsonb_build_object('id', 'd', 'label', 'Deceptive (V-vi)')
      ),
      'chord_symbols', jsonb_build_array('V', 'I')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'V to I is the authentic cadence — dominant resolving to tonic.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'V is the dominant, I is the tonic. When V moves to I, that is an authentic cadence.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Chord symbols to cadence name — authentic',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L5: Theory — what makes authentic distinctive? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_authentic_l5', NULL, 'declarative', 'select_one',
    'What defines an authentic cadence?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'V resolves to I — the strongest resolution'),
        jsonb_build_object('id', 'b', 'label', 'IV resolves to I — the Amen cadence'),
        jsonb_build_object('id', 'c', 'label', 'Phrase ends on V — tension unresolved'),
        jsonb_build_object('id', 'd', 'label', 'V moves to vi — the surprise')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The authentic cadence is the strongest harmonic resolution. The leading tone in V pulls to the tonic, creating complete closure.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'V resolves to I — the dominant chord contains the leading tone, which has the strongest pull toward the tonic.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Theory — what defines authentic cadence',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L6: Full chorale phrase -> identify ending (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_authentic_l6', NULL, 'perceptual', 'select_one',
    'Listen to the full phrase. What cadence ends it?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'b', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'c', 'label', 'Half (->V)'),
        jsonb_build_object('id', 'd', 'label', 'Deceptive (V-vi)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'authentic', 'source', 'bach_chorale', 'full_phrase', true)
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The phrase ends with the dominant resolving to tonic — a complete authentic cadence. This is how most chorale phrases conclude.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Focus on the last two chords. V to I produces the strongest sense of finality — the leading tone resolves up to the tonic.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Full chorale phrase — identify authentic cadence',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  -- =============================================
  -- Chain 2: Plagal Cadence (IV->I) — cold start
  -- =============================================

  INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
  VALUES ('cadence_plagal', 'Plagal Cadence (IV-I)', 'cadence_recognition', NULL, 6, '{"type":"cold_start"}', true)
  RETURNING id INTO v_chain_id;

  -- L1: Final or unfinished? (binary_choice)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_plagal_l1', NULL, 'perceptual', 'binary_choice',
    'Does this phrase ending sound final or unfinished?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Final'),
        jsonb_build_object('id', 'b', 'label', 'Unfinished')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'plagal', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'IV to I — the subdominant resolves to tonic. A gentler arrival than V-I, but still conclusive.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'This phrase ends on the tonic chord. IV resolving to I produces a softer but definite sense of closure.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Final or unfinished — plagal cadence',
    '["binary_choice"]'::JSONB, '{}'::JSONB);

  -- L2: Which cadence? 2 options (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_plagal_l2', NULL, 'perceptual', 'select_one',
    'What type of cadence ends this phrase?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'plagal', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The subdominant resolves to tonic without the leading tone — the characteristic warmth of the plagal cadence.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Both end on I, but the chord before matters. IV-I is plagal (softer). V-I is authentic (stronger). Listen for the leading tone.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Identify plagal vs authentic cadence',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  -- L3: Which cadence? 4 options (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_plagal_l3', NULL, 'perceptual', 'select_one',
    'Identify the cadence type',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'c', 'label', 'Half (->V)'),
        jsonb_build_object('id', 'd', 'label', 'Deceptive (V-vi)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'plagal', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'IV to I — the Amen cadence. The subdominant settles into the tonic without the urgency of the leading tone.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'The plagal cadence moves from IV to I. No leading tone pull — just the warmth of the subdominant resolving downward to tonic.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Identify plagal cadence among all 4 types',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  -- L4: Staff — chord symbols -> name cadence (select_one, no audio)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_plagal_l4', NULL, 'declarative', 'select_one',
    'Based on these chord symbols, name the cadence',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'c', 'label', 'Half (->V)'),
        jsonb_build_object('id', 'd', 'label', 'Deceptive (V-vi)')
      ),
      'chord_symbols', jsonb_build_array('IV', 'I')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'IV to I is the plagal cadence — the subdominant resolving to tonic.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'IV is the subdominant, I is the tonic. When IV moves to I, that is a plagal cadence — often called the Amen cadence.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Chord symbols to cadence name — plagal',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L5: Theory — what makes plagal distinctive? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_plagal_l5', NULL, 'declarative', 'select_one',
    'What defines a plagal cadence?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'IV resolves to I — the Amen cadence'),
        jsonb_build_object('id', 'b', 'label', 'V resolves to I — the strongest resolution'),
        jsonb_build_object('id', 'c', 'label', 'Phrase ends on V — tension unresolved'),
        jsonb_build_object('id', 'd', 'label', 'V moves to vi — the surprise')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The plagal cadence avoids the leading tone entirely. IV shares a common tone with I, creating a gentle settling rather than a dramatic resolution.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'IV resolves to I — the subdominant to tonic. It is called the Amen cadence because hymns traditionally end this way.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Theory — what defines plagal cadence',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L6: Full chorale phrase -> identify ending (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_plagal_l6', NULL, 'perceptual', 'select_one',
    'Listen to the full phrase. What cadence ends it?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'c', 'label', 'Half (->V)'),
        jsonb_build_object('id', 'd', 'label', 'Deceptive (V-vi)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'plagal', 'source', 'bach_chorale', 'full_phrase', true)
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The phrase settles from subdominant to tonic — a plagal cadence. Softer than V-I, but unmistakably final.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'The last two chords are IV to I. No leading tone resolution — just the subdominant gently resolving to tonic.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Full chorale phrase — identify plagal cadence',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  -- =============================================
  -- Chain 3: Half Cadence (->V) — unlock: neighbor_mastery of cadence_authentic, min_link 3
  -- =============================================

  INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
  VALUES ('cadence_half', 'Half Cadence (->V)', 'cadence_recognition', NULL, 6,
    '{"type":"neighbor_mastery","requires_chain":"cadence_authentic","min_link":3}', true)
  RETURNING id INTO v_chain_id;

  -- L1: Final or unfinished? (binary_choice)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_half_l1', NULL, 'perceptual', 'binary_choice',
    'Does this phrase ending sound final or unfinished?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Unfinished'),
        jsonb_build_object('id', 'b', 'label', 'Final')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'half', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The phrase stops on the dominant — tension remains. A half cadence is like a comma, not a period.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'This phrase ends on V, not I. The dominant chord creates expectation — something more needs to follow.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Final or unfinished — half cadence',
    '["binary_choice"]'::JSONB, '{}'::JSONB);

  -- L2: Which cadence? 2 options (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_half_l2', NULL, 'perceptual', 'select_one',
    'What type of cadence ends this phrase?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Half (->V)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'half', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The phrase ends on the dominant — no resolution to tonic. A half cadence pauses the harmonic motion.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'A half cadence ends ON the dominant (V). An authentic cadence ends on tonic (I). Listen for whether the tension resolves.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Identify half vs authentic cadence',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  -- L3: Which cadence? 4 options (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_half_l3', NULL, 'perceptual', 'select_one',
    'Identify the cadence type',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Half (->V)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'c', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'd', 'label', 'Deceptive (V-vi)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'half', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The phrase stops on V — tension hangs in the air. Half cadences create the expectation that more music will follow.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'A half cadence ends on the dominant. The phrase feels incomplete — the harmony demands continuation.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Identify half cadence among all 4 types',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  -- L4: Staff — chord symbols -> name cadence (select_one, no audio)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_half_l4', NULL, 'declarative', 'select_one',
    'Based on these chord symbols, name the cadence',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Half (->V)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'c', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'd', 'label', 'Deceptive (V-vi)')
      ),
      'chord_symbols', jsonb_build_array('I', 'V')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The progression ends on V — a half cadence. Any chord moving to V at a phrase boundary creates this effect.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'When a phrase ends on V (the dominant), regardless of what precedes it, that is a half cadence.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Chord symbols to cadence name — half',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L5: Theory — what makes half cadence distinctive? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_half_l5', NULL, 'declarative', 'select_one',
    'What defines a half cadence?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Phrase ends ON V — tension unresolved'),
        jsonb_build_object('id', 'b', 'label', 'V resolves to I — the strongest resolution'),
        jsonb_build_object('id', 'c', 'label', 'IV resolves to I — the Amen cadence'),
        jsonb_build_object('id', 'd', 'label', 'V moves to vi — the surprise')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'A half cadence is an open cadence — it ends on the dominant, leaving harmonic tension unresolved. It demands continuation.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'The phrase ends ON the dominant chord. Unlike other cadences, the half cadence is defined by its destination (V), not its origin.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Theory — what defines half cadence',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L6: Full chorale phrase -> identify ending (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_half_l6', NULL, 'perceptual', 'select_one',
    'Listen to the full phrase. What cadence ends it?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Half (->V)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'c', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'd', 'label', 'Deceptive (V-vi)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'half', 'source', 'bach_chorale', 'full_phrase', true)
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The phrase pauses on the dominant — a half cadence. Bach often uses these to separate paired phrases before the final resolution.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'The phrase ends on V, not I. It sounds unfinished because the dominant is a point of tension, not rest.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Full chorale phrase — identify half cadence',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  -- =============================================
  -- Chain 4: Deceptive Cadence (V->vi) — unlock: neighbor_mastery of cadence_half, min_link 3
  -- =============================================

  INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
  VALUES ('cadence_deceptive', 'Deceptive Cadence (V-vi)', 'cadence_recognition', NULL, 6,
    '{"type":"neighbor_mastery","requires_chain":"cadence_half","min_link":3}', true)
  RETURNING id INTO v_chain_id;

  -- L1: Final or unfinished? (binary_choice)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_deceptive_l1', NULL, 'perceptual', 'binary_choice',
    'Does this phrase ending sound final or unfinished?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Unfinished'),
        jsonb_build_object('id', 'b', 'label', 'Final')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'deceptive', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'V moves to vi instead of I — the ear expects resolution but gets diverted. The surprise leaves the phrase feeling unresolved.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'The dominant sets up an expectation of tonic, but the bass drops to vi. The leading tone still resolves, but the bass deceives.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Final or unfinished — deceptive cadence',
    '["binary_choice"]'::JSONB, '{}'::JSONB);

  -- L2: Which cadence? 2 options (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_deceptive_l2', NULL, 'perceptual', 'select_one',
    'What type of cadence ends this phrase?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Deceptive (V-vi)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'deceptive', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Both start on V, but the deceptive cadence lands on vi instead of I. The leading tone resolves, but the bass takes an unexpected path.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Both begin with V. Authentic goes V-I (expected). Deceptive goes V-vi (surprise). Listen to where the bass lands.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Identify deceptive vs authentic cadence',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  -- L3: Which cadence? 4 options (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_deceptive_l3', NULL, 'perceptual', 'select_one',
    'Identify the cadence type',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Deceptive (V-vi)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'c', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'd', 'label', 'Half (->V)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'deceptive', 'source', 'bach_chorale')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'V usually resolves to I, but here it moves to vi — same leading tone resolution, unexpected bass. The ear is deceived.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'V to vi — the dominant resolves somewhere unexpected. The leading tone still moves up, but the bass steps to the 6th degree instead of the tonic.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Identify deceptive cadence among all 4 types',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  -- L4: Staff — chord symbols -> name cadence (select_one, no audio)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_deceptive_l4', NULL, 'declarative', 'select_one',
    'Based on these chord symbols, name the cadence',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Deceptive (V-vi)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'c', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'd', 'label', 'Half (->V)')
      ),
      'chord_symbols', jsonb_build_array('V', 'vi')
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'V to vi is the deceptive cadence — the dominant resolves to the submediant instead of tonic.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'V is the dominant, vi is the submediant. When V moves to vi instead of the expected I, that is a deceptive cadence.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Chord symbols to cadence name — deceptive',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L5: Theory — what makes deceptive distinctive? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_deceptive_l5', NULL, 'declarative', 'select_one',
    'What defines a deceptive cadence?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'V moves to vi instead of I — the surprise'),
        jsonb_build_object('id', 'b', 'label', 'V resolves to I — the strongest resolution'),
        jsonb_build_object('id', 'c', 'label', 'IV resolves to I — the Amen cadence'),
        jsonb_build_object('id', 'd', 'label', 'Phrase ends on V — tension unresolved')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The deceptive cadence subverts expectation. V sets up the tonic, but vi arrives instead — sharing two common tones with I, which softens the surprise.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'V moves to vi instead of the expected I. The vi chord shares two notes with I, which is why the deception works — it is close enough to feel plausible.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Theory — what defines deceptive cadence',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L6: Full chorale phrase -> identify ending (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_cadence_deceptive_l6', NULL, 'perceptual', 'select_one',
    'Listen to the full phrase. What cadence ends it?',
    ARRAY['cadence_recognition'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Deceptive (V-vi)'),
        jsonb_build_object('id', 'b', 'label', 'Authentic (V-I)'),
        jsonb_build_object('id', 'c', 'label', 'Plagal (IV-I)'),
        jsonb_build_object('id', 'd', 'label', 'Half (->V)')
      ),
      'audio_config', jsonb_build_object('type', 'cadence', 'cadence_type', 'deceptive', 'source', 'bach_chorale', 'full_phrase', true)
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The dominant sets up tonic but lands on vi — a deceptive cadence. Bach uses these to extend phrases when the listener expects an ending.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'V to vi — the ear expects I but gets vi instead. The deceptive cadence prolongs the harmonic journey by denying the expected resolution.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Full chorale phrase — identify deceptive cadence',
    '["select_one","audio_select"]'::JSONB, '{}'::JSONB);

  RAISE NOTICE 'Topic 10 Cadence Recognition: 4 chains, 24 card templates, 24 card instances, 24 chain links seeded';
END $$;
