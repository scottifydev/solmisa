-- Update key signature chain_links modality_by_stage to include
-- virtuoso and mastered entries. Without these, high-stage cards
-- fall back to the first modality in the array (usually select_one),
-- losing the progression to staff-based and accidental-placement modalities.

-- Link 1 (Identify): add virtuoso + mastered → staff_to_name
-- (clef override in stream-builder handles bass/random clef)
UPDATE chain_links
SET modality_by_stage = modality_by_stage
  || '{"virtuoso":"staff_to_name","mastered":"staff_to_name"}'::jsonb
FROM chain_definitions cd
WHERE chain_links.chain_id = cd.id
  AND cd.topic = 'key_signatures'
  AND chain_links.position = 1;

-- Link 2 (Spell): add virtuoso → accidental_input, mastered → staff_accidental
UPDATE chain_links
SET modality_by_stage = modality_by_stage
  || '{"virtuoso":"accidental_input","mastered":"staff_accidental"}'::jsonb
FROM chain_definitions cd
WHERE chain_links.chain_id = cd.id
  AND cd.topic = 'key_signatures'
  AND chain_links.position = 2;

-- Link 3 (Modal alteration): add virtuoso + mastered → audio_to_name
UPDATE chain_links
SET modality_by_stage = modality_by_stage
  || '{"virtuoso":"audio_to_name","mastered":"audio_to_name"}'::jsonb
FROM chain_definitions cd
WHERE chain_links.chain_id = cd.id
  AND cd.topic = 'key_signatures'
  AND chain_links.position = 3;

-- Link 4 (Brightness): add virtuoso + mastered → drag_rank
UPDATE chain_links
SET modality_by_stage = modality_by_stage
  || '{"virtuoso":"drag_rank","mastered":"drag_rank"}'::jsonb
FROM chain_definitions cd
WHERE chain_links.chain_id = cd.id
  AND cd.topic = 'key_signatures'
  AND chain_links.position = 4;

-- Link 5 (Relative minor): add virtuoso + mastered → binary_choice
UPDATE chain_links
SET modality_by_stage = modality_by_stage
  || '{"virtuoso":"binary_choice","mastered":"binary_choice"}'::jsonb
FROM chain_definitions cd
WHERE chain_links.chain_id = cd.id
  AND cd.topic = 'key_signatures'
  AND chain_links.position = 5;

-- Link 6 (V chord): add mastered → staff_placement
-- (uses the new staff_placement modality for placing key sig accidentals)
UPDATE chain_links
SET modalities = '["select_one","staff_placement"]'::jsonb,
    modality_by_stage = '{"apprentice":"select_one","mastered":"staff_placement"}'::jsonb
FROM chain_definitions cd
WHERE chain_links.chain_id = cd.id
  AND cd.topic = 'key_signatures'
  AND chain_links.position = 6;
