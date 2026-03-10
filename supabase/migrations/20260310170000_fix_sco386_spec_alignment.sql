-- SCO-386: Fix broken cards + spec alignment
-- 1. Scale degree _tendency/_resolve missing audio_config
-- 2. Note reading templates with null clef/note
-- 3. Rhythm modality_by_stage (add journeyman/adept)

-- =============================================
-- 1. Scale Degree: add audio_config to L4 (tendency) and L5 (resolve)
-- =============================================

-- L4 tendency cards: use degree_fading_drone (drone fades, degree heard in context)
UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_fading_drone', 'degree', 1)
) WHERE slug = 'flow_degree_1_tendency';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_fading_drone', 'degree', 2)
) WHERE slug = 'flow_degree_2_tendency';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_fading_drone', 'degree', 3)
) WHERE slug = 'flow_degree_3_tendency';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_fading_drone', 'degree', 4)
) WHERE slug = 'flow_degree_4_tendency';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_fading_drone', 'degree', 5)
) WHERE slug = 'flow_degree_5_tendency';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_fading_drone', 'degree', 6)
) WHERE slug = 'flow_degree_6_tendency';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_fading_drone', 'degree', 7)
) WHERE slug = 'flow_degree_7_tendency';

-- L5 resolve cards: use degree_with_drone (drone + degree, hear resolution context)
UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_with_drone', 'degree', 1)
) WHERE slug = 'flow_degree_1_resolve';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_with_drone', 'degree', 2)
) WHERE slug = 'flow_degree_2_resolve';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_with_drone', 'degree', 3)
) WHERE slug = 'flow_degree_3_resolve';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_with_drone', 'degree', 4)
) WHERE slug = 'flow_degree_4_resolve';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_with_drone', 'degree', 5)
) WHERE slug = 'flow_degree_5_resolve';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_with_drone', 'degree', 6)
) WHERE slug = 'flow_degree_6_resolve';

UPDATE card_templates SET parameters = parameters || jsonb_build_object(
  'audio_config', jsonb_build_object('type', 'degree_with_drone', 'degree', 7)
) WHERE slug = 'flow_degree_7_resolve';

-- =============================================
-- 2. Note Reading: fix null clef/note values
-- =============================================

-- _reverse templates (clef + note both null): "Given name, find on staff"
-- These need clef to render staff; note is the correct answer
UPDATE card_templates SET parameters = parameters || '{"clef": "treble"}'::JSONB
WHERE slug IN ('flow_note_treble_spaces_reverse', 'flow_note_treble_lines_reverse',
               'flow_note_ledger_above_reverse', 'flow_note_ledger_below_reverse')
  AND parameters->>'clef' IS NULL;

UPDATE card_templates SET parameters = parameters || '{"clef": "bass"}'::JSONB
WHERE slug IN ('flow_note_bass_spaces_reverse', 'flow_note_bass_lines_reverse')
  AND parameters->>'clef' IS NULL;

UPDATE card_templates SET parameters = parameters || '{"clef": "treble"}'::JSONB
WHERE slug = 'flow_note_grand_staff_reverse'
  AND parameters->>'clef' IS NULL;

-- _degree templates (clef null): "What scale degree is this note?"
UPDATE card_templates SET parameters = parameters || '{"clef": "treble"}'::JSONB
WHERE slug IN ('flow_note_treble_spaces_degree', 'flow_note_treble_lines_degree',
               'flow_note_ledger_above_degree', 'flow_note_ledger_below_degree')
  AND parameters->>'clef' IS NULL;

UPDATE card_templates SET parameters = parameters || '{"clef": "bass"}'::JSONB
WHERE slug IN ('flow_note_bass_spaces_degree', 'flow_note_bass_lines_degree')
  AND parameters->>'clef' IS NULL;

UPDATE card_templates SET parameters = parameters || '{"clef": "treble"}'::JSONB
WHERE slug = 'flow_note_grand_staff_degree'
  AND parameters->>'clef' IS NULL;

-- _reverse templates: add representative notes
UPDATE card_templates SET parameters = parameters || '{"note": "A4"}'::JSONB
WHERE slug = 'flow_note_treble_spaces_reverse' AND parameters->>'note' IS NULL;

UPDATE card_templates SET parameters = parameters || '{"note": "B4"}'::JSONB
WHERE slug = 'flow_note_treble_lines_reverse' AND parameters->>'note' IS NULL;

UPDATE card_templates SET parameters = parameters || '{"note": "F3"}'::JSONB
WHERE slug = 'flow_note_bass_spaces_reverse' AND parameters->>'note' IS NULL;

UPDATE card_templates SET parameters = parameters || '{"note": "A2"}'::JSONB
WHERE slug = 'flow_note_bass_lines_reverse' AND parameters->>'note' IS NULL;

UPDATE card_templates SET parameters = parameters || '{"note": "C6"}'::JSONB
WHERE slug = 'flow_note_ledger_above_reverse' AND parameters->>'note' IS NULL;

UPDATE card_templates SET parameters = parameters || '{"note": "B3"}'::JSONB
WHERE slug = 'flow_note_ledger_below_reverse' AND parameters->>'note' IS NULL;

UPDATE card_templates SET parameters = parameters || '{"note": "B3"}'::JSONB
WHERE slug = 'flow_note_grand_staff_reverse' AND parameters->>'note' IS NULL;

-- =============================================
-- 3. Rhythm: modality_by_stage progression
-- =============================================

UPDATE chain_links SET modality_by_stage =
  '{"apprentice": "select_one", "journeyman": "rhythm_display", "adept": "audio_rhythm"}'::JSONB
WHERE chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'rhythm');
