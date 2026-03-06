-- Event-driven radar reconciliation trigger
-- When lessons.unlocks_cards is updated, flag affected users for radar refresh
-- This ensures the radar cache stays consistent when lesson content changes

-- Create a reconciliation log table for tracking pending refreshes
CREATE TABLE IF NOT EXISTS radar_reconciliation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_radar_reconciliation_pending
  ON radar_reconciliation_queue (processed) WHERE NOT processed;

-- Trigger function: when lesson unlocks_cards changes, queue reconciliation
-- for all users who completed that lesson
CREATE OR REPLACE FUNCTION notify_radar_reconciliation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.unlocks_cards IS DISTINCT FROM NEW.unlocks_cards THEN
    INSERT INTO radar_reconciliation_queue (user_id, dimension)
    SELECT lp.user_id, unnest(NEW.unlocks_cards)
    FROM lesson_progress lp
    WHERE lp.lesson_id = NEW.id
      AND lp.status = 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to lessons table
DROP TRIGGER IF EXISTS trg_lesson_unlocks_changed ON lessons;
CREATE TRIGGER trg_lesson_unlocks_changed
  AFTER UPDATE OF unlocks_cards ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION notify_radar_reconciliation();
