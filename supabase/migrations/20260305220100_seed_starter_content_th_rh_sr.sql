-- SCO-220: Seed starter content for Theory, Rhythm, and Sight-Reading tracks
-- Creates Module 1 + 2-3 lessons for each track with v2 stage types,
-- card templates with radar_dimensions, and drill definitions.

DO $$
DECLARE
  v_th_track_id UUID;
  v_rh_track_id UUID;
  v_sr_track_id UUID;
  v_module_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_th_track_id FROM skill_tracks WHERE slug = 'theory';
  SELECT id INTO v_rh_track_id FROM skill_tracks WHERE slug = 'rhythm';
  SELECT id INTO v_sr_track_id FROM skill_tracks WHERE slug = 'sight_reading';

  IF v_th_track_id IS NULL OR v_rh_track_id IS NULL OR v_sr_track_id IS NULL THEN
    RAISE NOTICE 'Missing track(s) — skipping starter content';
    RETURN;
  END IF;

  -- =============================================
  -- THEORY TRACK: TH-1 Notation Basics
  -- =============================================
  INSERT INTO modules (title, description, module_order, track_id)
  VALUES ('Notation Basics', 'Learn to read the musical staff, note names, and basic notation symbols.', 1, v_th_track_id)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM modules WHERE track_id = v_th_track_id AND module_order = 1;
  END IF;

  -- TH-1 Lesson 1: The Musical Staff
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'The Musical Staff',
    'The staff is where music lives on paper. Learn its five lines, four spaces, and how clefs tell you which notes go where.',
    v_module_id, v_th_track_id, 1,
    ARRAY['th_staff_basics']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "Five Lines, Four Spaces",
        "content": "The musical staff has five horizontal lines and four spaces between them. Each line and space represents a different pitch. The higher a note sits on the staff, the higher it sounds.",
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Treble Clef",
        "content": "The treble clef (or G clef) curls around the second line, marking it as the note G. It is used for higher-pitched instruments and the right hand of piano. The line notes from bottom to top: E, G, B, D, F. The space notes: F, A, C, E.",
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Bass Clef",
        "content": "The bass clef (or F clef) has two dots around the fourth line, marking it as F. It is used for lower-pitched instruments and the left hand of piano. The line notes from bottom to top: G, B, D, F, A. The space notes: A, C, E, G.",
        "show_degree_circle": false
      },
      {
        "type": "interactive",
        "title": "Explore the Staff",
        "instructions": "Tap on different lines and spaces of the staff. Each position has a letter name that depends on the clef.",
        "interactive_type": "keyboard_explore",
        "config": {
          "mode": "staff_explore",
          "clef": "treble",
          "show_labels_on_tap": true
        },
        "min_interactions": 5
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, front_template, back_template, radar_dimensions)
    VALUES (v_lesson_id, 'th_staff_basics', 'declarative',
      'How many lines does a musical staff have?',
      'Five lines and four spaces. Notes are placed on or between lines to indicate pitch.',
      ARRAY['key_signatures']::TEXT[])
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- TH-1 Lesson 2: Notes and Accidentals
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Notes and Accidentals',
    'Learn how note shapes show duration and how sharps, flats, and naturals alter pitch.',
    v_module_id, v_th_track_id, 2,
    ARRAY['th_note_values', 'th_accidentals']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "Note Values",
        "content": "The shape of a note tells you how long to hold it. A whole note (open, no stem) lasts four beats. A half note (open, with stem) lasts two. A quarter note (filled, with stem) lasts one. Each level divides the previous by two.",
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Sharps, Flats, Naturals",
        "content": "A sharp (#) raises a note by one half step. A flat (b) lowers it by one half step. A natural cancels any previous sharp or flat. These symbols are called accidentals — they modify the pitch of the note they precede.",
        "show_degree_circle": false
      },
      {
        "type": "guided_practice",
        "title": "Name That Note",
        "instructions": "You will see a note on the staff. Name the note including any accidental. The answer reveals after a few seconds.",
        "practice_type": "degree",
        "audio_degrees": [],
        "options": ["C", "D", "E", "F", "G", "A", "B"],
        "correct_answer": "E",
        "reveal_delay_ms": 3000,
        "show_resolution": false
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, front_template, back_template, radar_dimensions)
    VALUES
      (v_lesson_id, 'th_note_values', 'declarative',
       'How many beats does a half note last?',
       'Two beats. It is half the duration of a whole note and twice a quarter note.',
       ARRAY['key_signatures']::TEXT[]),
      (v_lesson_id, 'th_accidentals', 'declarative',
       'What does a sharp do to a note?',
       'Raises the pitch by one half step. The symbol is placed to the left of the note on the staff.',
       ARRAY['key_signatures']::TEXT[])
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- =============================================
  -- RHYTHM TRACK: RH-1 Pulse and Beat
  -- =============================================
  INSERT INTO modules (title, description, module_order, track_id)
  VALUES ('Pulse and Beat', 'Feel the steady pulse that drives all music. Learn to find, follow, and subdivide the beat.', 1, v_rh_track_id)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM modules WHERE track_id = v_rh_track_id AND module_order = 1;
  END IF;

  -- RH-1 Lesson 1: Finding the Beat
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Finding the Beat',
    'Every piece of music has a pulse — a steady, recurring throb that drives it forward. Learn to find and follow it.',
    v_module_id, v_rh_track_id, 1,
    ARRAY['rh_steady_pulse']::TEXT[],
    ARRAY['rhythm_tap_basic']::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "The Pulse",
        "instructions": "Listen to this steady click. This is the beat — the heartbeat of music. Every song, every piece has one. Your job is to feel it in your body, not just hear it in your ears.",
        "audio_degrees": [],
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "Tap Along",
        "instructions": "Tap the button in time with the metronome. Stay steady — do not rush or drag.",
        "mode": "tap",
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
        "type": "rhythm",
        "title": "Faster Pulse",
        "instructions": "Now the tempo increases. Keep tapping on every beat. Feel how the energy changes with speed.",
        "mode": "tap",
        "tempo": 100,
        "time_signature": [4, 4],
        "pattern": [
          {"beat": 1, "duration": 1},
          {"beat": 2, "duration": 1},
          {"beat": 3, "duration": 1},
          {"beat": 4, "duration": 1}
        ]
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, front_template, back_template, radar_dimensions)
    VALUES (v_lesson_id, 'rh_steady_pulse', 'rhythm',
      'Tap along with the metronome at 80 BPM for 8 beats.',
      'Steady pulse maintained. Consistency is more important than speed.',
      ARRAY['rhythm_accuracy']::TEXT[])
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- RH-1 Lesson 2: Strong and Weak Beats
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Strong and Weak Beats',
    'Not all beats are equal. Learn to hear and feel the difference between strong downbeats and lighter upbeats.',
    v_module_id, v_rh_track_id, 2,
    ARRAY['rh_strong_weak']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "The Downbeat",
        "instructions": "Listen carefully. The first beat of each group sounds stronger — it has more weight. This is the downbeat. It is the anchor that organizes everything else around it.",
        "audio_degrees": [],
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "Tap the Downbeat Only",
        "instructions": "This time, only tap on beat 1 — the strong beat. Let the other beats pass. Feel the space between downbeats.",
        "mode": "tap",
        "tempo": 80,
        "time_signature": [4, 4],
        "pattern": [
          {"beat": 1, "duration": 1},
          {"beat": 2, "duration": 1, "rest": true},
          {"beat": 3, "duration": 1, "rest": true},
          {"beat": 4, "duration": 1, "rest": true}
        ]
      },
      {
        "type": "guided_practice",
        "title": "How Many Beats Per Group?",
        "instructions": "Listen to the pattern. How many beats do you hear before the strong beat returns? This tells you the meter.",
        "practice_type": "rhythm",
        "audio_degrees": [],
        "options": ["2", "3", "4"],
        "correct_answer": "4",
        "reveal_delay_ms": 3000,
        "show_resolution": false
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, front_template, back_template, radar_dimensions)
    VALUES (v_lesson_id, 'rh_strong_weak', 'declarative',
      'What is the downbeat?',
      'The first beat of each measure — it carries the most weight and organizes the rhythmic pattern.',
      ARRAY['meter_id']::TEXT[])
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- RH-1 Lesson 3: Dividing the Beat
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Dividing the Beat',
    'When you split each beat in half, you get eighth notes — the first level of subdivision. Learn to hear and tap them.',
    v_module_id, v_rh_track_id, 3,
    ARRAY['rh_subdivisions']::TEXT[],
    ARRAY['rhythm_tap_eighths']::TEXT[],
    '[
      {
        "type": "aural_teach",
        "title": "Eighth Notes",
        "instructions": "Listen to the metronome, then hear eighth notes layered on top. Each beat now has two equal parts. The pulse stays the same — the notes move twice as fast within it.",
        "audio_degrees": [],
        "show_degree_circle": false
      },
      {
        "type": "rhythm",
        "title": "Tap Eighth Notes",
        "instructions": "Tap twice per beat — two even taps for every click of the metronome. Stay relaxed and even.",
        "mode": "tap",
        "tempo": 72,
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
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, front_template, back_template, radar_dimensions)
    VALUES (v_lesson_id, 'rh_subdivisions', 'rhythm',
      'Tap eighth note subdivisions at 72 BPM for 4 beats.',
      'Two equal taps per beat. Subdivision is the foundation of rhythmic complexity.',
      ARRAY['rhythm_accuracy']::TEXT[])
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- =============================================
  -- SIGHT-READING TRACK: SR-1 Note Reading
  -- =============================================
  INSERT INTO modules (title, description, module_order, track_id)
  VALUES ('Note Reading', 'Learn to identify notes on the treble and bass clef staves — the foundation of reading music.', 1, v_sr_track_id)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM modules WHERE track_id = v_sr_track_id AND module_order = 1;
  END IF;

  -- SR-1 Lesson 1: Treble Clef Notes
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Treble Clef Notes',
    'The treble clef is the most common clef in music. Learn to identify notes on its five lines and four spaces.',
    v_module_id, v_sr_track_id, 1,
    ARRAY['sr_treble_lines', 'sr_treble_spaces']::TEXT[],
    ARRAY['note_reading_treble']::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "Lines of the Treble Clef",
        "content": "The five lines of the treble clef, from bottom to top, are: E, G, B, D, F. A common memory aid: Every Good Boy Does Fine. Each line is a skip (third) apart.",
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Spaces of the Treble Clef",
        "content": "The four spaces, from bottom to top, spell the word FACE: F, A, C, E. Spaces sit between lines, and together they form a continuous ladder of notes.",
        "show_degree_circle": false
      },
      {
        "type": "interactive",
        "title": "Explore Treble Clef",
        "instructions": "Tap on lines and spaces of the treble clef staff. Each position reveals its note name. See how the notes alternate between lines and spaces.",
        "interactive_type": "keyboard_explore",
        "config": {
          "mode": "staff_explore",
          "clef": "treble",
          "show_labels_on_tap": true
        },
        "min_interactions": 7
      },
      {
        "type": "guided_practice",
        "title": "Name the Note",
        "instructions": "A note appears on the treble clef staff. Name it. The answer reveals after a few seconds.",
        "practice_type": "degree",
        "audio_degrees": [],
        "options": ["E", "F", "G", "A", "B", "C", "D"],
        "correct_answer": "G",
        "reveal_delay_ms": 3000,
        "show_resolution": false
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, front_template, back_template, radar_dimensions)
    VALUES
      (v_lesson_id, 'sr_treble_lines', 'declarative',
       'Name the five line notes of the treble clef from bottom to top.',
       'E, G, B, D, F — Every Good Boy Does Fine.',
       ARRAY['note_reading']::TEXT[]),
      (v_lesson_id, 'sr_treble_spaces', 'declarative',
       'Name the four space notes of the treble clef from bottom to top.',
       'F, A, C, E — they spell the word FACE.',
       ARRAY['note_reading']::TEXT[])
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- SR-1 Lesson 2: Bass Clef Notes
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Bass Clef Notes',
    'The bass clef covers lower pitches. Learn its line and space notes to read music for bass instruments and left-hand piano.',
    v_module_id, v_sr_track_id, 2,
    ARRAY['sr_bass_lines', 'sr_bass_spaces']::TEXT[],
    ARRAY['note_reading_bass']::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "Lines of the Bass Clef",
        "content": "The five lines of the bass clef, from bottom to top, are: G, B, D, F, A. Memory aid: Good Boys Do Fine Always. Notice these are different from the treble clef.",
        "show_degree_circle": false
      },
      {
        "type": "theory_teach",
        "title": "Spaces of the Bass Clef",
        "content": "The four spaces, from bottom to top, are: A, C, E, G. Memory aid: All Cows Eat Grass. Together with the lines, they form a complete set of notes.",
        "show_degree_circle": false
      },
      {
        "type": "interactive",
        "title": "Explore Bass Clef",
        "instructions": "Tap on lines and spaces of the bass clef staff. Compare the note names to what you learned in treble clef — the positions are different.",
        "interactive_type": "keyboard_explore",
        "config": {
          "mode": "staff_explore",
          "clef": "bass",
          "show_labels_on_tap": true
        },
        "min_interactions": 7
      },
      {
        "type": "guided_practice",
        "title": "Name the Note",
        "instructions": "A note appears on the bass clef staff. Name it. The answer reveals after a few seconds.",
        "practice_type": "degree",
        "audio_degrees": [],
        "options": ["G", "A", "B", "C", "D", "E", "F"],
        "correct_answer": "B",
        "reveal_delay_ms": 3000,
        "show_resolution": false
      }
    ]'::JSONB
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO card_templates (lesson_id, slug, card_category, front_template, back_template, radar_dimensions)
    VALUES
      (v_lesson_id, 'sr_bass_lines', 'declarative',
       'Name the five line notes of the bass clef from bottom to top.',
       'G, B, D, F, A — Good Boys Do Fine Always.',
       ARRAY['note_reading']::TEXT[]),
      (v_lesson_id, 'sr_bass_spaces', 'declarative',
       'Name the four space notes of the bass clef from bottom to top.',
       'A, C, E, G — All Cows Eat Grass.',
       ARRAY['note_reading']::TEXT[])
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- =============================================
  -- DRILLS for new content
  -- =============================================
  INSERT INTO drills (track_id, slug, title, description, drill_type, config, display_order)
  VALUES
    (v_rh_track_id, 'rhythm_tap_basic', 'Basic Tap', 'Tap along with the metronome at steady tempos.', 'rhythm_tap',
     '{"tempo_range": [60, 100], "time_signature": [4, 4]}'::JSONB, 1),
    (v_rh_track_id, 'rhythm_tap_eighths', 'Eighth Note Tap', 'Tap eighth note subdivisions at various tempos.', 'rhythm_tap',
     '{"tempo_range": [60, 90], "subdivision": "eighth", "time_signature": [4, 4]}'::JSONB, 2),
    (v_sr_track_id, 'note_reading_treble', 'Treble Clef Reading', 'Identify notes on the treble clef staff.', 'note_reading',
     '{"clef": "treble", "range": ["E4", "F5"]}'::JSONB, 1),
    (v_sr_track_id, 'note_reading_bass', 'Bass Clef Reading', 'Identify notes on the bass clef staff.', 'note_reading',
     '{"clef": "bass", "range": ["G2", "A3"]}'::JSONB, 2)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Starter content seeded for Theory, Rhythm, and Sight-Reading tracks';
END $$;
