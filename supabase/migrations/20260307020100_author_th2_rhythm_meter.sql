-- SCO-302: TH-2 Rhythm & Meter module (theory track, module_order=2)
-- 5 lessons, 6 card templates, 1 drill
-- Teaches note values, rests, time signatures, dots/ties, compound meter, tempo.

DO $$
DECLARE
  v_th_track_id UUID;
  v_module_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_th_track_id FROM skill_tracks WHERE slug = 'theory';
  IF v_th_track_id IS NULL THEN
    RAISE NOTICE 'theory track not found — skipping TH-2';
    RETURN;
  END IF;

  -- =============================================
  -- Module: Rhythm & Meter
  -- =============================================
  INSERT INTO modules (title, description, module_order, track_id)
  VALUES (
    'Rhythm & Meter',
    'Learn to read and understand rhythmic notation — note values, rests, time signatures, dotted notes, ties, and tempo markings.',
    2,
    v_th_track_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM modules WHERE track_id = v_th_track_id AND module_order = 2;
  END IF;

  IF v_module_id IS NULL THEN
    RAISE NOTICE 'Could not create or find TH-2 module — skipping';
    RETURN;
  END IF;

  -- =============================================
  -- Lesson 1: Note Values — The Duration Family
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Note Values: The Duration Family',
    'Every note shape tells you how long to hold it. Learn the family of note values from whole notes down to sixteenths.',
    v_module_id, v_th_track_id, 1,
    ARRAY['th2_note_value_beats', 'th2_rest_match']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "The Duration Family",
        "content": "Note shapes tell you how long to hold a sound. A whole note (open oval, no stem) lasts 4 beats. A half note (open oval, with stem) lasts 2. A quarter note (filled oval, with stem) lasts 1. An eighth note adds a flag or beam — half a beat. A sixteenth adds two flags — a quarter of a beat. Each level divides the previous by two.",
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Rests: The Sound of Silence",
        "content": "Every note value has a matching rest — a symbol that tells you to stay silent for the same duration. A whole rest hangs from a line (4 beats). A half rest sits on a line (2 beats). A quarter rest is a zigzag shape (1 beat). Eighth and sixteenth rests look like small angular marks with flags.",
        "show_degree_circle": false
      },
      {
        "type": "interactive",
        "title": "Explore Note Durations",
        "instructions": "Tap each note value to hear how long it lasts. Notice how each one is exactly half the duration of the previous.",
        "interactive_type": "keyboard_explore",
        "config": {
          "mode": "note_value_explore",
          "show_labels_on_tap": true
        },
        "min_interactions": 5
      },
      {
        "type": "guided_practice",
        "title": "How Many Beats?",
        "instructions": "In 4/4 time, how many beats does a half note get?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["1", "2", "3", "4"],
        "correct_answer": "2",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      },
      {
        "type": "guided_practice",
        "title": "Quarter Note Duration",
        "instructions": "How many beats does a quarter note get in 4/4 time?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["0.5", "1", "2", "4"],
        "correct_answer": "1",
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
      'th2_note_value_beats',
      'declarative',
      'select_one',
      'How many beats does a half note get in 4/4 time?',
      ARRAY['music_literacy']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'A half note gets two beats — half as long as a whole note.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'The half note lasts for two beats. Each level doubles or halves.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', '1 beat'),
          jsonb_build_object('id', 'b', 'label', '2 beats'),
          jsonb_build_object('id', 'c', 'label', '3 beats'),
          jsonb_build_object('id', 'd', 'label', '4 beats')
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
      'th2_rest_match',
      'declarative',
      'select_one',
      'Which rest has the same duration as a quarter note?',
      ARRAY['music_literacy']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'The quarter rest lasts one beat, same as a quarter note.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'Every note value has a matching rest of the same duration.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Whole rest (4 beats)'),
          jsonb_build_object('id', 'b', 'label', 'Quarter rest (1 beat)'),
          jsonb_build_object('id', 'c', 'label', 'Half rest (2 beats)'),
          jsonb_build_object('id', 'd', 'label', 'Eighth rest (0.5 beats)')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 2: Time Signatures — Organizing the Beat
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Time Signatures: Organizing the Beat',
    'The two numbers at the start of a piece tell you how beats are grouped. Learn to read 4/4, 3/4, and 2/4.',
    v_module_id, v_th_track_id, 2,
    ARRAY['th2_time_sig_meaning']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "Two Numbers, One Meaning",
        "content": "A time signature has two numbers stacked vertically. The top number tells you how many beats per measure. The bottom number tells you which note value gets one beat. In 4/4, there are 4 beats per measure and the quarter note gets one beat.",
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Common Time Signatures",
        "content": "4/4 is called common time — four quarter-note beats per measure. Most popular music uses it. 3/4 is waltz time — three beats, giving a ONE-two-three feel. 2/4 is march time — two beats, strong-weak, strong-weak.",
        "show_degree_circle": false
      },
      {
        "type": "interactive",
        "title": "Hear the Difference",
        "instructions": "Listen to the same melody in 4/4, then 3/4. Notice how the grouping changes the feel completely, even though the notes are the same.",
        "interactive_type": "keyboard_explore",
        "config": {
          "mode": "meter_explore",
          "meters": ["4/4", "3/4"],
          "show_labels_on_tap": true
        },
        "min_interactions": 4
      },
      {
        "type": "guided_practice",
        "title": "Top Number Meaning",
        "instructions": "In a time signature, what does the top number tell you?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["How fast to play", "How many beats per measure", "Which note gets the beat", "How many measures"],
        "correct_answer": "How many beats per measure",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      },
      {
        "type": "guided_practice",
        "title": "Beats in 3/4",
        "instructions": "In 3/4 time, how many beats are in each measure?",
        "practice_type": "theory",
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
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, feedback, parameters)
    VALUES (
      v_lesson_id,
      'th2_time_sig_meaning',
      'declarative',
      'select_one',
      'In 3/4 time, how many beats are in each measure?',
      ARRAY['music_literacy']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', '3/4 means three beats per measure, with the quarter note getting one beat.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'The top number is always the number of beats per measure.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
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
  -- Lesson 3: Dots and Ties
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Dots and Ties',
    'Two tools extend note durations: a dot adds half the value, and a tie connects two notes into one longer sound.',
    v_module_id, v_th_track_id, 3,
    ARRAY['th2_dotted_value']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "The Dot",
        "content": "A dot after a note adds half its value. A dotted half note = 2 + 1 = 3 beats. A dotted quarter = 1 + 0.5 = 1.5 beats. The dot always adds exactly half of whatever the note is worth on its own.",
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "The Tie",
        "content": "A tie is a curved line connecting two notes of the same pitch. You play the first note and hold it through the second — do not re-attack. Ties let you sustain notes across barlines or create durations that no single note value can express.",
        "show_degree_circle": false
      },
      {
        "type": "guided_practice",
        "title": "Dotted Quarter Value",
        "instructions": "A dotted quarter note equals how many eighth notes?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["2", "3", "4", "6"],
        "correct_answer": "3",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      },
      {
        "type": "guided_practice",
        "title": "Dotted Half Value",
        "instructions": "How many beats does a dotted half note get in 4/4 time?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["2", "3", "4", "5"],
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
      'th2_dotted_value',
      'declarative',
      'select_one',
      'A dotted quarter note equals how many eighth notes?',
      ARRAY['music_literacy']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'A dotted quarter = 1.5 beats = 3 eighth notes. The dot adds half the value.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'A dot adds half the original value. Quarter = 1 beat, plus half = 0.5, total = 1.5 beats = 3 eighths.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
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
  -- Lesson 4: Compound Meter
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Compound Meter',
    'Not all meters divide beats by two. In compound meter, beats naturally split into three — creating a rolling, lilting feel.',
    v_module_id, v_th_track_id, 4,
    ARRAY['th2_simple_vs_compound']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "6/8 Is Not 6 Beats",
        "content": "6/8 looks like 6 beats, but it actually feels like 2. The six eighth notes group into two sets of three: ONE-two-three FOUR-five-six. Each group of three is one big beat. That is compound meter — the beat itself divides by three.",
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Simple vs Compound",
        "content": "In simple meter (2/4, 3/4, 4/4), each beat naturally divides into two equal parts. In compound meter (6/8, 9/8, 12/8), each beat naturally divides into three. The feel is completely different — simple is march-like, compound is flowing.",
        "show_degree_circle": false
      },
      {
        "type": "interactive",
        "title": "Hear Compound Meter",
        "instructions": "Listen to 6/8 and feel the two big beats, each containing three pulses. Compare it to 3/4, which has three beats of two. Same number of eighth notes, completely different feel.",
        "interactive_type": "keyboard_explore",
        "config": {
          "mode": "meter_explore",
          "meters": ["6/8", "3/4"],
          "show_labels_on_tap": true
        },
        "min_interactions": 4
      },
      {
        "type": "guided_practice",
        "title": "Simple or Compound?",
        "instructions": "Is 6/8 simple or compound meter?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["Simple", "Compound"],
        "correct_answer": "Compound",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      },
      {
        "type": "guided_practice",
        "title": "How Many Big Beats?",
        "instructions": "How many main beats do you feel in 6/8?",
        "practice_type": "theory",
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
    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, feedback, parameters)
    VALUES (
      v_lesson_id,
      'th2_simple_vs_compound',
      'declarative',
      'select_one',
      'Is 6/8 simple or compound meter?',
      ARRAY['music_literacy']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', '6/8 is compound — each beat divides into three, giving it a rolling feel.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'In compound meter like 6/8, the beats group in threes. Simple meter groups in twos.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Simple'),
          jsonb_build_object('id', 'b', 'label', 'Compound')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Lesson 5: Tempo — How Fast?
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Tempo: How Fast?',
    'Tempo tells you the speed of the beat. Learn the traditional Italian terms and how BPM measurements work.',
    v_module_id, v_th_track_id, 5,
    ARRAY['th2_tempo_order']::TEXT[],
    ARRAY['drill_th2_rhythm_notation']::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "Beats Per Minute",
        "content": "Tempo is measured in BPM — beats per minute. A metronome at 60 BPM clicks once per second. At 120 BPM, it clicks twice per second. Higher BPM = faster music. Most music falls between 60 and 180 BPM.",
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Italian Tempo Terms",
        "content": "Composers use Italian words for tempo. From slowest to fastest: Largo (very slow, ~40-60), Adagio (slow, ~60-76), Andante (walking pace, ~76-108), Moderato (moderate, ~108-120), Allegro (fast, ~120-156), Vivace (lively, ~156-176), Presto (very fast, ~176-200). These terms also suggest character, not just speed.",
        "show_degree_circle": false
      },
      {
        "type": "guided_practice",
        "title": "Which Is Fastest?",
        "instructions": "Which tempo marking is fastest?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["Andante", "Allegro", "Adagio", "Moderato"],
        "correct_answer": "Allegro",
        "reveal_delay_ms": 4500,
        "show_resolution": false
      },
      {
        "type": "guided_practice",
        "title": "Walking Pace",
        "instructions": "Which Italian term means a comfortable walking pace?",
        "practice_type": "theory",
        "audio_degrees": [],
        "options": ["Largo", "Andante", "Presto", "Vivace"],
        "correct_answer": "Andante",
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
      'th2_tempo_order',
      'declarative',
      'select_one',
      'Which tempo marking is fastest?',
      ARRAY['music_literacy']::TEXT[],
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Allegro is fast, around 120-156 BPM. Only Vivace and Presto are faster.', 'show_answer', true, 'play_confirmation', false),
        'incorrect', jsonb_build_object('text', 'From slow to fast: Largo, Adagio, Andante, Moderato, Allegro, Vivace, Presto.', 'show_answer', true, 'play_correct', false, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Andante'),
          jsonb_build_object('id', 'b', 'label', 'Allegro'),
          jsonb_build_object('id', 'c', 'label', 'Adagio'),
          jsonb_build_object('id', 'd', 'label', 'Moderato')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;
  END IF;

  -- =============================================
  -- Drill: Rhythm Notation
  -- =============================================
  INSERT INTO drills (track_id, slug, title, description, drill_type, config, display_order)
  VALUES (
    v_th_track_id,
    'drill_th2_rhythm_notation',
    'Rhythm Notation Quiz',
    'Test your knowledge of note values, time signatures, dotted notes, and tempo terms.',
    'note_reading',
    jsonb_build_object(
      'categories', jsonb_build_array('note_values', 'time_signatures', 'dotted_notes', 'tempo'),
      'randomize', true
    ),
    2
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'TH-2 Rhythm & Meter module seeded (5 lessons, 6 card templates, 1 drill)';
END $$;
