-- SCO-305: ET-3 Pentatonic module (ear_training track, module_order=3)
-- 4 lessons, 5 card templates, 1 drill
-- Builds on ET-2 (degrees 1, 3, 5) by adding degrees 2 and 6.
-- Pentatonic = 5 notes, no half steps. Found across cultures.

DO $$
DECLARE
  v_et_track_id UUID;
  v_module_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_et_track_id FROM skill_tracks WHERE slug = 'ear_training';
  IF v_et_track_id IS NULL THEN
    RAISE NOTICE 'ear_training track not found — skipping ET-3';
    RETURN;
  END IF;

  -- =============================================
  -- Module: Pentatonic
  -- =============================================
  INSERT INTO modules (title, description, module_order, track_id)
  VALUES (
    'Pentatonic',
    'Add Re and La to your ear vocabulary. Five degrees, no half steps — the pentatonic scale appears in music everywhere.',
    3,
    v_et_track_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM modules WHERE track_id = v_et_track_id AND module_order = 3;
  END IF;

  IF v_module_id IS NULL THEN
    RAISE NOTICE 'Could not create or find ET-3 module — skipping';
    RETURN;
  END IF;

  -- =============================================
  -- Lesson 1: Degree 2 — The Stepper
  -- drone_key: C
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, drone_key, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Degree 2: The Stepper',
    'Re sits a whole step above Do — restless, always moving. Learn to hear its stepping quality between the stable triad degrees.',
    v_module_id, v_et_track_id, 1, 'C',
    ARRAY['et3_degree_2_id']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "Hearing Re",
        "instructions": "Listen to the drone — that is Do. Now hear a new note just above it. This is Re, degree 2. It sits a whole step above Do. Notice how it feels restless — it wants to move, either back down to Do or up to Mi.",
        "audio_degrees": [1, 2],
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Re — Always Moving",
        "instructions": "Re is the first unstable degree you have met. Do, Mi, and Sol all feel settled in their own way. Re does not. It is a stepping stone — close to Do but never at rest. In solfège, we call it Re.",
        "show_degree_circle": true,
        "highlight_degree": 2
      },
      {
        "type": "interactive",
        "title": "Do, Re, Mi, Sol",
        "instructions": "Tap each degree on the circle. Compare Re to the triad degrees. Do is home. Re steps away from home. Mi is warm. Sol is strong. Notice how Re sits between Do and Mi — restless, always in motion.",
        "interactive_type": "degree_circle_explore",
        "config": {
          "enabled_degrees": [1, 2, 3, 5],
          "show_labels": true,
          "allow_octave_change": true
        },
        "min_interactions": 5
      },
      {
        "type": "guided_practice",
        "title": "Find Re",
        "instructions": "You will hear a degree over the drone. Is it Do, Re, Mi, or Sol? Re is the one that feels like stepping — close to Do but not settled.",
        "practice_type": "degree",
        "audio_degrees": [1, 2, 3, 5],
        "options": [1, 2, 3, 5],
        "correct_answer": 2,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      },
      {
        "type": "guided_practice",
        "title": "Find Re Again",
        "instructions": "One more round. Trust the feeling — Re is restless. The triad degrees are stable. That contrast is your cue.",
        "practice_type": "degree",
        "audio_degrees": [1, 2, 3, 5],
        "options": [1, 2, 3, 5],
        "correct_answer": 2,
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
      'et3_degree_2_id',
      'perceptual',
      'select_degree',
      'Listen to the note over the drone. Which degree is it?',
      ARRAY['degree_2']::TEXT[],
      jsonb_build_object(
        'type', 'tone_js', 'drone', true, 'drone_key', 'C',
        'sequence', jsonb_build_array('2'), 'auto_play', true,
        'replay_allowed', true, 'pause_before_options_ms', 1500,
        'timbre', 'sine', 'tempo', '80'
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Re always wants to move — it sits a whole step above Do, restless but close to home.', 'show_answer', true, 'play_confirmation', true),
        'incorrect', jsonb_build_object('text', 'Re is the degree that feels restless, always in motion. It sits a whole step above Do.', 'show_answer', true, 'play_correct', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', '2', 'correct_degree', 2),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', '1', 'label', 'Do (1)', 'degree', 1),
          jsonb_build_object('id', '2', 'label', 'Re (2)', 'degree', 2),
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
  -- Lesson 2: Degree 6 — The Bittersweet One
  -- drone_key: C
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, drone_key, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Degree 6: The Bittersweet One',
    'La carries a gentle tension — warm but tinged with longing. It is the degree that becomes the tonic in minor keys.',
    v_module_id, v_et_track_id, 2, 'C',
    ARRAY['et3_degree_6_id']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "Hearing La",
        "instructions": "Listen to Sol, then hear a note just above it. This is La, degree 6. It has a warm but bittersweet quality — like a smile that is also a little sad. In minor keys, La becomes the home note.",
        "audio_degrees": [5, 6],
        "show_degree_circle": false
      },
      {
        "type": "aural_teach",
        "title": "The 5-6-5 Neighbor",
        "instructions": "Listen to Sol, then La, then Sol again. This neighbor motion — 5-6-5 — is one of the most common melodic patterns in music. La leans gently away from Sol and returns.",
        "audio_degrees": [5, 6, 5],
        "show_degree_circle": true,
        "highlight_degree": 6
      },
      {
        "type": "theory_teach",
        "title": "La — Warm Longing",
        "instructions": "La sits a whole step above Sol. It is the second unstable degree you have met, after Re. But where Re feels restless and active, La feels gentle and wistful. In moveable-do solfège, La is the natural minor tonic.",
        "show_degree_circle": true,
        "highlight_degree": 6
      },
      {
        "type": "interactive",
        "title": "All Five Pentatonic Degrees",
        "instructions": "Tap each degree on the circle: Do, Re, Mi, Sol, La. You now have all five pentatonic degrees. Notice how the two new ones — Re and La — add movement and color to the stable triad.",
        "interactive_type": "degree_circle_explore",
        "config": {
          "enabled_degrees": [1, 2, 3, 5, 6],
          "show_labels": true,
          "allow_octave_change": true
        },
        "min_interactions": 6
      },
      {
        "type": "guided_practice",
        "title": "Find La",
        "instructions": "You will hear a degree over the drone. Is it Do, Mi, Sol, or La? La is the warm one above Sol — bittersweet, not bright.",
        "practice_type": "degree",
        "audio_degrees": [1, 3, 5, 6],
        "options": [1, 3, 5, 6],
        "correct_answer": 6,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      },
      {
        "type": "guided_practice",
        "title": "Find La Again",
        "instructions": "Once more. La is gentle where Sol is strong. Trust the warmth you hear.",
        "practice_type": "degree",
        "audio_degrees": [1, 3, 5, 6],
        "options": [1, 3, 5, 6],
        "correct_answer": 6,
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
      'et3_degree_6_id',
      'perceptual',
      'select_degree',
      'Listen to the note over the drone. Which degree is it?',
      ARRAY['degree_6']::TEXT[],
      jsonb_build_object(
        'type', 'tone_js', 'drone', true, 'drone_key', 'C',
        'sequence', jsonb_build_array('6'), 'auto_play', true,
        'replay_allowed', true, 'pause_before_options_ms', 1500,
        'timbre', 'sine', 'tempo', '80'
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'La has a bittersweet warmth — a whole step above Sol, gentle but with longing.', 'show_answer', true, 'play_confirmation', true),
        'incorrect', jsonb_build_object('text', 'La sits just above Sol. Where Sol is strong and open, La is warm and wistful.', 'show_answer', true, 'play_correct', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', '6', 'correct_degree', 6),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', '1', 'label', 'Do (1)', 'degree', 1),
          jsonb_build_object('id', '3', 'label', 'Mi (3)', 'degree', 3),
          jsonb_build_object('id', '5', 'label', 'Sol (5)', 'degree', 5),
          jsonb_build_object('id', '6', 'label', 'La (6)', 'degree', 6)
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
  -- Lesson 3: The Pentatonic Family
  -- drone_key: C
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, drone_key, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'The Pentatonic Family',
    'All five pentatonic degrees together — Do, Re, Mi, Sol, La. No half steps, no friction. Practice identifying each one.',
    v_module_id, v_et_track_id, 3, 'C',
    ARRAY['et3_penta_id', 'et3_penta_feeling', 'et3_penta_count']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "The Complete Pentatonic",
        "instructions": "Listen to all five degrees ascending: Do, Re, Mi, Sol, La. Then descending: La, Sol, Mi, Re, Do. This is the pentatonic scale — five notes with no half steps. It appears in folk music, blues, rock, and traditional music worldwide.",
        "audio_degrees": [1, 2, 3, 5, 6],
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Why Five Notes?",
        "instructions": "Pentatonic means five tones. By leaving out degrees 4 and 7, the scale avoids half steps entirely. No half steps means no strong dissonance — every note sounds good with every other note. This is why the pentatonic scale is the basis for improvisation in so many genres.",
        "show_degree_circle": true,
        "highlight_degree": 1
      },
      {
        "type": "interactive",
        "title": "Pentatonic Explorer",
        "instructions": "Tap all five degrees on the circle. Try different patterns — ascending, descending, skipping around. Notice how nothing clashes. Every combination sounds natural.",
        "interactive_type": "degree_circle_explore",
        "config": {
          "enabled_degrees": [1, 2, 3, 5, 6],
          "show_labels": true,
          "show_feeling_states": true,
          "allow_octave_change": true
        },
        "min_interactions": 8
      },
      {
        "type": "guided_practice",
        "title": "Pentatonic ID Round 1",
        "instructions": "You will hear one of the five pentatonic degrees. Identify it. Remember: Do is home, Re steps, Mi is warm, Sol is strong, La is bittersweet.",
        "practice_type": "degree",
        "audio_degrees": [1, 2, 3, 5, 6],
        "options": [1, 2, 3, 5, 6],
        "correct_answer": 2,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      },
      {
        "type": "guided_practice",
        "title": "Pentatonic ID Round 2",
        "instructions": "Again — which degree? Trust the character of each note. Your ear is building a vocabulary.",
        "practice_type": "degree",
        "audio_degrees": [1, 2, 3, 5, 6],
        "options": [1, 2, 3, 5, 6],
        "correct_answer": 6,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      },
      {
        "type": "guided_practice",
        "title": "Pentatonic ID Round 3",
        "instructions": "One more. Each time you identify a degree correctly, the connection between sound and name grows stronger.",
        "practice_type": "degree",
        "audio_degrees": [1, 2, 3, 5, 6],
        "options": [1, 2, 3, 5, 6],
        "correct_answer": 3,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    -- Card 3: et3_penta_id (parametric — random degree from pentatonic pool)
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, playback, feedback, parameters, is_parametric)
    VALUES (
      v_lesson_id,
      'et3_penta_id',
      'perceptual',
      'select_degree',
      'Listen to the note over the drone. Which pentatonic degree is it?',
      ARRAY['degree_1', 'degree_2', 'degree_3', 'degree_5', 'degree_6']::TEXT[],
      jsonb_build_object(
        'type', 'tone_js', 'drone', true, 'drone_key', 'C',
        'sequence', jsonb_build_array('1'), 'auto_play', true,
        'replay_allowed', true, 'pause_before_options_ms', 1500,
        'timbre', 'sine', 'tempo', '80'
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Five degrees, no half steps — the pentatonic family works together without friction.', 'show_answer', true, 'play_confirmation', true),
        'incorrect', jsonb_build_object('text', 'In the pentatonic scale, each degree has a distinct character. Let the drone be your anchor.', 'show_answer', true, 'play_correct', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', '1', 'correct_degree', 1),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', '1', 'label', 'Do (1)', 'degree', 1),
          jsonb_build_object('id', '2', 'label', 'Re (2)', 'degree', 2),
          jsonb_build_object('id', '3', 'label', 'Mi (3)', 'degree', 3),
          jsonb_build_object('id', '5', 'label', 'Sol (5)', 'degree', 5),
          jsonb_build_object('id', '6', 'label', 'La (6)', 'degree', 6)
        )
      ),
      true
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      radar_dimensions = EXCLUDED.radar_dimensions,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters,
      is_parametric = EXCLUDED.is_parametric;

    -- Card 4: et3_penta_feeling (declarative)
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, playback, feedback, parameters)
    VALUES (
      v_lesson_id,
      'et3_penta_feeling',
      'declarative',
      'select_one',
      'Which word best describes degree 2 (Re)?',
      ARRAY['degree_2']::TEXT[],
      NULL,
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Re is restless — always stepping, never settling. It wants to move to Do or Mi.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'Re sits between Do and Mi. Unlike the stable triad degrees, it always feels like it is going somewhere.', 'show_answer', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Stable'),
          jsonb_build_object('id', 'b', 'label', 'Restless/moving'),
          jsonb_build_object('id', 'c', 'label', 'Bright'),
          jsonb_build_object('id', 'd', 'label', 'Dark')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      radar_dimensions = EXCLUDED.radar_dimensions,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;

    -- Card 5: et3_penta_count (declarative)
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, playback, feedback, parameters)
    VALUES (
      v_lesson_id,
      'et3_penta_count',
      'declarative',
      'select_one',
      'How many notes in a pentatonic scale?',
      ARRAY['degree_1']::TEXT[],
      NULL,
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Penta means five. Five notes, no half steps, found in music across every culture.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'Pentatonic = penta (five) + tonic (tone). The scale uses degrees 1, 2, 3, 5, 6.', 'show_answer', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', '4'),
          jsonb_build_object('id', 'b', 'label', '5'),
          jsonb_build_object('id', 'c', 'label', '6'),
          jsonb_build_object('id', 'd', 'label', '7')
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
  -- Lesson 4: Pentatonic in G
  -- drone_key: G (tests transfer)
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, drone_key, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Pentatonic in G',
    'The pentatonic relationships transfer to every key. Prove it by identifying all five degrees over a new drone.',
    v_module_id, v_et_track_id, 4, 'G',
    ARRAY[]::TEXT[],
    ARRAY['drill_et3_penta_recognition']::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "New Drone, Same Family",
        "instructions": "The drone has changed to G. But the five pentatonic degrees feel the same: Do is home, Re steps, Mi is warm, Sol is strong, La is bittersweet. The pitch level shifted. The relationships did not.",
        "audio_degrees": [1, 2, 3, 5, 6],
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Key Independence",
        "instructions": "This is the core principle of ear training: you are learning to hear relationships, not pitches. Once you know what Re feels like relative to the drone, you can find it in any key. The pentatonic framework travels with you.",
        "show_degree_circle": true,
        "highlight_degree": 2
      },
      {
        "type": "interactive",
        "title": "Explore in G",
        "instructions": "Tap the degree circle in this new key. Confirm for yourself — each degree feels the same as it did in C. Your ear learned the pattern, not the frequency.",
        "interactive_type": "degree_circle_explore",
        "config": {
          "enabled_degrees": [1, 2, 3, 5, 6],
          "show_labels": true,
          "allow_octave_change": true
        },
        "min_interactions": 6
      },
      {
        "type": "guided_practice",
        "title": "Pentatonic ID in G — Round 1",
        "instructions": "Identify the degree over the new drone. If you learned the feelings in C, they work here too.",
        "practice_type": "degree",
        "audio_degrees": [1, 2, 3, 5, 6],
        "options": [1, 2, 3, 5, 6],
        "correct_answer": 6,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      },
      {
        "type": "guided_practice",
        "title": "Pentatonic ID in G — Round 2",
        "instructions": "Again — the key changed, but your ear training carries over. Trust it.",
        "practice_type": "degree",
        "audio_degrees": [1, 2, 3, 5, 6],
        "options": [1, 2, 3, 5, 6],
        "correct_answer": 2,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      },
      {
        "type": "guided_practice",
        "title": "Pentatonic ID in G — Round 3",
        "instructions": "Last round. You now hear five degrees in two keys. The pentatonic vocabulary is yours.",
        "practice_type": "degree",
        "audio_degrees": [1, 2, 3, 5, 6],
        "options": [1, 2, 3, 5, 6],
        "correct_answer": 5,
        "reveal_delay_ms": 4500,
        "show_resolution": true
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING;

  -- =============================================
  -- Drill: Pentatonic Recognition
  -- =============================================
  INSERT INTO drills (track_id, slug, title, description, drill_type, config, display_order)
  VALUES (
    v_et_track_id,
    'drill_et3_penta_recognition',
    'Pentatonic Recognition',
    'Identify all five pentatonic degrees — Do, Re, Mi, Sol, La — over a drone in various keys. Builds speed and confidence with the full pentatonic vocabulary.',
    'degree_id',
    jsonb_build_object(
      'degrees', jsonb_build_array(1, 2, 3, 5, 6),
      'keys', jsonb_build_array('C', 'G', 'F'),
      'tempo_range', jsonb_build_array(70, 100),
      'drone', true
    ),
    2
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'ET-3 Pentatonic module seeded (4 lessons, 5 card templates, 1 drill)';
END $$;
