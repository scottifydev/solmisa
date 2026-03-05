-- v2 Migration Step 7: Create radar_cache + review_records.radar_dimensions
CREATE TABLE radar_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dimension)
);

ALTER TABLE radar_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON radar_cache FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_radar_cache_user ON radar_cache (user_id);

ALTER TABLE review_records ADD COLUMN radar_dimensions TEXT[] DEFAULT '{}';
CREATE INDEX idx_review_records_radar_dims ON review_records USING GIN (radar_dimensions);
