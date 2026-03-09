-- Topic 6: Chord Spelling
-- 8 chains x 6 links = 48 card_templates, 48 card_instances, 48 chain_links

DO $$
DECLARE
  r RECORD;
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  CREATE TEMP TABLE _cs_chains (
    slug TEXT, name TEXT,
    unlock_cond JSONB,
    -- L1: Interval formula
    l1_prompt TEXT,
    l1_a TEXT, l1_b TEXT, l1_c TEXT, l1_d TEXT,
    l1_fb_correct TEXT, l1_fb_incorrect TEXT,
    -- L2: Interval stack
    l2_prompt TEXT,
    l2_a TEXT, l2_b TEXT, l2_c TEXT, l2_d TEXT,
    l2_fb_correct TEXT, l2_fb_incorrect TEXT,
    -- L3: Name the 3rd
    l3_prompt TEXT,
    l3_a TEXT, l3_b TEXT, l3_c TEXT, l3_d TEXT,
    l3_fb_correct TEXT, l3_fb_incorrect TEXT,
    -- L4: Difference from related chord
    l4_prompt TEXT,
    l4_a TEXT, l4_b TEXT, l4_c TEXT, l4_d TEXT,
    l4_fb_correct TEXT, l4_fb_incorrect TEXT,
    -- L5: 7th connection
    l5_prompt TEXT,
    l5_a TEXT, l5_b TEXT, l5_c TEXT, l5_d TEXT,
    l5_fb_correct TEXT, l5_fb_incorrect TEXT,
    -- L6: Symbol -> interval formula
    l6_prompt TEXT,
    l6_a TEXT, l6_b TEXT, l6_c TEXT, l6_d TEXT,
    l6_fb_correct TEXT, l6_fb_incorrect TEXT
  );

  INSERT INTO _cs_chains VALUES
    -- ==============================
    -- Chain 1: Major Triad (cold start)
    -- ==============================
    (
      'spell_major',
      'Major Triad',
      '{"type":"cold_start"}',
      -- L1
      'What is the interval formula for a major triad?',
      'R - M3 - P5', 'R - m3 - P5', 'R - M3 - A5', 'R - m3 - d5',
      'The major triad is built from a root, major 3rd, and perfect 5th. This is the most common chord in tonal music.',
      'A major triad stacks a major 3rd above the root, then a perfect 5th above the root: R - M3 - P5.',
      -- L2
      'What intervals are stacked in a major triad?',
      'M3 + m3', 'm3 + M3', 'M3 + M3', 'm3 + m3',
      'A major triad stacks a major 3rd on the bottom and a minor 3rd on top. The two thirds add up to a perfect 5th.',
      'From root to 3rd is a major 3rd (4 half steps). From 3rd to 5th is a minor 3rd (3 half steps). Together: M3 + m3.',
      -- L3
      'What type of 3rd does a major triad have?',
      'Major 3rd', 'Minor 3rd', 'Augmented 3rd', 'Diminished 3rd',
      'The major 3rd is 4 half steps above the root. It gives the major triad its bright, stable character.',
      'A major triad contains a major 3rd (4 half steps) above the root. The 3rd defines the chord quality.',
      -- L4
      'How does a major triad differ from a minor triad?',
      'The 3rd is a half step higher', 'The 5th is a half step higher', 'The root is different', 'The 3rd is a half step lower',
      'Major and minor triads share the same root and perfect 5th. The only difference is the 3rd — major is a half step higher.',
      'Compare R-M3-P5 (major) with R-m3-P5 (minor). The 3rd moves by one half step. Everything else stays the same.',
      -- L5
      'What 7th would you add to a major triad to make a dominant 7th chord?',
      'Minor 7th', 'Major 7th', 'Diminished 7th', 'Augmented 7th',
      'A dominant 7th chord is a major triad plus a minor 7th. The tension between the major 3rd and minor 7th defines its sound.',
      'The dominant 7th adds a minor 7th (10 half steps from the root) to a major triad: R - M3 - P5 - m7.',
      -- L6
      'Given the symbol C, what is the interval formula?',
      'R - M3 - P5', 'R - m3 - P5', 'R - M3 - P5 - M7', 'R - m3 - P5 - m7',
      'A letter name alone (like C) indicates a major triad: root, major 3rd, perfect 5th.',
      'When no suffix appears after the letter name, the chord is major. C = R - M3 - P5.'
    ),
    -- ==============================
    -- Chain 2: Minor Triad (cold start)
    -- ==============================
    (
      'spell_minor',
      'Minor Triad',
      '{"type":"cold_start"}',
      -- L1
      'What is the interval formula for a minor triad?',
      'R - m3 - P5', 'R - M3 - P5', 'R - m3 - d5', 'R - M3 - A5',
      'The minor triad is built from a root, minor 3rd, and perfect 5th. The lowered 3rd gives it a darker quality.',
      'A minor triad: R - m3 - P5. The minor 3rd (3 half steps) is the defining interval.',
      -- L2
      'What intervals are stacked in a minor triad?',
      'm3 + M3', 'M3 + m3', 'm3 + m3', 'M3 + M3',
      'A minor triad stacks a minor 3rd on the bottom and a major 3rd on top — the reverse of a major triad.',
      'From root to 3rd is a minor 3rd (3 half steps). From 3rd to 5th is a major 3rd (4 half steps). Together: m3 + M3.',
      -- L3
      'What type of 3rd does a minor triad have?',
      'Minor 3rd', 'Major 3rd', 'Augmented 3rd', 'Diminished 3rd',
      'The minor 3rd is 3 half steps above the root. This single interval is what makes a chord minor.',
      'A minor triad contains a minor 3rd (3 half steps) above the root. The 3rd determines whether a chord sounds major or minor.',
      -- L4
      'How does a minor triad differ from a major triad?',
      'The 3rd is a half step lower', 'The 5th is a half step lower', 'The root is different', 'The 3rd is a half step higher',
      'Minor and major triads share the same root and perfect 5th. The 3rd is lowered by one half step in minor.',
      'Compare R-m3-P5 (minor) with R-M3-P5 (major). Only the 3rd changes — it drops by a half step in minor.',
      -- L5
      'What 7th would you add to a minor triad to make a minor 7th chord?',
      'Minor 7th', 'Major 7th', 'Diminished 7th', 'Augmented 7th',
      'A minor 7th chord is a minor triad plus a minor 7th. Both the 3rd and 7th are minor intervals.',
      'The minor 7th chord adds a minor 7th (10 half steps from the root) to a minor triad: R - m3 - P5 - m7.',
      -- L6
      'Given the symbol Cm, what is the interval formula?',
      'R - m3 - P5', 'R - M3 - P5', 'R - m3 - d5', 'R - m3 - P5 - m7',
      'The lowercase "m" suffix indicates a minor triad: root, minor 3rd, perfect 5th.',
      'The "m" after the letter name means minor. Cm = R - m3 - P5.'
    ),
    -- ==============================
    -- Chain 3: Diminished Triad (unlock: spell_minor L3)
    -- ==============================
    (
      'spell_dim',
      'Diminished Triad',
      '{"type":"neighbor_mastery","requires_chain":"spell_minor","min_link":3}',
      -- L1
      'What is the interval formula for a diminished triad?',
      'R - m3 - d5', 'R - m3 - P5', 'R - M3 - d5', 'R - M3 - P5',
      'The diminished triad has a minor 3rd and a diminished 5th. Both intervals are compressed, creating an unstable, tense sound.',
      'A diminished triad: R - m3 - d5. The diminished 5th (6 half steps) is one half step smaller than a perfect 5th.',
      -- L2
      'What intervals are stacked in a diminished triad?',
      'm3 + m3', 'M3 + m3', 'm3 + M3', 'M3 + M3',
      'Two minor 3rds stacked on top of each other. This symmetrical construction creates the tritone between root and 5th.',
      'From root to 3rd is a minor 3rd (3 half steps). From 3rd to 5th is another minor 3rd (3 half steps). Together: m3 + m3.',
      -- L3
      'What type of 3rd does a diminished triad have?',
      'Minor 3rd', 'Major 3rd', 'Augmented 3rd', 'Diminished 3rd',
      'Like the minor triad, the diminished triad has a minor 3rd. The difference is the 5th — diminished instead of perfect.',
      'A diminished triad contains a minor 3rd (3 half steps) above the root, same as a minor triad.',
      -- L4
      'How does a diminished triad differ from a minor triad?',
      'The 5th is lowered by a half step', 'The 3rd is lowered by a half step', 'The root is raised', 'The 5th is raised by a half step',
      'Both have a minor 3rd. The diminished triad lowers the 5th by a half step — from perfect to diminished.',
      'Compare R-m3-d5 (diminished) with R-m3-P5 (minor). The 3rd is the same. The 5th drops by one half step.',
      -- L5
      'What 7th would you add to a diminished triad to make a half-diminished 7th chord?',
      'Minor 7th', 'Major 7th', 'Diminished 7th', 'Augmented 7th',
      'A half-diminished 7th is a diminished triad plus a minor 7th. It is common as the ii chord in minor keys.',
      'The half-diminished 7th adds a minor 7th to a diminished triad: R - m3 - d5 - m7.',
      -- L6
      'Given the symbol Cdim, what is the interval formula?',
      'R - m3 - d5', 'R - m3 - P5', 'R - M3 - d5', 'R - m3 - d5 - m7',
      'The "dim" suffix indicates a diminished triad: root, minor 3rd, diminished 5th.',
      'Cdim = R - m3 - d5. The "dim" tells you both the 3rd is minor and the 5th is diminished.'
    ),
    -- ==============================
    -- Chain 4: Augmented Triad (unlock: spell_major L3)
    -- ==============================
    (
      'spell_aug',
      'Augmented Triad',
      '{"type":"neighbor_mastery","requires_chain":"spell_major","min_link":3}',
      -- L1
      'What is the interval formula for an augmented triad?',
      'R - M3 - A5', 'R - M3 - P5', 'R - m3 - A5', 'R - m3 - P5',
      'The augmented triad has a major 3rd and an augmented 5th. The raised 5th creates an expansive, unresolved sound.',
      'An augmented triad: R - M3 - A5. The augmented 5th (8 half steps) is one half step larger than a perfect 5th.',
      -- L2
      'What intervals are stacked in an augmented triad?',
      'M3 + M3', 'M3 + m3', 'm3 + M3', 'm3 + m3',
      'Two major 3rds stacked on top of each other. This symmetrical construction divides the octave into three equal parts.',
      'From root to 3rd is a major 3rd (4 half steps). From 3rd to 5th is another major 3rd (4 half steps). Together: M3 + M3.',
      -- L3
      'What type of 3rd does an augmented triad have?',
      'Major 3rd', 'Minor 3rd', 'Augmented 3rd', 'Diminished 3rd',
      'Like the major triad, the augmented triad has a major 3rd. The difference is the 5th — augmented instead of perfect.',
      'An augmented triad contains a major 3rd (4 half steps) above the root, same as a major triad.',
      -- L4
      'How does an augmented triad differ from a major triad?',
      'The 5th is raised by a half step', 'The 3rd is raised by a half step', 'The root is different', 'The 5th is lowered by a half step',
      'Both have a major 3rd. The augmented triad raises the 5th by a half step — from perfect to augmented.',
      'Compare R-M3-A5 (augmented) with R-M3-P5 (major). The 3rd is the same. The 5th rises by one half step.',
      -- L5
      'What 7th would you add to an augmented triad to make a major 7th #5 chord?',
      'Major 7th', 'Minor 7th', 'Diminished 7th', 'Augmented 7th',
      'An augmented triad with a major 7th creates an augmented major 7th chord (maj7#5), used in jazz and film scores.',
      'Adding a major 7th to an augmented triad gives R - M3 - A5 - M7.',
      -- L6
      'Given the symbol Caug, what is the interval formula?',
      'R - M3 - A5', 'R - M3 - P5', 'R - m3 - A5', 'R - M3 - A5 - M7',
      'The "aug" suffix indicates an augmented triad: root, major 3rd, augmented 5th.',
      'Caug = R - M3 - A5. The "aug" tells you the 5th is raised by a half step from perfect.'
    ),
    -- ==============================
    -- Chain 5: Dominant 7th (unlock: spell_major L3)
    -- ==============================
    (
      'spell_dom7',
      'Dominant 7th',
      '{"type":"neighbor_mastery","requires_chain":"spell_major","min_link":3}',
      -- L1
      'What is the interval formula for a dominant 7th chord?',
      'R - M3 - P5 - m7', 'R - M3 - P5 - M7', 'R - m3 - P5 - m7', 'R - m3 - d5 - m7',
      'The dominant 7th is a major triad with a minor 7th added. The tension between M3 and m7 creates the strongest pull toward resolution.',
      'A dominant 7th: R - M3 - P5 - m7. It is the chord most responsible for creating harmonic motion.',
      -- L2
      'What intervals are stacked in a dominant 7th chord?',
      'M3 + m3 + m3', 'm3 + M3 + m3', 'M3 + M3 + m3', 'm3 + m3 + M3',
      'Major 3rd, then minor 3rd, then another minor 3rd. The bottom is like a major triad, with one more minor 3rd on top.',
      'Root to 3rd: M3 (4). 3rd to 5th: m3 (3). 5th to 7th: m3 (3). The stack is M3 + m3 + m3.',
      -- L3
      'What type of 3rd does a dominant 7th chord have?',
      'Major 3rd', 'Minor 3rd', 'Augmented 3rd', 'Diminished 3rd',
      'The dominant 7th has a major 3rd, just like its parent major triad. The major 3rd combined with the minor 7th creates the tritone.',
      'A dominant 7th contains a major 3rd above the root. The tritone between the M3 and m7 drives the chord toward resolution.',
      -- L4
      'How does a dominant 7th differ from a major 7th chord?',
      'The 7th is a half step lower', 'The 3rd is a half step lower', 'The 5th is different', 'The 7th is a half step higher',
      'Both have a major triad. The dominant 7th has a minor 7th (10 half steps), while the major 7th has a major 7th (11 half steps).',
      'Compare R-M3-P5-m7 (dom7) with R-M3-P5-M7 (maj7). Only the 7th changes — it is one half step lower in a dominant 7th.',
      -- L5
      'Remove the 7th from a dominant 7th chord. What triad remains?',
      'Major triad', 'Minor triad', 'Diminished triad', 'Augmented triad',
      'Strip the minor 7th away and you are left with R - M3 - P5: a major triad.',
      'A dominant 7th is R - M3 - P5 - m7. Remove the m7 and you have R - M3 - P5, which is a major triad.',
      -- L6
      'Given the symbol C7, what is the interval formula?',
      'R - M3 - P5 - m7', 'R - M3 - P5 - M7', 'R - m3 - P5 - m7', 'R - M3 - P5',
      'A number 7 alone after a letter name indicates a dominant 7th: major triad plus minor 7th.',
      'C7 = R - M3 - P5 - m7. The bare "7" always means dominant — major triad with a minor 7th.'
    ),
    -- ==============================
    -- Chain 6: Major 7th (unlock: spell_dom7 L3)
    -- ==============================
    (
      'spell_maj7',
      'Major 7th',
      '{"type":"neighbor_mastery","requires_chain":"spell_dom7","min_link":3}',
      -- L1
      'What is the interval formula for a major 7th chord?',
      'R - M3 - P5 - M7', 'R - M3 - P5 - m7', 'R - m3 - P5 - M7', 'R - m3 - P5 - m7',
      'The major 7th chord is a major triad with a major 7th added. It has a lush, open quality often used in jazz and pop.',
      'A major 7th: R - M3 - P5 - M7. The major 7th (11 half steps) sits just one half step below the octave.',
      -- L2
      'What intervals are stacked in a major 7th chord?',
      'M3 + m3 + M3', 'M3 + M3 + m3', 'm3 + M3 + M3', 'm3 + m3 + M3',
      'Major 3rd, then minor 3rd, then major 3rd. The outer thirds are both major, framing a minor 3rd in the middle.',
      'Root to 3rd: M3 (4). 3rd to 5th: m3 (3). 5th to 7th: M3 (4). The stack is M3 + m3 + M3.',
      -- L3
      'What type of 3rd does a major 7th chord have?',
      'Major 3rd', 'Minor 3rd', 'Augmented 3rd', 'Diminished 3rd',
      'The major 7th chord has a major 3rd, identical to its parent major triad. Both the 3rd and 7th are major intervals.',
      'A major 7th chord contains a major 3rd above the root. The chord is built entirely on "major" intervals (M3 and M7).',
      -- L4
      'How does a major 7th chord differ from a dominant 7th chord?',
      'The 7th is a half step higher', 'The 3rd is a half step higher', 'The 5th is different', 'The 7th is a half step lower',
      'Both share a major triad. The major 7th raises the 7th by a half step compared to the dominant 7th — M7 vs m7.',
      'Compare R-M3-P5-M7 (maj7) with R-M3-P5-m7 (dom7). The 7th is raised by one half step in a major 7th chord.',
      -- L5
      'Remove the 7th from a major 7th chord. What triad remains?',
      'Major triad', 'Minor triad', 'Diminished triad', 'Augmented triad',
      'Strip the major 7th away and you are left with R - M3 - P5: a major triad.',
      'A major 7th is R - M3 - P5 - M7. Remove the M7 and you have R - M3 - P5, which is a major triad.',
      -- L6
      'Given the symbol Cmaj7, what is the interval formula?',
      'R - M3 - P5 - M7', 'R - M3 - P5 - m7', 'R - m3 - P5 - M7', 'R - M3 - P5',
      'The "maj7" suffix specifies a major 7th chord: major triad plus major 7th.',
      'Cmaj7 = R - M3 - P5 - M7. The "maj" before the 7 distinguishes it from C7 (dominant).'
    ),
    -- ==============================
    -- Chain 7: Minor 7th (unlock: spell_minor L3)
    -- ==============================
    (
      'spell_min7',
      'Minor 7th',
      '{"type":"neighbor_mastery","requires_chain":"spell_minor","min_link":3}',
      -- L1
      'What is the interval formula for a minor 7th chord?',
      'R - m3 - P5 - m7', 'R - M3 - P5 - m7', 'R - m3 - P5 - M7', 'R - m3 - d5 - m7',
      'The minor 7th chord is a minor triad with a minor 7th added. It has a warm, mellow quality common in jazz and R&B.',
      'A minor 7th: R - m3 - P5 - m7. Both the 3rd and 7th are minor intervals.',
      -- L2
      'What intervals are stacked in a minor 7th chord?',
      'm3 + M3 + m3', 'M3 + m3 + m3', 'm3 + m3 + M3', 'M3 + M3 + m3',
      'Minor 3rd, then major 3rd, then minor 3rd. The outer thirds are both minor, framing a major 3rd in the middle.',
      'Root to 3rd: m3 (3). 3rd to 5th: M3 (4). 5th to 7th: m3 (3). The stack is m3 + M3 + m3.',
      -- L3
      'What type of 3rd does a minor 7th chord have?',
      'Minor 3rd', 'Major 3rd', 'Augmented 3rd', 'Diminished 3rd',
      'The minor 7th chord has a minor 3rd, identical to its parent minor triad.',
      'A minor 7th chord contains a minor 3rd (3 half steps) above the root. The minor quality comes from this interval.',
      -- L4
      'How does a minor 7th chord differ from a dominant 7th chord?',
      'The 3rd is a half step lower', 'The 7th is a half step lower', 'The 5th is different', 'The 3rd is a half step higher',
      'Both have a minor 7th. The minor 7th chord lowers the 3rd — m3 instead of M3. The 5th and 7th stay the same.',
      'Compare R-m3-P5-m7 (min7) with R-M3-P5-m7 (dom7). The 3rd drops by one half step. The 7th is the same.',
      -- L5
      'Remove the 7th from a minor 7th chord. What triad remains?',
      'Minor triad', 'Major triad', 'Diminished triad', 'Augmented triad',
      'Strip the minor 7th away and you are left with R - m3 - P5: a minor triad.',
      'A minor 7th is R - m3 - P5 - m7. Remove the m7 and you have R - m3 - P5, which is a minor triad.',
      -- L6
      'Given the symbol Cm7, what is the interval formula?',
      'R - m3 - P5 - m7', 'R - M3 - P5 - m7', 'R - m3 - d5 - m7', 'R - m3 - P5',
      'The "m7" suffix indicates a minor 7th chord: minor triad plus minor 7th.',
      'Cm7 = R - m3 - P5 - m7. The "m" means minor triad, and the "7" adds a minor 7th.'
    ),
    -- ==============================
    -- Chain 8: Half-Diminished 7th (unlock: spell_dim L3)
    -- ==============================
    (
      'spell_halfdim7',
      'Half-Diminished 7th',
      '{"type":"neighbor_mastery","requires_chain":"spell_dim","min_link":3}',
      -- L1
      'What is the interval formula for a half-diminished 7th chord?',
      'R - m3 - d5 - m7', 'R - m3 - P5 - m7', 'R - m3 - d5 - d7', 'R - M3 - d5 - m7',
      'The half-diminished 7th is a diminished triad with a minor 7th. It is "half" diminished because the 7th is minor, not diminished.',
      'A half-diminished 7th: R - m3 - d5 - m7. It combines the diminished triad with a minor (not diminished) 7th.',
      -- L2
      'What intervals are stacked in a half-diminished 7th chord?',
      'm3 + m3 + M3', 'm3 + M3 + m3', 'M3 + m3 + m3', 'm3 + m3 + m3',
      'Minor 3rd, then minor 3rd, then major 3rd. The bottom two thirds are both minor (like a diminished triad), with a major 3rd on top.',
      'Root to 3rd: m3 (3). 3rd to 5th: m3 (3). 5th to 7th: M3 (4). The stack is m3 + m3 + M3.',
      -- L3
      'What type of 3rd does a half-diminished 7th chord have?',
      'Minor 3rd', 'Major 3rd', 'Augmented 3rd', 'Diminished 3rd',
      'The half-diminished 7th has a minor 3rd, the same as its parent diminished triad.',
      'A half-diminished 7th chord contains a minor 3rd above the root, inherited from the diminished triad.',
      -- L4
      'How does a half-diminished 7th differ from a minor 7th chord?',
      'The 5th is lowered by a half step', 'The 3rd is lowered by a half step', 'The 7th is different', 'The 5th is raised by a half step',
      'Both have a minor 3rd and minor 7th. The half-diminished 7th lowers the 5th — d5 instead of P5.',
      'Compare R-m3-d5-m7 (half-dim7) with R-m3-P5-m7 (min7). The 3rd and 7th are the same. The 5th drops by one half step.',
      -- L5
      'Remove the 7th from a half-diminished 7th chord. What triad remains?',
      'Diminished triad', 'Minor triad', 'Major triad', 'Augmented triad',
      'Strip the minor 7th away and you are left with R - m3 - d5: a diminished triad.',
      'A half-diminished 7th is R - m3 - d5 - m7. Remove the m7 and you have R - m3 - d5, which is a diminished triad.',
      -- L6
      'Given the symbol Cm7b5, what is the interval formula?',
      'R - m3 - d5 - m7', 'R - m3 - P5 - m7', 'R - m3 - d5 - d7', 'R - m3 - d5',
      'The "m7b5" suffix indicates a half-diminished 7th: minor 7th chord with a flatted 5th.',
      'Cm7b5 = R - m3 - d5 - m7. The "m7" means minor 7th chord, and "b5" lowers the 5th to diminished.'
    );

  FOR r IN SELECT * FROM _cs_chains LOOP

    -- Insert chain_definition
    INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
    VALUES (r.slug, r.name, 'chord_spelling', NULL, 6, r.unlock_cond, true)
    RETURNING id INTO v_chain_id;

    -- ---- LINK 1: Interval formula ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l1', NULL, 'declarative', 'select_one',
      r.l1_prompt,
      ARRAY['chord_spelling'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l1_a),
          jsonb_build_object('id', 'b', 'label', r.l1_b),
          jsonb_build_object('id', 'c', 'label', r.l1_c),
          jsonb_build_object('id', 'd', 'label', r.l1_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l1_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l1_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Interval formula identification',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 2: Interval stack ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l2', NULL, 'declarative', 'select_one',
      r.l2_prompt,
      ARRAY['chord_spelling'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l2_a),
          jsonb_build_object('id', 'b', 'label', r.l2_b),
          jsonb_build_object('id', 'c', 'label', r.l2_c),
          jsonb_build_object('id', 'd', 'label', r.l2_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l2_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l2_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Stacked interval identification',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 3: Name the 3rd ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l3', NULL, 'declarative', 'select_one',
      r.l3_prompt,
      ARRAY['chord_spelling'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l3_a),
          jsonb_build_object('id', 'b', 'label', r.l3_b),
          jsonb_build_object('id', 'c', 'label', r.l3_c),
          jsonb_build_object('id', 'd', 'label', r.l3_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l3_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l3_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Identify the type of 3rd',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 4: Difference from related chord ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l4', NULL, 'declarative', 'select_one',
      r.l4_prompt,
      ARRAY['chord_spelling'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l4_a),
          jsonb_build_object('id', 'b', 'label', r.l4_b),
          jsonb_build_object('id', 'c', 'label', r.l4_c),
          jsonb_build_object('id', 'd', 'label', r.l4_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l4_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l4_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Difference from related chord type',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 5: 7th connection ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l5', NULL, 'declarative', 'select_one',
      r.l5_prompt,
      ARRAY['chord_spelling'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l5_a),
          jsonb_build_object('id', 'b', 'label', r.l5_b),
          jsonb_build_object('id', 'c', 'label', r.l5_c),
          jsonb_build_object('id', 'd', 'label', r.l5_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l5_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l5_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', '7th chord connection',
      '["select_one"]'::JSONB, '{}'::JSONB);

    -- ---- LINK 6: Symbol -> interval formula ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_l6', NULL, 'declarative', 'select_one',
      r.l6_prompt,
      ARRAY['chord_spelling'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l6_a),
          jsonb_build_object('id', 'b', 'label', r.l6_b),
          jsonb_build_object('id', 'c', 'label', r.l6_c),
          jsonb_build_object('id', 'd', 'label', r.l6_d)
        )
      ),
      jsonb_build_object(
        'correct', jsonb_build_object('text', r.l6_fb_correct, 'show_answer', true),
        'incorrect', jsonb_build_object('text', r.l6_fb_incorrect, 'show_answer', true, 'delay_ms', 1500)
      )
    )
    RETURNING id INTO v_ct_id;

    INSERT INTO card_instances (template_id, prompt_rendered, answer_data, options_data)
    SELECT v_ct_id, ct.prompt_text, ct.parameters->'answer_data', ct.parameters->'options_data'
    FROM card_templates ct WHERE ct.id = v_ct_id;

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities, modality_by_stage)
    VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Symbol to interval formula',
      '["select_one"]'::JSONB, '{}'::JSONB);

  END LOOP;

  DROP TABLE _cs_chains;
  RAISE NOTICE 'Topic 6 Chord Spelling: 8 chains, 48 card templates, 48 card instances, 48 chain links seeded';
END $$;
