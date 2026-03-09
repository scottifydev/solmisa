-- Fix Topic 7 (Scale Degree Feeling) audio_config modes
-- The migration used non-existent 'drone_and_note' and 'drone_and_two_notes' types.
-- Replace with valid AudioMode values: 'degree_with_drone' for single degree,
-- and keep 'degree_with_drone' for paired degrees (L6).

UPDATE card_templates
SET parameters = jsonb_set(
  parameters,
  '{audio_config,type}',
  '"degree_with_drone"'
)
WHERE slug LIKE 'flow_degree_%'
  AND parameters->'audio_config'->>'type' IN ('drone_and_note', 'drone_and_two_notes');
