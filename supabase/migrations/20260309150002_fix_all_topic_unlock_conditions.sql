-- Fix unlock conditions per Topic Activation Order v2
-- Tier 0 cold start (CORRECT, no changes needed):
--   scale_degree_feeling: degree_1, degree_5, degree_3
--   chord_quality_ear_id: chord_quality_major, chord_quality_minor
--   note_reading: note_treble_spaces, note_treble_lines
--   rhythm: rhythm_4_4
--
-- Key Signatures cold_start → cross_topic already handled in 20260309150000

-- Tier 1: Modes — unlock when Scale Degree Feeling (Tier 0) reaches L3
UPDATE chain_definitions
SET unlock_condition = '{"type":"cross_topic_mastery","required_topic":"scale_degree_feeling","min_link":3}'::jsonb
WHERE slug IN ('mode_ionian', 'mode_aeolian')
  AND unlock_condition->>'type' = 'cold_start';

-- Tier 1: Intervals — unlock when Scale Degree Feeling (Tier 0) reaches L3
UPDATE chain_definitions
SET unlock_condition = '{"type":"cross_topic_mastery","required_topic":"scale_degree_feeling","min_link":3}'::jsonb
WHERE slug IN ('interval_M2', 'interval_M3', 'interval_P4', 'interval_P5', 'interval_P8')
  AND unlock_condition->>'type' = 'cold_start';

-- Tier 2: Chord Inversions — unlock when Chord Quality reaches L3
UPDATE chain_definitions
SET unlock_condition = '{"type":"cross_topic_mastery","required_topic":"chord_quality_ear_id","min_link":3}'::jsonb
WHERE slug IN ('inv_major_triads', 'inv_minor_triads')
  AND unlock_condition->>'type' = 'cold_start';

-- Tier 2: Chord Spelling — unlock when Chord Quality reaches L3
UPDATE chain_definitions
SET unlock_condition = '{"type":"cross_topic_mastery","required_topic":"chord_quality_ear_id","min_link":3}'::jsonb
WHERE slug IN ('spell_major', 'spell_minor')
  AND unlock_condition->>'type' = 'cold_start';

-- Tier 2: Harmonic Function — unlock when Chord Quality reaches L3
UPDATE chain_definitions
SET unlock_condition = '{"type":"cross_topic_mastery","required_topic":"chord_quality_ear_id","min_link":3}'::jsonb
WHERE slug IN ('hf_tonic', 'hf_dominant', 'hf_subdominant')
  AND unlock_condition->>'type' = 'cold_start';

-- Tier 2: Cadence Recognition — unlock when Chord Quality reaches L3
-- (Ideally dual prereq with harmonic_function, but cross_topic_mastery
--  currently supports single topic. Use chord_quality as primary gate.)
UPDATE chain_definitions
SET unlock_condition = '{"type":"cross_topic_mastery","required_topic":"chord_quality_ear_id","min_link":3}'::jsonb
WHERE slug IN ('cadence_authentic', 'cadence_plagal')
  AND unlock_condition->>'type' = 'cold_start';

-- Tier 2: Enharmonics — unlock when Key Signatures reaches L3
UPDATE chain_definitions
SET unlock_condition = '{"type":"cross_topic_mastery","required_topic":"key_signatures","min_link":3}'::jsonb
WHERE slug IN ('enharmonic_notes', 'enharmonic_intervals', 'enharmonic_keys')
  AND unlock_condition->>'type' = 'cold_start';

-- Tier 2: Circle of Fifths — unlock when Key Signatures reaches L3
UPDATE chain_definitions
SET unlock_condition = '{"type":"cross_topic_mastery","required_topic":"key_signatures","min_link":3}'::jsonb
WHERE slug IN ('cof_clockwise', 'cof_counterclockwise')
  AND unlock_condition->>'type' = 'cold_start';
