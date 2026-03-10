-- Topic 3: Interval Recognition
-- 12 chains x 6 links = 72 card_templates, 72 card_instances, 72 chain_links

DO $$
DECLARE
  r RECORD;
  v_chain_id UUID;
  v_ct_id UUID;
BEGIN

  CREATE TEMP TABLE _ir_chains (
    slug TEXT, name TEXT,
    unlock_cond JSONB,
    half_steps INT,
    -- L1: Ascending melodic -> name it (select_one, audio_select)
    l1_prompt TEXT,
    l1_a TEXT, l1_b TEXT, l1_c TEXT, l1_d TEXT,
    l1_fb_correct TEXT, l1_fb_incorrect TEXT,
    -- L2: Descending melodic -> name it (select_one, audio_select)
    l2_prompt TEXT,
    l2_a TEXT, l2_b TEXT, l2_c TEXT, l2_d TEXT,
    l2_fb_correct TEXT, l2_fb_incorrect TEXT,
    -- L3: Harmonic (simultaneous) -> name it (select_one, audio_select)
    l3_prompt TEXT,
    l3_a TEXT, l3_b TEXT, l3_c TEXT, l3_d TEXT,
    l3_fb_correct TEXT, l3_fb_incorrect TEXT,
    -- L4: Wider or narrower? (binary_choice)
    l4_prompt TEXT,
    l4_a TEXT, l4_b TEXT,
    l4_fb_correct TEXT, l4_fb_incorrect TEXT,
    -- L5: Staff interval -> name it, no audio (select_one)
    l5_prompt TEXT,
    l5_a TEXT, l5_b TEXT, l5_c TEXT, l5_d TEXT,
    l5_fb_correct TEXT, l5_fb_incorrect TEXT,
    -- L6: How many half-steps? (select_one)
    l6_prompt TEXT,
    l6_a TEXT, l6_b TEXT, l6_c TEXT, l6_d TEXT,
    l6_fb_correct TEXT, l6_fb_incorrect TEXT
  );

  INSERT INTO _ir_chains VALUES
    -- ==============================
    -- Chain 1: Minor 2nd (unlock: neighbor_mastery of interval_M2 L3)
    -- ==============================
    (
      'interval_m2',
      'Minor 2nd',
      '{"type":"neighbor_mastery","requires_chain":"interval_M2","min_link":3}',
      1,
      -- L1
      'Name this ascending interval',
      'Minor 2nd', 'Major 2nd', 'Perfect unison', 'Minor 3rd',
      'One half step — the smallest interval in Western music. That tight, tense proximity is unmistakable.',
      'This is a minor 2nd — just one half step. The narrowest melodic distance produces a sharp, biting quality.',
      -- L2
      'Name this descending interval',
      'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Perfect unison',
      'Descending by a half step carries the same narrow tension. The direction changes, but the interval stays the same.',
      'A minor 2nd descending — one half step down. The tight proximity creates that characteristic dissonance.',
      -- L3
      'Name this harmonic interval',
      'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Perfect unison',
      'Two notes a half step apart played together produce a harsh clash — the most dissonant harmonic interval.',
      'When a minor 2nd sounds simultaneously, the beating between frequencies is rapid and intense.',
      -- L4
      'Is this interval wider or narrower than a major 2nd?',
      'Narrower', 'Wider',
      'A minor 2nd is 1 half step; a major 2nd is 2. The minor version is always the narrower of the pair.',
      'Compare: minor 2nd = 1 half step, major 2nd = 2 half steps. The minor 2nd is narrower.',
      -- L5
      'Name the interval shown on the staff',
      'Minor 2nd', 'Major 2nd', 'Perfect unison', 'Minor 3rd',
      'Adjacent letter names with one half step between them — that is a minor 2nd on the staff.',
      'Two notes on adjacent lines/spaces one half step apart form a minor 2nd.',
      -- L6
      'How many half-steps in a minor 2nd?',
      '1', '2', '3', '0',
      'One half step — the fundamental building block of all intervals.',
      'A minor 2nd spans exactly 1 half step. It is the smallest standard interval.'
    ),
    -- ==============================
    -- Chain 2: Major 2nd (cold start)
    -- ==============================
    (
      'interval_M2',
      'Major 2nd',
      '{"type":"cold_start"}',
      2,
      -- L1
      'Name this ascending interval',
      'Major 2nd', 'Minor 2nd', 'Major 3rd', 'Perfect 4th',
      'Two half steps — a whole step. This is the most common melodic step in scales.',
      'A major 2nd spans 2 half steps (one whole step). It is the standard step between most scale degrees.',
      -- L2
      'Name this descending interval',
      'Major 2nd', 'Minor 3rd', 'Minor 2nd', 'Perfect unison',
      'A whole step down. Descending major 2nds are the backbone of stepwise melodic motion.',
      'This is a major 2nd descending — 2 half steps. The interval quality does not change with direction.',
      -- L3
      'Name this harmonic interval',
      'Major 2nd', 'Minor 2nd', 'Major 3rd', 'Perfect 4th',
      'Two notes a whole step apart played together still have tension, but less bite than a minor 2nd.',
      'A major 2nd sounded harmonically is mildly dissonant — two half steps of separation softens the clash.',
      -- L4
      'Is this interval wider or narrower than a minor 3rd?',
      'Narrower', 'Wider',
      'A major 2nd is 2 half steps; a minor 3rd is 3. The 2nd is narrower.',
      'Compare: major 2nd = 2 half steps, minor 3rd = 3 half steps. The major 2nd is narrower.',
      -- L5
      'Name the interval shown on the staff',
      'Major 2nd', 'Minor 2nd', 'Minor 3rd', 'Major 3rd',
      'Adjacent letter names separated by a whole step — that is a major 2nd.',
      'Two notes on adjacent staff positions with 2 half steps between them form a major 2nd.',
      -- L6
      'How many half-steps in a major 2nd?',
      '2', '1', '3', '4',
      'Two half steps make one whole step — the major 2nd.',
      'A major 2nd spans exactly 2 half steps, which equals one whole step.'
    ),
    -- ==============================
    -- Chain 3: Minor 3rd (unlock: neighbor_mastery of interval_M3 L3)
    -- ==============================
    (
      'interval_m3',
      'Minor 3rd',
      '{"type":"neighbor_mastery","requires_chain":"interval_M3","min_link":3}',
      3,
      -- L1
      'Name this ascending interval',
      'Minor 3rd', 'Major 3rd', 'Major 2nd', 'Perfect 4th',
      'Three half steps — the minor 3rd. Its dark, introspective quality defines the minor tonality.',
      'A minor 3rd spans 3 half steps. This interval is the foundation of every minor chord and scale.',
      -- L2
      'Name this descending interval',
      'Minor 3rd', 'Major 3rd', 'Major 2nd', 'Perfect 4th',
      'Descending by a minor 3rd retains that somber character. Direction changes; the color does not.',
      'A minor 3rd descending — 3 half steps down. It carries the same dark quality as when ascending.',
      -- L3
      'Name this harmonic interval',
      'Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Major 2nd',
      'Played together, a minor 3rd sounds warm but shadowed — consonant with a melancholy edge.',
      'The harmonic minor 3rd blends smoothly but carries a darker shade than its major counterpart.',
      -- L4
      'Is this interval wider or narrower than a major 3rd?',
      'Narrower', 'Wider',
      'A minor 3rd is 3 half steps; a major 3rd is 4. Minor intervals are always narrower than their major counterparts.',
      'Compare: minor 3rd = 3 half steps, major 3rd = 4 half steps. The minor 3rd is narrower.',
      -- L5
      'Name the interval shown on the staff',
      'Minor 3rd', 'Major 3rd', 'Major 2nd', 'Perfect 4th',
      'A third on the staff with 3 half steps between the notes — that is a minor 3rd.',
      'Notes a third apart (skipping one letter name) with 3 half steps form a minor 3rd.',
      -- L6
      'How many half-steps in a minor 3rd?',
      '3', '4', '2', '5',
      'Three half steps. The minor 3rd is one half step narrower than a major 3rd.',
      'A minor 3rd spans exactly 3 half steps — one and a half whole steps.'
    ),
    -- ==============================
    -- Chain 4: Major 3rd (cold start)
    -- ==============================
    (
      'interval_M3',
      'Major 3rd',
      '{"type":"cold_start"}',
      4,
      -- L1
      'Name this ascending interval',
      'Major 3rd', 'Minor 3rd', 'Perfect 4th', 'Major 2nd',
      'Four half steps — the major 3rd. Bright and warm, it defines major tonality.',
      'A major 3rd spans 4 half steps (two whole steps). This interval gives major chords their radiant quality.',
      -- L2
      'Name this descending interval',
      'Major 3rd', 'Perfect 4th', 'Minor 3rd', 'Major 2nd',
      'Descending by a major 3rd — the brightness persists regardless of direction.',
      'A major 3rd descending — 4 half steps down. The warm, open character remains.',
      -- L3
      'Name this harmonic interval',
      'Major 3rd', 'Minor 3rd', 'Perfect 5th', 'Perfect 4th',
      'Two notes 4 half steps apart played together sound bright and stable — a hallmark of consonance.',
      'The harmonic major 3rd is one of the most consonant intervals. Its brightness anchors major harmony.',
      -- L4
      'Is this interval wider or narrower than a perfect 4th?',
      'Narrower', 'Wider',
      'A major 3rd is 4 half steps; a perfect 4th is 5. The 3rd is one half step narrower.',
      'Compare: major 3rd = 4 half steps, perfect 4th = 5 half steps. The major 3rd is narrower.',
      -- L5
      'Name the interval shown on the staff',
      'Major 3rd', 'Minor 3rd', 'Perfect 4th', 'Major 2nd',
      'A third on the staff with 4 half steps — that is a major 3rd.',
      'Notes a third apart with 4 half steps between them form a major 3rd.',
      -- L6
      'How many half-steps in a major 3rd?',
      '4', '3', '5', '2',
      'Four half steps — two whole steps. The major 3rd is one half step wider than a minor 3rd.',
      'A major 3rd spans exactly 4 half steps, which equals two whole steps.'
    ),
    -- ==============================
    -- Chain 5: Perfect 4th (cold start)
    -- ==============================
    (
      'interval_P4',
      'Perfect 4th',
      '{"type":"cold_start"}',
      5,
      -- L1
      'Name this ascending interval',
      'Perfect 4th', 'Perfect 5th', 'Major 3rd', 'Tritone',
      'Five half steps — the perfect 4th. Open and restful, yet with a subtle forward lean.',
      'A perfect 4th spans 5 half steps. Its clean, open sound sits at the boundary of consonance.',
      -- L2
      'Name this descending interval',
      'Perfect 4th', 'Perfect 5th', 'Major 3rd', 'Minor 3rd',
      'Descending by a perfect 4th produces the same open quality. Perfect intervals sound identical in both directions.',
      'A perfect 4th descending — 5 half steps down. Perfect intervals maintain their character regardless of direction.',
      -- L3
      'Name this harmonic interval',
      'Perfect 4th', 'Perfect 5th', 'Major 3rd', 'Tritone',
      'The harmonic perfect 4th is hollow and open — consonant, but less stable than a 5th above a bass note.',
      'Sounded together, the perfect 4th has a characteristic open, hollow ring.',
      -- L4
      'Is this interval wider or narrower than a tritone?',
      'Narrower', 'Wider',
      'A perfect 4th is 5 half steps; a tritone is 6. The 4th is one half step narrower.',
      'Compare: perfect 4th = 5 half steps, tritone = 6 half steps. The perfect 4th is narrower.',
      -- L5
      'Name the interval shown on the staff',
      'Perfect 4th', 'Perfect 5th', 'Major 3rd', 'Tritone',
      'A fourth on the staff — spanning three letter names with 5 half steps.',
      'Notes a fourth apart (spanning three letter names) with 5 half steps form a perfect 4th.',
      -- L6
      'How many half-steps in a perfect 4th?',
      '5', '4', '6', '7',
      'Five half steps. The perfect 4th is the inversion of the perfect 5th.',
      'A perfect 4th spans exactly 5 half steps — two and a half whole steps.'
    ),
    -- ==============================
    -- Chain 6: Tritone (unlock: neighbor_mastery of interval_P4 L3)
    -- ==============================
    (
      'interval_A4',
      'Tritone',
      '{"type":"neighbor_mastery","requires_chain":"interval_P4","min_link":3}',
      6,
      -- L1
      'Name this ascending interval',
      'Tritone', 'Perfect 5th', 'Perfect 4th', 'Minor 6th',
      'Six half steps — the tritone. It divides the octave exactly in half, creating maximum instability.',
      'The tritone spans 6 half steps. Its restless tension has made it the most distinctive dissonance in tonal music.',
      -- L2
      'Name this descending interval',
      'Tritone', 'Perfect 5th', 'Perfect 4th', 'Major 3rd',
      'Descending by a tritone — the same unstable, searching quality. The tritone is its own inversion.',
      'A tritone descending — 6 half steps down. Uniquely, the tritone inverts to another tritone.',
      -- L3
      'Name this harmonic interval',
      'Tritone', 'Perfect 5th', 'Perfect 4th', 'Minor 6th',
      'Played together, the tritone produces a tense, unresolved sound that demands resolution.',
      'The harmonic tritone is sharply dissonant. It sits at the exact midpoint of the octave.',
      -- L4
      'Is this interval wider or narrower than a perfect 5th?',
      'Narrower', 'Wider',
      'A tritone is 6 half steps; a perfect 5th is 7. The tritone is one half step narrower.',
      'Compare: tritone = 6 half steps, perfect 5th = 7 half steps. The tritone is narrower.',
      -- L5
      'Name the interval shown on the staff',
      'Tritone', 'Perfect 4th', 'Perfect 5th', 'Minor 6th',
      'An augmented 4th or diminished 5th on the staff — 6 half steps. Both spellings yield a tritone.',
      'Six half steps on the staff. Whether spelled as an augmented 4th or diminished 5th, it is a tritone.',
      -- L6
      'How many half-steps in a tritone?',
      '6', '5', '7', '8',
      'Six half steps — exactly half an octave. Three whole tones, hence the name tritone.',
      'A tritone spans exactly 6 half steps. Three whole steps = tri-tone.'
    ),
    -- ==============================
    -- Chain 7: Perfect 5th (cold start)
    -- ==============================
    (
      'interval_P5',
      'Perfect 5th',
      '{"type":"cold_start"}',
      7,
      -- L1
      'Name this ascending interval',
      'Perfect 5th', 'Perfect 4th', 'Major 6th', 'Tritone',
      'Seven half steps — the perfect 5th. The most consonant interval after the octave and unison.',
      'A perfect 5th spans 7 half steps. Its pure, stable quality is the foundation of tonal harmony.',
      -- L2
      'Name this descending interval',
      'Perfect 5th', 'Perfect 4th', 'Major 6th', 'Tritone',
      'Descending by a perfect 5th — the same powerful stability. It is the backbone of bass motion.',
      'A perfect 5th descending — 7 half steps down. Root motion by 5th drives harmonic progression.',
      -- L3
      'Name this harmonic interval',
      'Perfect 5th', 'Perfect 4th', 'Major 6th', 'Minor 6th',
      'Two notes a perfect 5th apart blend so naturally they almost fuse into one sound — pure consonance.',
      'The harmonic perfect 5th is the most stable interval after the unison and octave.',
      -- L4
      'Is this interval wider or narrower than a minor 6th?',
      'Narrower', 'Wider',
      'A perfect 5th is 7 half steps; a minor 6th is 8. The 5th is one half step narrower.',
      'Compare: perfect 5th = 7 half steps, minor 6th = 8 half steps. The perfect 5th is narrower.',
      -- L5
      'Name the interval shown on the staff',
      'Perfect 5th', 'Perfect 4th', 'Major 6th', 'Tritone',
      'A fifth on the staff — spanning four letter names with 7 half steps.',
      'Notes a fifth apart (spanning four letter names) with 7 half steps form a perfect 5th.',
      -- L6
      'How many half-steps in a perfect 5th?',
      '7', '6', '8', '5',
      'Seven half steps. The perfect 5th is the inversion of the perfect 4th (5 + 7 = 12).',
      'A perfect 5th spans exactly 7 half steps — three and a half whole steps.'
    ),
    -- ==============================
    -- Chain 8: Minor 6th (unlock: neighbor_mastery of interval_P5 L3)
    -- ==============================
    (
      'interval_m6',
      'Minor 6th',
      '{"type":"neighbor_mastery","requires_chain":"interval_P5","min_link":3}',
      8,
      -- L1
      'Name this ascending interval',
      'Minor 6th', 'Major 6th', 'Perfect 5th', 'Minor 7th',
      'Eight half steps — the minor 6th. Warm and bittersweet, it carries a gentle melancholy.',
      'A minor 6th spans 8 half steps. Its emotional quality blends consonance with a hint of longing.',
      -- L2
      'Name this descending interval',
      'Minor 6th', 'Major 6th', 'Perfect 5th', 'Tritone',
      'Descending by a minor 6th — a wide, expressive leap with a poignant character.',
      'A minor 6th descending — 8 half steps down. Wide descending intervals feel dramatic and expressive.',
      -- L3
      'Name this harmonic interval',
      'Minor 6th', 'Major 6th', 'Perfect 5th', 'Minor 7th',
      'The harmonic minor 6th is consonant but shadowed — sweet with an undercurrent of tension.',
      'Sounded together, the minor 6th blends warmly but retains a darker coloring than the major 6th.',
      -- L4
      'Is this interval wider or narrower than a major 6th?',
      'Narrower', 'Wider',
      'A minor 6th is 8 half steps; a major 6th is 9. The minor version is one half step narrower.',
      'Compare: minor 6th = 8 half steps, major 6th = 9 half steps. The minor 6th is narrower.',
      -- L5
      'Name the interval shown on the staff',
      'Minor 6th', 'Major 6th', 'Perfect 5th', 'Minor 7th',
      'A sixth on the staff with 8 half steps between the notes — that is a minor 6th.',
      'Notes a sixth apart with 8 half steps between them form a minor 6th.',
      -- L6
      'How many half-steps in a minor 6th?',
      '8', '9', '7', '10',
      'Eight half steps. The minor 6th is the inversion of the major 3rd (4 + 8 = 12).',
      'A minor 6th spans exactly 8 half steps — four whole steps.'
    ),
    -- ==============================
    -- Chain 9: Major 6th (unlock: neighbor_mastery of interval_P5 L3)
    -- ==============================
    (
      'interval_M6',
      'Major 6th',
      '{"type":"neighbor_mastery","requires_chain":"interval_P5","min_link":3}',
      9,
      -- L1
      'Name this ascending interval',
      'Major 6th', 'Minor 6th', 'Minor 7th', 'Perfect 5th',
      'Nine half steps — the major 6th. Bright and expansive, with an optimistic warmth.',
      'A major 6th spans 9 half steps. Its wide, open character feels confident and luminous.',
      -- L2
      'Name this descending interval',
      'Major 6th', 'Minor 7th', 'Minor 6th', 'Perfect 5th',
      'Descending by a major 6th — a wide, sweeping drop that retains its bright color.',
      'A major 6th descending — 9 half steps down. The interval sounds warm and spacious in either direction.',
      -- L3
      'Name this harmonic interval',
      'Major 6th', 'Minor 6th', 'Perfect 5th', 'Minor 7th',
      'The harmonic major 6th is smooth and radiant — one of the most naturally pleasant intervals.',
      'Sounded together, the major 6th blends beautifully. It inverts to a minor 3rd.',
      -- L4
      'Is this interval wider or narrower than a minor 7th?',
      'Narrower', 'Wider',
      'A major 6th is 9 half steps; a minor 7th is 10. The 6th is one half step narrower.',
      'Compare: major 6th = 9 half steps, minor 7th = 10 half steps. The major 6th is narrower.',
      -- L5
      'Name the interval shown on the staff',
      'Major 6th', 'Minor 6th', 'Minor 7th', 'Perfect 5th',
      'A sixth on the staff with 9 half steps — that is a major 6th.',
      'Notes a sixth apart with 9 half steps between them form a major 6th.',
      -- L6
      'How many half-steps in a major 6th?',
      '9', '8', '10', '7',
      'Nine half steps. The major 6th is the inversion of the minor 3rd (3 + 9 = 12).',
      'A major 6th spans exactly 9 half steps — four and a half whole steps.'
    ),
    -- ==============================
    -- Chain 10: Minor 7th (unlock: neighbor_mastery of interval_M6 L3)
    -- ==============================
    (
      'interval_m7',
      'Minor 7th',
      '{"type":"neighbor_mastery","requires_chain":"interval_M6","min_link":3}',
      10,
      -- L1
      'Name this ascending interval',
      'Minor 7th', 'Major 7th', 'Major 6th', 'Perfect octave',
      'Ten half steps — the minor 7th. Warm and bluesy, it wants to resolve but is in no hurry.',
      'A minor 7th spans 10 half steps. It is the signature sound of dominant 7th and blues harmony.',
      -- L2
      'Name this descending interval',
      'Minor 7th', 'Major 7th', 'Major 6th', 'Minor 6th',
      'Descending by a minor 7th — a wide, dramatic drop with a warm, unresolved character.',
      'A minor 7th descending — 10 half steps down. The wide drop retains that bluesy, soulful quality.',
      -- L3
      'Name this harmonic interval',
      'Minor 7th', 'Major 7th', 'Major 6th', 'Perfect octave',
      'The harmonic minor 7th is mildly dissonant but rich — the tension that makes dominant chords compelling.',
      'Sounded together, the minor 7th has a characteristic warm dissonance that drives harmonic motion.',
      -- L4
      'Is this interval wider or narrower than a major 7th?',
      'Narrower', 'Wider',
      'A minor 7th is 10 half steps; a major 7th is 11. The minor version is one half step narrower.',
      'Compare: minor 7th = 10 half steps, major 7th = 11 half steps. The minor 7th is narrower.',
      -- L5
      'Name the interval shown on the staff',
      'Minor 7th', 'Major 7th', 'Major 6th', 'Perfect octave',
      'A seventh on the staff with 10 half steps — that is a minor 7th.',
      'Notes a seventh apart with 10 half steps between them form a minor 7th.',
      -- L6
      'How many half-steps in a minor 7th?',
      '10', '11', '9', '12',
      'Ten half steps. The minor 7th is the inversion of the major 2nd (2 + 10 = 12).',
      'A minor 7th spans exactly 10 half steps — five whole steps.'
    ),
    -- ==============================
    -- Chain 11: Major 7th (unlock: neighbor_mastery of interval_m7 L3)
    -- ==============================
    (
      'interval_M7',
      'Major 7th',
      '{"type":"neighbor_mastery","requires_chain":"interval_m7","min_link":3}',
      11,
      -- L1
      'Name this ascending interval',
      'Major 7th', 'Minor 7th', 'Perfect octave', 'Major 6th',
      'Eleven half steps — the major 7th. Bright and piercing, one half step shy of the octave.',
      'A major 7th spans 11 half steps. Its sharp, luminous dissonance defines major 7th chord voicings.',
      -- L2
      'Name this descending interval',
      'Major 7th', 'Perfect octave', 'Minor 7th', 'Major 6th',
      'Descending by a major 7th — nearly a full octave, with a bright, cutting edge.',
      'A major 7th descending — 11 half steps down. Just one half step short of the octave.',
      -- L3
      'Name this harmonic interval',
      'Major 7th', 'Minor 7th', 'Perfect octave', 'Major 6th',
      'The harmonic major 7th is intensely dissonant — bright and crystalline, pulling strongly toward the octave.',
      'Sounded together, the major 7th creates a sharp dissonance. It is the inversion of the minor 2nd.',
      -- L4
      'Is this interval wider or narrower than a perfect octave?',
      'Narrower', 'Wider',
      'A major 7th is 11 half steps; a perfect octave is 12. One half step separates them.',
      'Compare: major 7th = 11 half steps, perfect octave = 12 half steps. The major 7th is narrower.',
      -- L5
      'Name the interval shown on the staff',
      'Major 7th', 'Minor 7th', 'Perfect octave', 'Major 6th',
      'A seventh on the staff with 11 half steps — that is a major 7th.',
      'Notes a seventh apart with 11 half steps between them form a major 7th.',
      -- L6
      'How many half-steps in a major 7th?',
      '11', '10', '12', '9',
      'Eleven half steps — one shy of the octave. The major 7th is the inversion of the minor 2nd (1 + 11 = 12).',
      'A major 7th spans exactly 11 half steps — five and a half whole steps.'
    ),
    -- ==============================
    -- Chain 12: Perfect Octave (cold start)
    -- ==============================
    (
      'interval_P8',
      'Perfect Octave',
      '{"type":"cold_start"}',
      12,
      -- L1
      'Name this ascending interval',
      'Perfect octave', 'Perfect 5th', 'Major 7th', 'Minor 7th',
      'Twelve half steps — the perfect octave. The same note at a higher frequency, doubling the pitch.',
      'A perfect octave spans 12 half steps. The two notes share the same letter name, one register apart.',
      -- L2
      'Name this descending interval',
      'Perfect octave', 'Major 7th', 'Perfect 5th', 'Minor 7th',
      'Descending by an octave — returning to the same note one register lower. Complete and stable.',
      'A perfect octave descending — 12 half steps down. The same pitch class, one octave lower.',
      -- L3
      'Name this harmonic interval',
      'Perfect octave', 'Perfect 5th', 'Major 7th', 'Perfect 4th',
      'Two notes an octave apart fuse almost completely — the purest consonance after unison.',
      'The harmonic octave blends so perfectly the two notes nearly merge. The frequency ratio is exactly 2:1.',
      -- L4
      'Is this interval wider or narrower than a major 7th?',
      'Wider', 'Narrower',
      'A perfect octave is 12 half steps; a major 7th is 11. The octave is one half step wider.',
      'Compare: perfect octave = 12 half steps, major 7th = 11 half steps. The octave is wider.',
      -- L5
      'Name the interval shown on the staff',
      'Perfect octave', 'Major 7th', 'Perfect 5th', 'Minor 7th',
      'Same letter name, one staff position higher or lower — spanning all 12 half steps. A perfect octave.',
      'Notes with the same letter name one register apart form a perfect octave — 12 half steps.',
      -- L6
      'How many half-steps in a perfect octave?',
      '12', '11', '10', '13',
      'Twelve half steps — the full cycle. Every interval and its inversion sum to 12.',
      'A perfect octave spans exactly 12 half steps — six whole steps.'
    );

  -- Loop through each chain and create chain_definition + 6 links
  FOR r IN SELECT * FROM _ir_chains LOOP

    -- Insert chain_definition
    INSERT INTO chain_definitions (slug, name, topic, root_key, total_links, unlock_condition, is_published)
    VALUES (r.slug, r.name, 'interval_recognition', NULL, 6, r.unlock_cond, true)
    RETURNING id INTO v_chain_id;

    -- ---- LINK 1: Ascending melodic -> name it ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_asc', NULL, 'perceptual', 'select_one',
      r.l1_prompt,
      ARRAY['interval_recognition'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l1_a),
          jsonb_build_object('id', 'b', 'label', r.l1_b),
          jsonb_build_object('id', 'c', 'label', r.l1_c),
          jsonb_build_object('id', 'd', 'label', r.l1_d)
        ),
        'direction', 'ascending',
        'half_steps', r.half_steps
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 1, v_ct_id, 'always_unlocked', 'Ascending melodic interval identification',
      '["select_one","audio_select"]'::JSONB);

    -- ---- LINK 2: Descending melodic -> name it ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_desc', NULL, 'perceptual', 'select_one',
      r.l2_prompt,
      ARRAY['interval_recognition'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l2_a),
          jsonb_build_object('id', 'b', 'label', r.l2_b),
          jsonb_build_object('id', 'c', 'label', r.l2_c),
          jsonb_build_object('id', 'd', 'label', r.l2_d)
        ),
        'direction', 'descending',
        'half_steps', r.half_steps
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 2, v_ct_id, 'journeyman_1', 'Descending melodic interval identification',
      '["select_one","audio_select"]'::JSONB);

    -- ---- LINK 3: Harmonic (simultaneous) -> name it ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_harm', NULL, 'perceptual', 'select_one',
      r.l3_prompt,
      ARRAY['interval_recognition'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l3_a),
          jsonb_build_object('id', 'b', 'label', r.l3_b),
          jsonb_build_object('id', 'c', 'label', r.l3_c),
          jsonb_build_object('id', 'd', 'label', r.l3_d)
        ),
        'direction', 'harmonic',
        'half_steps', r.half_steps
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 3, v_ct_id, 'journeyman_1', 'Harmonic interval identification',
      '["select_one","audio_select"]'::JSONB);

    -- ---- LINK 4: Wider or narrower? (binary_choice) ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_compare', NULL, 'perceptual', 'select_one',
      r.l4_prompt,
      ARRAY['interval_recognition'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l4_a),
          jsonb_build_object('id', 'b', 'label', r.l4_b)
        ),
        'half_steps', r.half_steps
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 4, v_ct_id, 'journeyman_1', 'Interval width comparison',
      '["binary_choice"]'::JSONB);

    -- ---- LINK 5: Staff interval -> name it (no audio) ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_staff', NULL, 'declarative', 'select_one',
      r.l5_prompt,
      ARRAY['interval_recognition'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l5_a),
          jsonb_build_object('id', 'b', 'label', r.l5_b),
          jsonb_build_object('id', 'c', 'label', r.l5_c),
          jsonb_build_object('id', 'd', 'label', r.l5_d)
        ),
        'half_steps', r.half_steps
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 5, v_ct_id, 'journeyman_1', 'Visual interval identification from staff',
      '["select_one"]'::JSONB);

    -- ---- LINK 6: How many half-steps? ----
    INSERT INTO card_templates (slug, lesson_id, card_category, response_type, prompt_text, dimensions, parameters, feedback)
    VALUES (
      'flow_' || r.slug || '_halfsteps', NULL, 'declarative', 'select_one',
      r.l6_prompt,
      ARRAY['interval_recognition'],
      jsonb_build_object(
        'answer_data', jsonb_build_object('correct_answer', 'a'),
        'options_data', jsonb_build_array(
          jsonb_build_object('id', 'a', 'label', r.l6_a),
          jsonb_build_object('id', 'b', 'label', r.l6_b),
          jsonb_build_object('id', 'c', 'label', r.l6_c),
          jsonb_build_object('id', 'd', 'label', r.l6_d)
        ),
        'half_steps', r.half_steps
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

    INSERT INTO chain_links (chain_id, position, card_template_id, unlock_stage, description, modalities)
    VALUES (v_chain_id, 6, v_ct_id, 'journeyman_1', 'Half-step count theory',
      '["select_one"]'::JSONB);

  END LOOP;

  DROP TABLE _ir_chains;
  RAISE NOTICE 'Topic 3 Interval Recognition: 12 chains, 72 card templates, 72 card instances, 72 chain links seeded';
END $$;
