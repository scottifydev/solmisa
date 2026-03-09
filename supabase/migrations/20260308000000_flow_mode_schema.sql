-- SCO-314: Flow Mode schema + 15 key signature chains
-- 3 tables, 15 chain_definitions, 90 card_templates, 90 card_instances, 90 chain_links

-- =============================================
-- Part 1: Schema
-- =============================================

CREATE TABLE chain_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  root_key TEXT,
  total_links INTEGER NOT NULL,
  unlock_condition JSONB DEFAULT '{"type":"cold_start"}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chain_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID NOT NULL REFERENCES chain_definitions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  card_template_id UUID NOT NULL REFERENCES card_templates(id),
  unlock_stage TEXT NOT NULL DEFAULT 'journeyman_1',
  description TEXT,
  modalities JSONB NOT NULL DEFAULT '["select_one"]',
  modality_by_stage JSONB DEFAULT '{}',
  UNIQUE(chain_id, position)
);

CREATE TABLE user_chain_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chain_id UUID NOT NULL REFERENCES chain_definitions(id) ON DELETE CASCADE,
  highest_unlocked_position INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  completed_once BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  total_reviews INTEGER DEFAULT 0,
  UNIQUE(user_id, chain_id)
);

-- RLS
ALTER TABLE chain_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chain_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_published" ON chain_definitions FOR SELECT USING (is_published = true);
CREATE POLICY "read_links" ON chain_links FOR SELECT USING (
  EXISTS (SELECT 1 FROM chain_definitions WHERE id = chain_links.chain_id AND is_published = true)
);
CREATE POLICY "own_progress" ON user_chain_progress FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_chain_links_chain ON chain_links (chain_id, position);
CREATE INDEX idx_user_chain_progress_user ON user_chain_progress (user_id) WHERE is_active = true;

-- =============================================
-- Part 2: Seed 15 key signature chains
-- =============================================

DO $$
DECLARE
  r RECORD;
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  -- Temp table with all key data
  CREATE TEMP TABLE _keys (
    slug TEXT, name TEXT, root_key TEXT, root_note TEXT,
    acc_count INT, acc_type TEXT, acc_list TEXT,
    unlock_cond JSONB,
    rel_minor TEXT, v_chord TEXT,
    -- link 1 options (identify): 4 keys
    id_opt_a TEXT, id_opt_b TEXT, id_opt_c TEXT, id_opt_d TEXT,
    -- link 2 options (spell): 4 accidental lists
    sp_opt_a TEXT, sp_opt_b TEXT, sp_opt_c TEXT, sp_opt_d TEXT,
    -- link 5 options (relative minor): 4 minors
    rm_opt_a TEXT, rm_opt_b TEXT, rm_opt_c TEXT, rm_opt_d TEXT,
    -- link 6 options (V chord): 4 chords
    vc_opt_a TEXT, vc_opt_b TEXT, vc_opt_c TEXT, vc_opt_d TEXT
  );

  INSERT INTO _keys VALUES
    -- Cold start keys
    ('key_c_major','C major','C','C',0,'none','none',
     '{"type":"cold_start"}',
     'Am','G',
     'C major','G major','F major','D major',
     'No sharps or flats','F#','Bb','F#, C#',
     'Am','Em','Dm','Gm',
     'G','D','F','C'),
    ('key_g_major','G major','G','G',1,'sharp','F#',
     '{"type":"cold_start"}',
     'Em','D',
     'G major','C major','D major','F major',
     'F#','Bb','F#, C#','No sharps or flats',
     'Em','Am','Bm','Dm',
     'D','G','A','C'),
    ('key_d_major','D major','D','D',2,'sharp','F#, C#',
     '{"type":"cold_start"}',
     'Bm','A',
     'D major','G major','A major','C major',
     'F#, C#','F#','F#, C#, G#','Bb',
     'Bm','Em','F#m','Am',
     'A','D','E','G'),
    ('key_f_major','F major','F','F',1,'flat','Bb',
     '{"type":"cold_start"}',
     'Dm','C',
     'F major','C major','Bb major','G major',
     'Bb','F#','Bb, Eb','No sharps or flats',
     'Dm','Am','Gm','Em',
     'C','F','G','Bb'),
    ('key_bb_major','Bb major','Bb','Bb',2,'flat','Bb, Eb',
     '{"type":"cold_start"}',
     'Gm','F',
     'Bb major','F major','Eb major','C major',
     'Bb, Eb','Bb','Bb, Eb, Ab','F#',
     'Gm','Dm','Cm','Am',
     'F','Bb','C','Eb'),
    -- Neighbor unlock: sharp side
    ('key_a_major','A major','A','A',3,'sharp','F#, C#, G#',
     '{"type":"neighbor_mastery","requires_chain":"key_d_major","min_link":3}',
     'F#m','E',
     'A major','D major','E major','G major',
     'F#, C#, G#','F#, C#','F#, C#, G#, D#','F#',
     'F#m','Bm','C#m','Em',
     'E','A','B','D'),
    ('key_e_major','E major','E','E',4,'sharp','F#, C#, G#, D#',
     '{"type":"neighbor_mastery","requires_chain":"key_a_major","min_link":3}',
     'C#m','B',
     'E major','A major','B major','D major',
     'F#, C#, G#, D#','F#, C#, G#','F#, C#, G#, D#, A#','F#, C#',
     'C#m','F#m','G#m','Bm',
     'B','E','F#','A'),
    ('key_b_major','B major','B','B',5,'sharp','F#, C#, G#, D#, A#',
     '{"type":"neighbor_mastery","requires_chain":"key_e_major","min_link":3}',
     'G#m','F#',
     'B major','E major','F# major','A major',
     'F#, C#, G#, D#, A#','F#, C#, G#, D#','F#, C#, G#, D#, A#, E#','F#, C#, G#',
     'G#m','C#m','D#m','F#m',
     'F#','B','C#','E'),
    ('key_fs_major','F# major','F#','F#',6,'sharp','F#, C#, G#, D#, A#, E#',
     '{"type":"neighbor_mastery","requires_chain":"key_b_major","min_link":3}',
     'D#m','C#',
     'F# major','B major','C# major','E major',
     'F#, C#, G#, D#, A#, E#','F#, C#, G#, D#, A#','F#, C#, G#, D#, A#, E#, B#','F#, C#, G#, D#',
     'D#m','G#m','A#m','C#m',
     'C#','F#','G#','B'),
    ('key_cs_major','C# major','C#','C#',7,'sharp','F#, C#, G#, D#, A#, E#, B#',
     '{"type":"neighbor_mastery","requires_chain":"key_fs_major","min_link":3}',
     'A#m','G#',
     'C# major','F# major','G# major','B major',
     'F#, C#, G#, D#, A#, E#, B#','F#, C#, G#, D#, A#, E#','F#, C#, G#, D#, A#','F#, C#, G#, D#, A#, E#',
     'A#m','D#m','E#m','G#m',
     'G#','C#','D#','F#'),
    -- Neighbor unlock: flat side
    ('key_eb_major','Eb major','Eb','Eb',3,'flat','Bb, Eb, Ab',
     '{"type":"neighbor_mastery","requires_chain":"key_bb_major","min_link":3}',
     'Cm','Bb',
     'Eb major','Bb major','Ab major','F major',
     'Bb, Eb, Ab','Bb, Eb','Bb, Eb, Ab, Db','Bb',
     'Cm','Gm','Fm','Dm',
     'Bb','Eb','F','Ab'),
    ('key_ab_major','Ab major','Ab','Ab',4,'flat','Bb, Eb, Ab, Db',
     '{"type":"neighbor_mastery","requires_chain":"key_eb_major","min_link":3}',
     'Fm','Eb',
     'Ab major','Eb major','Db major','Bb major',
     'Bb, Eb, Ab, Db','Bb, Eb, Ab','Bb, Eb, Ab, Db, Gb','Bb, Eb',
     'Fm','Cm','Bbm','Gm',
     'Eb','Ab','Bb','Db'),
    ('key_db_major','Db major','Db','Db',5,'flat','Bb, Eb, Ab, Db, Gb',
     '{"type":"neighbor_mastery","requires_chain":"key_ab_major","min_link":3}',
     'Bbm','Ab',
     'Db major','Ab major','Gb major','Eb major',
     'Bb, Eb, Ab, Db, Gb','Bb, Eb, Ab, Db','Bb, Eb, Ab, Db, Gb, Cb','Bb, Eb, Ab',
     'Bbm','Fm','Ebm','Cm',
     'Ab','Db','Eb','Gb'),
    ('key_gb_major','Gb major','Gb','Gb',6,'flat','Bb, Eb, Ab, Db, Gb, Cb',
     '{"type":"neighbor_mastery","requires_chain":"key_db_major","min_link":3}',
     'Ebm','Db',
     'Gb major','Db major','Cb major','Ab major',
     'Bb, Eb, Ab, Db, Gb, Cb','Bb, Eb, Ab, Db, Gb','Bb, Eb, Ab, Db, Gb, Cb, Fb','Bb, Eb, Ab, Db',
     'Ebm','Bbm','Abm','Fm',
     'Db','Gb','Ab','Cb'),
    ('key_cb_major','Cb major','Cb','Cb',7,'flat','Bb, Eb, Ab, Db, Gb, Cb, Fb',
     '{"type":"neighbor_mastery","requires_chain":"key_gb_major","min_link":3}',
     'Abm','Gb',
     'Cb major','Gb major','Fb major','Db major',
     'Bb, Eb, Ab, Db, Gb, Cb, Fb','Bb, Eb, Ab, Db, Gb, Cb','Bb, Eb, Ab, Db, Gb','Bb, Eb, Ab, Db, Gb, Cb',
     'Abm','Ebm','Gbm','Bbm',
     'Gb','Cb','Db','Fb');

  -- Loop through each key and create chain + 6 links
  FOR r IN SELECT * FROM _keys LOOP

    -- Insert chain_definition
    INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
    VALUES (r.slug, r.name, 'key_signatures', r.root_key, 6, r.unlock_cond, true)
    RETURNING id INTO v_chain_id;

    -- ---- LINK 1: Identify ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_identify', NULL, 'declarative', 'select_one',
      CASE
        WHEN r.acc_count = 0 THEN 'What major key has no sharps or flats?'
        WHEN r.acc_type = 'sharp' AND r.acc_count = 1 THEN 'What major key has 1 sharp?'
        WHEN r.acc_type = 'sharp' THEN 'What major key has ' || r.acc_count || ' sharps?'
        WHEN r.acc_count = 1 THEN 'What major key has 1 flat?'
        ELSE 'What major key has ' || r.acc_count || ' flats?'
      END,
      ARRAY['key_signatures'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.id_opt_a),
          jsonb_build_object('id', 'b', 'label', r.id_opt_b),
          jsonb_build_object('id', 'c', 'label', r.id_opt_c),
          jsonb_build_object('id', 'd', 'label', r.id_opt_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.name || ' — you know the circle of fifths.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'Count the accidentals on the circle of fifths.', 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Identify key by accidental count',
      '["select_one","staff_to_name","sharps_to_name"]'::JSONB,
      '{"apprentice":"select_one","journeyman":"sharps_to_name","adept":"staff_to_name"}'::JSONB);

    -- ---- LINK 2: Spell ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_spell', NULL, 'declarative', 'select_one',
      CASE
        WHEN r.acc_count = 0 THEN 'Name the accidentals in C major'
        ELSE 'Name all the ' || CASE WHEN r.acc_type = 'sharp' THEN 'sharps' ELSE 'flats' END || ' in ' || r.name || ', in order'
      END,
      ARRAY['key_signatures'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a', 'correct_accidentals', r.acc_list, 'ordered', true),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.sp_opt_a),
          jsonb_build_object('id', 'b', 'label', r.sp_opt_b),
          jsonb_build_object('id', 'c', 'label', r.sp_opt_c),
          jsonb_build_object('id', 'd', 'label', r.sp_opt_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'The order of ' || CASE WHEN r.acc_type = 'sharp' THEN 'sharps' WHEN r.acc_type = 'flat' THEN 'flats' ELSE 'accidentals' END || ' follows the circle of fifths.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'Sharps: F C G D A E B. Flats: B E A D G C F — the reverse.', 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Spell accidentals in order',
      '["select_one","accidental_input","partial_fill"]'::JSONB,
      '{"apprentice":"select_one","journeyman":"partial_fill","adept":"accidental_input"}'::JSONB);

    -- ---- LINK 3: Modal alteration ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_mode', NULL, 'declarative', 'select_one',
      r.name || ', but raise the 4th degree. What mode?',
      ARRAY['key_signatures'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', 'Lydian'),
          jsonb_build_object('id', 'b', 'label', 'Ionian'),
          jsonb_build_object('id', 'c', 'label', 'Mixolydian'),
          jsonb_build_object('id', 'd', 'label', 'Dorian')
        ),
        'audio_config', jsonb_build_object('type', 'scale', 'root', r.root_note || '3', 'scaleType', 'lydian', 'direction', 'ascending', 'tempo', 3)
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Raising the 4th degree produces the Lydian mode — the brightest of all.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'A raised 4th is the signature of Lydian. It is the brightest mode.', 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Modal alteration — raised 4th',
      '["select_one","audio_to_name"]'::JSONB,
      '{"apprentice":"select_one","adept":"audio_to_name"}'::JSONB);

    -- ---- LINK 4: Brightness spectrum ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_brightness', NULL, 'declarative', 'select_one',
      'Order these modes from brightest to darkest',
      ARRAY['key_signatures'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_order', jsonb_build_array('lydian', 'ionian', 'mixolydian', 'dorian')),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'lydian', 'label', 'Lydian'),
          jsonb_build_object('id', 'ionian', 'label', 'Ionian'),
          jsonb_build_object('id', 'mixolydian', 'label', 'Mixolydian'),
          jsonb_build_object('id', 'dorian', 'label', 'Dorian')
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'Lydian (brightest) > Ionian > Mixolydian > Dorian (darkest of these four).', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'Each flat added darkens: Lydian (#4) > Ionian (natural) > Mixolydian (b7) > Dorian (b3, b7).', 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Brightness spectrum ordering',
      '["drag_rank"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 5: Relative minor ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_relative', NULL, 'declarative', 'select_one',
      'What is the relative minor of ' || r.name || '?',
      ARRAY['key_signatures'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.rm_opt_a),
          jsonb_build_object('id', 'b', 'label', r.rm_opt_b),
          jsonb_build_object('id', 'c', 'label', r.rm_opt_c),
          jsonb_build_object('id', 'd', 'label', r.rm_opt_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'The relative minor is built on the 6th degree — same key signature, different tonic.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'Count down 3 half steps from the major tonic, or up to the 6th degree.', 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Relative minor identification',
      '["select_one","binary_choice"]'::JSONB,
      '{"apprentice":"select_one","journeyman":"binary_choice"}'::JSONB);

    -- ---- LINK 6: V chord ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_vchord', NULL, 'declarative', 'select_one',
      'What is the V chord in ' || r.name || '?',
      ARRAY['key_signatures'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.vc_opt_a),
          jsonb_build_object('id', 'b', 'label', r.vc_opt_b),
          jsonb_build_object('id', 'c', 'label', r.vc_opt_c),
          jsonb_build_object('id', 'd', 'label', r.vc_opt_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', 'The V chord is built on the 5th degree — the dominant.', 'show_answer', true),
        'incorrect', jsonb_build_object('text', 'Count up to the 5th note of the major scale. The major triad there is the V chord.', 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Diatonic V chord identification',
      '["select_one"]'::JSONB, '{}'::JSONB);

  END LOOP;

  DROP TABLE _keys;
  RAISE NOTICE 'Flow mode: 15 chains, 90 card templates, 90 card instances, 90 chain links seeded';
END $$;
