-- SCO-336: Fix awkward "sharp(s)" / "flat(s)" pluralization in Flow card prompts
-- Updates both card_templates.prompt_text and card_instances.prompt_rendered

-- Fix card_templates: 1 sharp → "1 sharp", 2+ sharps → "N sharps"
UPDATE card_templates
SET prompt_text = CASE
  WHEN prompt_text LIKE '%1 sharp(s)%' THEN REPLACE(prompt_text, '1 sharp(s)', '1 sharp')
  WHEN prompt_text LIKE '%sharp(s)%' THEN REPLACE(prompt_text, 'sharp(s)', 'sharps')
  ELSE prompt_text
END
WHERE prompt_text LIKE '%sharp(s)%';

UPDATE card_templates
SET prompt_text = CASE
  WHEN prompt_text LIKE '%1 flat(s)%' THEN REPLACE(prompt_text, '1 flat(s)', '1 flat')
  WHEN prompt_text LIKE '%flat(s)%' THEN REPLACE(prompt_text, 'flat(s)', 'flats')
  ELSE prompt_text
END
WHERE prompt_text LIKE '%flat(s)%';

-- Sync card_instances.prompt_rendered from their templates
UPDATE card_instances ci
SET prompt_rendered = ct.prompt_text
FROM card_templates ct
WHERE ci.template_id = ct.id
  AND ci.prompt_rendered LIKE '%sharp(s)%';

UPDATE card_instances ci
SET prompt_rendered = ct.prompt_text
FROM card_templates ct
WHERE ci.template_id = ct.id
  AND ci.prompt_rendered LIKE '%flat(s)%';

-- Also fix the original migration's source so future re-seeds are correct
-- (This is a data-only migration — the original migration file is also patched in this PR)
