-- v2 Migration Step 1: Create skill_tracks table (SCO-195)
CREATE TABLE skill_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL CHECK (slug IN ('ear_training', 'theory', 'rhythm', 'sight_reading')),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO skill_tracks (slug, name, description, display_order) VALUES
  ('ear_training', 'Ear Training', 'Degree recognition, interval identification, chord quality discrimination.', 1),
  ('theory', 'Theory', 'Key signatures, scale construction, chord construction, Roman numeral analysis.', 2),
  ('rhythm', 'Rhythm', 'Beat subdivision, meter, polyrhythm, rhythmic dictation.', 3),
  ('sight_reading', 'Sight-Reading', 'Staff reading, clef fluency, note identification, rhythmic notation reading.', 4);

ALTER TABLE skill_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all" ON skill_tracks FOR SELECT USING (auth.role() = 'authenticated');
CREATE INDEX idx_skill_tracks_slug ON skill_tracks (slug);
CREATE INDEX idx_skill_tracks_display_order ON skill_tracks (display_order);
