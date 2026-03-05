-- v2 Migration Step 9: Create reconcile_lesson_cards RPC (SCO-226)
CREATE OR REPLACE FUNCTION reconcile_lesson_cards(
  p_user_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_progress RECORD;
  v_card_slug TEXT;
  v_template RECORD;
  v_instance_id UUID;
  v_default_interval INTERVAL;
  v_reconciled INTEGER := 0;
  v_result JSONB := '[]'::jsonb;
BEGIN
  FOR v_progress IN
    SELECT lp.user_id, lp.lesson_id, l.unlocks_cards, l.track_id
    FROM lesson_progress lp
    JOIN lessons l ON l.id = lp.lesson_id
    WHERE lp.status = 'completed'
      AND array_length(l.unlocks_cards, 1) > 0
      AND (p_user_id IS NULL OR lp.user_id = p_user_id)
  LOOP
    FOREACH v_card_slug IN ARRAY v_progress.unlocks_cards
    LOOP
      SELECT * INTO v_template FROM card_templates WHERE slug = v_card_slug;
      IF v_template IS NULL THEN CONTINUE; END IF;

      IF v_template.card_category IN ('perceptual', 'rhythm') THEN
        v_default_interval := INTERVAL '4 hours';
      ELSE
        v_default_interval := INTERVAL '8 hours';
      END IF;

      SELECT id INTO v_instance_id FROM card_instances WHERE template_id = v_template.id LIMIT 1;
      IF v_instance_id IS NULL THEN
        INSERT INTO card_instances (template_id, instance_parameters, prompt_rendered, answer_data)
        VALUES (v_template.id, '{}'::jsonb, v_template.prompt_text, '{}'::jsonb)
        RETURNING id INTO v_instance_id;
      END IF;

      INSERT INTO user_card_state (user_id, card_instance_id, srs_stage, next_review_at)
      VALUES (v_progress.user_id, v_instance_id, 'apprentice_1', NOW() + v_default_interval)
      ON CONFLICT (user_id, card_instance_id) DO NOTHING;

      IF FOUND THEN
        v_reconciled := v_reconciled + 1;
        v_result := v_result || jsonb_build_object('user_id', v_progress.user_id, 'slug', v_card_slug, 'lesson_id', v_progress.lesson_id);
      END IF;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('reconciled', v_reconciled, 'details', v_result);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
