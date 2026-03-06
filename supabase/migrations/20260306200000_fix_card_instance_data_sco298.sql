-- SCO-298: Fix card instances seeded with empty answer/options data
-- Two fixes:
--   1. Populate starter card templates with proper default instance data
--   2. Rewrite seed_lesson_cards_v2 RPC to use template parameters

-- ─── Step 1: Update starter card templates ──────────────────────────

-- ET degree cards: playback, feedback, dimensions, and instance defaults in parameters
UPDATE card_templates SET
  playback = jsonb_build_object(
    'type', 'tone_js', 'drone', true, 'drone_key', 'C',
    'sequence', jsonb_build_array('1'), 'auto_play', true,
    'replay_allowed', true, 'pause_before_options_ms', 1500,
    'timbre', 'sine', 'tempo', '80'
  ),
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'That pull toward home is your ear finding tonic.', 'show_answer', true, 'play_confirmation', true),
    'incorrect', jsonb_build_object('text', 'Listen for the note that matches the drone — that is Do.', 'show_answer', true, 'play_correct', true, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['degree_1'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('correct_answer', '1', 'correct_degree', 1),
    'options_data', jsonb_build_array(
      jsonb_build_object('id', '1', 'label', 'Do (1)', 'degree', 1),
      jsonb_build_object('id', '3', 'label', 'Mi (3)', 'degree', 3),
      jsonb_build_object('id', '5', 'label', 'Sol (5)', 'degree', 5)
    )
  )
WHERE slug = 'et_degree_1_basic';

UPDATE card_templates SET
  playback = jsonb_build_object(
    'type', 'tone_js', 'drone', true, 'drone_key', 'C',
    'sequence', jsonb_build_array('3'), 'auto_play', true,
    'replay_allowed', true, 'pause_before_options_ms', 1500,
    'timbre', 'sine', 'tempo', '80'
  ),
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'Mi has a warm, bright quality — a major third above Do.', 'show_answer', true, 'play_confirmation', true),
    'incorrect', jsonb_build_object('text', 'Mi sits between Do and Sol — it adds warmth to the tonic triad.', 'show_answer', true, 'play_correct', true, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['degree_3'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('correct_answer', '3', 'correct_degree', 3),
    'options_data', jsonb_build_array(
      jsonb_build_object('id', '1', 'label', 'Do (1)', 'degree', 1),
      jsonb_build_object('id', '3', 'label', 'Mi (3)', 'degree', 3),
      jsonb_build_object('id', '5', 'label', 'Sol (5)', 'degree', 5)
    )
  )
WHERE slug = 'et_degree_3_basic';

UPDATE card_templates SET
  playback = jsonb_build_object(
    'type', 'tone_js', 'drone', true, 'drone_key', 'C',
    'sequence', jsonb_build_array('5'), 'auto_play', true,
    'replay_allowed', true, 'pause_before_options_ms', 1500,
    'timbre', 'sine', 'tempo', '80'
  ),
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'Sol is the dominant — the second most stable tone after Do.', 'show_answer', true, 'play_confirmation', true),
    'incorrect', jsonb_build_object('text', 'Sol has a strong, open quality — a perfect fifth above Do.', 'show_answer', true, 'play_correct', true, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['degree_5'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('correct_answer', '5', 'correct_degree', 5),
    'options_data', jsonb_build_array(
      jsonb_build_object('id', '1', 'label', 'Do (1)', 'degree', 1),
      jsonb_build_object('id', '3', 'label', 'Mi (3)', 'degree', 3),
      jsonb_build_object('id', '5', 'label', 'Sol (5)', 'degree', 5)
    )
  )
WHERE slug = 'et_degree_5_basic';

-- Theory cards
UPDATE card_templates SET
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'Five lines and four spaces — the foundation of written music.', 'show_answer', true, 'play_confirmation', false),
    'incorrect', jsonb_build_object('text', 'A standard musical staff has five horizontal lines.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['music_literacy'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('correct_answer', 'b'),
    'options_data', jsonb_build_array(
      jsonb_build_object('id', 'a', 'label', '4'),
      jsonb_build_object('id', 'b', 'label', '5'),
      jsonb_build_object('id', 'c', 'label', '6'),
      jsonb_build_object('id', 'd', 'label', '7')
    )
  )
WHERE slug = 'th_staff_basics';

UPDATE card_templates SET
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'A half note gets two beats in common time.', 'show_answer', true, 'play_confirmation', false),
    'incorrect', jsonb_build_object('text', 'The half note lasts for two beats — half as long as a whole note.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['music_literacy'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('correct_answer', 'b'),
    'options_data', jsonb_build_array(
      jsonb_build_object('id', 'a', 'label', '1'),
      jsonb_build_object('id', 'b', 'label', '2'),
      jsonb_build_object('id', 'c', 'label', '3'),
      jsonb_build_object('id', 'd', 'label', '4')
    )
  )
WHERE slug = 'th_note_values';

UPDATE card_templates SET
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'A sharp raises a note by one half step.', 'show_answer', true, 'play_confirmation', false),
    'incorrect', jsonb_build_object('text', 'Sharps raise, flats lower — each by one half step.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['music_literacy'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('correct_answer', 'a'),
    'options_data', jsonb_build_array(
      jsonb_build_object('id', 'a', 'label', 'Raises it by a half step'),
      jsonb_build_object('id', 'b', 'label', 'Lowers it by a half step'),
      jsonb_build_object('id', 'c', 'label', 'Raises it by a whole step'),
      jsonb_build_object('id', 'd', 'label', 'Cancels a previous accidental')
    )
  )
WHERE slug = 'th_accidentals';

-- Rhythm cards
UPDATE card_templates SET
  playback = jsonb_build_object('pattern', 'quarter quarter quarter quarter quarter quarter quarter quarter', 'tempo', 80),
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'Steady pulse is the foundation of rhythm.', 'show_answer', true, 'play_confirmation', false),
    'incorrect', jsonb_build_object('text', 'Try to match each beat evenly. Consistency comes with practice.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['rhythm'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('tempo', 80, 'beats', 8, 'tolerance_ms', 150)
  )
WHERE slug = 'rh_steady_pulse';

UPDATE card_templates SET
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'The downbeat anchors every measure.', 'show_answer', true, 'play_confirmation', false),
    'incorrect', jsonb_build_object('text', 'The downbeat is the first beat of each measure — the strongest pulse.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['rhythm'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('correct_answer', 'a'),
    'options_data', jsonb_build_array(
      jsonb_build_object('id', 'a', 'label', 'The first beat of a measure'),
      jsonb_build_object('id', 'b', 'label', 'The last beat of a measure'),
      jsonb_build_object('id', 'c', 'label', 'Any accented beat'),
      jsonb_build_object('id', 'd', 'label', 'The fastest beat')
    )
  )
WHERE slug = 'rh_strong_weak';

UPDATE card_templates SET
  playback = jsonb_build_object('pattern', 'eighth eighth eighth eighth eighth eighth eighth eighth', 'tempo', 72),
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'Subdividing the beat builds rhythmic precision.', 'show_answer', true, 'play_confirmation', false),
    'incorrect', jsonb_build_object('text', 'Each beat splits into two equal halves — tap twice per click.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['rhythm'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('tempo', 72, 'beats', 8, 'tolerance_ms', 120)
  )
WHERE slug = 'rh_subdivisions';

-- Sight-reading cards
UPDATE card_templates SET
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'Every Good Boy Does Fine — the treble clef lines.', 'show_answer', true, 'play_confirmation', false),
    'incorrect', jsonb_build_object('text', 'Treble clef lines from bottom: E, G, B, D, F.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['sight_reading'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('correct_answer', 'a'),
    'options_data', jsonb_build_array(
      jsonb_build_object('id', 'a', 'label', 'E, G, B, D, F'),
      jsonb_build_object('id', 'b', 'label', 'F, A, C, E, G'),
      jsonb_build_object('id', 'c', 'label', 'D, F, A, C, E'),
      jsonb_build_object('id', 'd', 'label', 'G, B, D, F, A')
    )
  )
WHERE slug = 'sr_treble_lines';

UPDATE card_templates SET
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'FACE — the treble clef spaces spell a word.', 'show_answer', true, 'play_confirmation', false),
    'incorrect', jsonb_build_object('text', 'Treble clef spaces from bottom: F, A, C, E — they spell FACE.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['sight_reading'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('correct_answer', 'a'),
    'options_data', jsonb_build_array(
      jsonb_build_object('id', 'a', 'label', 'F, A, C, E'),
      jsonb_build_object('id', 'b', 'label', 'E, G, B, D'),
      jsonb_build_object('id', 'c', 'label', 'A, C, E, G'),
      jsonb_build_object('id', 'd', 'label', 'D, F, A, C')
    )
  )
WHERE slug = 'sr_treble_spaces';

UPDATE card_templates SET
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'Good Boys Do Fine Always — the bass clef lines.', 'show_answer', true, 'play_confirmation', false),
    'incorrect', jsonb_build_object('text', 'Bass clef lines from bottom: G, B, D, F, A.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['sight_reading'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('correct_answer', 'a'),
    'options_data', jsonb_build_array(
      jsonb_build_object('id', 'a', 'label', 'G, B, D, F, A'),
      jsonb_build_object('id', 'b', 'label', 'E, G, B, D, F'),
      jsonb_build_object('id', 'c', 'label', 'A, C, E, G, B'),
      jsonb_build_object('id', 'd', 'label', 'F, A, C, E, G')
    )
  )
WHERE slug = 'sr_bass_lines';

UPDATE card_templates SET
  feedback = jsonb_build_object(
    'correct', jsonb_build_object('text', 'All Cows Eat Grass — the bass clef spaces.', 'show_answer', true, 'play_confirmation', false),
    'incorrect', jsonb_build_object('text', 'Bass clef spaces from bottom: A, C, E, G.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
  ),
  dimensions = ARRAY['sight_reading'],
  parameters = jsonb_build_object(
    'answer_data', jsonb_build_object('correct_answer', 'a'),
    'options_data', jsonb_build_array(
      jsonb_build_object('id', 'a', 'label', 'A, C, E, G'),
      jsonb_build_object('id', 'b', 'label', 'F, A, C, E'),
      jsonb_build_object('id', 'c', 'label', 'G, B, D, F'),
      jsonb_build_object('id', 'd', 'label', 'D, F, A, C')
    )
  )
WHERE slug = 'sr_bass_spaces';

-- ─── Step 2: Create proper card_instances for starter templates ─────
-- Non-parametric templates share a single instance across all users.
-- Only insert if one doesn't already exist.

DO $$
DECLARE
  v_template RECORD;
  v_instance_id UUID;
BEGIN
  FOR v_template IN
    SELECT id, slug, prompt_text, response_type, parameters
    FROM card_templates
    WHERE slug IN (
      'et_degree_1_basic', 'et_degree_3_basic', 'et_degree_5_basic',
      'th_staff_basics', 'th_note_values', 'th_accidentals',
      'rh_steady_pulse', 'rh_strong_weak', 'rh_subdivisions',
      'sr_treble_lines', 'sr_treble_spaces', 'sr_bass_lines', 'sr_bass_spaces'
    )
  LOOP
    -- Check if instance already exists
    SELECT id INTO v_instance_id
    FROM card_instances WHERE template_id = v_template.id LIMIT 1;

    IF v_instance_id IS NOT NULL THEN
      -- Update existing instance with proper data
      UPDATE card_instances SET
        prompt_rendered = v_template.prompt_text,
        answer_data = COALESCE(v_template.parameters->'answer_data', '{}'::jsonb),
        options_data = v_template.parameters->'options_data'
      WHERE id = v_instance_id;
    ELSE
      -- Create new instance
      INSERT INTO card_instances (template_id, instance_parameters, prompt_rendered, answer_data, options_data)
      VALUES (
        v_template.id,
        '{}'::jsonb,
        v_template.prompt_text,
        COALESCE(v_template.parameters->'answer_data', '{}'::jsonb),
        v_template.parameters->'options_data'
      );
    END IF;
  END LOOP;
END $$;

-- ─── Step 3: Delete orphaned broken card_instances ──────────────────
-- These are m1-l1 instances created with empty data and no user_card_state.
DELETE FROM card_instances
WHERE answer_data = '{}'::jsonb
  AND options_data IS NULL
  AND id NOT IN (SELECT card_instance_id FROM user_card_state);

-- ─── Step 4: Rewrite seed_lesson_cards_v2 RPC ──────────────────────
-- Now reads options_data and answer_data from template.parameters

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
  v_answer_data JSONB;
  v_options_data JSONB;
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

    -- Read default instance data from template parameters
    v_answer_data := COALESCE(v_template.parameters->'answer_data', '{}'::jsonb);
    v_options_data := v_template.parameters->'options_data';

    IF v_template.is_parametric THEN
      INSERT INTO card_instances (template_id, instance_parameters, prompt_rendered, answer_data, options_data)
      VALUES (v_template.id, '{}'::jsonb, v_template.prompt_text, v_answer_data, v_options_data)
      ON CONFLICT DO NOTHING RETURNING id INTO v_instance_id;
      IF v_instance_id IS NULL THEN
        SELECT id INTO v_instance_id FROM card_instances WHERE template_id = v_template.id LIMIT 1;
      END IF;
    ELSE
      SELECT id INTO v_instance_id FROM card_instances WHERE template_id = v_template.id LIMIT 1;
      IF v_instance_id IS NULL THEN
        INSERT INTO card_instances (template_id, instance_parameters, prompt_rendered, answer_data, options_data)
        VALUES (v_template.id, '{}'::jsonb, v_template.prompt_text, v_answer_data, v_options_data)
        RETURNING id INTO v_instance_id;
      END IF;
    END IF;

    INSERT INTO user_card_state (user_id, card_instance_id, srs_stage, next_review_at)
    VALUES (p_user_id, v_instance_id, 'apprentice_1', NOW() + v_default_interval)
    ON CONFLICT (user_id, card_instance_id) DO NOTHING;

    v_seeded_count := v_seeded_count + 1;
    v_result := v_result || jsonb_build_object('slug', v_card_slug, 'template_id', v_template.id, 'instance_id', v_instance_id, 'initial_interval', v_default_interval::text);
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
