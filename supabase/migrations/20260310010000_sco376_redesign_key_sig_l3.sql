-- SCO-376: Redesign Key Sigs Link 3 (modal alteration)
-- Problem: "X major, raise the 4th degree. What mode?" always = Lydian. Key doesn't matter.
-- Fix (Option B): "X Lydian. Which note is altered compared to X major?"
-- Each key now tests a DIFFERENT specific note change. The key matters.
-- Distractors represent other real modal alterations (Mixolydian b7, Dorian b3, Aeolian b6)
-- or plausible wrong-degree raises for extreme flat keys.

DO $$
DECLARE
  r RECORD;
  v_tpl_id UUID;
BEGIN

  CREATE TEMP TABLE _l3_fix (
    slug        TEXT,  -- card_template slug: flow_key_{slug}_mode
    prompt      TEXT,
    opt_a       TEXT,  -- correct: raised 4th (Lydian)
    opt_b       TEXT,  -- distractor
    opt_c       TEXT,  -- distractor
    opt_d       TEXT,  -- distractor
    fb_correct  TEXT,
    fb_incorrect TEXT,
    root_note   TEXT   -- for audio_config
  );

  INSERT INTO _l3_fix VALUES
    -- === NATURAL KEY ===
    ('flow_key_c_major_mode',
     'C Lydian. Which note is altered compared to C major?',
     'F → F#', 'B → Bb', 'E → Eb', 'A → Ab',
     'Lydian raises the 4th degree. In C major, that means F becomes F#.',
     'Lydian is defined by a raised 4th. In C major, the 4th is F.',
     'C'),

    -- === SHARP KEYS ===
    ('flow_key_g_major_mode',
     'G Lydian. Which note is altered compared to G major?',
     'C → C#', 'F# → F', 'B → Bb', 'E → Eb',
     'Lydian raises the 4th degree. In G major, that means C becomes C#.',
     'Lydian is defined by a raised 4th. In G major, the 4th is C.',
     'G'),

    ('flow_key_d_major_mode',
     'D Lydian. Which note is altered compared to D major?',
     'G → G#', 'C# → C', 'F# → F', 'B → Bb',
     'Lydian raises the 4th degree. In D major, that means G becomes G#.',
     'Lydian is defined by a raised 4th. In D major, the 4th is G.',
     'D'),

    ('flow_key_a_major_mode',
     'A Lydian. Which note is altered compared to A major?',
     'D → D#', 'G# → G', 'C# → C', 'F# → F',
     'Lydian raises the 4th degree. In A major, that means D becomes D#.',
     'Lydian is defined by a raised 4th. In A major, the 4th is D.',
     'A'),

    ('flow_key_e_major_mode',
     'E Lydian. Which note is altered compared to E major?',
     'A → A#', 'D# → D', 'G# → G', 'C# → C',
     'Lydian raises the 4th degree. In E major, that means A becomes A#.',
     'Lydian is defined by a raised 4th. In E major, the 4th is A.',
     'E'),

    ('flow_key_b_major_mode',
     'B Lydian. Which note is altered compared to B major?',
     'E → E#', 'A# → A', 'D# → D', 'G# → G',
     'Lydian raises the 4th degree. In B major, that means E becomes E#.',
     'Lydian is defined by a raised 4th. In B major, the 4th is E.',
     'B'),

    ('flow_key_fs_major_mode',
     'F# Lydian. Which note is altered compared to F# major?',
     'B → B#', 'E# → E', 'A# → A', 'D# → D',
     'Lydian raises the 4th degree. In F# major, that means B becomes B#.',
     'Lydian is defined by a raised 4th. In F# major, the 4th is B.',
     'F#'),

    ('flow_key_cs_major_mode',
     'C# Lydian. Which note is altered compared to C# major?',
     'F# → Fx', 'B# → B', 'E# → E', 'A# → A',
     'Lydian raises the 4th degree. In C# major, the 4th is F#, raised to Fx (double sharp).',
     'Lydian is defined by a raised 4th. In C# major, the 4th is F#.',
     'C#'),

    -- === FLAT KEYS ===
    ('flow_key_f_major_mode',
     'F Lydian. Which note is altered compared to F major?',
     'Bb → B', 'E → Eb', 'A → Ab', 'D → Db',
     'Lydian raises the 4th degree. In F major, the 4th is Bb, raised to B.',
     'Lydian is defined by a raised 4th. In F major, the 4th is Bb.',
     'F'),

    ('flow_key_bb_major_mode',
     'Bb Lydian. Which note is altered compared to Bb major?',
     'Eb → E', 'A → Ab', 'D → Db', 'G → Gb',
     'Lydian raises the 4th degree. In Bb major, the 4th is Eb, raised to E.',
     'Lydian is defined by a raised 4th. In Bb major, the 4th is Eb.',
     'Bb'),

    ('flow_key_eb_major_mode',
     'Eb Lydian. Which note is altered compared to Eb major?',
     'Ab → A', 'D → Db', 'G → Gb', 'C → Cb',
     'Lydian raises the 4th degree. In Eb major, the 4th is Ab, raised to A.',
     'Lydian is defined by a raised 4th. In Eb major, the 4th is Ab.',
     'Eb'),

    ('flow_key_ab_major_mode',
     'Ab Lydian. Which note is altered compared to Ab major?',
     'Db → D', 'G → Gb', 'C → Cb', 'F → Fb',
     'Lydian raises the 4th degree. In Ab major, the 4th is Db, raised to D.',
     'Lydian is defined by a raised 4th. In Ab major, the 4th is Db.',
     'Ab'),

    -- Db major: b6 would be Bbb (double flat), so use raise-2nd distractor instead
    ('flow_key_db_major_mode',
     'Db Lydian. Which note is altered compared to Db major?',
     'Gb → G', 'C → Cb', 'F → Fb', 'Eb → E',
     'Lydian raises the 4th degree. In Db major, the 4th is Gb, raised to G.',
     'Lydian is defined by a raised 4th. In Db major, the 4th is Gb.',
     'Db'),

    -- Gb major: b3 and b6 would be double flats, use raise-2nd and raise-5th
    ('flow_key_gb_major_mode',
     'Gb Lydian. Which note is altered compared to Gb major?',
     'Cb → C', 'F → Fb', 'Ab → A', 'Db → D',
     'Lydian raises the 4th degree. In Gb major, the 4th is Cb, raised to C.',
     'Lydian is defined by a raised 4th. In Gb major, the 4th is Cb.',
     'Gb'),

    -- Cb major: all lowering distractors produce double flats, use raise-2nd/5th/6th
    ('flow_key_cb_major_mode',
     'Cb Lydian. Which note is altered compared to Cb major?',
     'Fb → F', 'Db → D', 'Gb → G', 'Ab → A',
     'Lydian raises the 4th degree. In Cb major, the 4th is Fb, raised to F.',
     'Lydian is defined by a raised 4th. In Cb major, the 4th is Fb.',
     'Cb');

  -- Update card_templates
  FOR r IN SELECT * FROM _l3_fix LOOP
    UPDATE card_templates SET
      prompt_text = r.prompt,
      parameters = jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.opt_a),
          jsonb_build_object('id', 'b', 'label', r.opt_b),
          jsonb_build_object('id', 'c', 'label', r.opt_c),
          jsonb_build_object('id', 'd', 'label', r.opt_d)
        ),
        'audio_config', jsonb_build_object(
          'type', 'scale',
          'root', r.root_note || '3',
          'scaleType', 'lydian',
          'direction', 'ascending',
          'tempo', 3
        )
      ),
      feedback = jsonb_build_object(
        'correct', jsonb_build_object('text', r.fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    WHERE slug = r.slug
    RETURNING id INTO v_tpl_id;

    -- Update matching card_instance
    UPDATE card_instances SET
      prompt_rendered = r.prompt,
      answer_data = jsonb_build_object('correct_answer', 'a'),
      options_data = jsonb_build_array(
        jsonb_build_object('id', 'a', 'label', r.opt_a),
        jsonb_build_object('id', 'b', 'label', r.opt_b),
        jsonb_build_object('id', 'c', 'label', r.opt_c),
        jsonb_build_object('id', 'd', 'label', r.opt_d)
      )
    WHERE template_id = v_tpl_id;
  END LOOP;

  -- Update chain_links description for L3 across all key_signatures chains
  UPDATE chain_links SET
    description = 'Identify the Lydian alteration in context',
    modalities = '["select_one"]'::JSONB,
    modality_by_stage = '{"apprentice":"select_one"}'::JSONB
  WHERE position = 3
    AND chain_id IN (SELECT id FROM chain_definitions WHERE topic = 'key_signatures');

  DROP TABLE _l3_fix;
  RAISE NOTICE 'SCO-376: Redesigned 15 key sig L3 cards — modal alteration now key-specific';
END $$;
