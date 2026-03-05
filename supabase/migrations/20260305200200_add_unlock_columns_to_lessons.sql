-- v2 Migration Step 3: Add unlocks_cards, unlocks_drills, soft_prerequisites (SCO-197)
ALTER TABLE lessons ADD COLUMN unlocks_cards TEXT[] DEFAULT '{}';
ALTER TABLE lessons ADD COLUMN unlocks_drills TEXT[] DEFAULT '{}';
ALTER TABLE lessons ADD COLUMN soft_prerequisites JSONB DEFAULT '[]'::jsonb;

UPDATE lessons l SET unlocks_cards = COALESCE(
  (SELECT array_agg(ct.slug ORDER BY ct.slug)
   FROM card_templates ct
   WHERE ct.lesson_id = l.id),
  '{}'
);
