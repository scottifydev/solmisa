-- SCO-304: SR-2 Rhythm Reading module (sight_reading track, module_order=2)
-- 3 lessons, 4 card templates (2 select_one + 1 tap_rhythm + 1 select_one), 1 drill
-- Bridges theory of rhythm (TH-2) and embodied rhythm (RH) into actual reading.

DO $$
DECLARE
  v_sr_track_id UUID;
  v_module_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_sr_track_id FROM skill_tracks WHERE slug = 'sight_reading';
  IF v_sr_track_id IS NULL THEN
    RAISE NOTICE 'sight_reading track not found — skipping SR-2';
    RETURN;
  END IF;

  -- =============================================
  -- Module: Rhythm Reading
  -- =============================================
  INSERT INTO modules (title, description, module_order, track_id)
  VALUES (
    'Rhythm Reading',
    'Connect what you see on the page with what you do with your hands. Read and tap rhythms using quarter, half, and whole notes.',
    2,
    v_sr_track_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM modules WHERE track_id = v_sr_track_id AND module_order = 2;
  END IF;

  IF v_module_id IS NULL THEN
    RAISE NOTICE 'Could not create or find SR-2 module — skipping';
    RETURN;
  END IF;

  -- =============================================
  -- Lesson 1: Reading Note Values
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Reading Note Values',
    'You have felt rhythms in your body. Now see what they look like on paper. Learn to identify note values by sight.',
    v_module_id, v_sr_track_id, 1,
    ARRAY['sr2_note_id_visual', 'sr2_measure_beats']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "From Feeling to Reading",
        "content": "You have felt rhythms in the Rhythm track. Now see what they look like. A filled notehead with a stem is a quarter note — one beat. An open notehead with a stem is a half note — two beats. An open oval alone is a whole note — four beats. A filled notehead with a stem and flag is an eighth note — half a beat.",
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Visual Identification",
        "content": "Quick identification guide: Is the notehead filled or open? Filled = quarter or shorter. Open = half or whole. Does it have a stem? No stem = whole note. Stem but open = half. Stem, filled, no flag = quarter. Flag or beam = eighth or shorter.",
        "show_degree_circle": false
      },
      {
        "type": "interactive",
        "title": "Tap to Hear",
        "instructions": "Tap each note on the rhythm staff to hear how long it lasts. Connect the visual shape with the duration you feel.",
        "interactive_type": "keyboard_explore",
        "config": {
          "mode": "rhythm_staff_explore",
          "note_types": ["quarter", "half", "whole", "eighth"],
          "show_labels_on_tap": true
        },
        "min_interactions": 5
      },
      {
        "type": "guided_practice",
        "title": "Identify the Half Note",
        "instructions": "How many beats does a half note get in 4/4 time?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["1", "2", "3", "4"],
        "correct_answer": "2",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      },
      {
        "type": "guided_practice",
        "title": "Identify the Whole Note",
        "instructions": "How many beats does a whole note get in 4/4 time?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["1", "2", "3", "4"],
        "correct_answer": "4",
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
      'sr2_note_id_visual',
      'declarative',
      'select_one',
      'What type of note is this? (Open notehead, with stem)',
      ARRAY['sight_reading']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'An open notehead with a stem is a half note — it lasts two beats.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Look at the notehead: open or filled? Check for a stem and flags. Open + stem = half note.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Quarter note'),
          jsonb_build_object('id', 'b', 'label', 'Half note'),
          jsonb_build_object('id', 'c', 'label', 'Whole note'),
          jsonb_build_object('id', 'd', 'label', 'Eighth note')
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
      'sr2_measure_beats',
      'declarative',
      'select_one',
      'This measure contains a half note and two quarter notes. How many total beats?',
      ARRAY['sight_reading']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Half note (2) + quarter (1) + quarter (1) = 4 beats. A complete measure in 4/4.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Add up each note value: half note = 2 beats, quarter note = 1 beat each.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', '3'),
          jsonb_build_object('id', 'b', 'label', '4'),
          jsonb_build_object('id', 'c', 'label', '5'),
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
  -- Lesson 2: Reading in Time
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Reading in Time',
    'Reading music means converting symbols to time. Practice tapping rhythms while reading notation.',
    v_module_id, v_sr_track_id, 2,
    ARRAY['sr2_rhythm_read_basic']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "See and Hear Together",
        "instructions": "Listen to this rhythm while watching the notation. A cursor tracks each note as it plays. Notice how the longer notes (half, whole) hold while the cursor waits, and shorter notes (quarter) pass quickly.",
        "audio_degrees": [],
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Reading Ahead",
        "content": "Reading music means your eyes scan ahead while your hands keep the beat. You do not wait to see the next note — you anticipate. This is a skill that develops with practice. Start slow and let your eyes lead your hands.",
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "Tap Along While Reading",
        "instructions": "Tap the rhythm as you read it. The pattern uses quarter notes, a half note, and a whole note. Keep steady time.",
        "mode": "tap_along",
        "tempo": 72,
        "time_signature": [4, 4],
        "pattern": [
          {"beat": 1, "duration": 1},
          {"beat": 2, "duration": 1},
          {"beat": 3, "duration": 2},
          {"beat": 5, "duration": 1},
          {"beat": 6, "duration": 1},
          {"beat": 7, "duration": 1},
          {"beat": 8, "duration": 1},
          {"beat": 9, "duration": 4}
        ]
      },
      {
        "type": "guided_practice",
        "title": "Measure Total",
        "instructions": "A measure contains a dotted half note and a quarter note. How many total beats?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["3", "4", "5", "6"],
        "correct_answer": "4",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      },
      {
        "type": "guided_practice",
        "title": "Note Count",
        "instructions": "A measure in 4/4 has one whole note. How many beats does it fill?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["2", "3", "4", "8"],
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
      'sr2_rhythm_read_basic',
      'rhythm',
      'tap_rhythm',
      'Tap this rhythm as you read: quarter quarter half | quarter quarter quarter quarter | whole',
      ARRAY['sight_reading', 'rhythm_accuracy']::TEXT[],
      jsonb_build_object(
        'type', 'metronome',
        'pattern', 'quarter quarter half quarter quarter quarter quarter whole',
        'tempo', 75,
        'time_signature', jsonb_build_array(4, 4)
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Reading and tapping together. Your eyes and hands are connecting.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Slow down. Read ahead so your eyes know what comes next before your hands need to play it.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('tempo', 75, 'beats', 8, 'tolerance_ms', 150)
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 3: Your First Rhythm Reading
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Your First Rhythm Reading',
    'Put it all together. Read and tap multi-measure rhythms mixing quarter, half, and whole notes.',
    v_module_id, v_sr_track_id, 3,
    ARRAY['sr2_beat_position']::TEXT[],
    ARRAY['drill_sr2_rhythm_reading']::TEXT[],
    '[
      {
        "type": "rhythm",
        "title": "Four-Bar Exercise",
        "instructions": "Read and tap this four-bar rhythm. It uses quarter, half, and whole notes. Take it slowly — accuracy matters more than speed.",
        "mode": "echo",
        "tempo": 70,
        "time_signature": [4, 4],
        "pattern": [
          {"beat": 1, "duration": 1},
          {"beat": 2, "duration": 1},
          {"beat": 3, "duration": 1},
          {"beat": 4, "duration": 1},
          {"beat": 5, "duration": 2},
          {"beat": 7, "duration": 2},
          {"beat": 9, "duration": 1},
          {"beat": 10, "duration": 1},
          {"beat": 11, "duration": 2},
          {"beat": 13, "duration": 4}
        ]
      },
      {
        "type": "theory_teach",
        "title": "Reading Ahead",
        "content": "Reading ahead is the key sight-reading skill. While you play the current note, your eyes should already be on the next one. Do not wait to see what comes next — anticipate. This gets easier with practice, and these exercises are building that skill.",
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "New Exercise",
        "instructions": "A new rhythm at a slightly faster tempo. Use the same technique: eyes ahead, steady pulse, trust your preparation.",
        "mode": "echo",
        "tempo": 75,
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
        "title": "Beat Position",
        "instructions": "In this measure (half note, quarter, quarter), what note value starts on beat 3?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["Half note", "Quarter note", "Whole note", "Eighth note"],
        "correct_answer": "Quarter note",
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
      'sr2_beat_position',
      'declarative',
      'select_one',
      'In this measure (half note, quarter, quarter), what note value starts on beat 3?',
      ARRAY['sight_reading']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'The half note takes beats 1-2, so beat 3 starts with a quarter note.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Count through the measure: half note fills beats 1-2, then quarter notes on beats 3 and 4.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Half note'),
          jsonb_build_object('id', 'b', 'label', 'Quarter note'),
          jsonb_build_object('id', 'c', 'label', 'Whole note'),
          jsonb_build_object('id', 'd', 'label', 'Eighth note')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Drill: Rhythm Reading
  -- =============================================
  INSERT INTO drills (track_id, slug, title, description, drill_type, config, display_order)
  VALUES (
    v_sr_track_id,
    'drill_sr2_rhythm_reading',
    'Rhythm Reading',
    'Read and tap 2-4 bar rhythms using quarter, half, and whole notes at various tempos.',
    'rhythm_tap',
    jsonb_build_object(
      'tempo_range', jsonb_build_array(70, 85),
      'note_values', jsonb_build_array('quarter', 'half', 'whole'),
      'measures', jsonb_build_array(2, 3, 4),
      'time_signature', jsonb_build_array(4, 4),
      'randomize', true
    ),
    3
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'SR-2 Rhythm Reading module seeded (3 lessons, 4 card templates, 1 drill)';
END $$;
