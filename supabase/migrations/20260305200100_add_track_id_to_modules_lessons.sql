-- v2 Migration Step 2: Add track_id FK to modules and lessons (SCO-196)
ALTER TABLE modules ADD COLUMN track_id UUID REFERENCES skill_tracks(id);
ALTER TABLE lessons ADD COLUMN track_id UUID REFERENCES skill_tracks(id);

UPDATE modules SET track_id = (SELECT id FROM skill_tracks WHERE slug = 'ear_training');
UPDATE lessons SET track_id = (SELECT id FROM skill_tracks WHERE slug = 'ear_training');

ALTER TABLE modules ALTER COLUMN track_id SET NOT NULL;
ALTER TABLE lessons ALTER COLUMN track_id SET NOT NULL;

ALTER TABLE modules DROP CONSTRAINT IF EXISTS modules_module_order_key;
ALTER TABLE modules ADD CONSTRAINT modules_track_module_order_unique UNIQUE (track_id, module_order);

CREATE INDEX idx_modules_track ON modules (track_id);
CREATE INDEX idx_lessons_track ON lessons (track_id);
