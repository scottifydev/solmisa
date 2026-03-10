-- Fix Flow audio, modalities, and distractors
-- 1. Add audio_config to chord_quality_ear_id card templates
-- 2. Set modality_by_stage for Tier 0 topics (so non-select_one modalities activate)
-- 3. Fix SCO-381: key sig spell distractors for early keys + modality_by_stage

-- =============================================
-- 1. Chord Quality: add audio_config
-- =============================================

-- Major chains
UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'chord', 'quality', 'major', 'root', 'C4', 'voicing', 'arpeggiated')
) WHERE slug LIKE 'flow_chord_quality_major_l%';

-- Minor chains
UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'chord', 'quality', 'minor', 'root', 'C4', 'voicing', 'arpeggiated')
) WHERE slug LIKE 'flow_chord_quality_minor_l%';

-- Augmented chains (slug: aug)
UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'chord', 'quality', 'augmented', 'root', 'C4', 'voicing', 'arpeggiated')
) WHERE slug LIKE 'flow_chord_quality_aug_l%';

-- Diminished chains (slug: dim)
UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'chord', 'quality', 'diminished', 'root', 'C4', 'voicing', 'arpeggiated')
) WHERE slug LIKE 'flow_chord_quality_dim_l%';

-- Dominant 7th chains
UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'chord', 'quality', 'dominant7', 'root', 'C4', 'voicing', 'arpeggiated')
) WHERE slug LIKE 'flow_chord_quality_dom7_l%';

-- Major 7th chains (slug: maj7)
UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'chord', 'quality', 'major7', 'root', 'C4', 'voicing', 'arpeggiated')
) WHERE slug LIKE 'flow_chord_quality_maj7_l%';

-- =============================================
-- 2. Set modality_by_stage for Tier 0 topic chain links
-- =============================================

-- Scale Degree Feeling: position 1 = binary_choice always, position 2+ = audio_select at apprentice, feeling_state_match at journeyman+
UPDATE chain_links SET
  modality_by_stage = '{"apprentice": "binary_choice"}'::JSONB
WHERE position = 1
  AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'scale_degree_feeling');

UPDATE chain_links SET
  modality_by_stage = '{"apprentice": "audio_select", "journeyman": "feeling_state_match", "adept": "feeling_state_match"}'::JSONB
WHERE position >= 2
  AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'scale_degree_feeling');

-- Chord Quality Ear ID: position 1 = binary_choice, position 2+ = audio_select
UPDATE chain_links SET
  modality_by_stage = '{"apprentice": "binary_choice"}'::JSONB
WHERE position = 1
  AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'chord_quality_ear_id');

UPDATE chain_links SET
  modality_by_stage = '{"apprentice": "audio_select"}'::JSONB
WHERE position >= 2
  AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'chord_quality_ear_id');

-- Note Reading: position 1-2 = select_one at apprentice, staff_note_display at journeyman+
UPDATE chain_links SET
  modality_by_stage = '{"apprentice": "select_one", "journeyman": "staff_note_display", "adept": "staff_note_display"}'::JSONB
WHERE chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'note_reading');

-- Rhythm: select_one at apprentice (rhythm_display would be ideal but select_one is safe default)
UPDATE chain_links SET
  modality_by_stage = '{"apprentice": "select_one"}'::JSONB
WHERE chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'rhythm');

-- =============================================
-- 3. SCO-381: Fix key sig spell distractors
-- =============================================

-- C major (0 accidentals) — distractors should be 1 sharp, 2 sharps, 1 flat
UPDATE card_templates SET parameters = jsonb_set(
  parameters,
  '{options_data}',
  '[
    {"id": "a", "label": "No sharps or flats"},
    {"id": "b", "label": "F#"},
    {"id": "c", "label": "F#, C#"},
    {"id": "d", "label": "Bb"}
  ]'::JSONB
) WHERE slug = 'flow_key_c_major_spell';

-- G major (1 sharp: F#) — all sharp-family distractors
UPDATE card_templates SET parameters = jsonb_set(
  parameters,
  '{options_data}',
  '[
    {"id": "a", "label": "F#"},
    {"id": "b", "label": "No sharps"},
    {"id": "c", "label": "F#, C#"},
    {"id": "d", "label": "F#, C#, G#"}
  ]'::JSONB
) WHERE slug = 'flow_key_g_major_spell';

-- Update correct answer for G major to 'a'
UPDATE card_templates SET parameters = jsonb_set(
  parameters,
  '{answer_data}',
  '{"correct_answer": "a"}'::JSONB
) WHERE slug = 'flow_key_g_major_spell';

-- D major (2 sharps: F#, C#) — all sharp-family
UPDATE card_templates SET parameters = jsonb_set(
  parameters,
  '{options_data}',
  '[
    {"id": "a", "label": "F#"},
    {"id": "b", "label": "F#, C#"},
    {"id": "c", "label": "F#, C#, G#"},
    {"id": "d", "label": "F#, C#, G#, D#"}
  ]'::JSONB
) WHERE slug = 'flow_key_d_major_spell';

UPDATE card_templates SET parameters = jsonb_set(
  parameters,
  '{answer_data}',
  '{"correct_answer": "b"}'::JSONB
) WHERE slug = 'flow_key_d_major_spell';

-- F major (1 flat: Bb) — all flat-family
UPDATE card_templates SET parameters = jsonb_set(
  parameters,
  '{options_data}',
  '[
    {"id": "a", "label": "Bb"},
    {"id": "b", "label": "No flats"},
    {"id": "c", "label": "Bb, Eb"},
    {"id": "d", "label": "Bb, Eb, Ab"}
  ]'::JSONB
) WHERE slug = 'flow_key_f_major_spell';

UPDATE card_templates SET parameters = jsonb_set(
  parameters,
  '{answer_data}',
  '{"correct_answer": "a"}'::JSONB
) WHERE slug = 'flow_key_f_major_spell';

-- Bb major (2 flats: Bb, Eb) — all flat-family
UPDATE card_templates SET parameters = jsonb_set(
  parameters,
  '{options_data}',
  '[
    {"id": "a", "label": "Bb"},
    {"id": "b", "label": "Bb, Eb"},
    {"id": "c", "label": "Bb, Eb, Ab"},
    {"id": "d", "label": "Bb, Eb, Ab, Db"}
  ]'::JSONB
) WHERE slug = 'flow_key_bb_major_spell';

UPDATE card_templates SET parameters = jsonb_set(
  parameters,
  '{answer_data}',
  '{"correct_answer": "b"}'::JSONB
) WHERE slug = 'flow_key_bb_major_spell';

-- Also update corresponding card_instances with the new options/answers
UPDATE card_instances ci SET
  options_data = ct.parameters->'options_data',
  answer_data = ct.parameters->'answer_data'
FROM card_templates ct
WHERE ci.template_id = ct.id
  AND ct.slug IN ('flow_key_c_major_spell', 'flow_key_g_major_spell', 'flow_key_d_major_spell', 'flow_key_f_major_spell', 'flow_key_bb_major_spell');

-- Update key sig spell chain_links modality_by_stage per SCO-381 spec
UPDATE chain_links SET
  modalities = '["select_one", "sequence_builder"]'::JSONB,
  modality_by_stage = '{"apprentice": "select_one", "journeyman": "sequence_builder", "adept": "sequence_builder"}'::JSONB
WHERE position = 2
  AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'key_signatures');
