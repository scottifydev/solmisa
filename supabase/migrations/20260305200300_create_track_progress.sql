-- v2 Migration Step 4: Create track_progress table (SCO-198)
CREATE TABLE track_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES skill_tracks(id),
  lessons_completed INTEGER DEFAULT 0,
  current_module_id UUID REFERENCES modules(id),
  started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

ALTER TABLE track_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON track_progress FOR ALL USING (auth.uid() = user_id);
CREATE TRIGGER trg_track_progress_updated_at BEFORE UPDATE ON track_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_track_progress_user ON track_progress (user_id);

COMMENT ON COLUMN lesson_progress.score IS 'DEPRECATED in v2: lessons no longer have scores. Will be removed in a future migration.';
