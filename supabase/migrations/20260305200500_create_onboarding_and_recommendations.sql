-- v2 Migration Step 6: Create onboarding_results + practice_recommendations (SCO-200)
CREATE TABLE onboarding_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES skill_tracks(id),
  dimension TEXT NOT NULL,
  estimated_level TEXT NOT NULL CHECK (estimated_level IN ('beginner', 'elementary', 'intermediate', 'advanced')),
  confidence REAL DEFAULT 0.5,
  raw_responses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id, dimension)
);

ALTER TABLE onboarding_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON onboarding_results FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_onboarding_results_user ON onboarding_results (user_id);

CREATE TABLE practice_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES skill_tracks(id),
  dimension TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'elementary', 'intermediate', 'advanced')),
  tool_type TEXT NOT NULL CHECK (tool_type IN ('internal_drill', 'external_app', 'instrument', 'singing')),
  tool_name TEXT NOT NULL,
  tool_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE practice_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all" ON practice_recommendations FOR SELECT USING (auth.role() = 'authenticated');

INSERT INTO practice_recommendations (track_id, dimension, level, tool_type, tool_name, description, display_order) VALUES
  ((SELECT id FROM skill_tracks WHERE slug = 'ear_training'), 'degree_recognition', 'beginner', 'internal_drill', 'Degree Identification', 'Practice identifying scale degrees by ear in simple contexts.', 1),
  ((SELECT id FROM skill_tracks WHERE slug = 'ear_training'), 'interval_recognition', 'beginner', 'external_app', 'Sonofield', 'Interactive interval training with visual feedback.', 2),
  ((SELECT id FROM skill_tracks WHERE slug = 'ear_training'), 'degree_recognition', 'beginner', 'singing', 'Sing Scale Degrees', 'Sing each degree against a drone to internalize pitch relationships.', 3),
  ((SELECT id FROM skill_tracks WHERE slug = 'rhythm'), 'beat_subdivision', 'beginner', 'internal_drill', 'Rhythm Tapping', 'Tap along to beat patterns with metronome feedback.', 1);

ALTER TABLE profiles ADD COLUMN cat_state JSONB DEFAULT NULL;
