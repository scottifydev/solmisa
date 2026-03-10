-- SCO-306: TH-3 Major Scales & Key Signatures module (theory track, module_order=3)
-- 5 lessons, 6 card templates, 1 drill
-- Covers W-W-H-W-W-W-H pattern, all 15 key sigs, circle of fifths,
-- scale degree names, solfège intro (moveable-do).

DO $$
DECLARE
  v_th_track_id UUID;
  v_module_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_th_track_id FROM skill_tracks WHERE slug = 'theory';
  IF v_th_track_id IS NULL THEN
    RAISE NOTICE 'theory track not found — skipping TH-3';
    RETURN;
  END IF;

  -- =============================================
  -- Module: Major Scales & Key Signatures
  -- =============================================
  INSERT INTO modules (title, description, module_order, track_id)
  VALUES (
    'Major Scales & Key Signatures',
    'The major scale is the foundation of Western harmony. Learn its interval pattern, all 15 key signatures, the circle of fifths, scale degree names, and solfège.',
    3,
    v_th_track_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_module_id;

  IF v_module_id IS NULL THEN
    SELECT id INTO v_module_id FROM modules WHERE track_id = v_th_track_id AND module_order = 3;
  END IF;

  IF v_module_id IS NULL THEN
    RAISE NOTICE 'Could not create or find TH-3 module — skipping';
    RETURN;
  END IF;

  -- =============================================
  -- Lesson 1: The Major Scale Recipe
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'The Major Scale Recipe',
    'Every major scale follows the same interval recipe: whole, whole, half, whole, whole, whole, half. Learn to build one from any starting note.',
    v_module_id, v_th_track_id, 1,
    ARRAY['th3_scale_pattern']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "The Pattern",
        "instructions": "Every major scale uses the same sequence of intervals: Whole - Whole - Half - Whole - Whole - Whole - Half. This pattern never changes. Start on any note, follow this recipe, and you get a major scale."
      },
      {
        "type": "theory_teach",
        "title": "C Major: The Natural Scale",
        "instructions": "C major uses only the white keys: C - D - E - F - G - A - B - C. The half steps fall between E-F and B-C — exactly where the pattern demands them. No sharps, no flats. This is why C major is the reference point for everything else."
      },
      {
        "type": "interactive",
        "title": "Build a Scale",
        "instructions": "Build a C major scale step by step. Start on C, then apply the pattern: whole step to D, whole step to E, half step to F, whole step to G, whole step to A, whole step to B, half step back to C.",
        "interactive_type": "scale_builder",
        "config": {
          "root": "C",
          "pattern": ["W", "W", "H", "W", "W", "W", "H"],
          "show_intervals": true
        },
        "min_interactions": 7
      },
      {
        "type": "guided_practice",
        "title": "Scale Intervals",
        "instructions": "What interval is between degrees 3 and 4 in any major scale?",
        "practice_type": "theory",
        "options": ["Whole step", "Half step", "Minor third", "Major third"],
        "correct_answer": "Half step",
        "reveal_delay_ms": 4500,
        "show_resolution": true
      },
      {
        "type": "guided_practice",
        "title": "Scale Intervals Again",
        "instructions": "What interval is between degrees 7 and 8 (the octave) in any major scale?",
        "practice_type": "theory",
        "options": ["Whole step", "Half step", "Minor third", "Perfect fourth"],
        "correct_answer": "Half step",
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
      'th3_scale_pattern',
      'declarative',
      'select_one',
      'What interval pattern defines a major scale?',
      ARRAY['music_literacy']::TEXT[],
      NULL,
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'W-W-H-W-W-W-H — the half steps always fall between degrees 3-4 and 7-8.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'The major scale pattern is Whole-Whole-Half-Whole-Whole-Whole-Half. The two half steps are its defining feature.', 'show_answer', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'W-W-H-W-W-W-H'),
          jsonb_build_object('id', 'b', 'label', 'W-H-W-W-H-W-W'),
          jsonb_build_object('id', 'c', 'label', 'W-W-W-H-W-W-H'),
          jsonb_build_object('id', 'd', 'label', 'H-W-W-W-H-W-W')
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
  -- Lesson 2: Sharp Keys & the Circle
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Sharp Keys & the Circle',
    'Each step clockwise on the circle of fifths adds one sharp. Learn the order of sharps and the shortcut for naming sharp keys.',
    v_module_id, v_th_track_id, 2,
    ARRAY['th3_key_from_sharps']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "The Order of Sharps",
        "instructions": "Sharps are always added in the same order: F - C - G - D - A - E - B. G major has one sharp (F#). D major has two (F#, C#). A major has three (F#, C#, G#). Each new key adds the next sharp in the sequence."
      },
      {
        "type": "theory_teach",
        "title": "The Shortcut",
        "instructions": "To name a sharp key from its signature: find the last sharp, then go up one half step. That note is the key name. Three sharps? The last sharp is G#. Half step up = A. The key is A major."
      },
      {
        "type": "interactive",
        "title": "Circle of Fifths — Clockwise",
        "instructions": "Explore the sharp side of the circle. Starting from C (no sharps), each step clockwise adds one sharp: G, D, A, E, B, F#, C#. Notice how each key is a fifth above the last.",
        "interactive_type": "circle_of_fifths_explore",
        "config": {
          "direction": "clockwise",
          "highlight_sharps": true
        },
        "min_interactions": 7
      },
      {
        "type": "guided_practice",
        "title": "Sharp Key ID",
        "instructions": "A key signature has 3 sharps. What major key is it?",
        "practice_type": "theory",
        "options": ["D major", "A major", "E major", "B major"],
        "correct_answer": "A major",
        "reveal_delay_ms": 4500,
        "show_resolution": true
      },
      {
        "type": "guided_practice",
        "title": "Sharp Key ID Again",
        "instructions": "A key signature has 1 sharp. What major key is it?",
        "practice_type": "theory",
        "options": ["C major", "G major", "D major", "F major"],
        "correct_answer": "G major",
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
      'th3_key_from_sharps',
      'declarative',
      'select_one',
      'A key signature has 3 sharps. What major key is it?',
      ARRAY['music_literacy']::TEXT[],
      NULL,
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Last sharp is G#. Half step up = A. The key is A major.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'Find the last sharp in the order (F-C-G-D-A-E-B), then go up a half step to name the key.', 'show_answer', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'D major'),
          jsonb_build_object('id', 'b', 'label', 'A major'),
          jsonb_build_object('id', 'c', 'label', 'E major'),
          jsonb_build_object('id', 'd', 'label', 'B major')
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
  -- Lesson 3: Flat Keys
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Flat Keys',
    'Each step counterclockwise on the circle of fifths adds one flat. Learn the order of flats and the naming shortcut.',
    v_module_id, v_th_track_id, 3,
    ARRAY['th3_key_from_flats', 'th3_accidental_count']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "The Order of Flats",
        "instructions": "Flats are added in the reverse order of sharps: B - E - A - D - G - C - F. F major has one flat (Bb). Bb major has two (Bb, Eb). Eb major has three (Bb, Eb, Ab). The mnemonic: Battle Ends And Down Goes Charles Father."
      },
      {
        "type": "theory_teach",
        "title": "The Flat Key Shortcut",
        "instructions": "To name a flat key: the second-to-last flat IS the key name. Two flats (Bb, Eb)? Second-to-last is Bb — the key is Bb major. Three flats (Bb, Eb, Ab)? Second-to-last is Eb — the key is Eb major. Exception: one flat (Bb) is F major — just memorize that one."
      },
      {
        "type": "interactive",
        "title": "Circle of Fifths — Counterclockwise",
        "instructions": "Explore the flat side of the circle. From C, each step counterclockwise adds one flat: F, Bb, Eb, Ab, Db, Gb, Cb. Each key is a fourth above (or a fifth below) the last.",
        "interactive_type": "circle_of_fifths_explore",
        "config": {
          "direction": "counterclockwise",
          "highlight_flats": true
        },
        "min_interactions": 7
      },
      {
        "type": "guided_practice",
        "title": "Flat Key ID",
        "instructions": "A key signature has 3 flats. What major key is it?",
        "practice_type": "theory",
        "options": ["Bb major", "Eb major", "Ab major", "F major"],
        "correct_answer": "Eb major",
        "reveal_delay_ms": 4500,
        "show_resolution": true
      },
      {
        "type": "guided_practice",
        "title": "Count the Accidentals",
        "instructions": "How many flats does Ab major have?",
        "practice_type": "theory",
        "options": ["2", "3", "4", "5"],
        "correct_answer": "4",
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
      'th3_key_from_flats',
      'declarative',
      'select_one',
      'A key signature has 4 flats. What major key is it?',
      ARRAY['music_literacy']::TEXT[],
      NULL,
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Four flats: Bb, Eb, Ab, Db. Second-to-last flat is Ab — the key is Ab major.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'The second-to-last flat names the key. Four flats = Bb, Eb, Ab, Db. Second-to-last is Ab.', 'show_answer', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'c'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Eb major'),
          jsonb_build_object('id', 'b', 'label', 'Db major'),
          jsonb_build_object('id', 'c', 'label', 'Ab major'),
          jsonb_build_object('id', 'd', 'label', 'Bb major')
        )
      )
    )
    ON CONFLICT (slug) DO UPDATE SET
      lesson_id = EXCLUDED.lesson_id,
      radar_dimensions = EXCLUDED.radar_dimensions,
      playback = EXCLUDED.playback,
      feedback = EXCLUDED.feedback,
      parameters = EXCLUDED.parameters;

    INSERT INTO card_templates (lesson_id, slug, card_category, response_type, prompt_text, radar_dimensions, playback, feedback, parameters)
    VALUES (
      v_lesson_id,
      'th3_accidental_count',
      'declarative',
      'select_one',
      'How many sharps or flats does D major have?',
      ARRAY['music_literacy']::TEXT[],
      NULL,
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'D major has 2 sharps: F# and C#. It sits two steps clockwise from C on the circle of fifths.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'D is two steps clockwise from C on the circle. Each step adds one sharp.', 'show_answer', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', '1 sharp'),
          jsonb_build_object('id', 'b', 'label', '2 sharps'),
          jsonb_build_object('id', 'c', 'label', '3 sharps'),
          jsonb_build_object('id', 'd', 'label', '1 flat')
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
  -- Lesson 4: Scale Degree Names
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Scale Degree Names',
    'Each degree of the scale has a name that describes its function: tonic, supertonic, mediant, subdominant, dominant, submediant, leading tone.',
    v_module_id, v_th_track_id, 4,
    ARRAY['th3_degree_name']::TEXT[],
    ARRAY[]::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "The Seven Degree Names",
        "instructions": "Each scale degree has a name: 1 = Tonic (home), 2 = Supertonic (above tonic), 3 = Mediant (middle of tonic triad), 4 = Subdominant (below dominant), 5 = Dominant (the strongest pull back to tonic), 6 = Submediant (below mediant, counting down), 7 = Leading tone (leads to tonic)."
      },
      {
        "type": "theory_teach",
        "title": "Function Groups",
        "instructions": "Degrees group by function. Tonic group (1, 3, 6): feels stable, resolved. Dominant group (5, 7): creates tension, wants to resolve to tonic. Pre-dominant group (2, 4): sets up the dominant. This grouping explains why chords built on these degrees behave predictably."
      },
      {
        "type": "guided_practice",
        "title": "Name That Degree",
        "instructions": "What is the name of scale degree 5?",
        "practice_type": "theory",
        "options": ["Subdominant", "Dominant", "Mediant", "Leading tone"],
        "correct_answer": "Dominant",
        "reveal_delay_ms": 4500,
        "show_resolution": true
      },
      {
        "type": "guided_practice",
        "title": "Name That Degree Again",
        "instructions": "What is the name of scale degree 4?",
        "practice_type": "theory",
        "options": ["Mediant", "Subdominant", "Dominant", "Submediant"],
        "correct_answer": "Subdominant",
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
      'th3_degree_name',
      'declarative',
      'select_one',
      'What is the name of scale degree 4?',
      ARRAY['music_literacy']::TEXT[],
      NULL,
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Subdominant — it sits one degree below the dominant (5). It belongs to the pre-dominant function group.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'Degree 4 is the subdominant. Sub = below. It sits below the dominant (5) and typically leads to it.', 'show_answer', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'b'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Mediant'),
          jsonb_build_object('id', 'b', 'label', 'Subdominant'),
          jsonb_build_object('id', 'c', 'label', 'Dominant'),
          jsonb_build_object('id', 'd', 'label', 'Submediant')
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
  -- Lesson 5: Solfège — Do Re Mi
  -- =============================================
  INSERT INTO lessons (title, description, module_id, track_id, lesson_order, unlocks_cards, unlocks_drills, stages)
  VALUES (
    'Solfège: Do Re Mi',
    'Moveable-do solfège gives every scale degree a singable name that works in any key. Do is always the tonic.',
    v_module_id, v_th_track_id, 5,
    ARRAY['th3_solfege_note']::TEXT[],
    ARRAY['drill_th3_key_sig_quiz']::TEXT[],
    '[
      {
        "type": "theory_teach",
        "title": "Moveable Do",
        "instructions": "In moveable-do solfège, Do is always the tonic — the first degree of whatever key you are in. In C major, Do is C. In G major, Do is G. In Eb major, Do is Eb. The syllable names the function, not the pitch."
      },
      {
        "type": "theory_teach",
        "title": "The Seven Syllables",
        "instructions": "Do - Re - Mi - Fa - Sol - La - Ti. Each syllable maps to a scale degree: Do=1, Re=2, Mi=3, Fa=4, Sol=5, La=6, Ti=7. These are the same syllables used in ear training — now you see why. They name the feeling of each degree."
      },
      {
        "type": "guided_practice",
        "title": "Solfège in Context",
        "instructions": "In G major, what note is Sol (degree 5)?",
        "practice_type": "theory",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "D",
        "reveal_delay_ms": 4500,
        "show_resolution": true
      },
      {
        "type": "guided_practice",
        "title": "Solfège in Context Again",
        "instructions": "In F major, what note is La (degree 6)?",
        "practice_type": "theory",
        "options": ["C", "D", "E", "Bb"],
        "correct_answer": "D",
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
      'th3_solfege_note',
      'declarative',
      'select_one',
      'In G major, what note is Sol (degree 5)?',
      ARRAY['music_literacy']::TEXT[],
      NULL,
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'G major scale: G-A-B-C-D-E-F#. Degree 5 (Sol) is D.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'Count up the G major scale to the 5th degree: G(1)-A(2)-B(3)-C(4)-D(5). Sol is D.', 'show_answer', true, 'delay_ms', 1500)
      ),
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'd'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'A'),
          jsonb_build_object('id', 'b', 'label', 'B'),
          jsonb_build_object('id', 'c', 'label', 'C'),
          jsonb_build_object('id', 'd', 'label', 'D')
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
  -- Drill: Key Signature Quiz
  -- =============================================
  INSERT INTO drills (track_id, slug, title, description, drill_type, config, display_order)
  VALUES (
    v_th_track_id,
    'drill_th3_key_sig_quiz',
    'Key Signature Quiz',
    'Identify major keys from their accidental count and vice versa. Tests both sharp and flat keys across the full circle of fifths.',
    'key_signature_id',
    jsonb_build_object(
      'directions', jsonb_build_array('key_from_count', 'count_from_key'),
      'keys', jsonb_build_array('C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb')
    ),
    2
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'TH-3 Major Scales & Key Signatures module seeded (5 lessons, 6 card templates, 1 drill)';
END $$;
