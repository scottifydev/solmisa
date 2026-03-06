-- SCO-301: ET-2 Tonic Triad module (ear_training track, module_order=2)
-- 4 lessons, 4 card templates, 1 drill
-- Builds on ET-1 (Do only) by introducing Sol, Mi, then the full triad.

DO $$
DECLARE
  v_et_track_id UUID;
  v_module_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_et_track_id FROM skill_tracks WHERE slug = 'ear_training';
  IF v_et_track_id IS NULL THEN
    RAISE NOTICE 'ear_training track not found — skipping ET-2';
    RETURN;
  END IF;

  -- =============================================
  -- Module: Tonic Triad
  -- =============================================
  INSERT INTO modules (title, description, module_order, track_id)
  VALUES (
    'Tonic Triad',
    'Meet the three most stable degrees — Do, Mi, Sol. Learn to hear each one over a drone and identify them by ear.',
    2,
    v_et_track_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM modules WHERE track_id = v_et_track_id AND module_order = 2;
  END IF;

  IF v_module_id IS NULL THEN
    RAISE NOTICE 'Could not create or find ET-2 module — skipping';
    RETURN;
  END IF;

  -- =============================================
  -- Lesson 1: Meeting Degree 5 — The Anchor
  -- drone_key: C
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, drone_key, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Meeting Degree 5: The Anchor',
    'Sol is the second most stable degree — an open, strong pillar that supports the key. Learn to hear it against the drone.',
    v_module_id, v_et_track_id, 1, 'C',
    ARRAY['et2_degree_5_id']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "Hearing Sol",
        "instructions": "Listen to the drone — that is Do, home. Now hear a new note above it. This is Sol, degree 5. It has an open, strong quality — like a pillar supporting the key. It is stable, but it is not home.",
        "audio_degrees": [1, 5],
        "show_degree_circle": false
      },
      {
        "type": "aural_teach",
        "title": "Sol on the Circle",
        "instructions": "Sol sits opposite Do on the degree circle. These two degrees form the strongest relationship in music — the perfect fifth. Listen again and watch Sol light up.",
        "audio_degrees": [5],
        "show_degree_circle": true,
        "highlight_degree": 5
      },
      {
        "type": "interactive",
        "title": "Do and Sol",
        "instructions": "Tap Do and Sol on the degree circle. Compare their characters. Do feels like rest. Sol feels like support — stable but always pointing back to Do.",
        "interactive_type": "degree_circle_explore",
        "config": {
          "enabled_degrees": [1, 5],
          "show_labels": true,
          "allow_octave_change": true
        },
        "min_interactions": 4
      },
      {
        "type": "guided_practice",
        "title": "Do or Sol?",
        "instructions": "You will hear a note over the drone. Is it Do or Sol? Listen for the difference: Do feels like arrival, Sol feels like support.",
        "practice_type": "degree",
        "audio_degrees": [1, 5],
        "options": [1, 5],
        "correct_answer": 5,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, playback, feedback, parameters)
    VALUES (
      v_lesson_id,
      'et2_degree_5_id',
      'perceptual',
      'select_degree',
      'Listen to the note over the drone. Is it Do or Sol?',
      ARRAY['degree_5']::TEXT[],
      jsonb_build_object(
        'type', 'tone_js', 'drone', true, 'drone_key', 'C',
        'sequence', jsonb_build_array('5'), 'auto_play', true,
        'replay_allowed', true, 'pause_before_options_ms', 1500,
        'timbre', 'sine', 'tempo', '80'
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Sol is the dominant — an open, strong pillar a perfect fifth above Do.', 'show_answer', true, 'play_confirmation', true),
        'incorrect', jsonb_build_object('text', 'Sol has a stable but unsettled quality — it supports the key without being home.', 'show_answer', true, 'play_correct', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', '5', 'correct_degree', 5),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', '1', 'label', 'Do (1)', 'degree', 1),
          jsonb_build_object('id', '5', 'label', 'Sol (5)', 'degree', 5)
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      radar_dimensions = EXCLUDED.radar_dimensions,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 2: Meeting Degree 3 — The Warm One
  -- drone_key: C
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, drone_key, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Meeting Degree 3: The Warm One',
    'Mi is the degree that gives major its brightness. Learn to hear its warm, sweet quality between Do and Sol.',
    v_module_id, v_et_track_id, 2, 'C',
    ARRAY['et2_degree_3_id']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "Hearing Mi",
        "instructions": "Listen to Do, then hear Mi — degree 3. Mi sits between Do and Sol. In a major key, it has a warm, bright character. It is what makes major sound major.",
        "audio_degrees": [1, 3],
        "show_degree_circle": false
      },
      {
        "type": "aural_teach",
        "title": "Mi on the Circle",
        "instructions": "Mi sits between Do and Sol on the degree circle, completing the warm core of the tonic triad. Listen and watch it light up.",
        "audio_degrees": [3],
        "show_degree_circle": true,
        "highlight_degree": 3
      },
      {
        "type": "interactive",
        "title": "Do, Mi, and Sol",
        "instructions": "Tap all three triad members on the degree circle. Notice how Mi sits between Do and Sol — warmer than Sol, brighter than Do.",
        "interactive_type": "degree_circle_explore",
        "config": {
          "enabled_degrees": [1, 3, 5],
          "show_labels": true,
          "allow_octave_change": true
        },
        "min_interactions": 5
      },
      {
        "type": "guided_practice",
        "title": "Which Degree?",
        "instructions": "You will hear one of three degrees over the drone: Do, Mi, or Sol. Identify which one. Listen for the distinct character of each.",
        "practice_type": "degree",
        "audio_degrees": [1, 3, 5],
        "options": [1, 3, 5],
        "correct_answer": 3,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, playback, feedback, parameters)
    VALUES (
      v_lesson_id,
      'et2_degree_3_id',
      'perceptual',
      'select_degree',
      'Listen to the note over the drone. Which degree is it?',
      ARRAY['degree_3']::TEXT[],
      jsonb_build_object(
        'type', 'tone_js', 'drone', true, 'drone_key', 'C',
        'sequence', jsonb_build_array('3'), 'auto_play', true,
        'replay_allowed', true, 'pause_before_options_ms', 1500,
        'timbre', 'sine', 'tempo', '80'
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Mi has a warm, bright quality — a major third above Do.', 'show_answer', true, 'play_confirmation', true),
        'incorrect', jsonb_build_object('text', 'Mi sits between Do and Sol. It is what gives major its warmth and brightness.', 'show_answer', true, 'play_correct', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', '3', 'correct_degree', 3),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', '1', 'label', 'Do (1)', 'degree', 1),
          jsonb_build_object('id', '3', 'label', 'Mi (3)', 'degree', 3),
          jsonb_build_object('id', '5', 'label', 'Sol (5)', 'degree', 5)
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      radar_dimensions = EXCLUDED.radar_dimensions,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 3: The Tonic Triad Family
  -- drone_key: C
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, drone_key, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'The Tonic Triad Family',
    'Do, Mi, Sol together form the tonic triad — the most stable chord in any key. Practice hearing and identifying all three members.',
    v_module_id, v_et_track_id, 3, 'C',
    ARRAY['et2_degree_triad']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "The Complete Triad",
        "instructions": "Listen to all three degrees played together, then one at a time: Do, Mi, Sol. This is the tonic triad — the harmonic foundation of the key. Every other chord pulls toward or away from this one.",
        "audio_degrees": [1, 3, 5],
        "show_degree_circle": true,
        "highlight_degree": 1
      },
      {
        "type": "aural_teach",
        "title": "Each Has a Role",
        "instructions": "Do is home. Mi adds warmth and color. Sol provides strength and support. Together they create the most complete, stable sound in the key. Listen to each in turn and feel their character.",
        "audio_degrees": [1, 3, 5],
        "show_degree_circle": true,
        "highlight_degree": 3
      },
      {
        "type": "interactive",
        "title": "Triad Explorer",
        "instructions": "Tap each degree on the circle. Try playing them in different orders — Do-Mi-Sol, Sol-Mi-Do, Mi-Sol-Do. Notice how each ordering has a different feel, but they always sound like they belong together.",
        "interactive_type": "degree_circle_explore",
        "config": {
          "enabled_degrees": [1, 3, 5],
          "show_labels": true,
          "allow_octave_change": true
        },
        "min_interactions": 6
      },
      {
        "type": "guided_practice",
        "title": "Rapid Triad ID",
        "instructions": "Identify each degree as it plays. This time the reveal comes after 4.5 seconds. Trust your first instinct — your ear often knows before your mind does.",
        "practice_type": "degree",
        "audio_degrees": [1, 3, 5],
        "options": [1, 3, 5],
        "correct_answer": 1,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, playback, feedback, parameters)
    VALUES (
      v_lesson_id,
      'et2_degree_triad',
      'perceptual',
      'select_degree',
      'Listen to the note over the drone. Which triad degree is it — Do, Mi, or Sol?',
      ARRAY['degree_1', 'degree_3', 'degree_5']::TEXT[],
      jsonb_build_object(
        'type', 'tone_js', 'drone', true, 'drone_key', 'C',
        'sequence', jsonb_build_array('1'), 'auto_play', true,
        'replay_allowed', true, 'pause_before_options_ms', 1500,
        'timbre', 'sine', 'tempo', '80'
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Trust the feeling — each triad degree has a distinct character.', 'show_answer', true, 'play_confirmation', true),
        'incorrect', jsonb_build_object('text', 'Do is home, Mi is warm, Sol is strong. Let the drone anchor your ear.', 'show_answer', true, 'play_correct', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', '1', 'correct_degree', 1),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', '1', 'label', 'Do (1)', 'degree', 1),
          jsonb_build_object('id', '3', 'label', 'Mi (3)', 'degree', 3),
          jsonb_build_object('id', '5', 'label', 'Sol (5)', 'degree', 5)
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      radar_dimensions = EXCLUDED.radar_dimensions,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 4: Triad in a New Key
  -- drone_key: G (tests transfer to a new key)
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, drone_key, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Triad in a New Key',
    'The tonic triad sounds the same in every key — only the pitch level changes. Prove it by identifying Do, Mi, Sol in the key of G.',
    v_module_id, v_et_track_id, 4, 'G',
    ARRAY['et2_triad_feeling']::TEXT[],
    ARRAY['drill_et2_triad_recognition']::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "New Drone, Same Feeling",
        "instructions": "The drone has changed — you are now in the key of G. But Do still feels like home, Mi still feels warm, and Sol still feels strong. The relationships are the same. Only the pitch level has shifted.",
        "audio_degrees": [1, 3, 5],
        "show_degree_circle": false
      },
      {
        "type": "aural_teach",
        "title": "Degree Feelings Transfer",
        "instructions": "This is the power of solmisation: once you learn what Do, Mi, and Sol feel like, you can find them in any key. The intervals stay the same. The feelings stay the same.",
        "audio_degrees": [1, 3, 5],
        "show_degree_circle": true,
        "highlight_degree": 5
      },
      {
        "type": "interactive",
        "title": "Explore in G",
        "instructions": "Tap the degree circle in this new key. Confirm for yourself — Do, Mi, Sol feel the same as they did in C. Your ear has already learned the pattern.",
        "interactive_type": "degree_circle_explore",
        "config": {
          "enabled_degrees": [1, 3, 5],
          "show_labels": true,
          "allow_octave_change": true
        },
        "min_interactions": 5
      },
      {
        "type": "guided_practice",
        "title": "Triad ID in G",
        "instructions": "Identify each degree over the new drone. If you learned the feelings in C, they will work here too.",
        "practice_type": "degree",
        "audio_degrees": [1, 3, 5],
        "options": [1, 3, 5],
        "correct_answer": 5,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, playback, feedback, parameters)
    VALUES (
      v_lesson_id,
      'et2_triad_feeling',
      'perceptual',
      'select_degree',
      'Listen to the note over the drone. Which triad degree is it?',
      ARRAY['degree_1', 'degree_3', 'degree_5']::TEXT[],
      jsonb_build_object(
        'type', 'tone_js', 'drone', true, 'drone_key', 'G',
        'sequence', jsonb_build_array('5'), 'auto_play', true,
        'replay_allowed', true, 'pause_before_options_ms', 1500,
        'timbre', 'sine', 'tempo', '80'
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'The feeling transfers to every key. Your ear recognizes the relationship, not the pitch.', 'show_answer', true, 'play_confirmation', true),
        'incorrect', jsonb_build_object('text', 'Focus on the feeling, not the pitch. Do is home, Mi is warm, Sol is strong — in every key.', 'show_answer', true, 'play_correct', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', '5', 'correct_degree', 5),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', '1', 'label', 'Do (1)', 'degree', 1),
          jsonb_build_object('id', '3', 'label', 'Mi (3)', 'degree', 3),
          jsonb_build_object('id', '5', 'label', 'Sol (5)', 'degree', 5)
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      radar_dimensions = EXCLUDED.radar_dimensions,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Drill: Triad Recognition
  -- =============================================
  INSERT INTO drills (track_id, slug, title, description, drill_type, config, display_order)
  VALUES (
    v_et_track_id,
    'drill_et2_triad_recognition',
    'Triad Recognition',
    'Identify Do, Mi, and Sol over a drone in various keys. Builds speed and confidence with the three most stable degrees.',
    'degree_id',
    jsonb_build_object(
      'degrees', jsonb_build_array(1, 3, 5),
      'keys', jsonb_build_array('C', 'G', 'F'),
      'tempo_range', jsonb_build_array(70, 100),
      'drone', true
    ),
    1
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'ET-2 Tonic Triad module seeded (4 lessons, 4 card templates, 1 drill)';
END $$;
