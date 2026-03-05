-- v2 Migration Step 5: Create drills table + radar_dimensions on card_templates (SCO-199)
CREATE TABLE drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES skill_tracks(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  drill_type TEXT NOT NULL CHECK (drill_type IN (
    'degree_id', 'interval_id', 'chord_quality', 'degree_discrimination',
    'meter_id', 'minor_form_id', 'rhythm_tap', 'rhythm_echo',
    'note_reading', 'key_signature_id', 'scale_construction',
    'roman_numeral_id', 'melodic_dictation', 'harmonic_dictation'
  )),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  difficulty_range TEXT[] DEFAULT '{intro,core,stretch}'::text[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE drills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all" ON drills FOR SELECT USING (auth.role() = 'authenticated');
CREATE INDEX idx_drills_track ON drills (track_id);
CREATE INDEX idx_drills_type ON drills (drill_type);

ALTER TABLE card_templates ADD COLUMN radar_dimensions TEXT[] DEFAULT '{}';
CREATE INDEX idx_card_templates_radar_dims ON card_templates USING GIN (radar_dimensions);
