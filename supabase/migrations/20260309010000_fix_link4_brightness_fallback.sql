-- SCO-358: Fix Link 4 (brightness) missing select_one fallback
-- All 15 key sig chains had ONLY drag_rank — unrenderable until SCO-318 ships.
-- Add select_one as primary modality, drag_rank for journeyman+.

-- 1. Update chain_links: add select_one fallback
UPDATE chain_links
SET
  modalities = '["select_one", "drag_rank"]'::jsonb,
  modality_by_stage = '{"apprentice": "select_one", "journeyman": "drag_rank"}'::jsonb
WHERE position = 4
AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'key_signature');

-- 2. Update card_templates: add correct_answer for select_one,
--    change prompt to work for both modalities
UPDATE card_templates
SET
  prompt_text = 'Which of these modes is the brightest?',
  parameters = jsonb_set(
    parameters,
    '{answer_data,correct_answer}',
    '"lydian"'
  )
WHERE slug LIKE 'flow_key_%_brightness';

-- 3. Update card_instances to match
UPDATE card_instances
SET
  prompt_rendered = 'Which of these modes is the brightest?',
  answer_data = jsonb_set(
    answer_data,
    '{correct_answer}',
    '"lydian"'
  )
WHERE template_id IN (
  SELECT id FROM card_templates WHERE slug LIKE 'flow_key_%_brightness'
);
