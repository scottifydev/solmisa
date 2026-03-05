-- Add score_history JSONB column to radar_cache for sparkline trends
ALTER TABLE radar_cache
  ADD COLUMN score_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN radar_cache.score_history IS 'Array of {score, date} entries for sparkline trends, capped at 30';
