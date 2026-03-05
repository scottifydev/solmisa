-- v2 Migration Step 8: Rewrite seed_lesson_cards RPC (SCO-201)
CREATE OR REPLACE FUNCTION seed_lesson_cards_v2(
  p_user_id UUID,
  p_lesson_id UUID,
  p_initial_interval_override INTERVAL DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_lesson RECORD;
  v_template RECORD;
  v_instance_id UUID;
  v_card_slug TEXT;
  v_result JSONB := '[]'::jsonb;
  v_seeded_count INTEGER := 0;
  v_default_interval INTERVAL;
  v_track_id UUID;
BEGIN
  SELECT l.id, l.unlocks_cards, l.track_id INTO v_lesson FROM lessons l WHERE l.id = p_lesson_id;
  IF v_lesson IS NULL THEN RAISE EXCEPTION 'Lesson not found: %', p_lesson_id; END IF;
  v_track_id := v_lesson.track_id;

  FOREACH v_card_slug IN ARRAY v_lesson.unlocks_cards
  LOOP
    SELECT * INTO v_template FROM card_templates WHERE slug = v_card_slug;
    IF v_template IS NULL THEN CONTINUE; END IF;

    IF p_initial_interval_override IS NOT NULL THEN
      v_default_interval := p_initial_interval_override;
    ELSIF v_template.card_category IN ('perceptual', 'rhythm') THEN
      v_default_interval := INTERVAL '4 hours';
    ELSE
      v_default_interval := INTERVAL '8 hours';
    END IF;

    IF v_template.is_parametric THEN
      INSERT INTO card_instances (template_id, instance_parameters, prompt_rendered, answer_data)
      VALUES (v_template.id, '{}'::jsonb, v_template.prompt_text, '{}'::jsonb)
      ON CONFLICT DO NOTHING RETURNING id INTO v_instance_id;
      IF v_instance_id IS NULL THEN
        SELECT id INTO v_instance_id FROM card_instances WHERE template_id = v_template.id LIMIT 1;
      END IF;
    ELSE
      SELECT id INTO v_instance_id FROM card_instances WHERE template_id = v_template.id LIMIT 1;
      IF v_instance_id IS NULL THEN
        INSERT INTO card_instances (template_id, instance_parameters, prompt_rendered, answer_data)
        VALUES (v_template.id, '{}'::jsonb, v_template.prompt_text, '{}'::jsonb)
        RETURNING id INTO v_instance_id;
      END IF;
    END IF;

    INSERT INTO user_card_state (user_id, card_instance_id, srs_stage, next_review_at)
    VALUES (p_user_id, v_instance_id, 'apprentice_1', NOW() + v_default_interval)
    ON CONFLICT (user_id, card_instance_id) DO NOTHING;

    v_seeded_count := v_seeded_count + 1;
    v_result := v_result || jsonb_build_object('slug', v_card_slug, 'template_id', v_template.id, 'instance_id', v_instance_id, 'interval', v_default_interval::text);
  END LOOP;

  INSERT INTO lesson_progress (user_id, lesson_id, status, completed_at)
  VALUES (p_user_id, p_lesson_id, 'completed', NOW())
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', completed_at = COALESCE(lesson_progress.completed_at, NOW());

  INSERT INTO track_progress (user_id, track_id, lessons_completed, started_at)
  VALUES (p_user_id, v_track_id, 1, NOW())
  ON CONFLICT (user_id, track_id) DO UPDATE SET lessons_completed = track_progress.lessons_completed + 1;

  RETURN jsonb_build_object('seeded', v_seeded_count, 'cards', v_result, 'lesson_id', p_lesson_id, 'track_id', v_track_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
