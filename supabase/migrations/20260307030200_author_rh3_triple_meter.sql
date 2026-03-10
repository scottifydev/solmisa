-- SCO-307: RH-3 Simple Triple Meter module (rhythm track, module_order=3)
-- 3 lessons, 4 card templates (1 tap_rhythm + 3 select_one), 1 drill
-- Teaches triple meter (3/4), waltz feel, duple vs triple discrimination,
-- ta-ki-da Takadimi for triple subdivision.

DO $$
DECLARE
  v_rh_track_id UUID;
  v_module_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_rh_track_id FROM skill_tracks WHERE slug = 'rhythm';
  IF v_rh_track_id IS NULL THEN
    RAISE NOTICE 'rhythm track not found — skipping RH-3';
    RETURN;
  END IF;

  -- =============================================
  -- Module: Simple Triple Meter
  -- =============================================
  INSERT INTO modules (title, description, module_order, track_id)
  VALUES (
    'Simple Triple Meter',
    'Feel triple grouping in 3/4, distinguish duple from triple meter, and learn the Takadimi syllable set for triple subdivision: ta-ki-da.',
    3,
    v_rh_track_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM modules WHERE track_id = v_rh_track_id AND module_order = 3;
  END IF;

  IF v_module_id IS NULL THEN
    RAISE NOTICE 'Could not create or find RH-3 module — skipping';
    RETURN;
  END IF;

  -- =============================================
  -- Lesson 1: Feeling Three — The Waltz
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Feeling Three: The Waltz',
    'Triple meter groups beats in threes. Feel the waltz pulse — strong, light, light — and tap along in 3/4.',
    v_module_id, v_rh_track_id, 1,
    ARRAY['rh3_triple_tap', 'rh3_beats_per_measure']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "The Waltz Pulse",
        "instructions": "Listen to this 3/4 pattern. Feel how the beats group in threes: ONE-two-three, ONE-two-three. The first beat is strong, the other two are light. This is the waltz — music that sways instead of marches.",
        "audio_degrees": [],
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "Tap in 3/4",
        "instructions": "Tap along with the waltz pulse. Three beats per group. Let beat 1 carry more weight.",
        "mode": "tap_along",
        "tempo": 80,
        "time_signature": [3, 4],
        "pattern": [
          {"beat": 1, "duration": 1},
          {"beat": 2, "duration": 1},
          {"beat": 3, "duration": 1}
        ]
      },
      {
        "type": "theory_teach",
        "title": "Triple Meter",
        "content": "Triple meter groups beats in threes. In 3/4 time, beat 1 is strong, beats 2 and 3 are weak. The top number (3) tells you how many beats per measure. The bottom number (4) tells you the quarter note gets one beat.",
        "show_degree_circle": false
      },
      {
        "type": "guided_practice",
        "title": "Beats Per Measure",
        "instructions": "How many beats per measure in 3/4 time?",
        "practice_type": "rhythm",
        "audio_degrees": [],
        "options": ["2", "3", "4", "6"],
        "correct_answer": "3",
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
      'rh3_triple_tap',
      'rhythm',
      'tap_rhythm',
      'Tap the waltz pulse.',
      ARRAY['rhythm_accuracy']::TEXT[],
      jsonb_build_object(
        'type', 'metronome',
        'pattern', 'quarter quarter quarter quarter quarter quarter',
        'tempo', 80,
        'time_signature', jsonb_build_array(3, 4)
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Steady triple pulse. You can feel the waltz.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Three beats per measure. Let beat 1 anchor you, then let 2 and 3 follow naturally.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('tempo', 80, 'beats', 6, 'tolerance_ms', 150)
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;

    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, feedback, parameters)
    VALUES (
      v_lesson_id,
      'rh3_beats_per_measure',
      'declarative',
      'select_one',
      'How many beats per measure in 3/4 time?',
      ARRAY['meter_id']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Three beats per measure. The top number tells you the grouping.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'The top number of a time signature tells you how many beats per measure. 3/4 = three.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', '2'),
          jsonb_build_object('id', 'b', 'label', '3'),
          jsonb_build_object('id', 'c', 'label', '4'),
          jsonb_build_object('id', 'd', 'label', '6')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 2: Duple vs Triple
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Duple vs Triple',
    'Your body knows the difference — duple feels like marching, triple feels like swaying. Learn to hear and name the distinction.',
    v_module_id, v_rh_track_id, 2,
    ARRAY['rh3_duple_vs_triple']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "Hear the Difference",
        "instructions": "First you will hear 4/4 — a marching pulse: ONE-two-THREE-four. Then 3/4 — a swaying pulse: ONE-two-three. Listen for how the grouping changes. The beats themselves stay even; the accent pattern shifts.",
        "audio_degrees": [],
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Marching vs Swaying",
        "content": "Your body knows the difference before your mind does. Duple meter (2/4, 4/4) feels like marching — left, right, left, right. Triple meter (3/4) feels like swaying or waltzing. The grouping is what changes, not the speed of the beats.",
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "Tap in 3/4",
        "instructions": "Tap along in 3/4. Feel the sway: ONE-two-three, ONE-two-three.",
        "mode": "echo",
        "tempo": 85,
        "time_signature": [3, 4],
        "pattern": [
          {"beat": 1, "duration": 1},
          {"beat": 2, "duration": 1},
          {"beat": 3, "duration": 1}
        ]
      },
      {
        "type": "guided_practice",
        "title": "Duple or Triple?",
        "instructions": "A piece feels like it sways in groups of three. Is it in duple or triple meter?",
        "practice_type": "rhythm",
        "audio_degrees": [],
        "options": ["Duple", "Triple"],
        "correct_answer": "Triple",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      },
      {
        "type": "guided_practice",
        "title": "Duple or Triple Again?",
        "instructions": "A march has beats grouped in fours: ONE-two-THREE-four. Is this duple or triple meter?",
        "practice_type": "rhythm",
        "audio_degrees": [],
        "options": ["Duple", "Triple"],
        "correct_answer": "Duple",
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
      'rh3_duple_vs_triple',
      'declarative',
      'select_one',
      'Is this meter duple or triple?',
      ARRAY['meter_id']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Groups of three = triple meter. The waltz sways in threes.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Listen for the grouping. Twos and fours = duple. Threes = triple. Feel whether you want to march or sway.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Duple'),
          jsonb_build_object('id', 'b', 'label', 'Triple')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 3: Triple Subdivision — Ta-ki-da
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Triple Subdivision: Ta-ki-da',
    'When each beat divides into three equal parts, Takadimi names them ta-ki-da. This is the foundation for compound meter.',
    v_module_id, v_rh_track_id, 3,
    ARRAY['rh3_takida_parts']::TEXT[],
    ARRAY['drill_rh3_triple_pulse']::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "Hearing Triplets",
        "instructions": "Listen to the metronome, then hear each beat divide into three equal parts: ta-ki-da, ta-ki-da. The pulse stays the same — the notes move three times as fast within each beat.",
        "audio_degrees": [],
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Ta-ki-da",
        "content": "When a beat splits into three equal parts: ta (the beat), ki (first third), da (second third). In Takadimi, duple division is ta-di (two parts), triple division is ta-ki-da (three parts). This distinction carries through all of rhythm — simple vs compound meter comes down to whether the beat naturally divides in two or three.",
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "Tap Ta-ki-da",
        "instructions": "Tap three times per beat: ta-ki-da, ta-ki-da. Keep all three parts even. The metronome marks ta — ki and da fall between.",
        "mode": "echo",
        "tempo": 70,
        "time_signature": [3, 4],
        "pattern": [
          {"beat": 1, "duration": 0.333},
          {"beat": 1.333, "duration": 0.333},
          {"beat": 1.667, "duration": 0.333},
          {"beat": 2, "duration": 0.333},
          {"beat": 2.333, "duration": 0.333},
          {"beat": 2.667, "duration": 0.333},
          {"beat": 3, "duration": 0.333},
          {"beat": 3.333, "duration": 0.333},
          {"beat": 3.667, "duration": 0.333}
        ]
      },
      {
        "type": "guided_practice",
        "title": "Parts Per Beat",
        "instructions": "Ta-ki-da splits each beat into how many equal parts?",
        "practice_type": "rhythm",
        "audio_degrees": [],
        "options": ["2", "3", "4"],
        "correct_answer": "3",
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
      'rh3_takida_parts',
      'declarative',
      'select_one',
      'Ta-ki-da divides each beat into how many parts?',
      ARRAY['rhythm_accuracy']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Three equal parts: ta (the beat), ki (first third), da (second third).', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Ta-ki-da = three syllables = three equal parts per beat. Compare with ta-di which divides into two.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', '2'),
          jsonb_build_object('id', 'b', 'label', '3'),
          jsonb_build_object('id', 'c', 'label', '4')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Drill: Triple Pulse Tap
  -- =============================================
  INSERT INTO drills (track_id, slug, title, description, drill_type, config, display_order)
  VALUES (
    v_rh_track_id,
    'drill_rh3_triple_pulse',
    'Triple Pulse Tap',
    'Tap quarter and triplet patterns in 3/4 meter at various tempos.',
    'rhythm_tap',
    jsonb_build_object(
      'tempo_range', jsonb_build_array(75, 90),
      'patterns', jsonb_build_array('quarter', 'triplet'),
      'time_signature', jsonb_build_array(3, 4),
      'randomize', true
    ),
    4
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'RH-3 Simple Triple Meter module seeded (3 lessons, 4 card templates, 1 drill)';
END $$;
