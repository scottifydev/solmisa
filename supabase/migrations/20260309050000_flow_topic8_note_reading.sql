-- Topic 8: Note Reading
-- 7 chains x 6 links = 42 card_templates, 42 card_instances, 42 chain_links

DO $$
DECLARE
  r RECORD;
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  CREATE TEMP TABLE _nr_chains (
    slug TEXT, name TEXT,
    unlock_cond JSONB,
    -- L1: note -> name (staff_note_display, select_one)
    l1_prompt TEXT, l1_params JSONB, l1_modalities JSONB,
    l1_a TEXT, l1_b TEXT, l1_c TEXT, l1_d TEXT,
    l1_fb_correct TEXT, l1_fb_incorrect TEXT,
    -- L2: note with accidental (staff_note_display, select_one)
    l2_prompt TEXT, l2_params JSONB, l2_modalities JSONB,
    l2_a TEXT, l2_b TEXT, l2_c TEXT, l2_d TEXT,
    l2_fb_correct TEXT, l2_fb_incorrect TEXT,
    -- L3: two notes (staff_multi_note, select_one)
    l3_prompt TEXT, l3_params JSONB, l3_modalities JSONB,
    l3_a TEXT, l3_b TEXT, l3_c TEXT, l3_d TEXT,
    l3_fb_correct TEXT, l3_fb_incorrect TEXT,
    -- L4: reverse - name -> staff position (select_one)
    l4_prompt TEXT, l4_params JSONB, l4_modalities JSONB,
    l4_a TEXT, l4_b TEXT, l4_c TEXT, l4_d TEXT,
    l4_fb_correct TEXT, l4_fb_incorrect TEXT,
    -- L5: speed drill (timed_select, staff_note_display)
    l5_prompt TEXT, l5_params JSONB, l5_modalities JSONB,
    l5_a TEXT, l5_b TEXT, l5_c TEXT, l5_d TEXT,
    l5_fb_correct TEXT, l5_fb_incorrect TEXT,
    -- L6: note in key context -> scale degree (select_one)
    l6_prompt TEXT, l6_params JSONB, l6_modalities JSONB,
    l6_a TEXT, l6_b TEXT, l6_c TEXT, l6_d TEXT,
    l6_fb_correct TEXT, l6_fb_incorrect TEXT
  );

  INSERT INTO _nr_chains VALUES
    -- ==============================
    -- Chain 1: Treble Clef Spaces (cold start)
    -- ==============================
    (
      'note_treble_spaces',
      'Treble Clef Spaces',
      '{"type":"cold_start"}',
      -- L1
      'Name this note',
      '{"clef":"treble","note":"F4"}',
      '["select_one","staff_note_display"]',
      'F', 'G', 'E', 'A',
      'F is the first space of the treble clef. The spaces spell F-A-C-E from bottom to top.',
      'The bottom space of the treble clef is F. Spaces spell F-A-C-E.',
      -- L2
      'Name this note',
      '{"clef":"treble","note":"F#4"}',
      '["select_one","staff_note_display"]',
      'F#', 'G', 'F', 'E#',
      'A sharp raises the note by one half step. F# sits on the same space as F.',
      'Accidentals modify the note by a half step — sharp raises, flat lowers.',
      -- L3
      'Name both notes (bottom to top)',
      '{"clef":"treble","notes":["F4","A4"]}',
      '["select_one","staff_multi_note"]',
      'F and A', 'E and G', 'G and B', 'F and G',
      'F (1st space) and A (2nd space) are the first two letters of F-A-C-E.',
      'Read from bottom to top. The treble spaces spell F-A-C-E.',
      -- L4
      'Which space holds the note E?',
      '{}',
      '["select_one"]',
      '4th space', '3rd space', '2nd space', '1st space',
      'E5 sits in the 4th (top) space of the treble clef — the last letter of F-A-C-E.',
      'The spaces spell F-A-C-E from bottom to top. E is the 4th space.',
      -- L5
      'Name this note',
      '{"clef":"treble","note":"C5","speed_threshold_ms":3000}',
      '["timed_select","staff_note_display"]',
      'C', 'D', 'B', 'E',
      'Quick recognition builds fluency. C5 is the 3rd space.',
      'C is the 3rd space in the treble clef. Reading fluency comes from pattern recognition, not counting.',
      -- L6
      'In D major, the note on the 3rd space (C5) is scale degree...?',
      '{"key":"D","note":"C5"}',
      '["select_one"]',
      E'\u0037\u0302', E'\u0036\u0302', E'\u0031\u0302', E'\u0035\u0302',
      'In D major the scale runs D-E-F#-G-A-B-C#-D, but natural C is the lowered 7th degree.',
      'C is the 7th note of D major (lowered). Count up from D: D(1) E(2) F#(3) G(4) A(5) B(6) C(7).'
    ),
    -- ==============================
    -- Chain 2: Treble Clef Lines (cold start)
    -- ==============================
    (
      'note_treble_lines',
      'Treble Clef Lines',
      '{"type":"cold_start"}',
      -- L1
      'Name this note',
      '{"clef":"treble","note":"E4"}',
      '["select_one","staff_note_display"]',
      'E', 'F', 'D', 'G',
      'E4 sits on the 1st (bottom) line of the treble clef. The lines spell E-G-B-D-F.',
      'The bottom line of the treble clef is E. Lines spell E-G-B-D-F.',
      -- L2
      'Name this note',
      '{"clef":"treble","note":"Bb4"}',
      '["select_one","staff_note_display"]',
      'Bb', 'A', 'B', 'Ab',
      'A flat lowers B by one half step. Bb sits on the same line as B.',
      'Accidentals modify the note by a half step — sharp raises, flat lowers.',
      -- L3
      'Name both notes (bottom to top)',
      '{"clef":"treble","notes":["G4","D5"]}',
      '["select_one","staff_multi_note"]',
      'G and D', 'A and E', 'F and C', 'G and E',
      'G (2nd line) and D (4th line) — two lines apart in E-G-B-D-F.',
      'Read from bottom to top. The treble lines spell E-G-B-D-F.',
      -- L4
      'Which line holds B?',
      '{}',
      '["select_one"]',
      '3rd line', '2nd line', '4th line', '1st line',
      'B4 sits on the 3rd (middle) line. E-G-B-D-F: B is the third letter.',
      'The lines spell E-G-B-D-F from bottom to top. B is the 3rd line.',
      -- L5
      'Name this note',
      '{"clef":"treble","note":"B4","speed_threshold_ms":3000}',
      '["timed_select","staff_note_display"]',
      'B', 'C', 'A', 'D',
      'Quick recognition. B4 is the 3rd line — the center of the staff.',
      'B is the 3rd line in the treble clef. Reading fluency comes from pattern recognition, not counting.',
      -- L6
      'In G major, the note on the 1st line (E4) is scale degree...?',
      '{"key":"G","note":"E4"}',
      '["select_one"]',
      E'\u0036\u0302', E'\u0035\u0302', E'\u0037\u0302', E'\u0034\u0302',
      'In G major: G-A-B-C-D-E-F#-G. E is the 6th degree.',
      'Count up from G: G(1) A(2) B(3) C(4) D(5) E(6). E is the 6th degree.'
    ),
    -- ==============================
    -- Chain 3: Bass Clef Spaces (unlock after treble spaces L3)
    -- ==============================
    (
      'note_bass_spaces',
      'Bass Clef Spaces',
      '{"type":"neighbor_mastery","requires_chain":"note_treble_spaces","min_link":3}',
      -- L1
      'Name this note',
      '{"clef":"bass","note":"A2"}',
      '["select_one","staff_note_display"]',
      'A', 'B', 'G', 'C',
      'A2 is the 1st space of the bass clef. The bass spaces spell A-C-E-G.',
      'The bottom space of the bass clef is A. Bass spaces spell A-C-E-G.',
      -- L2
      'Name this note',
      '{"clef":"bass","note":"C#3"}',
      '["select_one","staff_note_display"]',
      'C#', 'D', 'C', 'B#',
      'C# sits on the same space as C, raised by a half step.',
      'Accidentals modify the note by a half step — sharp raises, flat lowers.',
      -- L3
      'Name both notes (bottom to top)',
      '{"clef":"bass","notes":["A2","E3"]}',
      '["select_one","staff_multi_note"]',
      'A and E', 'G and D', 'B and F', 'A and F',
      'A (1st space) and E (3rd space) — the 1st and 3rd letters of A-C-E-G.',
      'Read from bottom to top. The bass spaces spell A-C-E-G.',
      -- L4
      'Which space holds C in bass clef?',
      '{}',
      '["select_one"]',
      '2nd space', '1st space', '3rd space', '4th space',
      'C3 is the 2nd space. A-C-E-G: C is the second letter.',
      'The bass spaces spell A-C-E-G from bottom to top. C is the 2nd space.',
      -- L5
      'Name this note',
      '{"clef":"bass","note":"G3","speed_threshold_ms":3000}',
      '["timed_select","staff_note_display"]',
      'G', 'F', 'A', 'E',
      'G3 is the 4th (top) space. Quick recognition strengthens reading fluency.',
      'G is the 4th space in the bass clef. Every line and space represents a specific pitch.',
      -- L6
      'In F major, C3 (2nd space) is scale degree...?',
      '{"key":"F","note":"C3"}',
      '["select_one"]',
      E'\u0035\u0302', E'\u0034\u0302', E'\u0036\u0302', E'\u0033\u0302',
      'In F major: F-G-A-Bb-C-D-E-F. C is the 5th degree — the dominant.',
      'Count up from F: F(1) G(2) A(3) Bb(4) C(5). C is the 5th degree.'
    ),
    -- ==============================
    -- Chain 4: Bass Clef Lines (unlock after treble lines L3)
    -- ==============================
    (
      'note_bass_lines',
      'Bass Clef Lines',
      '{"type":"neighbor_mastery","requires_chain":"note_treble_lines","min_link":3}',
      -- L1
      'Name this note',
      '{"clef":"bass","note":"G2"}',
      '["select_one","staff_note_display"]',
      'G', 'A', 'F', 'B',
      'G2 is the 1st (bottom) line of the bass clef. The bass lines spell G-B-D-F-A.',
      'The bottom line of the bass clef is G. Bass lines spell G-B-D-F-A.',
      -- L2
      'Name this note',
      '{"clef":"bass","note":"Eb3"}',
      '["select_one","staff_note_display"]',
      'Eb', 'D', 'E', 'Fb',
      'Eb sits on the same line/space as E, lowered by a half step.',
      'Accidentals modify the note by a half step — sharp raises, flat lowers.',
      -- L3
      'Name both notes (bottom to top)',
      '{"clef":"bass","notes":["B2","F3"]}',
      '["select_one","staff_multi_note"]',
      'B and F', 'A and E', 'C and G', 'B and G',
      'B (2nd line) and F (4th line) — two of the five bass lines G-B-D-F-A.',
      'Read from bottom to top. The bass lines spell G-B-D-F-A.',
      -- L4
      'Which line holds D in bass clef?',
      '{}',
      '["select_one"]',
      '3rd line', '2nd line', '4th line', '1st line',
      'D3 is the 3rd (middle) line. G-B-D-F-A: D is the third letter.',
      'The bass lines spell G-B-D-F-A from bottom to top. D is the 3rd line.',
      -- L5
      'Name this note',
      '{"clef":"bass","note":"D3","speed_threshold_ms":3000}',
      '["timed_select","staff_note_display"]',
      'D', 'C', 'E', 'B',
      'D3 is the 3rd line — the center of the bass staff.',
      'D is the 3rd line in the bass clef. Reading fluency comes from pattern recognition, not counting.',
      -- L6
      'In Bb major, D3 (3rd line) is scale degree...?',
      '{"key":"Bb","note":"D3"}',
      '["select_one"]',
      E'\u0033\u0302', E'\u0032\u0302', E'\u0034\u0302', E'\u0035\u0302',
      'In Bb major: Bb-C-D-Eb-F-G-A-Bb. D is the 3rd degree.',
      'Count up from Bb: Bb(1) C(2) D(3). D is the 3rd degree.'
    ),
    -- ==============================
    -- Chain 5: Ledger Lines Above (unlock after treble lines L4)
    -- ==============================
    (
      'note_ledger_above',
      'Ledger Lines Above',
      '{"type":"neighbor_mastery","requires_chain":"note_treble_lines","min_link":4}',
      -- L1
      'Name this note',
      '{"clef":"treble","note":"A5"}',
      '["select_one","staff_note_display"]',
      'A', 'G', 'B', 'F',
      'A5 sits on the first ledger line above the treble staff.',
      'The first ledger line above the treble staff holds A.',
      -- L2
      'Name this note',
      '{"clef":"treble","note":"Bb5"}',
      '["select_one","staff_note_display"]',
      'Bb', 'A', 'B', 'Ab',
      'Bb5 is just above the first ledger line — A flatted becomes Ab, but the space above A is B, flatted to Bb.',
      'Accidentals modify the note by a half step — sharp raises, flat lowers.',
      -- L3
      'Name both notes (bottom to top)',
      '{"clef":"treble","notes":["A5","C6"]}',
      '["select_one","staff_multi_note"]',
      'A and C', 'G and B', 'B and D', 'A and B',
      'A (1st ledger line) and C (2nd ledger line) — continue the alternating line-space pattern above the staff.',
      'Ledger lines extend the staff. Count up from the top line (F5): G (space), A (1st ledger), B (space), C (2nd ledger).',
      -- L4
      'The first ledger line above the treble staff holds...?',
      '{}',
      '["select_one"]',
      'A', 'G', 'B', 'C',
      'A5 is the first ledger line above. The staff top line is F5, then G5 (space above), then A5 (ledger line).',
      'Count up from the top line F: the space above is G, the first ledger line is A.',
      -- L5
      'Name this note',
      '{"clef":"treble","note":"B5","speed_threshold_ms":3000}',
      '["timed_select","staff_note_display"]',
      'B', 'C', 'A', 'D',
      'B5 sits in the space above the first ledger line.',
      'B5 is the space just above the first ledger line (A5). Every line and space represents a specific pitch.',
      -- L6
      'In C major, A5 (first ledger line above) is scale degree...?',
      '{"key":"C","note":"A5"}',
      '["select_one"]',
      E'\u0036\u0302', E'\u0035\u0302', E'\u0037\u0302', E'\u0034\u0302',
      'In C major: C-D-E-F-G-A-B-C. A is the 6th degree.',
      'Count up from C: C(1) D(2) E(3) F(4) G(5) A(6). A is the 6th degree.'
    ),
    -- ==============================
    -- Chain 6: Ledger Lines Below (unlock after treble spaces L4)
    -- ==============================
    (
      'note_ledger_below',
      'Ledger Lines Below',
      '{"type":"neighbor_mastery","requires_chain":"note_treble_spaces","min_link":4}',
      -- L1
      'Name this note',
      '{"clef":"treble","note":"C4"}',
      '["select_one","staff_note_display"]',
      'C', 'D', 'B', 'E',
      'C4 is middle C — it sits on the first ledger line below the treble staff.',
      'Middle C (C4) sits on the first ledger line below the treble staff.',
      -- L2
      'Name this note',
      '{"clef":"treble","note":"C#4"}',
      '["select_one","staff_note_display"]',
      'C#', 'D', 'C', 'B#',
      'C# is middle C raised by one half step. It sits on the same ledger line.',
      'Accidentals modify the note by a half step — sharp raises, flat lowers.',
      -- L3
      'Name both notes (bottom to top)',
      '{"clef":"treble","notes":["B3","C4"]}',
      '["select_one","staff_multi_note"]',
      'B and C', 'A and B', 'C and D', 'B and D',
      'B3 (space below middle C) and C4 (middle C) sit right next to each other.',
      'B3 is the space just below middle C. Ledger lines extend the staff downward.',
      -- L4
      'Middle C sits on...?',
      '{}',
      '["select_one"]',
      'First ledger line below treble', 'Bottom line', 'Second ledger line', 'First space',
      'Middle C sits on the first ledger line below the treble staff — a bridge between clefs.',
      'Middle C (C4) is one ledger line below the bottom of the treble staff.',
      -- L5
      'Name this note',
      '{"clef":"treble","note":"C4","speed_threshold_ms":3000}',
      '["timed_select","staff_note_display"]',
      'C', 'B', 'D', 'E',
      'Middle C is the most important reference point on the staff.',
      'Middle C sits on the first ledger line below treble. It is the anchor between both clefs.',
      -- L6
      'In G major, middle C (C4) is scale degree...?',
      '{"key":"G","note":"C4"}',
      '["select_one"]',
      E'\u0034\u0302', E'\u0033\u0302', E'\u0035\u0302', E'\u0031\u0302',
      'In G major: G-A-B-C-D-E-F#-G. C is the 4th degree.',
      'Count up from G: G(1) A(2) B(3) C(4). C is the 4th degree.'
    ),
    -- ==============================
    -- Chain 7: Grand Staff (unlock after bass_lines AND ledger_below L4)
    -- ==============================
    (
      'note_grand_staff',
      'Grand Staff',
      '{"type":"neighbor_mastery","requires_chains":["note_bass_lines","note_ledger_below"],"min_link":4}',
      -- L1
      'Name this note',
      '{"clef":"bass","note":"E3"}',
      '["select_one","staff_note_display"]',
      'E', 'F', 'D', 'G',
      'E3 is the 3rd space of the bass clef. The grand staff combines both clefs.',
      'E is the 3rd space in the bass clef. Bass spaces spell A-C-E-G.',
      -- L2
      'Name this note',
      '{"clef":"treble","note":"F#5"}',
      '["select_one","staff_note_display"]',
      'F#', 'G', 'F', 'E#',
      'F#5 is the top line of the treble clef (F5) raised by one half step.',
      'Accidentals modify the note by a half step — sharp raises, flat lowers.',
      -- L3
      'Both notes shown are the same letter name an octave apart. Name the note.',
      '{"clef":"grand","notes":["C3","C4"]}',
      '["select_one"]',
      'C', 'D', 'E', 'B',
      'Both are C — C3 in bass clef and C4 (middle C). The grand staff connects them.',
      'The grand staff connects treble and bass with middle C as the bridge between them.',
      -- L4
      'Where does middle C appear on the grand staff?',
      '{}',
      '["select_one"]',
      'Between both staves', 'On treble staff', 'On bass staff', 'On neither',
      'Middle C sits on its own ledger line between the two staves — it belongs to both.',
      'Middle C is written on a ledger line that sits between the treble and bass staves.',
      -- L5
      'Name this note',
      '{"clef":"bass","note":"A3","speed_threshold_ms":3000}',
      '["timed_select","staff_note_display"]',
      'A', 'G', 'B', 'F',
      'A3 is the 5th (top) line of the bass clef. Quick recognition across both clefs is the goal.',
      'A is the top line of the bass clef. Bass lines spell G-B-D-F-A.',
      -- L6
      'In the key of F, the note A3 in bass clef is scale degree...?',
      '{"key":"F","note":"A3"}',
      '["select_one"]',
      E'\u0033\u0302', E'\u0032\u0302', E'\u0034\u0302', E'\u0035\u0302',
      'In F major: F-G-A-Bb-C-D-E-F. A is the 3rd degree.',
      'Count up from F: F(1) G(2) A(3). A is the 3rd degree.'
    );

  -- Loop through each chain and create chain_definition + 6 links
  FOR r IN SELECT * FROM _nr_chains LOOP

    -- Insert chain_definition
    INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
    VALUES (r.slug, r.name, 'note_reading', NULL, 6, r.unlock_cond, true)
    RETURNING id INTO v_chain_id;

    -- ---- LINK 1: Note -> name ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_note_name', NULL, 'declarative', 'select_one',
      r.l1_prompt,
      ARRAY['note_reading'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l1_a),
          jsonb_build_object('id', 'b', 'label', r.l1_b),
          jsonb_build_object('id', 'c', 'label', r.l1_c),
          jsonb_build_object('id', 'd', 'label', r.l1_d)
        )
      ) || r.l1_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l1_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l1_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Identify note on staff', r.l1_modalities);

    -- ---- LINK 2: Note with accidental ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_accidental', NULL, 'declarative', 'select_one',
      r.l2_prompt,
      ARRAY['note_reading'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l2_a),
          jsonb_build_object('id', 'b', 'label', r.l2_b),
          jsonb_build_object('id', 'c', 'label', r.l2_c),
          jsonb_build_object('id', 'd', 'label', r.l2_d)
        )
      ) || r.l2_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l2_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l2_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Identify note with accidental', r.l2_modalities);

    -- ---- LINK 3: Two notes ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_two_notes', NULL, 'declarative', 'select_one',
      r.l3_prompt,
      ARRAY['note_reading'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l3_a),
          jsonb_build_object('id', 'b', 'label', r.l3_b),
          jsonb_build_object('id', 'c', 'label', r.l3_c),
          jsonb_build_object('id', 'd', 'label', r.l3_d)
        )
      ) || r.l3_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l3_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l3_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Identify two notes simultaneously', r.l3_modalities);

    -- ---- LINK 4: Reverse — name to position ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_reverse', NULL, 'declarative', 'select_one',
      r.l4_prompt,
      ARRAY['note_reading'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l4_a),
          jsonb_build_object('id', 'b', 'label', r.l4_b),
          jsonb_build_object('id', 'c', 'label', r.l4_c),
          jsonb_build_object('id', 'd', 'label', r.l4_d)
        )
      ) || r.l4_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l4_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l4_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Name to staff position (reverse)', r.l4_modalities);

    -- ---- LINK 5: Speed drill ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_speed', NULL, 'declarative', 'select_one',
      r.l5_prompt,
      ARRAY['note_reading'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l5_a),
          jsonb_build_object('id', 'b', 'label', r.l5_b),
          jsonb_build_object('id', 'c', 'label', r.l5_c),
          jsonb_build_object('id', 'd', 'label', r.l5_d)
        )
      ) || r.l5_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l5_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l5_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Timed note identification', r.l5_modalities);

    -- ---- LINK 6: Note in key context -> scale degree ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_degree', NULL, 'declarative', 'select_one',
      r.l6_prompt,
      ARRAY['note_reading'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l6_a),
          jsonb_build_object('id', 'b', 'label', r.l6_b),
          jsonb_build_object('id', 'c', 'label', r.l6_c),
          jsonb_build_object('id', 'd', 'label', r.l6_d)
        )
      ) || r.l6_params,
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l6_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l6_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Scale degree in key context', r.l6_modalities);

  END LOOP;

  DROP TABLE _nr_chains;
  RAISE NOTICE 'Topic 8 Note Reading: 7 chains, 42 card templates, 42 card instances, 42 chain links seeded';
END $$;
