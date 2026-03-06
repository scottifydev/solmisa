-- SCO-219: Rewrite ET-1 lessons with v2 stage types
-- This migration updates Module 1 lesson stages:
--   - Lesson 1 (Finding Tonic): v2 aural_teach + interactive + guided_practice
--   - Lesson 3 (Tonic Triad): v2 aural_teach + interactive + guided_practice
-- Rhythm lessons (1.2, 1.4) remain as-is — moved to rhythm track in SCO-220.
-- Per the spec: no aural_quiz or theory_quiz stages in ET-1.

-- =============================================
-- Helper: get the ear_training track ID
-- =============================================
DO $$
DECLARE
  v_et_track_id UUID;
  v_module_id UUID;
  v_lesson1_id UUID;
  v_lesson3_id UUID;
BEGIN
  SELECT id INTO v_et_track_id FROM skill_tracks WHERE slug = 'ear_training';
  IF v_et_track_id IS NULL THEN
    RAISE NOTICE 'ear_training track not found — skipping ET-1 rewrite';
    RETURN;
  END IF;

  -- Find Module 1 in ear_training track (the first module by order)
  SELECT id INTO v_module_id
  FROM modules
  WHERE track_id = v_et_track_id
  ORDER BY module_order
  LIMIT 1;

  IF v_module_id IS NULL THEN
    RAISE NOTICE 'No Module 1 found in ear_training — skipping';
    RETURN;
  END IF;

  -- Find lessons by order within this module
  -- Lesson 1 (order=1): Finding Tonic
  SELECT id INTO v_lesson1_id
  FROM lessons
  WHERE module_id = v_module_id AND lesson_order = 1;

  -- Lesson 3 (order=3): Tonic Triad by Ear
  -- Note: after moving rhythm lessons out, this may be order=2 or 3
  SELECT id INTO v_lesson3_id
  FROM lessons
  WHERE module_id = v_module_id AND lesson_order = 3;

  -- =============================================
  -- Rewrite Lesson 1: Finding Tonic
  -- =============================================
  IF v_lesson1_id IS NOT NULL THEN
    UPDATE lessons SET
      title = 'Finding Tonic',
      description = 'Every melody has a home note — the one that feels like rest. In this lesson, you will learn to hear and feel tonic.',
      unlocks_cards = ARRAY['et_degree_1_basic']::TEXT[],
      unlocks_drills = ARRAY['degree_id_1']::TEXT[],
      stages = '[
        {
          "type": "aural_teach",
          "title": "Hearing Home",
          "instructions": "Listen to the drone. This sustained tone is tonic — the resting point of the key. Let it settle in your ear. Notice how it feels stable, grounded, complete.",
          "audio_degrees": [1],
          "show_degree_circle": false
        },
        {
          "type": "aural_teach",
          "title": "Do on the Circle",
          "instructions": "Now see where tonic lives. On the degree circle, Do sits at the top — the point everything else revolves around. Listen again and watch it light up.",
          "audio_degrees": [1],
          "show_degree_circle": true,
          "highlight_degree": 1
        },
        {
          "type": "interactive",
          "title": "Explore Tonic",
          "instructions": "Tap the degree circle to hear Do in different octaves. Notice how no matter where you play it, it always feels like home.",
          "interactive_type": "degree_circle_explore",
          "config": {
            "enabled_degrees": [1],
            "show_labels": true,
            "allow_octave_change": true
          },
          "min_interactions": 3
        },
        {
          "type": "guided_practice",
          "title": "Is It Tonic?",
          "instructions": "You will hear a note over the drone. Is it Do (tonic), or a different degree? Listen for that feeling of rest.",
          "practice_type": "degree",
          "audio_degrees": [1],
          "options": ["Do (1)", "Not Do"],
          "correct_answer": "Do (1)",
          "reveal_delay_ms": 3000,
          "show_resolution": true
        }
      ]'::JSONB
    WHERE id = v_lesson1_id;

    -- Ensure card template exists for this lesson
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions)
    VALUES (
      v_lesson1_id,
      'et_degree_1_basic',
      'perceptual',
      'select_degree',
      'Listen to the note over the drone. Which degree is it?',
      ARRAY['degree_1']::TEXT[]
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      radar_dimensions = EXCLUDED.radar_dimensions;
  END IF;

  -- =============================================
  -- Rewrite Lesson 3: Tonic Triad by Ear
  -- =============================================
  IF v_lesson3_id IS NOT NULL THEN
    UPDATE lessons SET
      title = 'Tonic Triad by Ear',
      description = 'The tonic triad — Do, Mi, Sol — forms the harmonic foundation. Learn to hear each member and feel how they relate to tonic.',
      unlocks_cards = ARRAY['et_degree_3_basic', 'et_degree_5_basic']::TEXT[],
      unlocks_drills = ARRAY['degree_id_1_3_5']::TEXT[],
      stages = '[
        {
          "type": "aural_teach",
          "title": "Three Notes, One Family",
          "instructions": "Listen to Do, then Mi, then Sol played over the drone. These three degrees form the tonic triad — the most stable chord in any key. Notice how each one feels at rest, but in different ways.",
          "audio_degrees": [1, 3, 5],
          "show_degree_circle": false
        },
        {
          "type": "aural_teach",
          "title": "Mi — The Third",
          "instructions": "Mi sits between Do and Sol. It gives the chord its quality — major or minor. In a major key, Mi has a warm, bright character. Listen for how it differs from Do.",
          "audio_degrees": [3],
          "show_degree_circle": true,
          "highlight_degree": 3
        },
        {
          "type": "aural_teach",
          "title": "Sol — The Fifth",
          "instructions": "Sol is the second most stable degree after Do. It has an open, strong quality — like a pillar supporting the key. Listen for its stability.",
          "audio_degrees": [5],
          "show_degree_circle": true,
          "highlight_degree": 5
        },
        {
          "type": "interactive",
          "title": "Explore the Triad",
          "instructions": "Tap Do, Mi, and Sol on the degree circle. Play them in any order. Notice how they all feel stable, but each has its own character.",
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
          "title": "Which Triad Member?",
          "instructions": "You will hear one of the three triad degrees over the drone. Identify which one it is. The answer reveals after a few seconds.",
          "practice_type": "degree",
          "audio_degrees": [1, 3, 5],
          "options": [1, 3, 5],
          "correct_answer": 1,
          "reveal_delay_ms": 3000,
          "show_resolution": true
        }
      ]'::JSONB
    WHERE id = v_lesson3_id;

    -- Ensure card templates exist
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions)
    VALUES
      (v_lesson3_id, 'et_degree_3_basic', 'perceptual', 'select_degree',
       'Listen to the note over the drone. Which degree is it?',
       ARRAY['degree_3']::TEXT[]),
      (v_lesson3_id, 'et_degree_5_basic', 'perceptual', 'select_degree',
       'Listen to the note over the drone. Which degree is it?',
       ARRAY['degree_5']::TEXT[])
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      radar_dimensions = EXCLUDED.radar_dimensions;
  END IF;

  RAISE NOTICE 'ET-1 lessons rewritten with v2 stages';
END $$;
