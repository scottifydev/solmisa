-- SCO-330: Backfill user_card_state for lessons completed before v2 card seeding
-- The seed_lesson_cards_v2 RPC was deployed after some lessons were already completed,
-- so those completions never created user_card_state rows. This migration retroactively
-- seeds cards for all completed lessons. The RPC is idempotent (skips existing rows).

DO $$
DECLARE
  v_record RECORD;
BEGIN
  FOR v_record IN
    SELECT lp.user_id, lp.lesson_id
    FROM lesson_progress lp
    WHERE lp.status = 'completed'
  LOOP
    PERFORM seed_lesson_cards_v2(v_record.user_id, v_record.lesson_id);
  END LOOP;
END $$;
