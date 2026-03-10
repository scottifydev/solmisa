-- SCO-308: SR-3 Melodic Reading module (sight_reading track, module_order=3)
-- 3 lessons, 4 card templates (3 select_one + 1 tap_rhythm), 1 drill
-- Combines pitch + rhythm reading: stepwise motion, steps vs skips,
-- short melodic phrases in treble clef.

DO $$
DECLARE
  v_sr_track_id UUID;
  v_module_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_sr_track_id FROM skill_tracks WHERE slug = 'sight_reading';
  IF v_sr_track_id IS NULL THEN
    RAISE NOTICE 'sight_reading track not found — skipping SR-3';
    RETURN;
  END IF;

  -- =============================================
  -- Module: Melodic Reading
  -- =============================================
  INSERT INTO modules (title, description, module_order, track_id)
  VALUES (
    'Melodic Reading',
    'Combine pitch and rhythm reading. Identify stepwise motion vs skips on the staff, then read short melodic phrases.',
    3,
    v_sr_track_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM modules WHERE track_id = v_sr_track_id AND module_order = 3;
  END IF;

  IF v_module_id IS NULL THEN
    RAISE NOTICE 'Could not create or find SR-3 module — skipping';
    RETURN;
  END IF;

  -- =============================================
  -- Lesson 1: Stepwise Motion — Reading Up and Down
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Stepwise Motion: Reading Up and Down',
    'Most melodies move by step — from line to space or space to line. Learn to read melodic direction on the staff.',
    v_module_id, v_sr_track_id, 1,
    ARRAY['sr3_direction', 'sr3_note_after']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "Steps on the Staff",
        "content": "Most melodies move by step — from a line to the next space, or from a space to the next line. When notes move stepwise, the melody flows smoothly. On the staff, a step always moves from line to space or space to line — never line to line or space to space.",
        "show_degree_circle": false
      },
      {
        "type": "interactive",
        "title": "See Stepwise Motion",
        "instructions": "Tap the notes on the staff to hear the melody. Notice how each note moves to its neighbor — line to space, space to line. This smooth, connected motion is called stepwise or conjunct motion.",
        "interactive_type": "keyboard_explore",
        "config": {
          "mode": "staff_explore",
          "clef": "treble",
          "highlight_steps": true,
          "notes": ["E4", "F4", "G4", "A4", "B4"]
        },
        "min_interactions": 5
      },
      {
        "type": "guided_practice",
        "title": "Which Direction?",
        "instructions": "The notes go C - D - E - F. Is this melody moving up or down?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["Up", "Down", "Same"],
        "correct_answer": "Up",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      },
      {
        "type": "guided_practice",
        "title": "Which Direction Again?",
        "instructions": "The notes go G - F - E - D. Is this melody moving up or down?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["Up", "Down", "Same"],
        "correct_answer": "Down",
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
      'sr3_direction',
      'declarative',
      'select_one',
      'Is this melody moving up, down, or staying the same?',
      ARRAY['sight_reading']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Watch the direction on the staff — notes moving higher go up, lower go down.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'On the staff, higher position = higher pitch = ascending. Lower position = descending.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Up'),
          jsonb_build_object('id', 'b', 'label', 'Down'),
          jsonb_build_object('id', 'c', 'label', 'Same')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;

    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, feedback, parameters)
    VALUES (
      v_lesson_id,
      'sr3_note_after',
      'declarative',
      'select_one',
      'If you are on E (first line), what note is one step up?',
      ARRAY['sight_reading']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'E is on the first line. One step up lands in the first space: F.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'A step moves from line to space or space to line. From E (first line), the next space up is F.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'D'),
          jsonb_build_object('id', 'b', 'label', 'F'),
          jsonb_build_object('id', 'c', 'label', 'G'),
          jsonb_build_object('id', 'd', 'label', 'A')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 2: Small Leaps — Skipping Notes
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Small Leaps: Skipping Notes',
    'Line to line or space to space is a skip — an interval of a third. Learn to distinguish steps from skips on the staff.',
    v_module_id, v_sr_track_id, 2,
    ARRAY['sr3_step_or_skip']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "Steps vs Skips",
        "content": "A step moves from line to space or space to line — one letter name apart. A skip jumps from line to line or space to space — two letter names apart, an interval of a third. Skips are wider than steps but narrower than large leaps. Recognizing this difference instantly is essential for fluent reading.",
        "show_degree_circle": false
      },
      {
        "type": "interactive",
        "title": "Steps and Skips Side by Side",
        "instructions": "Tap pairs of notes on the staff. Steps are highlighted in one color, skips in another. Notice how steps always alternate line-space while skips stay on the same type (line-line or space-space).",
        "interactive_type": "keyboard_explore",
        "config": {
          "mode": "staff_explore",
          "clef": "treble",
          "highlight_steps": true,
          "highlight_skips": true,
          "notes": ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]
        },
        "min_interactions": 6
      },
      {
        "type": "guided_practice",
        "title": "Step or Skip?",
        "instructions": "E (first line) to G (second line). Is this a step or a skip?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["Step", "Skip", "Leap"],
        "correct_answer": "Skip",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      },
      {
        "type": "guided_practice",
        "title": "Step or Skip Again?",
        "instructions": "F (first space) to G (second line). Is this a step or a skip?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["Step", "Skip", "Leap"],
        "correct_answer": "Step",
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
      'sr3_step_or_skip',
      'declarative',
      'select_one',
      'Is the interval between these two notes a step or a skip?',
      ARRAY['sight_reading']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Line to line or space to space = skip (a third). Line to space or space to line = step (a second).', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Check: do both notes sit on lines, or both on spaces? That is a skip. If one is on a line and the other on a space, that is a step.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Step'),
          jsonb_build_object('id', 'b', 'label', 'Skip'),
          jsonb_build_object('id', 'c', 'label', 'Leap')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 3: Reading a Short Melody
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Reading a Short Melody',
    'Put pitch and rhythm together. Read and tap short stepwise melodies in C major, treble clef.',
    v_module_id, v_sr_track_id, 3,
    ARRAY['sr3_melody_read']::TEXT[],
    ARRAY['drill_sr3_melodic_reading']::TEXT[],
    '[
      {
        "type": "rhythm",
        "title": "Four-Bar Melody",
        "instructions": "Read this stepwise melody in C major. Tap along as you follow the notes on the staff. Focus on connecting pitch direction with rhythm.",
        "mode": "tap_along",
        "tempo": 65,
        "time_signature": [4, 4],
        "pattern": [
          {"beat": 1, "duration": 1},
          {"beat": 2, "duration": 1},
          {"beat": 3, "duration": 1},
          {"beat": 4, "duration": 1},
          {"beat": 5, "duration": 1},
          {"beat": 6, "duration": 1},
          {"beat": 7, "duration": 2},
          {"beat": 9, "duration": 1},
          {"beat": 10, "duration": 1},
          {"beat": 11, "duration": 1},
          {"beat": 12, "duration": 1},
          {"beat": 13, "duration": 4}
        ]
      },
      {
        "type": "theory_teach",
        "title": "Eyes Ahead",
        "content": "Reading ahead is the key. While you play the current note, your eyes should already be on the next one. With melodic reading, you are tracking both pitch and rhythm simultaneously. Start slow — speed comes from comfort, not effort.",
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "New Melody",
        "instructions": "A new melody at a slightly faster tempo. Use the same approach: eyes ahead, steady pulse, connect pitch with rhythm.",
        "mode": "echo",
        "tempo": 70,
        "time_signature": [4, 4],
        "pattern": [
          {"beat": 1, "duration": 2},
          {"beat": 3, "duration": 1},
          {"beat": 4, "duration": 1},
          {"beat": 5, "duration": 1},
          {"beat": 6, "duration": 1},
          {"beat": 7, "duration": 1},
          {"beat": 8, "duration": 1},
          {"beat": 9, "duration": 2},
          {"beat": 11, "duration": 2},
          {"beat": 13, "duration": 4}
        ]
      },
      {
        "type": "guided_practice",
        "title": "What Comes Next?",
        "instructions": "A melody ascends stepwise: C - D - E - F. What note comes on the next beat?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["D", "E", "F", "G"],
        "correct_answer": "G",
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
      'sr3_melody_read',
      'rhythm',
      'tap_rhythm',
      'Tap this melody as you read.',
      ARRAY['sight_reading', 'rhythm_accuracy']::TEXT[],
      jsonb_build_object(
        'type', 'metronome',
        'pattern', 'quarter quarter quarter quarter quarter quarter quarter quarter',
        'tempo', 68,
        'time_signature', jsonb_build_array(4, 4)
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Pitch and rhythm together. Your melodic reading is developing.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Take it slower. Track the pitch direction while keeping steady time. Both skills work together.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('tempo', 68, 'beats', 8, 'tolerance_ms', 150)
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Drill: Melodic Reading
  -- =============================================
  INSERT INTO drills (track_id, slug, title, description, drill_type, config, display_order)
  VALUES (
    v_sr_track_id,
    'drill_sr3_melodic_reading',
    'Melodic Reading',
    'Read and tap stepwise melodies in C and G major at various tempos.',
    'rhythm_tap',
    jsonb_build_object(
      'tempo_range', jsonb_build_array(65, 75),
      'keys', jsonb_build_array('C', 'G'),
      'motion', 'stepwise',
      'clef', 'treble',
      'measures', jsonb_build_array(2, 3, 4),
      'randomize', true
    ),
    4
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'SR-3 Melodic Reading module seeded (3 lessons, 4 card templates, 1 drill)';
END $$;
