-- SCO-321: Fix flow card answer_data to use option IDs instead of values
-- The correct_answer field must match the option ID ("a") not the label/slug.
-- The correct answer is always the first option (id="a") in the seed data.

-- Fix links 1 (identify), 3 (mode), 5 (relative), 6 (vchord):
-- Overwrite correct_answer with "a"
UPDATE card_instances ci
SET answer_data = ci.answer_data || '{"correct_answer": "a"}'::jsonb
FROM card_templates ct
WHERE ci.template_id = ct.id
AND ct.slug LIKE 'flow_%'
AND (
  ct.slug LIKE '%_identify'
  OR ct.slug LIKE '%_mode'
  OR ct.slug LIKE '%_relative'
  OR ct.slug LIKE '%_vchord'
);

-- Fix link 2 (spell): add correct_answer = "a" (missing entirely)
UPDATE card_instances ci
SET answer_data = ci.answer_data || '{"correct_answer": "a"}'::jsonb
FROM card_templates ct
WHERE ci.template_id = ct.id
AND ct.slug LIKE 'flow_%_spell';

-- Also fix card_templates.parameters -> answer_data for consistency
UPDATE card_templates
SET parameters = jsonb_set(
  parameters,
  '{answer_data,correct_answer}',
  '"a"'::jsonb
)
WHERE slug LIKE 'flow_%'
AND slug NOT LIKE '%_brightness';
