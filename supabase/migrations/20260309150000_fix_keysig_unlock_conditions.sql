-- Fix key signature unlock conditions: cold_start → cross_topic_mastery
-- Per Topic Activation Order v2, Key Signatures are Tier 1b:
-- unlocked when Note Reading reaches link 2+
--
-- The 5 starter key sig chains were cold_start but should require
-- note_reading topic mastery first.

UPDATE chain_definitions
SET unlock_condition = '{"type":"cross_topic_mastery","required_topic":"note_reading","min_link":2}'::jsonb
WHERE slug IN ('key_c_major', 'key_g_major', 'key_d_major', 'key_f_major', 'key_bb_major')
  AND unlock_condition->>'type' = 'cold_start';
