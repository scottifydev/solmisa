-- Topic 12: Enharmonic Equivalents
-- 3 chains x 6 links = 18 card_templates, 18 card_instances, 18 chain_links

DO $$
DECLARE
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  -- =============================================
  -- Chain 1: Enharmonic Notes
  -- =============================================

  INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
  VALUES ('enharmonic_notes', 'Enharmonic Notes', 'enharmonics', NULL, 6, '{"type":"cold_start"}', true)
  RETURNING id INTO v_chain_id;

  -- L1: Enharmonic of X? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_notes_l1', NULL, 'declarative', 'select_one',
    'The enharmonic equivalent of F# is...?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Gb'),
        jsonb_build_object('id', 'b', 'label', 'G'),
        jsonb_build_object('id', 'c', 'label', 'Ab'),
        jsonb_build_object('id', 'd', 'label', 'E#')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Enharmonic equivalents are different spellings of the same sound — like synonyms in language.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'F# and Gb are the same key on the keyboard. Enharmonic means same pitch, different name.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Identify enharmonic equivalent of a note',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L2: Same pitch? (binary_choice -> select_one with 2+ options)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_notes_l2', NULL, 'declarative', 'select_one',
    'Are C# and Db the same pitch?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Yes — same key, different spelling'),
        jsonb_build_object('id', 'b', 'label', 'No — different pitches'),
        jsonb_build_object('id', 'c', 'label', 'Sometimes'),
        jsonb_build_object('id', 'd', 'label', 'Only on piano')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Every sharp note has a flat equivalent. The context determines which spelling is correct.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'In equal temperament, C# and Db produce the exact same frequency. The spelling depends on harmonic context.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Same pitch binary choice',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L3: Staff note -> enharmonic (select_one + staff_note_display)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_notes_l3', NULL, 'declarative', 'select_one',
    'This note can also be written as...?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'A#'),
        jsonb_build_object('id', 'b', 'label', 'Ab'),
        jsonb_build_object('id', 'c', 'label', 'B'),
        jsonb_build_object('id', 'd', 'label', 'G##')
      ),
      'note', 'Bb4',
      'clef', 'treble'
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Bb and A# are enharmonic — the same pitch on different lines or spaces depending on context.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Bb is one half step below B. A# is one half step above A. Same key, two names.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Staff note to enharmonic equivalent',
    '["select_one","staff_note_display"]'::JSONB, '{}'::JSONB);

  -- L4: Enharmonic key equivalence (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_notes_l4', NULL, 'declarative', 'select_one',
    'Which pair are enharmonic keys?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'F# major / Gb major'),
        jsonb_build_object('id', 'b', 'label', 'G major / Ab major'),
        jsonb_build_object('id', 'c', 'label', 'D major / Eb major'),
        jsonb_build_object('id', 'd', 'label', 'A major / Bb major')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'F# major (6 sharps) and Gb major (6 flats) contain the same pitches, just spelled differently.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Enharmonic keys share all the same pitches. F# and Gb, C# and Db, B and Cb are the three pairs.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Enharmonic key pair identification',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L5: Why C# not Db in A major? (select_one — theory reasoning)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_notes_l5', NULL, 'declarative', 'select_one',
    'In the key of A major, why do we write C# instead of Db?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Each scale degree needs its own letter name'),
        jsonb_build_object('id', 'b', 'label', 'C# is easier to read'),
        jsonb_build_object('id', 'c', 'label', 'Db doesn''t exist in sharps'),
        jsonb_build_object('id', 'd', 'label', 'Tradition')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'A major scale: A-B-C#-D-E-F#-G#. Each letter appears once — using Db would duplicate D and skip C.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Scales use each letter name exactly once. A-B-C#-D-E-F#-G# keeps every letter represented.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Theory reasoning — spelling convention',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L6: Respell interval (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_notes_l6', NULL, 'declarative', 'select_one',
    'An augmented 4th is enharmonic to a...?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Diminished 5th'),
        jsonb_build_object('id', 'b', 'label', 'Perfect 5th'),
        jsonb_build_object('id', 'c', 'label', 'Minor 5th'),
        jsonb_build_object('id', 'd', 'label', 'Major 4th')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'The augmented 4th and diminished 5th span the same number of half steps (6) — the tritone.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Both intervals span 6 half steps. The spelling depends on whether you count up from the 4th or down from the 5th.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Respell interval enharmonically',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- =============================================
  -- Chain 2: Enharmonic Intervals
  -- =============================================

  INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
  VALUES ('enharmonic_intervals', 'Enharmonic Intervals', 'enharmonics', NULL, 6, '{"type":"cold_start"}', true)
  RETURNING id INTO v_chain_id;

  -- L1: Enharmonic of augmented unison (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_intervals_l1', NULL, 'declarative', 'select_one',
    'The enharmonic equivalent of an augmented unison is...?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Minor 2nd'),
        jsonb_build_object('id', 'b', 'label', 'Major 2nd'),
        jsonb_build_object('id', 'c', 'label', 'Perfect unison'),
        jsonb_build_object('id', 'd', 'label', 'Diminished 2nd')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'An augmented unison (e.g., C to C#) spans 1 half step — the same as a minor 2nd (C to Db).', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Count the half steps. An augmented unison and a minor 2nd both span exactly 1 half step.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Identify enharmonic interval equivalent',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L2: Aug 2nd and min 3rd same? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_intervals_l2', NULL, 'declarative', 'select_one',
    'Do an augmented 2nd and minor 3rd sound the same?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Yes — same number of half steps'),
        jsonb_build_object('id', 'b', 'label', 'No — always different'),
        jsonb_build_object('id', 'c', 'label', 'Depends on context'),
        jsonb_build_object('id', 'd', 'label', 'Only in equal temperament')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Both span 3 half steps. The interval name depends on the letter-name distance, not the sound.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'An augmented 2nd (e.g., C to D#) and a minor 3rd (C to Eb) both span 3 half steps — same sound, different spelling.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Enharmonic interval equivalence check',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L3: Staff interval -> enharmonic (select_one + staff_interval_display)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_intervals_l3', NULL, 'declarative', 'select_one',
    'This interval can also be spelled as...?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Diminished 5th'),
        jsonb_build_object('id', 'b', 'label', 'Perfect 4th'),
        jsonb_build_object('id', 'c', 'label', 'Augmented 3rd'),
        jsonb_build_object('id', 'd', 'label', 'Minor 5th')
      ),
      'notes', jsonb_build_array('C4', 'F#4'),
      'clef', 'treble',
      'layout', 'melodic'
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'C to F# is an augmented 4th. Respelled as C to Gb, it becomes a diminished 5th — same 6 half steps.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'The tritone (6 half steps) can be spelled as an augmented 4th or a diminished 5th, depending on the letter names used.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Staff interval to enharmonic respelling',
    '["select_one","staff_interval_display"]'::JSONB, '{}'::JSONB);

  -- L4: Aug 5th = ? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_intervals_l4', NULL, 'declarative', 'select_one',
    'An augmented 5th contains the same number of half steps as a...?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Minor 6th'),
        jsonb_build_object('id', 'b', 'label', 'Major 6th'),
        jsonb_build_object('id', 'c', 'label', 'Diminished 6th'),
        jsonb_build_object('id', 'd', 'label', 'Perfect 5th')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Both span 8 half steps. C to G# (augmented 5th) and C to Ab (minor 6th) land on the same key.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'An augmented 5th and a minor 6th both span 8 half steps. The letter-name distance determines the interval name.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Enharmonic interval half-step equivalence',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L5: Why G# not Ab in augmented triad? (select_one — theory reasoning)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_intervals_l5', NULL, 'declarative', 'select_one',
    'Why spell C-E-G# as an augmented triad rather than C-E-Ab?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'G# preserves the stacked-thirds spelling'),
        jsonb_build_object('id', 'b', 'label', 'Ab is easier to read'),
        jsonb_build_object('id', 'c', 'label', 'Both are correct'),
        jsonb_build_object('id', 'd', 'label', 'It depends on the key')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Stacked-thirds spelling keeps the chord structure readable — root, 3rd, 5th should each be a different letter.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'C-E-G# gives root (C), major 3rd (E), augmented 5th (G#) — three consecutive letter names. C-E-Ab breaks that pattern.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Theory reasoning — stacked-thirds spelling',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L6: Respell diminished 4th (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_intervals_l6', NULL, 'declarative', 'select_one',
    'Respell this interval enharmonically: diminished 4th',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Major 3rd'),
        jsonb_build_object('id', 'b', 'label', 'Minor 3rd'),
        jsonb_build_object('id', 'c', 'label', 'Augmented 3rd'),
        jsonb_build_object('id', 'd', 'label', 'Perfect 3rd')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'A diminished 4th spans 4 half steps — the same as a major 3rd. The interval quality changes with the letter-name distance.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Count: a diminished 4th is 4 half steps. A major 3rd is also 4 half steps. Same sound, different spelling.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Respell interval enharmonically',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- =============================================
  -- Chain 3: Enharmonic Keys
  -- =============================================

  INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
  VALUES ('enharmonic_keys', 'Enharmonic Keys', 'enharmonics', NULL, 6, '{"type":"cold_start"}', true)
  RETURNING id INTO v_chain_id;

  -- L1: Which key is enharmonic to Db major? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_keys_l1', NULL, 'declarative', 'select_one',
    'Which key is enharmonic to Db major?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'C# major'),
        jsonb_build_object('id', 'b', 'label', 'B major'),
        jsonb_build_object('id', 'c', 'label', 'D major'),
        jsonb_build_object('id', 'd', 'label', 'Eb major')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Db major (5 flats) and C# major (7 sharps) contain the same pitches — Db is the practical choice.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Enharmonic keys share all the same pitches. Db major and C# major are one of the three enharmonic key pairs.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Identify enharmonic key',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L2: Gb major and F# major same pitches? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_keys_l2', NULL, 'declarative', 'select_one',
    'Do Gb major and F# major share the same pitches?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Yes — identical pitches spelled differently'),
        jsonb_build_object('id', 'b', 'label', 'No — different scales'),
        jsonb_build_object('id', 'c', 'label', 'Only some pitches'),
        jsonb_build_object('id', 'd', 'label', 'Depends on instrument')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Gb major uses 6 flats, F# major uses 6 sharps — every note lands on the same key, just named differently.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Enharmonic keys produce identical sounds. Gb and F# name the same pitch, and so does every other note in their scales.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Enharmonic key equivalence check',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L3: Key signature staff -> enharmonic key (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_keys_l3', NULL, 'declarative', 'select_one',
    'This key signature can also represent...?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'C# major (7 sharps)'),
        jsonb_build_object('id', 'b', 'label', 'B major'),
        jsonb_build_object('id', 'c', 'label', 'Gb major'),
        jsonb_build_object('id', 'd', 'label', 'Ab major')
      ),
      'keySignature', 'Db',
      'clef', 'treble'
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Db major (5 flats) and C# major (7 sharps) are enharmonic — same sound, different notation.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', '5 flats = Db major. Its enharmonic equivalent is C# major, which requires 7 sharps.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Key signature to enharmonic key',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L4: How many enharmonic key pairs? (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_keys_l4', NULL, 'declarative', 'select_one',
    'How many enharmonic key pairs exist in the major keys?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', '3'),
        jsonb_build_object('id', 'b', 'label', '2'),
        jsonb_build_object('id', 'c', 'label', '6'),
        jsonb_build_object('id', 'd', 'label', '1')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Three pairs: B/Cb, F#/Gb, and C#/Db. These are the keys where sharps and flats add up to 12.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'The three enharmonic major key pairs: B (5 sharps) / Cb (7 flats), F# (6) / Gb (6), C# (7) / Db (5).', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Count enharmonic key pairs',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L5: Why Db over C#? (select_one — theory reasoning)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_keys_l5', NULL, 'declarative', 'select_one',
    'Why do composers choose Db major over C# major?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'Fewer accidentals (5 flats vs 7 sharps)'),
        jsonb_build_object('id', 'b', 'label', 'Sounds better'),
        jsonb_build_object('id', 'c', 'label', 'Historical tradition'),
        jsonb_build_object('id', 'd', 'label', 'Db is more common')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Db major needs only 5 flats. C# major requires 7 sharps — every note is sharp. Fewer accidentals means easier reading.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'Practicality drives the choice. 5 flats (Db) is far easier to read than 7 sharps (C#), though they sound identical.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Theory reasoning — practical key choice',
    '["select_one"]'::JSONB, '{}'::JSONB);

  -- L6: Relative minor enharmonic equivalence (select_one)
  INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
  VALUES (
    'flow_enharmonic_keys_l6', NULL, 'declarative', 'select_one',
    'The relative minor of Gb major is enharmonic to the relative minor of...?',
    ARRAY['enharmonics'],
    jsonb_build_object(
      'answer_data', jsonb_build_object('correct_answer', 'a'),
      'options_data', jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', 'F# major'),
        jsonb_build_object('id', 'b', 'label', 'E major'),
        jsonb_build_object('id', 'c', 'label', 'Ab major'),
        jsonb_build_object('id', 'd', 'label', 'B major')
      )
    ),
    jsonb_build_object(
      'correct', jsonb_build_object('text', 'Gb major''s relative minor is Ebm. F# major''s relative minor is D#m. Ebm and D#m are enharmonic.', 'show_answer', true),
      'incorrect', jsonb_build_object('text', 'If two major keys are enharmonic, their relative minors are too. Gb/F# major gives Ebm/D#m.', 'show_answer', true, 'delay_ms', 1500)
    )
  )
  RETURNING id INTO v_ct_id;

  INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
  SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
  FROM card_templates ct WHERE ct.id = v_ct_id;

  INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
  VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Relative minor enharmonic equivalence',
    '["select_one"]'::JSONB, '{}'::JSONB);

  RAISE NOTICE 'Topic 12 Enharmonics: 3 chains, 18 card templates, 18 card instances, 18 chain links seeded';
END $$;
