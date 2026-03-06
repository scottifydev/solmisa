-- SCO-303: RH-2 Simple Duple Meter module (rhythm track, module_order=2)
-- 4 lessons, 4 card templates (2 tap_rhythm + 2 select_one), 1 drill
-- Teaches duple grouping, strong/weak beats, Takadimi syllables (ta, ta-di).

DO $$
DECLARE
  v_rh_track_id UUID;
  v_module_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_rh_track_id FROM skill_tracks WHERE slug = 'rhythm';
  IF v_rh_track_id IS NULL THEN
    RAISE NOTICE 'rhythm track not found — skipping RH-2';
    RETURN;
  END IF;

  -- =============================================
  -- Module: Simple Duple Meter
  -- =============================================
  INSERT INTO modules (title, description, module_order, track_id)
  VALUES (
    'Simple Duple Meter',
    'Feel duple grouping in 2/4 and 4/4, identify strong and weak beats, and begin using Takadimi syllables.',
    2,
    v_rh_track_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM modules WHERE track_id = v_rh_track_id AND module_order = 2;
  END IF;

  IF v_module_id IS NULL THEN
    RAISE NOTICE 'Could not create or find RH-2 module — skipping';
    RETURN;
  END IF;

  -- =============================================
  -- Lesson 1: Feeling Two and Four
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Feeling Two and Four',
    'Experience how beats group into twos and fours. Tap along to feel duple meter in your body.',
    v_module_id, v_rh_track_id, 1,
    ARRAY['rh2_duple_tap']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "rhythm",
        "title": "Tap Along in 4/4",
        "instructions": "Tap along with the metronome. Feel four beats per group. Let the first beat be a little stronger.",
        "mode": "tap_along",
        "tempo": 90,
        "time_signature": [4, 4],
        "pattern": [
          {"beat": 1, "duration": 1},
          {"beat": 2, "duration": 1},
          {"beat": 3, "duration": 1},
          {"beat": 4, "duration": 1}
        ]
      },
      {
        "type": "theory_teach",
        "title": "Four Beats Per Measure",
        "content": "You just felt four beats per measure. In 4/4 time, beat 1 is the strongest — it anchors each group. Beat 3 has a secondary accent. Beats 2 and 4 are lighter. This pattern of strong and weak is what gives music its forward motion.",
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "Try 2/4",
        "instructions": "Now tap in 2/4 — only two beats per group. Feel the strong-weak, strong-weak pattern. It is simpler but more driving.",
        "mode": "tap_along",
        "tempo": 90,
        "time_signature": [2, 4],
        "pattern": [
          {"beat": 1, "duration": 1},
          {"beat": 2, "duration": 1}
        ]
      },
      {
        "type": "guided_practice",
        "title": "Beats Per Measure",
        "instructions": "How many beats per measure in 4/4 time?",
        "practice_type": "rhythm",
        "audio_degrees": [],
        "options": ["2", "3", "4", "6"],
        "correct_answer": "4",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, playback, feedback, parameters)
    VALUES (
      v_lesson_id,
      'rh2_duple_tap',
      'rhythm',
      'tap_rhythm',
      'Tap along with the beat in 4/4 time.',
      ARRAY['rhythm_accuracy']::TEXT[],
      jsonb_build_object(
        'type', 'metronome',
        'pattern', 'quarter quarter quarter quarter quarter quarter quarter quarter',
        'tempo', 90,
        'time_signature', jsonb_build_array(4, 4)
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Steady pulse. Your internal clock is solid.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Focus on feeling the beat in your body before tapping. Let the metronome guide you.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('tempo', 90, 'beats', 8, 'tolerance_ms', 150)
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 2: Strong and Weak
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Strong and Weak',
    'Not all beats carry equal weight. Learn to hear and feel the hierarchy of strong and weak beats.',
    v_module_id, v_rh_track_id, 2,
    ARRAY['rh2_strong_beat']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "Accented Beats",
        "instructions": "Listen carefully. The first beat of each group sounds stronger — it has more weight. This is the downbeat. It anchors everything around it. The other beats are lighter, carrying the music forward to the next downbeat.",
        "audio_degrees": [],
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "The Beat Hierarchy",
        "content": "Beat 1 is the strongest — the downbeat. In 4/4: beat 1 = strong, beat 2 = weak, beat 3 = medium, beat 4 = weak. In 2/4: beat 1 = strong, beat 2 = weak. This hierarchy is what your body naturally responds to when you nod your head or tap your foot.",
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "Emphasize Beat 1",
        "instructions": "Tap along, but make beat 1 stronger than the others. Feel the weight land on the downbeat.",
        "mode": "tap_along",
        "tempo": 85,
        "time_signature": [4, 4],
        "pattern": [
          {"beat": 1, "duration": 1},
          {"beat": 2, "duration": 1},
          {"beat": 3, "duration": 1},
          {"beat": 4, "duration": 1}
        ]
      },
      {
        "type": "guided_practice",
        "title": "Strongest Beat",
        "instructions": "Which beat is the strongest in 4/4 time?",
        "practice_type": "rhythm",
        "audio_degrees": [],
        "options": ["Beat 1", "Beat 2", "Beat 3", "Beat 4"],
        "correct_answer": "Beat 1",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, feedback, parameters)
    VALUES (
      v_lesson_id,
      'rh2_strong_beat',
      'declarative',
      'select_one',
      'Which beat is the strongest in 4/4 time?',
      ARRAY['meter_id']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Beat 1 is the downbeat — the strongest beat in every measure.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'The downbeat (beat 1) always carries the most weight. It is the anchor of the measure.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Beat 1'),
          jsonb_build_object('id', 'b', 'label', 'Beat 2'),
          jsonb_build_object('id', 'c', 'label', 'Beat 3'),
          jsonb_build_object('id', 'd', 'label', 'Beat 4')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 3: Naming the Beat — Ta
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Naming the Beat: Ta',
    'Takadimi gives every rhythmic position a name. The beat onset is always "ta" — your first rhythm syllable.',
    v_module_id, v_rh_track_id, 3,
    ARRAY['rh2_takadimi_beat']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "Hearing Ta",
        "instructions": "Listen to the metronome. On each beat, you hear the syllable \"ta.\" Ta marks the beat onset — the moment the pulse lands. Say it along with the click: ta, ta, ta, ta.",
        "audio_degrees": [],
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Takadimi System",
        "content": "Takadimi gives every beat position a syllable name. The beat onset is always \"ta\" — no matter the meter, no matter the tempo. This is like solmisation for rhythm: a consistent set of syllables that map to rhythmic positions, making it easier to speak, think, and internalize patterns.",
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "Tap and Say Ta",
        "instructions": "Tap on each beat and say \"ta\" out loud. Let the word and the tap happen together. This builds the connection between your voice, your body, and your internal pulse.",
        "mode": "echo",
        "tempo": 80,
        "time_signature": [4, 4],
        "pattern": [
          {"beat": 1, "duration": 1},
          {"beat": 2, "duration": 1},
          {"beat": 3, "duration": 1},
          {"beat": 4, "duration": 1}
        ]
      },
      {
        "type": "guided_practice",
        "title": "Beat Syllable",
        "instructions": "What Takadimi syllable falls on the beat onset?",
        "practice_type": "rhythm",
        "audio_degrees": [],
        "options": ["ta", "di", "ka", "mi"],
        "correct_answer": "ta",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, feedback, parameters)
    VALUES (
      v_lesson_id,
      'rh2_takadimi_beat',
      'declarative',
      'select_one',
      'What Takadimi syllable falls on the beat onset?',
      ARRAY['rhythm_accuracy']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Ta always marks the beat onset — the moment the pulse lands.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'In Takadimi, \"ta\" is always the beat. The other syllables name the subdivisions.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'ta'),
          jsonb_build_object('id', 'b', 'label', 'di'),
          jsonb_build_object('id', 'c', 'label', 'ka'),
          jsonb_build_object('id', 'd', 'label', 'mi')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 4: Dividing the Beat — Ta-di
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Dividing the Beat: Ta-di',
    'When you split each beat in half, the second part is "di." Learn to feel and tap the eighth-note subdivision.',
    v_module_id, v_rh_track_id, 4,
    ARRAY['rh2_eighth_tap']::TEXT[],
    ARRAY['drill_rh2_duple_pulse']::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "Hearing Ta-di",
        "instructions": "Listen to the metronome, then hear eighth notes layered on top. Each beat now has two equal parts: \"ta-di, ta-di, ta-di, ta-di.\" The pulse stays the same — the notes move twice as fast within it.",
        "audio_degrees": [],
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "The Division",
        "content": "When a beat splits into two equal parts, the first half is \"ta\" (the beat) and the second half is \"di\" (the offbeat). Together they make eighth notes in simple meter: ta-di ta-di ta-di ta-di. Your foot taps on \"ta,\" and \"di\" falls between taps.",
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "Tap Eighth Notes",
        "instructions": "Tap twice per beat — ta-di, ta-di. Keep the metronome in your ear. The first tap of each pair aligns with the click.",
        "mode": "echo",
        "tempo": 75,
        "time_signature": [4, 4],
        "pattern": [
          {"beat": 1, "duration": 0.5},
          {"beat": 1.5, "duration": 0.5},
          {"beat": 2, "duration": 0.5},
          {"beat": 2.5, "duration": 0.5},
          {"beat": 3, "duration": 0.5},
          {"beat": 3.5, "duration": 0.5},
          {"beat": 4, "duration": 0.5},
          {"beat": 4.5, "duration": 0.5}
        ]
      },
      {
        "type": "guided_practice",
        "title": "How Many Parts?",
        "instructions": "Ta-di splits each beat into how many equal parts?",
        "practice_type": "rhythm",
        "audio_degrees": [],
        "options": ["2", "3", "4", "6"],
        "correct_answer": "2",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, playback, feedback, parameters)
    VALUES (
      v_lesson_id,
      'rh2_eighth_tap',
      'rhythm',
      'tap_rhythm',
      'Tap the eighth-note subdivision: ta-di on each beat.',
      ARRAY['rhythm_accuracy']::TEXT[],
      jsonb_build_object(
        'type', 'metronome',
        'pattern', 'eighth eighth eighth eighth eighth eighth eighth eighth',
        'tempo', 75,
        'time_signature', jsonb_build_array(4, 4)
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Even subdivisions. Your sense of division is developing well.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Think ta-di, ta-di. Each half of the beat should be equal. Let the metronome anchor you.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('tempo', 75, 'beats', 8, 'tolerance_ms', 120)
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Drill: Duple Pulse
  -- =============================================
  INSERT INTO drills (track_id, slug, title, description, drill_type, config, display_order)
  VALUES (
    v_rh_track_id,
    'drill_rh2_duple_pulse',
    'Duple Pulse Tap',
    'Tap quarter and eighth note patterns in duple meter at various tempos.',
    'rhythm_tap',
    jsonb_build_object(
      'tempo_range', jsonb_build_array(80, 100),
      'patterns', jsonb_build_array('quarter', 'eighth'),
      'time_signature', jsonb_build_array(4, 4),
      'randomize', true
    ),
    3
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'RH-2 Simple Duple Meter module seeded (4 lessons, 4 card templates, 1 drill)';
END $$;
