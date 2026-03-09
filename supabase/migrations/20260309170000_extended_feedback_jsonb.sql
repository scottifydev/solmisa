-- =============================================================================
-- Extended Feedback JSONB for all Flow topics (SCO-367)
-- Adds breakthrough_text, first_encounter_text, why_text to card_templates.feedback
-- =============================================================================

-- ============================================================
-- Topic 2: Scale/Mode Ear ID (7 chains x 6 links = 42 cards)
-- ============================================================

-- ---- mode_ionian (Ionian / Major) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your ear adapted — that bright, resolved quality of Ionian is landing now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Listen for the overall brightness. Ionian is the standard major scale — it sounds settled and resolved, with no surprising tensions.', 'why_text', 'Ionian has a natural 7th (leading tone) a half-step below the octave. That strong pull to the tonic gives it a sense of completeness that other modes lack.')
) WHERE slug = 'flow_mode_ionian_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'That Ionian recognition is getting reliable. The resolved brightness is clicking.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Ionian is the plain major scale — no lowered or raised degrees. Compare it to the other options: does it sound completely "normal" and resolved?', 'why_text', 'Ionian''s intervals follow the pattern W-W-H-W-W-W-H. Every degree sits where you''d expect in a major scale. When none of the scale degrees sound altered, you''re hearing Ionian.')
) WHERE slug = 'flow_mode_ionian_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Solid — you''re distinguishing Ionian from its close relatives consistently now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'With closer options, focus on whether the 4th and 7th degrees sound natural. Ionian has both a natural 4th and a natural 7th — no sharpened 4th (Lydian) or flattened 7th (Mixolydian).', 'why_text', 'Ionian vs. Lydian differs only at the 4th degree. Ionian vs. Mixolydian differs only at the 7th. Listen to those two scale degrees specifically — if both sound unaltered, it''s Ionian.')
) WHERE slug = 'flow_mode_ionian_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re locking onto Ionian''s characteristic degrees. That''s refined listening.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Ionian''s defining degree is the natural 7th — the leading tone. It sits a half-step below the tonic and creates a strong pull upward to resolve.', 'why_text', 'The leading tone (major 7th) is what separates Ionian from Mixolydian. That half-step tension is the strongest melodic pull in tonal music — it''s the reason major-key melodies feel so conclusive.')
) WHERE slug = 'flow_mode_ionian_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The emotional profile of Ionian is intuitive for you now — bright, stable, home.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Ionian feels bright, stable, and resolved — like arriving home. There''s no tension or ambiguity. It''s the sound of a simple, happy ending.', 'why_text', 'Every interval in Ionian reinforces the tonic. The perfect 5th, major 3rd, and leading tone all point clearly to the home note, creating that sense of complete stability and rest.')
) WHERE slug = 'flow_mode_ionian_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re identifying Ionian in real musical context. That''s the goal — recognition in the wild.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a full excerpt, listen for the overall sense of resolution and brightness. Does the melody feel settled and complete? No unexpected tensions or color tones?', 'why_text', 'Real music uses embellishments, but the underlying mode still colors everything. Ionian excerpts resolve cleanly — the leading tone pulls to tonic, and there are no modal surprises in the harmony.')
) WHERE slug = 'flow_mode_ionian_l6';

-- ---- mode_aeolian (Aeolian / Natural Minor) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your ear adapted — the minor quality of Aeolian is registering clearly now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Listen for an overall darker, more melancholy quality compared to major. Aeolian is the natural minor scale — it sounds somber but gentle.', 'why_text', 'Aeolian has a minor 3rd, which is the primary marker of a minor sound. That lowered 3rd degree darkens the entire scale compared to its major counterpart.')
) WHERE slug = 'flow_mode_aeolian_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Aeolian is separating from the pack for you. That gentle darkness is distinctive.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Aeolian is the plain natural minor — no raised or further lowered degrees beyond the minor 3rd, 6th, and 7th. It sounds dark but not exotic or tense.', 'why_text', 'Aeolian''s intervals are W-H-W-W-H-W-W. Compared to Dorian, it has a lowered 6th. Compared to Phrygian, it has a natural 2nd. It sits in the middle of the minor modes — dark but not extreme.')
) WHERE slug = 'flow_mode_aeolian_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re reliably sorting Aeolian from the other minor modes. The differences are registering.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among the minor modes, Aeolian sounds the most "standard." No jazzy warmth (Dorian) or exotic tension (Phrygian). Just straightforward, gentle minor.', 'why_text', 'The minor 6th is what separates Aeolian from Dorian. That lowered 6th adds weight and melancholy — Dorian''s raised 6th brightens the minor color. If the 6th sounds heavy, it''s Aeolian.')
) WHERE slug = 'flow_mode_aeolian_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re pinpointing the characteristic degrees that define Aeolian. Sharp ears.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Aeolian''s defining feature is its minor (lowered) 6th degree. It gives the scale a gentle downward pull and a melancholy weight that Dorian doesn''t have.', 'why_text', 'The minor 6th creates a half-step between degrees 5 and 6, producing a sighing, descending quality. This interval relationship is what makes Aeolian sound resigned rather than warm.')
) WHERE slug = 'flow_mode_aeolian_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Aeolian''s emotional character is clear for you — melancholy, gentle, grounded.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Aeolian feels melancholy and gentle — not aggressive or exotic, just quietly sad. Think of a folk ballad in a minor key.', 'why_text', 'The combination of minor 3rd, minor 6th, and minor 7th creates a consistently dark palette without any sharp dissonances. The result is sadness without tension — resignation rather than conflict.')
) WHERE slug = 'flow_mode_aeolian_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Aeolian in context is clicking for you. That understated darkness is unmistakable once you hear it.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In an excerpt, Aeolian sounds like a simple minor key without any harmonic-minor alterations. The 7th stays lowered — there''s no leading tone pulling sharply to the tonic.', 'why_text', 'Without a leading tone, Aeolian melodies don''t resolve as urgently as harmonic minor. The cadences feel softer and less decisive. That gentleness in the resolution is a reliable clue.')
) WHERE slug = 'flow_mode_aeolian_l6';

-- ---- mode_dorian (Dorian) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your ear adapted — Dorian''s minor-with-a-bright-6th quality is registering.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Dorian is minor, but with a warm, jazzy brightness. It doesn''t sound as heavy as natural minor — there''s a lift in the upper part of the scale.', 'why_text', 'Dorian has a minor 3rd (making it minor) but a major 6th (adding warmth). That raised 6th compared to Aeolian is the single note that gives Dorian its characteristic jazzy glow.')
) WHERE slug = 'flow_mode_dorian_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Dorian is standing out clearly from the other options now. That warmth is distinctive.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Dorian sounds minor but not heavy. Compare it to Aeolian: does the upper half of the scale sound brighter? That brightness comes from the raised 6th degree.', 'why_text', 'Dorian''s formula is W-H-W-W-W-H-W. The major 6th is the key — it creates a whole step between 5 and 6 instead of the half-step in Aeolian. That single change transforms the mood from melancholy to warm.')
) WHERE slug = 'flow_mode_dorian_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re reliably distinguishing Dorian even among close minor modes. The raised 6th is your anchor.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among close options, Dorian''s giveaway is that bright 6th. It''s minor like Aeolian, but the 6th degree sounds higher — a warm spot in an otherwise dark scale.', 'why_text', 'Dorian sits between Aeolian (darker, lowered 6th) and Mixolydian (major, lowered 7th). If it sounds minor but not bleak, with a warm upper range, that''s the raised 6th doing its work.')
) WHERE slug = 'flow_mode_dorian_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re targeting Dorian''s characteristic degree with confidence. That''s precise modal hearing.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Dorian''s characteristic degree is the major 6th. In a minor context, listen for the 6th degree — does it sound unexpectedly bright? That''s the Dorian marker.', 'why_text', 'The major 6th over a minor triad creates a characteristic tension — it''s bright but not dissonant. Jazz and funk exploit this interval constantly. It''s the sound of sophistication within a minor framework.')
) WHERE slug = 'flow_mode_dorian_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Dorian''s feeling-state is second nature now — cool, warm, sophisticated.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Dorian feels like cool sophistication — minor but not sad. Think smooth jazz, soulful funk. It has warmth and groove rather than melancholy.', 'why_text', 'The major 6th prevents the scale from sinking into sadness while the minor 3rd keeps it from sounding purely bright. This balance creates emotional complexity — introspective but not defeated.')
) WHERE slug = 'flow_mode_dorian_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Dorian in real music is clicking. That jazzy minor warmth is unmistakable to you now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a full excerpt, Dorian often shows up in jazz, funk, and modal rock. Listen for minor tonality with a surprising brightness when the melody reaches the 6th degree.', 'why_text', 'Composers and improvisers use Dorian specifically because it''s a more colorful minor than Aeolian. The raised 6th opens up harmonic possibilities — the ii chord becomes minor rather than diminished, enabling smoother voice leading.')
) WHERE slug = 'flow_mode_dorian_l6';

-- ---- mode_mixolydian (Mixolydian) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your ear adapted — Mixolydian''s major-without-the-leading-tone quality is clear to you.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Mixolydian sounds major but slightly bluesy or folksy. It doesn''t resolve as crisply as Ionian — the ending feels open rather than conclusive.', 'why_text', 'Mixolydian has a lowered 7th degree compared to Ionian. Without the leading tone, there''s no half-step pull to the tonic. The scale sounds major but relaxed — like a blues or folk inflection.')
) WHERE slug = 'flow_mode_mixolydian_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Mixolydian stands apart from the other options clearly now. That open, bluesy major is recognizable.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Mixolydian is major, but the 7th sounds lower than expected. It''s the sound of rock, blues, and folk — bright but without the sharp resolution of a standard major scale.', 'why_text', 'Mixolydian''s formula is W-W-H-W-W-H-W. The only difference from Ionian is the lowered 7th. That one change removes the leading tone and makes cadences feel open-ended rather than conclusive.')
) WHERE slug = 'flow_mode_mixolydian_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re sorting Mixolydian from its close relatives with precision. The lowered 7th is your anchor.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'When the options are close, focus on the 7th degree. Does the scale sound major but the 7th comes in lower than expected? That flat 7th is Mixolydian''s signature.', 'why_text', 'Mixolydian vs. Ionian: only the 7th differs. Mixolydian vs. Dorian: Mixolydian has a major 3rd. If it sounds clearly major but the resolution is soft, the lowered 7th is why.')
) WHERE slug = 'flow_mode_mixolydian_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re pinpointing Mixolydian''s characteristic degree consistently. Precise listening.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Mixolydian''s characteristic degree is the lowered (minor) 7th. In a major context, listen for the 7th — does it sit a whole step below the tonic instead of a half step? That''s Mixolydian.', 'why_text', 'The minor 7th over a major triad is the dominant 7th sound — the core of blues harmony. This interval is so distinctive that even a single appearance of the lowered 7th in a major melody signals Mixolydian.')
) WHERE slug = 'flow_mode_mixolydian_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Mixolydian''s emotional character is intuitive for you — open, earthy, unhurried.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Mixolydian feels open, earthy, and unhurried — like a song that could keep going forever without needing to resolve. Think classic rock riffs and folk tunes.', 'why_text', 'Without a leading tone, there''s no urgency to cadence. The lowered 7th creates a circular rather than directional quality. Music in Mixolydian tends to groove and sit rather than drive toward a conclusion.')
) WHERE slug = 'flow_mode_mixolydian_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Mixolydian in real excerpts is clear to you. That relaxed major sound is unmistakable.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a full excerpt, Mixolydian shows up everywhere in rock, blues, and Celtic music. Listen for a major feel with a 7th that doesn''t pull sharply upward.', 'why_text', 'Mixolydian harmony often features a bVII chord (built on the lowered 7th) — a major chord a whole step below the tonic. If you hear that chord relationship in a major context, it''s a strong Mixolydian indicator.')
) WHERE slug = 'flow_mode_mixolydian_l6';

-- ---- mode_phrygian (Phrygian) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your ear adapted — Phrygian''s dark, exotic tension is registering clearly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Phrygian sounds dark and exotic — almost Spanish or Middle Eastern. It''s minor, but with an extra edge of tension right at the start of the scale.', 'why_text', 'Phrygian has a lowered 2nd degree — a half-step above the tonic. That immediately creates a tense, exotic color. The proximity of the 2nd to the tonic gives Phrygian its distinctive brooding intensity.')
) WHERE slug = 'flow_mode_phrygian_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Phrygian is separating clearly for you now. That lowered 2nd is unmistakable.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Phrygian''s giveaway is the very first step — the 2nd degree sits a half-step above the tonic. That immediate semitone creates a dark, almost menacing opening.', 'why_text', 'Phrygian''s formula is H-W-W-W-H-W-W. The half-step at the bottom of the scale is what separates it from Aeolian (which has a whole step). That single change transforms gentle minor into tense, dramatic minor.')
) WHERE slug = 'flow_mode_phrygian_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re sorting Phrygian from close minor modes confidently. The exotic tension is your guide.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among close options, listen for that half-step right above the tonic. Aeolian has a whole step there; Phrygian drops it. That small change makes a dramatic difference in color.', 'why_text', 'Phrygian vs. Aeolian differs only at the 2nd degree. Phrygian vs. Locrian differs at the 5th (Locrian also has a diminished 5th). If it sounds dark and tense but the 5th is stable, it''s Phrygian.')
) WHERE slug = 'flow_mode_phrygian_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re targeting Phrygian''s characteristic degree with accuracy. That lowered 2nd is your anchor.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Phrygian''s characteristic degree is the minor 2nd — a half-step above the tonic. Listen for that tight, tense interval when the melody moves to or from the second scale degree.', 'why_text', 'The minor 2nd above the tonic is one of the most dissonant intervals available. In Phrygian, it''s structural rather than passing — the scale lives with that tension. Flamenco guitar exploits this interval constantly.')
) WHERE slug = 'flow_mode_phrygian_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Phrygian''s emotional world is clear to you — dark, intense, evocative.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Phrygian feels dark, tense, and evocative — think flamenco, metal, or Middle Eastern music. It''s the sound of drama and intensity, not gentle sadness.', 'why_text', 'The lowered 2nd creates a gravitational pull back down to the tonic — a descending resolution rather than ascending. This gives Phrygian its brooding, inward quality. The tension never fully releases, it just circles.')
) WHERE slug = 'flow_mode_phrygian_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Phrygian in real music is clicking. That dark, Spanish intensity is immediately recognizable to you.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a full excerpt, Phrygian often appears in flamenco, metal, and film scores for tense scenes. Listen for minor tonality with that distinctive half-step crunch at the bottom.', 'why_text', 'Phrygian harmony often uses a bII chord — a major chord a half-step above the tonic. That chord movement (bII to i) is the Phrygian cadence, one of the most recognizable sounds in flamenco and metal.')
) WHERE slug = 'flow_mode_phrygian_l6';

-- ---- mode_lydian (Lydian) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your ear adapted — Lydian''s floating, dreamy brightness is landing.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Lydian sounds bright and major, but with a floating, dreamy quality. It''s brighter than regular major — almost ethereal, like the ground shifted slightly upward.', 'why_text', 'Lydian has a raised 4th degree compared to Ionian. That sharpened 4th eliminates the only half-step in the lower half of the major scale, creating an uninterrupted stretch of whole tones that sounds weightless.')
) WHERE slug = 'flow_mode_lydian_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Lydian is standing out clearly from the other options. That raised 4th shimmer is distinctive.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Lydian is the brightest major mode. Listen for the 4th degree — does it sound higher than expected? That sharpened 4th gives Lydian its signature floating quality.', 'why_text', 'Lydian''s formula is W-W-W-H-W-W-H. Three whole steps in a row from the tonic create a sense of ascent without resistance. That unbroken upward motion is why Lydian sounds like it''s lifting off the ground.')
) WHERE slug = 'flow_mode_lydian_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re distinguishing Lydian from close modes reliably now. That raised 4th is unmistakable to you.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'When the choices are close, focus on the 4th degree. In Ionian, the 4th sounds grounded. In Lydian, it sounds lifted — a half-step higher. That single note changes the entire character.', 'why_text', 'Lydian vs. Ionian differs only at the 4th. The raised 4th creates a tritone above the tonic — normally a dissonance, but in Lydian it functions as a color tone that adds shimmer rather than tension.')
) WHERE slug = 'flow_mode_lydian_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re targeting the raised 4th with precision. That''s the heart of Lydian, and your ear knows it.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Lydian''s characteristic degree is the raised (augmented) 4th. In a major context, listen for the 4th — does it sound a half-step too high? That sharpened 4th is the Lydian fingerprint.', 'why_text', 'The augmented 4th (tritone) above the tonic would normally create instability, but in Lydian it''s the defining color. The raised 4th points upward away from the tonic, which is why Lydian sounds expansive rather than grounded.')
) WHERE slug = 'flow_mode_lydian_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Lydian''s emotional character is intuitive for you — floating, ethereal, luminous.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Lydian feels floating, ethereal, and luminous — like sunlight through clouds. It''s the sound of wonder and possibility, used often in film scores for awe-inspiring moments.', 'why_text', 'The raised 4th removes the gravitational pull that the natural 4th exerts toward the 3rd. Without that downward tendency, the scale feels untethered — bright but not anchored. This is why Lydian evokes spaciousness and wonder.')
) WHERE slug = 'flow_mode_lydian_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Lydian in real excerpts is clear to you. That shimmering brightness is unmistakable.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a full excerpt, Lydian appears in film scores, progressive rock, and jazz. Listen for major tonality with an extra brightness — a shimmer that regular major doesn''t have.', 'why_text', 'Lydian is often used in film for establishing shots and moments of awe precisely because of the raised 4th. It sounds "more major than major" — an intensification of brightness that signals something extraordinary.')
) WHERE slug = 'flow_mode_lydian_l6';

-- ---- mode_locrian (Locrian) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your ear adapted — Locrian''s unstable, dissonant quality is registering clearly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Locrian sounds deeply unstable and dissonant. It''s the darkest mode — even the "home" chord feels like it wants to go somewhere else. Nothing rests.', 'why_text', 'Locrian has a diminished 5th above the tonic. Since the tonic triad is diminished rather than major or minor, there''s no stable "home" to rest on. The fundamental chord itself is dissonant.')
) WHERE slug = 'flow_mode_locrian_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Locrian is separating out clearly. That restless instability is hard to miss once you know it.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Locrian''s giveaway is that nothing feels settled. Both the 2nd and the 5th are lowered. The tonic chord is diminished — it can''t provide a resting point.', 'why_text', 'Locrian''s formula is H-W-W-H-W-W-W. The diminished 5th means the tonic triad is a diminished chord (1-b3-b5). In every other mode, the tonic is at least major or minor. Locrian''s diminished tonic is what makes it uniquely rootless.')
) WHERE slug = 'flow_mode_locrian_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re distinguishing Locrian from the other dark modes reliably. That diminished tonic is your anchor.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among close options, Locrian stands out because even the 5th is lowered. Phrygian also has a lowered 2nd, but Phrygian''s 5th is perfect — stable. Locrian''s 5th collapses, making it uniquely unstable.', 'why_text', 'Locrian vs. Phrygian differs only at the 5th degree. Phrygian has a perfect 5th and can feel brooding but grounded. Locrian''s diminished 5th removes that last anchor — the result is a mode that resists any sense of home.')
) WHERE slug = 'flow_mode_locrian_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re targeting Locrian''s characteristic degree with precision. The diminished 5th is unmistakable to you.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Locrian''s characteristic degree is the diminished 5th. Listen for the 5th — does it sound flattened, creating a sense that even the most basic interval is unstable? That''s Locrian.', 'why_text', 'The perfect 5th is the most consonant interval after the octave. When it''s diminished, the most fundamental harmonic relationship breaks down. This is why Locrian sounds so uniquely unstable — the interval that normally provides the strongest support is compromised.')
) WHERE slug = 'flow_mode_locrian_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Locrian''s emotional character is clear to you — restless, unresolved, searching.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Locrian feels restless, unresolved, and dissonant — like a question that can never be answered. Nothing settles. It''s used rarely in practice precisely because of this instability.', 'why_text', 'With both a diminished 5th and a minor 2nd, Locrian has maximum darkness. The diminished tonic triad means any attempt at rest sounds tense. Composers use Locrian not for stability but for a sense of perpetual displacement.')
) WHERE slug = 'flow_mode_locrian_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Locrian in context is clicking. That persistent instability is immediately identifiable to you.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a full excerpt, Locrian is rare but appears in heavy metal and avant-garde music. Listen for a minor sound where even the home base feels wrong — nothing resolves, nothing rests.', 'why_text', 'Locrian is the least used mode precisely because the diminished tonic makes traditional harmonic function impossible. When it appears, it''s deliberately chosen for its disorienting effect — the listener is meant to feel ungrounded.')
) WHERE slug = 'flow_mode_locrian_l6';

-- ============================================================
-- Topic 5: Chord Inversions (4 chains x 6 links = 24 cards)
-- ============================================================

-- ---- inv_major_triads (Major Triad Inversions) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Root position is clicking — you''re hearing the solid, grounded stack clearly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Root position means the root of the chord is in the bass (lowest note). It sounds the most stable and grounded — the chord in its most natural, stacked form.', 'why_text', 'In root position, the intervals stack as a 3rd plus a 5th above the bass. The root in the bass aligns with the harmonic series, which is why root position sounds the most stable and "complete."')
) WHERE slug = 'flow_inv_major_triads_aural_binary';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'First inversion is registering — that lighter, lifted quality is distinctive to you now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First inversion puts the 3rd in the bass. The chord sounds lighter and less grounded than root position — still stable, but with a sense of upward motion.', 'why_text', 'With the 3rd in the bass, the intervals above become a 3rd and a 6th (hence the figured bass symbol 6/3). The 6th between the bass and root creates a wider spacing that sounds more open and less weighty than root position.')
) WHERE slug = 'flow_inv_major_triads_visual_inv';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Second inversion is clear to you — that tension needing resolution is unmistakable.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Second inversion puts the 5th in the bass. It sounds more tense and unstable than the other positions — like it wants to resolve somewhere. There''s a sense of suspension.', 'why_text', 'With the 5th in the bass, the intervals above are a 4th and a 6th (6/4). The 4th above the bass was historically treated as a dissonance requiring resolution. This is why second inversion chords sound unsettled and are often used as passing or cadential chords.')
) WHERE slug = 'flow_inv_major_triads_theory_bass';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re connecting bass note to inversion reliably. That''s the fundamental skill here.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The bass note determines the inversion — not the arrangement of the upper notes. Listen to the lowest sounding pitch: if it''s the root, it''s root position; the 3rd, first inversion; the 5th, second inversion.', 'why_text', 'The bass note has the strongest influence on how a chord sounds because it defines the harmonic foundation. Upper voices can be rearranged freely without changing the inversion — only the bass determines it.')
) WHERE slug = 'flow_inv_major_triads_figured_bass';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re recognizing inversions in musical context. Each voicing''s character is settling in.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In context, inversions create smooth bass lines. First inversion connects chords with stepwise bass motion. Second inversion often appears at cadences or as a passing chord between two more stable positions.', 'why_text', 'Inversions exist primarily for voice leading — keeping the bass line smooth rather than jumping. A descending bass line like C-B-A uses root position, first inversion, then root position again, creating stepwise motion that sounds connected.')
) WHERE slug = 'flow_inv_major_triads_aural_inv';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Full inversion identification in major triads is solid. Your voicing recognition is reliable.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'To identify any inversion: isolate the bass note, then determine its relationship to the chord root. Root in bass = root position. 3rd in bass = first inversion. 5th in bass = second inversion.', 'why_text', 'Each inversion has a distinct acoustic profile: root position is grounded and full, first inversion is light and mobile, second inversion is tense and suspenseful. With practice, you''ll recognize these qualities before consciously identifying the bass note.')
) WHERE slug = 'flow_inv_major_triads_combined';

-- ---- inv_minor_triads (Minor Triad Inversions) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Root position minor triads are clear — that dark, stable foundation is registering.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Root position in a minor triad has the root in the bass, just like major. It sounds dark but grounded — the most stable voicing of the minor chord.', 'why_text', 'A minor triad in root position stacks a minor 3rd then a major 3rd above the bass. The root in the bass still provides stability through the perfect 5th, even though the minor 3rd gives the chord its darker quality.')
) WHERE slug = 'flow_inv_minor_triads_aural_binary';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'First inversion minor triads are clicking — the bass shift changes the color noticeably.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First inversion puts the minor 3rd in the bass. In minor triads, this creates a warmer, less heavy sound — the darkness lifts slightly because the bass note is a major 3rd below the 5th.', 'why_text', 'With the minor 3rd in the bass, the interval structure above becomes a major 3rd and a major 6th. That major 6th between bass and root opens up the sound. First inversion minor triads often sound gentler than root position.')
) WHERE slug = 'flow_inv_minor_triads_visual_inv';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Second inversion minor triads are registering — that unstable quality is clear even in a minor context.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Second inversion puts the 5th in the bass. Like major second inversions, this sounds unstable — the 4th above the bass creates tension. In minor, this tension combines with the darker color.', 'why_text', 'The 4th above the bass is the same dissonance regardless of chord quality. In minor second inversion, you get the dark minor color plus the instability of the 6/4 voicing — a combination that strongly implies resolution.')
) WHERE slug = 'flow_inv_minor_triads_theory_bass';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Bass-note-to-inversion mapping in minor triads is solid. The principle transfers from major.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The same rule applies in minor: the bass note determines the inversion. Listen for the lowest pitch and determine whether it''s the root, the minor 3rd, or the 5th of the chord.', 'why_text', 'Inversion identification works identically in major and minor — it''s always about the bass note''s relationship to the root. The chord quality (major or minor) is a separate question from the voicing (which inversion).')
) WHERE slug = 'flow_inv_minor_triads_figured_bass';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Minor inversions in context are clear. The voice-leading logic applies just as it does in major.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In context, minor chord inversions serve the same voice-leading purpose as major. First inversion enables smooth bass lines; second inversion creates passing motion or cadential tension.', 'why_text', 'Minor progressions use inversions just like major ones — to create smooth, stepwise bass lines. A common pattern is i - iv6 - V, where the first inversion iv chord keeps the bass moving by step rather than leaping.')
) WHERE slug = 'flow_inv_minor_triads_aural_inv';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Full inversion identification in minor triads is reliable. You''re hearing voicings, not just chord names.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Identify the bass note first, then determine the chord quality (major or minor) from the intervals above. These are separate skills — inversion is about the bass, quality is about the intervals.', 'why_text', 'Expert listeners process inversion and quality simultaneously but independently. The bass note tells you the voicing; the intervals above tell you major or minor. Neither depends on the other — they''re orthogonal dimensions of chord identification.')
) WHERE slug = 'flow_inv_minor_triads_combined';

-- ---- inv_dom7 (Dominant 7th Inversions) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Root position dominant 7ths are clear — that driving, unresolved tension is landing.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Root position dominant 7th has the root in the bass. It sounds tense and driving — the major triad plus minor 7th creates a strong pull toward resolution. This is the most forceful voicing.', 'why_text', 'The dominant 7th chord contains a tritone between the 3rd and 7th. In root position, the root in the bass provides a strong harmonic anchor while the tritone above demands resolution — maximum tension with clear direction.')
) WHERE slug = 'flow_inv_dom7_aural_binary';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'First inversion dominant 7ths are registering — the 3rd in the bass changes the character noticeably.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First inversion puts the 3rd (leading tone) in the bass. This creates a particularly intense sound because the bass note itself wants to resolve upward by half-step.', 'why_text', 'With the leading tone in the bass, the resolution tendency is amplified — the lowest note pulls upward by semitone. This inversion is common in classical music where the bass drives toward the tonic. Figured bass: 6/5.')
) WHERE slug = 'flow_inv_dom7_visual_inv';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Second inversion dominant 7ths are clicking — that middle-ground voicing is recognizable.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Second inversion puts the 5th in the bass. It sounds less driving than root position but still tense. The tritone is still present, just repositioned above a more neutral bass note.', 'why_text', 'With the 5th in the bass, the chord''s tension is softened slightly. The 5th is the most neutral chord tone. Figured bass: 4/3. This inversion often appears in passing motion between other chords.')
) WHERE slug = 'flow_inv_dom7_theory_bass';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Bass note mapping in dominant 7ths is reliable, including all four positions.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In 7th chords, there are four possible bass notes: root, 3rd, 5th, or 7th. Each creates a different inversion. Listen to the lowest note and determine which chord tone it is.', 'why_text', 'The four inversions of a 7th chord each have distinct acoustic signatures. Root position (7) is forceful, first inversion (6/5) is intense with the leading tone low, second inversion (4/3) is neutral, and third inversion (4/2) has a downward pull.')
) WHERE slug = 'flow_inv_dom7_figured_bass';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Third inversion is settling in — the 7th in the bass creates that distinctive downward pull you''re now hearing.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Third inversion puts the 7th in the bass. This creates a strong downward pull — the bass wants to resolve down by step. Figured bass: 4/2. It often appears as a passing chord resolving to a first inversion chord.', 'why_text', 'The minor 7th in the bass is dissonant against the root above it. This dissonance resolves most naturally by the bass stepping down, which is why third inversion dominant 7ths almost always lead to a chord in first inversion — the bass descends by step.')
) WHERE slug = 'flow_inv_dom7_aural_inv';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Full inversion identification in dominant 7ths is solid. Four positions, four distinct characters — and you''re hearing them all.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'For full identification: isolate the bass, determine which chord tone it is (root, 3rd, 5th, or 7th), and name the inversion. With four notes, each inversion has its own acoustic profile — learn to feel them.', 'why_text', 'Each inversion of a dominant 7th serves a specific voice-leading function. Root position drives cadences, first inversion intensifies resolution, second inversion creates passing motion, third inversion descends. Understanding function helps identification.')
) WHERE slug = 'flow_inv_dom7_combined';

-- ---- inv_maj7 (Major 7th Inversions) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Root position major 7ths are clear — that lush, open quality is registering.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Root position major 7th has the root in the bass. It sounds lush, warm, and sophisticated — the major 7th interval adds color without the driving tension of a dominant 7th.', 'why_text', 'The major 7th interval (11 semitones) is wide and luminous. Unlike the minor 7th in dominant chords, it doesn''t create urgency — it adds richness. In root position, this creates a complex but stable sonority common in jazz.')
) WHERE slug = 'flow_inv_maj7_aural_binary';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'First inversion major 7ths are clicking — the 3rd in the bass opens up the sound distinctively.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First inversion puts the 3rd in the bass. The chord sounds more open and spread out. The dissonance between the bass (3rd) and the 7th above is a half-step apart — that tight interval at the top is the clue.', 'why_text', 'With the 3rd in the bass, there''s a minor 2nd (or its inversion, a major 7th) between the bass note and the actual 7th of the chord. This close voicing at one end of the chord creates a distinctive tension that differs from root position''s spacious sound.')
) WHERE slug = 'flow_inv_maj7_visual_inv';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Second inversion major 7ths are registering — the 5th in the bass gives it that transparent quality.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Second inversion puts the 5th in the bass. The chord sounds more transparent and airy. The bass provides a neutral foundation while the color tones (3rd and 7th) float above.', 'why_text', 'The 5th is acoustically neutral — it neither brightens nor darkens. With the 5th in the bass, the chord''s character comes entirely from the upper structure. This creates a lighter, more ambiguous sound that jazz arrangers use for textural variety.')
) WHERE slug = 'flow_inv_maj7_theory_bass';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Bass note identification across all four positions is reliable in major 7th chords.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Same principle: isolate the bass note and determine its chord-tone function. In major 7ths, the bass could be the root, 3rd, 5th, or major 7th. Each creates a different color.', 'why_text', 'Major 7th inversions are subtler than dominant 7th inversions because the chord itself is less tense. The differences between inversions are more about color and weight than about tension and resolution. This requires more refined listening.')
) WHERE slug = 'flow_inv_maj7_figured_bass';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Third inversion major 7ths are settling in — the major 7th in the bass creates that distinctive luminous tension.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Third inversion puts the major 7th in the bass. This is a distinctive sound — the bass sits a half-step below the root, creating a gentle upward pull. It sounds bright and slightly edgy.', 'why_text', 'The major 7th in the bass is a half-step below the root. Unlike the dominant 7th''s bass (which descends), this bass note tends to ascend to the root. The half-step below creates a leading-tone quality in the bass — luminous and forward-leaning.')
) WHERE slug = 'flow_inv_maj7_aural_inv';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Full inversion identification in major 7ths is solid. You''re hearing the subtle voicing differences that define each position.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'For full identification: listen to the bass note''s relationship to the chord. Root position is warm and full, first inversion is open with a tight interval at top, second inversion is airy, third inversion has a bright edge from the leading-tone bass.', 'why_text', 'Major 7th chords are the most coloristic of common chord types. Their inversions change the character more subtly than triads or dominant 7ths. Developing sensitivity to these differences trains your ear for the nuances of jazz and contemporary harmony.')
) WHERE slug = 'flow_inv_maj7_combined';
-- =============================================================================
-- Topic 3: Interval Recognition — Extended Feedback
-- 12 chains x 6 links = 72 UPDATE statements
-- =============================================================================

-- ---- interval_m2 (Minor 2nd, 1 semitone) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'That half-step tension is registering now. The minor 2nd is becoming a reliable anchor in your ear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor 2nd is the narrowest interval — just one half step. It sounds tight, biting, almost abrasive. That friction between two adjacent notes is its signature.', 'why_text', 'One half step means the two frequencies are very close together, creating rapid beating. That acoustic roughness is why the minor 2nd sounds so tense — the sound waves interfere with each other at a rate the ear perceives as dissonance.')
) WHERE slug = 'flow_interval_m2_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The descending half step is settling in. Direction no longer disguises the interval.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending minor 2nd drops by just one half step. The same tight, tense quality appears whether the interval moves up or down — direction changes, but the narrow distance stays the same.', 'why_text', 'Interval quality depends on the distance between pitches, not the direction. One half step descending produces the same frequency ratio as one half step ascending. Your ear learns to recognize the size regardless of motion.')
) WHERE slug = 'flow_interval_m2_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You are hearing the harmonic clash clearly now. The minor 2nd''s dissonance is becoming recognizable on contact.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'When both notes of a minor 2nd sound simultaneously, the result is a sharp, grinding dissonance. The two frequencies are so close they create an intense beating effect that is hard to miss once you know what to listen for.', 'why_text', 'Simultaneous notes a half step apart produce beating — periodic fluctuations in volume caused by the two nearly identical frequencies interfering. The closer the frequencies, the faster the beating, and the more dissonant the result sounds to the ear.')
) WHERE slug = 'flow_interval_m2_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your sense of interval width is sharpening. Comparing sizes is becoming intuitive.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor 2nd is one half step — the smallest standard interval. When compared to a major 2nd (two half steps), it sounds noticeably tighter and more compressed.', 'why_text', 'Width comparison is a foundational ear training skill. The minor 2nd (ratio approximately 16:15) and major 2nd (9:8) differ by just one half step, but that single semitone is enough to change the character from biting dissonance to neutral stepping.')
) WHERE slug = 'flow_interval_m2_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You are connecting the visual and the sound. Seeing a minor 2nd on the staff now triggers the right association.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, a minor 2nd appears as two notes on adjacent lines or spaces, separated by just one half step. Look for adjacent letter names where a half step naturally occurs (like E-F or B-C) or where an accidental creates one.', 'why_text', 'The staff is a visual map of pitch. Adjacent letter names span either a half step or a whole step depending on where they fall in the natural scale. E to F and B to C are natural half steps; all others require an accidental to produce a minor 2nd.')
) WHERE slug = 'flow_interval_m2_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The half-step count is locked in. You know the minor 2nd inside and out.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A minor 2nd contains exactly 1 half step. It is the smallest building block — every other interval is some multiple of this distance.', 'why_text', 'The half step (semitone) is the smallest interval in standard Western tuning. In equal temperament, each half step multiplies the frequency by the twelfth root of 2 (approximately 1.0595). One of these steps is a minor 2nd.')
) WHERE slug = 'flow_interval_m2_halfsteps';

-- ---- interval_M2 (Major 2nd, 2 semitones) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The whole-step sound is becoming second nature. Your ear picks it out reliably now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 2nd spans two half steps — one whole step. It sounds open and neutral, like stepping from one note to the next in a scale. It is the most common melodic motion in tonal music.', 'why_text', 'Two half steps produce a frequency ratio of 9:8 (in just intonation). This ratio is consonant enough to sound smooth but carries enough tension to create forward motion. Most scale passages move by major 2nds.')
) WHERE slug = 'flow_interval_M2_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Descending whole steps are clear to you now. The interval reads the same in either direction.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending major 2nd is a whole step down. It has the same neutral, stepwise character as the ascending version. Think of it as simply stepping down one position in a scale.', 'why_text', 'Direction does not change interval quality. Whether ascending or descending, a major 2nd covers two half steps. Training both directions ensures your ear recognizes the size of the gap, not just the contour of the motion.')
) WHERE slug = 'flow_interval_M2_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The harmonic whole step is registering clearly. You can distinguish it from the tighter minor 2nd.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Two notes a whole step apart played simultaneously create mild dissonance — less harsh than a minor 2nd, but still with audible friction. The slightly wider spacing softens the clash.', 'why_text', 'At two half steps, the beating between frequencies is slower than with a minor 2nd. This makes the harmonic major 2nd sound rough but not as aggressively dissonant. It occupies a middle ground between clash and consonance.')
) WHERE slug = 'flow_interval_M2_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You are sizing intervals confidently. The relative width comparison is becoming automatic.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 2nd is two half steps, which is narrower than a minor 3rd at three half steps. The major 2nd sounds like a scale step; the minor 3rd sounds like a small leap.', 'why_text', 'The boundary between a step and a skip falls between the major 2nd and the minor 3rd. This is one of the most important perceptual thresholds in music — one additional half step transforms a mundane step into a melodic leap with its own distinct character.')
) WHERE slug = 'flow_interval_M2_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You read the staff distance accurately. The visual-to-interval connection is strengthening.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, a major 2nd shows two adjacent letter names separated by a whole step. Most adjacent notes in the natural scale are a whole step apart — only E-F and B-C are half steps.', 'why_text', 'The staff reflects the diatonic scale''s irregular pattern of whole and half steps. Between most adjacent letter names (C-D, D-E, F-G, G-A, A-B), the distance is a whole step. Recognizing which pairs are exceptions (E-F, B-C) is key to reading intervals on the staff.')
) WHERE slug = 'flow_interval_M2_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The half-step count for the major 2nd is solid. This foundation supports everything built on top of it.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A major 2nd contains exactly 2 half steps, which equals one whole step. This is the standard step size in major and minor scales.', 'why_text', 'In equal temperament, two half steps multiply the frequency by (12th root of 2) squared, producing a ratio close to 9:8. This whole step is the fundamental unit of scalar motion and the building block of larger intervals.')
) WHERE slug = 'flow_interval_M2_halfsteps';

-- ---- interval_m3 (Minor 3rd, 3 semitones) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor 3rd''s dark color is becoming unmistakable. Your ear catches it without hesitation.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor 3rd spans three half steps. It has a dark, introspective quality — this is the interval that defines every minor chord and gives minor keys their characteristic sadness.', 'why_text', 'Three half steps produce a frequency ratio close to 6:5. This ratio is consonant but narrower than the major 3rd (5:4). The slight compression creates the darker coloring that distinguishes minor from major sonorities throughout Western music.')
) WHERE slug = 'flow_interval_m3_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Descending minor 3rds are reading clearly. The dark quality holds regardless of direction.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending minor 3rd drops by three half steps. The somber character remains the same — the interval''s quality is determined by its size, not its direction.', 'why_text', 'The minor 3rd descending is the inversion of a major 6th ascending (they sum to an octave). Training both directions builds a more robust internal representation of the interval''s distinctive color.')
) WHERE slug = 'flow_interval_m3_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The harmonic minor 3rd is clear to you now. That warm shadow is a strong identification cue.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'When sounded together, a minor 3rd produces a warm but shadowed blend. It is consonant — the two notes merge well — but carries an undercurrent of melancholy that distinguishes it from the brighter major 3rd.', 'why_text', 'The 6:5 ratio of the minor 3rd produces a consonant interval that blends smoothly. Compared to the major 3rd''s 5:4 ratio, the minor 3rd''s slightly narrower spacing shifts the perceived color from bright to dark — the acoustic basis of the major/minor distinction.')
) WHERE slug = 'flow_interval_m3_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You are reliably distinguishing minor from major 3rds by width. That one-semitone difference is clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor 3rd (3 half steps) is narrower than the major 3rd (4 half steps). The minor version sounds darker and slightly more compressed. That single half-step difference is what separates minor from major.', 'why_text', 'The major/minor 3rd distinction is the single most important interval comparison in tonal music. Every chord, scale, and key depends on whether the 3rd above the root spans 3 or 4 half steps. One semitone changes the entire emotional character.')
) WHERE slug = 'flow_interval_m3_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reading minor 3rds on the staff is clicking. The visual distance maps to the right sound.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, a minor 3rd skips one letter name and spans 3 half steps. The visual distance of a third is the same for both major and minor — you need to count the half steps (or know the key) to determine the quality.', 'why_text', 'The staff shows generic interval size (2nd, 3rd, 4th, etc.) but not quality (major, minor, perfect). Two notes a third apart could be either 3 or 4 half steps. Context — key signature, accidentals — tells you which. This is why interval quality requires more than just visual distance.')
) WHERE slug = 'flow_interval_m3_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Three half steps for the minor 3rd — that number is firmly in place.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A minor 3rd spans exactly 3 half steps — one and a half whole steps. It is one half step narrower than a major 3rd.', 'why_text', 'Three half steps in equal temperament approximate the just ratio of 6:5. This simple ratio explains why the minor 3rd is consonant despite its darker quality. Consonance and brightness are independent properties — a sound can be dark and smooth at the same time.')
) WHERE slug = 'flow_interval_m3_halfsteps';

-- ---- interval_M3 (Major 3rd, 4 semitones) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major 3rd''s brightness is imprinted. You hear it and know it immediately.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 3rd spans four half steps — two whole steps. It sounds bright, warm, and open. This is the interval that gives major chords their happy, resolved quality.', 'why_text', 'Four half steps approximate the ratio 5:4, one of the simplest and most consonant ratios in the overtone series. The 5th partial of the lower note nearly aligns with the 4th partial of the upper note, producing a smooth, bright blend that the ear perceives as stability and warmth.')
) WHERE slug = 'flow_interval_M3_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Descending major 3rds are just as clear. Brightness holds in both directions.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending major 3rd drops by four half steps. The bright, open character persists — the interval''s warmth is a property of its size, not its direction.', 'why_text', 'The descending major 3rd is the inversion of a minor 6th. Both intervals share the same pitch content but evoke different melodic gestures. Training descending intervals builds a complete spatial map of the pitch space.')
) WHERE slug = 'flow_interval_M3_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The harmonic major 3rd is reading as stable and bright. A core building block of your interval vocabulary.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Sounded together, two notes a major 3rd apart produce one of the most consonant combinations in music. The blend is warm, radiant, and stable — the harmonic foundation of every major chord.', 'why_text', 'The 5:4 frequency ratio means every 5th cycle of the lower note aligns with every 4th cycle of the upper note. This regular alignment produces minimal beating and a strong sense of fusion. The major 3rd is the interval that most defines the concept of major tonality.')
) WHERE slug = 'flow_interval_M3_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The size relationship between the major 3rd and perfect 4th is clear. One half step separates them.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 3rd (4 half steps) is narrower than the perfect 4th (5 half steps). The major 3rd sounds bright and sweet; the perfect 4th sounds open and hollow. That single semitone changes the character noticeably.', 'why_text', 'The major 3rd (5:4) and perfect 4th (4:3) are both consonant but have very different characters. The 3rd is warm and blending; the 4th is open and spatial. This boundary marks the transition from intervals that define chord quality to intervals that define chord voicing.')
) WHERE slug = 'flow_interval_M3_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Staff reading for major 3rds is accurate. You connect the visual third to its bright sound.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, a major 3rd looks identical to a minor 3rd — both skip one letter name. The difference is 4 half steps instead of 3. You determine quality from the key signature and any accidentals.', 'why_text', 'The staff is inherently diatonic — it shows the seven natural notes but hides the chromatic detail. A third on the staff could be major or minor depending on where it falls in the key. This is why reading intervals requires both visual distance and harmonic context.')
) WHERE slug = 'flow_interval_M3_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Four half steps for the major 3rd. The number is solid.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A major 3rd spans exactly 4 half steps — two whole steps. It is one half step wider than a minor 3rd.', 'why_text', 'Four half steps in equal temperament approximate the just ratio of 5:4. This ratio appears early in the harmonic series (between the 4th and 5th overtones), which is why the major 3rd sounds so naturally consonant and bright.')
) WHERE slug = 'flow_interval_M3_halfsteps';

-- ---- interval_P4 (Perfect 4th, 5 semitones) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The perfect 4th''s open quality is locked in. A familiar sound in your growing interval vocabulary.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The perfect 4th spans five half steps. It has an open, hollow quality — neither bright nor dark, but spacious. It sits right at the boundary between consonance and mild tension.', 'why_text', 'Five half steps approximate the ratio 4:3, the second simplest ratio after 3:2 (the perfect 5th). The perfect 4th is the inversion of the perfect 5th — they complement each other. Above a bass note, the 4th has a slight instability that makes it lean toward resolution.')
) WHERE slug = 'flow_interval_P4_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Descending perfect 4ths register clearly. The open quality reads the same in both directions.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending perfect 4th drops by five half steps. The open, hollow character remains — perfect intervals sound the same in both directions, which is part of what makes them "perfect."', 'why_text', 'Perfect intervals (unison, 4th, 5th, octave) have a unique property: they do not come in major/minor pairs. Their ratios (1:1, 4:3, 3:2, 2:1) are the simplest in the harmonic series, giving them a stable, direction-independent quality that the ear recognizes easily.')
) WHERE slug = 'flow_interval_P4_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The harmonic perfect 4th''s hollow ring is familiar now. You distinguish it from the 5th with confidence.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Two notes a perfect 4th apart played together produce a hollow, open sound. It is consonant but less grounded than a perfect 5th. In traditional harmony, the 4th above a bass note is treated as mildly unstable.', 'why_text', 'The 4:3 ratio is consonant, but when the 4th is above the bass, the upper note can be heard as a suspension wanting to resolve down to a 3rd. This contextual instability is why classical theory treats the perfect 4th as a dissonance above the bass, even though it is acoustically consonant.')
) WHERE slug = 'flow_interval_P4_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You gauge the width of the perfect 4th accurately against its neighbors.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The perfect 4th (5 half steps) is narrower than the tritone (6 half steps). The 4th sounds open and stable; the tritone sounds restless and tense. One half step separates stability from instability.', 'why_text', 'The boundary between the perfect 4th and the tritone is one of the most important in music. The perfect 4th (4:3) is consonant; the tritone (approximately 45:32) is the point of maximum dissonance within the octave. This single semitone marks the dividing line.')
) WHERE slug = 'flow_interval_P4_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reading perfect 4ths on the staff is reliable. The visual fourth maps to its open sound.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, a perfect 4th spans three letter names (e.g., C to F) with 5 half steps between them. Most natural 4ths are perfect — the only exception in the natural scale is F to B, which forms a tritone.', 'why_text', 'All fourths built on natural notes are perfect except F-B, which spans 6 half steps (a tritone). This single exception is the source of the tritone''s special status in music theory — it is the one diatonic interval that breaks the pattern of perfect 4ths and 5ths.')
) WHERE slug = 'flow_interval_P4_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Five half steps for the perfect 4th — confirmed and committed to memory.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A perfect 4th spans exactly 5 half steps — two and a half whole steps. It inverts to a perfect 5th (7 half steps), and together they fill an octave (5 + 7 = 12).', 'why_text', 'The inversional relationship between the 4th and 5th is fundamental: 4:3 inverted gives 3:2. Every perfect interval inverts to another perfect interval. This symmetry is why both the 4th and 5th have that characteristically open, hollow sound.')
) WHERE slug = 'flow_interval_P4_halfsteps';

-- ---- interval_A4 (Tritone, 6 semitones) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The tritone''s restless tension is unmistakable to you now. That unique instability registers immediately.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The tritone spans six half steps — exactly half the octave. It sounds tense, unstable, and searching. Unlike any other interval, it divides the octave into two equal parts, creating a uniquely ambiguous quality.', 'why_text', 'Six half steps split the octave symmetrically. This means the tritone is its own inversion — an augmented 4th and a diminished 5th are the same distance. This symmetry prevents the ear from establishing a clear tonal center, which is why the tritone sounds so unstable and is the engine of dominant-tonic resolution.')
) WHERE slug = 'flow_interval_A4_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Descending tritones are just as clear. The instability is direction-independent.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending tritone drops by six half steps. The restless, tense quality is identical in both directions. The tritone is unique: it is the only interval that inverts to the same size.', 'why_text', 'Because 6 half steps is exactly half of 12, descending by a tritone lands on the same pitch class as ascending by a tritone. This self-inversional property makes the tritone the axis of symmetry within the octave — a pivotal concept in both tonal and atonal music theory.')
) WHERE slug = 'flow_interval_A4_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The harmonic tritone''s sharp dissonance is a clear signal. You identify it on impact.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Two notes a tritone apart played simultaneously produce the most dissonant sound in tonal music. The clash is sharp and unresolved — it practically demands to move somewhere more stable.', 'why_text', 'The tritone''s frequency ratio (approximately 45:32 in just intonation, or the square root of 2 in equal temperament) has no simple integer relationship. This complexity means the overtones of the two notes rarely align, producing maximum roughness. In dominant 7th chords, this tritone between the 3rd and 7th drives the resolution to the tonic.')
) WHERE slug = 'flow_interval_A4_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You place the tritone accurately between the perfect 4th and perfect 5th.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The tritone (6 half steps) sits between the perfect 4th (5) and the perfect 5th (7). It is one half step wider than the 4th and one half step narrower than the 5th — right in the middle, where stability breaks down.', 'why_text', 'The tritone occupies the exact midpoint of the octave. The perfect 4th and 5th flank it on either side, both consonant. The tritone itself marks the point of maximum distance from both the unison and the octave — the point of greatest tonal ambiguity.')
) WHERE slug = 'flow_interval_A4_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You recognize the tritone on the staff whether spelled as an augmented 4th or diminished 5th.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, the tritone can appear as either an augmented 4th (e.g., F to B) or a diminished 5th (e.g., B to F). Both spell the same distance — 6 half steps. The only natural tritone in the C major scale is F-B.', 'why_text', 'The enharmonic dual identity of the tritone (augmented 4th vs. diminished 5th) reflects its unique position in the interval system. How it is spelled determines how it resolves: an augmented 4th expands outward, a diminished 5th contracts inward. Same sound, different grammatical function.')
) WHERE slug = 'flow_interval_A4_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Six half steps — the tritone. Exactly half the octave, and you know it without counting.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A tritone spans exactly 6 half steps — three whole steps (tri-tone). It divides the 12-note octave precisely in half.', 'why_text', 'The name "tritone" comes from its size: three whole tones (3 x 2 = 6 half steps). In medieval music theory, it was called "diabolus in musica" (the devil in music) because of its strong dissonance. In modern harmony, it is the essential tension that makes dominant-tonic resolution work.')
) WHERE slug = 'flow_interval_A4_halfsteps';

-- ---- interval_P5 (Perfect 5th, 7 semitones) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The perfect 5th''s stability is a reliable reference point. Your most fundamental interval recognition is secure.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The perfect 5th spans seven half steps. It is the most consonant interval after the octave — powerful, stable, and open. This is the interval of power chords and the foundation of the circle of fifths.', 'why_text', 'Seven half steps approximate the ratio 3:2, the simplest ratio after the octave (2:1). Every third cycle of the lower frequency aligns with every second cycle of the upper, producing strong reinforcement and minimal beating. This acoustic purity is why the 5th sounds so stable and why it anchors tonal harmony.')
) WHERE slug = 'flow_interval_P5_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Descending 5ths are just as solid. The power and stability translate perfectly downward.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending perfect 5th drops by seven half steps. The strong, grounded quality holds in both directions. Descending 5ths are the most common root motion in tonal music — the backbone of harmonic progression.', 'why_text', 'Bass motion by descending 5th (or ascending 4th) is the strongest harmonic progression in tonal music. The V-I cadence, the circle of fifths, the fundamental bass — all rely on this interval. Recognizing it by ear is recognizing the engine of tonal harmony itself.')
) WHERE slug = 'flow_interval_P5_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The harmonic perfect 5th''s pure consonance is immediately recognizable. A cornerstone of your ear training.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Two notes a perfect 5th apart played together produce the purest consonance after the unison and octave. The two notes blend so smoothly they can seem to fuse into a single, enriched sound.', 'why_text', 'The 3:2 ratio produces such strong consonance that the perfect 5th appears as the second interval in the harmonic series (after the octave). The overtones of two notes a 5th apart interlock with minimal conflict, which is why stacked 5ths (power chords) sound so clean and powerful.')
) WHERE slug = 'flow_interval_P5_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You distinguish the perfect 5th from its neighbors with precision.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The perfect 5th (7 half steps) is narrower than the minor 6th (8 half steps). The 5th sounds open and grounded; the minor 6th sounds warm but with a hint of bittersweet coloring. That single half step crosses into a different emotional territory.', 'why_text', 'The boundary between the perfect 5th (3:2) and the minor 6th (8:5) marks the transition from the realm of perfect intervals to the realm of imperfect consonances. Perfect intervals sound hollow and open; imperfect consonances carry emotional color — brightness or darkness.')
) WHERE slug = 'flow_interval_P5_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reading perfect 5ths on the staff is second nature. The visual fifth links to its sound instantly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, a perfect 5th spans four letter names (e.g., C to G) with 7 half steps between them. Most natural 5ths are perfect — the only exception is B to F, which is a diminished 5th (tritone).', 'why_text', 'Just as F-B is the only augmented 4th among natural notes, B-F is the only diminished 5th. All other natural 5ths span exactly 7 half steps. This single irregularity in the diatonic system is what makes the leading tone (B in C major) harmonically active — it creates the tritone that drives V to I.')
) WHERE slug = 'flow_interval_P5_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Seven half steps for the perfect 5th. A number you will never forget.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A perfect 5th spans exactly 7 half steps — three and a half whole steps. Together with the perfect 4th (5 half steps), it fills the octave (7 + 5 = 12).', 'why_text', 'The number 7 recurs throughout music: 7 natural notes, 7 half steps in a perfect 5th, and the circle of fifths completes after 12 steps because 7 and 12 share no common factors. The perfect 5th''s 7-semitone size is why stacking 5ths generates all 12 chromatic notes before repeating.')
) WHERE slug = 'flow_interval_P5_halfsteps';

-- ---- interval_m6 (Minor 6th, 8 semitones) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor 6th''s bittersweet quality is a clear signal now. Wide intervals are coming into focus.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor 6th spans eight half steps. It has a warm, bittersweet quality — wide enough to feel expansive, but with a gentle melancholy. It is the inversion of the major 3rd.', 'why_text', 'Eight half steps approximate the ratio 8:5. The minor 6th is the inversion of the major 3rd (4 + 8 = 12). They share the same pitch content in reverse order, but the wider spacing of the 6th creates a more spacious, wistful character compared to the compact brightness of the 3rd.')
) WHERE slug = 'flow_interval_m6_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Descending minor 6ths are reading clearly. The wide, poignant drop is distinctive.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending minor 6th is a wide, expressive drop of eight half steps. The bittersweet character comes through strongly in descent — the large distance makes the melodic gesture dramatic and emotionally charged.', 'why_text', 'Wide descending intervals (6ths and 7ths) are relatively rare in melodies, which makes them especially expressive when they appear. The descending minor 6th carries a sense of yearning or loss that composers use deliberately for emotional effect.')
) WHERE slug = 'flow_interval_m6_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The harmonic minor 6th''s warm shadow is a recognizable color. You place it accurately among the wide intervals.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Two notes a minor 6th apart played together produce a consonant blend with a shadowed warmth. It is smooth and stable, but carries a hint of tension — less bright than the major 6th, more expansive than the perfect 5th.', 'why_text', 'The 8:5 ratio of the minor 6th is an imperfect consonance — consonant enough to blend smoothly but colored with a dark warmth. It is the widest commonly used consonant interval before the 7ths introduce stronger dissonance. The overtone alignment is less perfect than the 5th but still regular enough for smooth blending.')
) WHERE slug = 'flow_interval_m6_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You distinguish minor from major 6ths by their emotional coloring as well as their width.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor 6th (8 half steps) is narrower than the major 6th (9 half steps). The minor version sounds more shadowed and bittersweet; the major version is warmer and more open. One half step separates their emotional qualities.', 'why_text', 'The minor/major 6th pair mirrors the minor/major 3rd pair in reverse: the minor 6th inverts to a major 3rd, and the major 6th inverts to a minor 3rd. This inversional relationship means learning one pair reinforces the other — widening the 3rd flips the emotional quality.')
) WHERE slug = 'flow_interval_m6_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reading minor 6ths on the staff is accurate. The wide visual span maps to its sound.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, a minor 6th spans five letter names with 8 half steps between them. As with all intervals that come in major/minor pairs, the staff shows the generic size (6th) but not the quality — you need accidentals and key context to determine if it is minor or major.', 'why_text', 'Wide intervals on the staff can be harder to read quickly because they span more space. Building fluency with 6ths requires learning which pairs of natural notes form minor 6ths (E-C, A-F, B-G in the natural scale) versus major 6ths.')
) WHERE slug = 'flow_interval_m6_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Eight half steps for the minor 6th. The number links to the sound without effort.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A minor 6th spans exactly 8 half steps — four whole steps. It is the inversion of the major 3rd (4 + 8 = 12).', 'why_text', 'The inversional relationship is a powerful shortcut: if you know the major 3rd is 4 half steps, you automatically know the minor 6th is 12 minus 4 = 8 half steps. Every interval pair that sums to 12 is an inversional pair, and their qualities swap (major inverts to minor, perfect stays perfect).')
) WHERE slug = 'flow_interval_m6_halfsteps';

-- ---- interval_M6 (Major 6th, 9 semitones) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major 6th''s warm expansiveness is a familiar sound. You hear it with confidence.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 6th spans nine half steps. It sounds wide, warm, and optimistic — like a sweeping, open gesture. It is the inversion of the minor 3rd.', 'why_text', 'Nine half steps approximate the ratio 5:3. The major 6th is one of the most naturally consonant intervals, producing a warm blend that is less hollow than the 5th but brighter than the minor 6th. Its position in the harmonic series (between the 3rd and 5th overtones) gives it both warmth and clarity.')
) WHERE slug = 'flow_interval_M6_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Descending major 6ths are clear. The warm, wide drop carries its characteristic brightness.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending major 6th drops by nine half steps — a wide, sweeping descent. The warm, bright character persists. In melodies, a descending major 6th is an expressive, somewhat rare gesture that draws attention.', 'why_text', 'The major 6th descending creates a large melodic leap that is uncommon in stepwise melodies. When composers use it, it typically marks a moment of emotional weight or structural importance. Recognizing wide descending intervals by ear requires familiarity with their rarity and expressiveness.')
) WHERE slug = 'flow_interval_M6_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The harmonic major 6th''s smooth warmth is immediately identifiable. A reliably pleasant consonance.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Sounded together, two notes a major 6th apart produce a radiant, spacious consonance. It is one of the smoothest and most pleasant harmonic intervals — warm and open, without the hollow quality of a perfect 5th.', 'why_text', 'The 5:3 ratio of the major 6th produces strong consonance because both numbers are small and the overtones align regularly. The major 6th inverts to a minor 3rd — they share the same harmonic quality in mirror image. This is why the major 6th sounds warm (like a minor 3rd) but spacious (because of the wider gap).')
) WHERE slug = 'flow_interval_M6_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You place the major 6th accurately relative to the minor 7th. The boundary between consonance and dissonance is clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 6th (9 half steps) is narrower than the minor 7th (10 half steps). The major 6th sounds warm and consonant; the minor 7th introduces dissonance and tension. That one semitone crosses the line from resolution to restlessness.', 'why_text', 'The major 6th is the widest imperfect consonance. One half step beyond it, the minor 7th enters the territory of dissonance. This boundary marks a critical perceptual threshold: 6ths blend and resolve, 7ths create tension that demands motion. Understanding this boundary sharpens your harmonic judgment.')
) WHERE slug = 'flow_interval_M6_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Staff reading for major 6ths is solid. The wide visual span connects to its warm sound.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, a major 6th spans five letter names with 9 half steps between them. In the natural scale, most 6ths are major (C-A, D-B, F-D, G-E) — only three natural 6ths are minor.', 'why_text', 'Knowing which natural-note 6ths are major versus minor speeds up staff reading significantly. In the C major scale, the major 6ths outnumber the minor 6ths. This asymmetry mirrors the structure of the diatonic scale and reinforces the major key''s overall bright character.')
) WHERE slug = 'flow_interval_M6_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Nine half steps for the major 6th. You know it, and you hear it.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A major 6th spans exactly 9 half steps — four and a half whole steps. It is the inversion of the minor 3rd (3 + 9 = 12).', 'why_text', 'The inversional pair of the major 6th and minor 3rd is one of the most useful to memorize: 9 + 3 = 12. When you invert an interval, major becomes minor and vice versa. This symmetry means that every time you practice major 6ths, you are also reinforcing your understanding of minor 3rds.')
) WHERE slug = 'flow_interval_M6_halfsteps';

-- ---- interval_m7 (Minor 7th, 10 semitones) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor 7th''s bluesy warmth is a reliable identification cue. You hear it and place it without delay.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor 7th spans ten half steps. It has a warm, bluesy quality — dissonant, but in an inviting way. This is the interval that defines dominant 7th chords and gives blues and jazz their characteristic flavor.', 'why_text', 'Ten half steps approximate the ratio 9:5 (or 16:9 in some tunings). The minor 7th is mildly dissonant — enough to create tension but not so harsh that it is unpleasant. This "sweet tension" is what makes dominant 7th chords so compelling: they want to resolve, but the journey is enjoyable.')
) WHERE slug = 'flow_interval_m7_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Descending minor 7ths are clear. The wide, warm drop carries its bluesy tension.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending minor 7th drops by ten half steps — a dramatic, wide leap. The warm, unresolved quality persists in descent, creating a soulful, expressive gesture.', 'why_text', 'The descending minor 7th is rare in most melodies because of its extreme width. When it appears, it often signals a shift in register or an intensely expressive moment. The interval''s size makes it challenging to sing accurately, which is why recognizing it by ear is valuable — it confirms your pitch memory across a wide span.')
) WHERE slug = 'flow_interval_m7_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The harmonic minor 7th''s rich tension is a clear identifier. You hear the dominant 7th quality instantly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Two notes a minor 7th apart played together create a warm dissonance — a tension that is expressive rather than harsh. This is the sound of the dominant 7th chord, the most important dissonant chord in tonal music.', 'why_text', 'The harmonic minor 7th creates tension because the two frequencies do not align as neatly as consonant intervals. But the dissonance is moderate — enough to drive harmonic motion (V7 to I) without being harsh. This balance between tension and warmth is why the dominant 7th chord has been the primary engine of tonal progression for centuries.')
) WHERE slug = 'flow_interval_m7_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You distinguish the minor 7th from the major 7th by their tension profiles. The difference is clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor 7th (10 half steps) is narrower than the major 7th (11 half steps). The minor 7th sounds warm and bluesy; the major 7th sounds bright and piercing. Both are dissonant, but with very different characters.', 'why_text', 'The minor 7th and major 7th create different types of tension. The minor 7th (in a dominant 7th chord) generates a tritone with the major 3rd, driving V-I resolution. The major 7th (in a major 7th chord) creates a half-step dissonance with the octave, producing luminous tension that is stable rather than resolving. Different tensions, different musical roles.')
) WHERE slug = 'flow_interval_m7_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reading minor 7ths on the staff is reliable. The wide visual span connects to its rich sound.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, a minor 7th spans six letter names with 10 half steps between them. It is the inversion of the major 2nd. In the natural scale, most 7ths are minor — only B-A and E-D are major 7ths in C major.', 'why_text', 'The minor 7th is more common in the natural scale than the major 7th, which appears only twice (C-B and F-E in C major). This asymmetry means that when you see a 7th on the staff without accidentals, it is more likely to be minor. Context and key signature confirm the quality.')
) WHERE slug = 'flow_interval_m7_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Ten half steps for the minor 7th. The number and the sound are one.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A minor 7th spans exactly 10 half steps — five whole steps. It is the inversion of the major 2nd (2 + 10 = 12).', 'why_text', 'The inversional pair of the minor 7th and major 2nd is elegant: the most common melodic step (major 2nd) and the most common harmonic tension (minor 7th) are mirror images of each other. What sounds like a simple step in one direction becomes a dramatic leap in the other.')
) WHERE slug = 'flow_interval_m7_halfsteps';

-- ---- interval_M7 (Major 7th, 11 semitones) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major 7th''s crystalline edge is unmistakable. You identify its bright tension without hesitation.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 7th spans eleven half steps — just one shy of the octave. It sounds bright, piercing, and luminous. This interval defines the major 7th chord''s dreamy, sophisticated quality.', 'why_text', 'Eleven half steps place the upper note just one half step below the octave. This proximity to the octave creates a strong pull upward — the ear expects resolution to the octave. But unlike the minor 7th''s warm tension, the major 7th''s dissonance is bright and crystalline, producing the shimmering quality prized in jazz and impressionist harmony.')
) WHERE slug = 'flow_interval_M7_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Descending major 7ths are recognizable. The wide, cutting drop is distinctive.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending major 7th drops by eleven half steps — nearly a full octave. The bright, piercing quality remains, though in descent the gesture feels dramatic and almost vertiginous.', 'why_text', 'The descending major 7th is one of the widest melodic intervals and among the most difficult to sing accurately. Its proximity to the octave means the ear can easily mistake it for a full octave. The key difference is that the major 7th stops one half step short, leaving a slight sense of incompleteness that distinguishes it.')
) WHERE slug = 'flow_interval_M7_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The harmonic major 7th''s bright dissonance is a reliable signal. You hear its shimmer distinctly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Two notes a major 7th apart played together produce an intensely bright dissonance. The upper note sits just one half step below the octave of the lower, creating a sharp, crystalline clash that is paradoxically beautiful.', 'why_text', 'The major 7th is the inversion of the minor 2nd — both span one half step from the octave, but from opposite sides. Where the minor 2nd''s half step sounds grinding and rough, the major 7th''s version sounds bright and luminous. This is because the wider spacing distributes the acoustic beating differently, spreading it across the frequency spectrum.')
) WHERE slug = 'flow_interval_M7_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You distinguish the major 7th from the octave with precision. That one-semitone difference is clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 7th (11 half steps) is narrower than the perfect octave (12 half steps). The major 7th has a sharp, unresolved edge; the octave sounds perfectly complete. Just one half step separates near-completion from full resolution.', 'why_text', 'The major 7th''s proximity to the octave creates what musicians call a "leading tone" effect — the upper note wants to resolve upward by a half step to complete the octave. This pull is the same force that drives the 7th scale degree to resolve to the tonic. The major 7th interval embodies that tension in its purest form.')
) WHERE slug = 'flow_interval_M7_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You read major 7ths on the staff accurately. The nearly-octave span is visually clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, a major 7th spans six letter names with 11 half steps between them. It looks almost like an octave — the two notes are nearly an octave apart, but one half step short. Only two natural 7ths are major: C-B and F-E.', 'why_text', 'The major 7th appears only where a half step naturally occurs between the 7th and the octave — between B and C, and between E and F. These are the same half steps that define the structure of the major scale. Recognizing where natural half steps fall is the key to reading interval quality on the staff.')
) WHERE slug = 'flow_interval_M7_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Eleven half steps for the major 7th. One short of the octave — the number is solid.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A major 7th spans exactly 11 half steps — five and a half whole steps. It is the inversion of the minor 2nd (1 + 11 = 12).', 'why_text', 'The inversional pair of the major 7th (11) and minor 2nd (1) is the most extreme: the widest non-octave interval and the narrowest. Together they frame the entire interval spectrum. This pairing also explains why both are dissonant — they both involve frequencies separated by just one half step, whether measured up or down from the octave.')
) WHERE slug = 'flow_interval_M7_halfsteps';

-- ---- interval_P8 (Perfect Octave, 12 semitones) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The octave''s perfect unity is unmistakable. The most fundamental interval is thoroughly internalized.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The perfect octave spans twelve half steps — the same note at a higher (or lower) pitch. It sounds complete, unified, and perfectly resolved. The two notes share the same letter name, one register apart.', 'why_text', 'Twelve half steps produce the ratio 2:1 — the simplest and most consonant ratio possible. Every second cycle of the lower frequency aligns with every cycle of the upper. This perfect alignment is so complete that the two notes are perceived as the "same" pitch in different registers. This phenomenon, called octave equivalence, is universal across musical cultures.')
) WHERE slug = 'flow_interval_P8_asc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Descending octaves are clear. The complete return to the same pitch class is unmistakable.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A descending perfect octave drops twelve half steps — returning to the same letter name one register lower. The sense of completeness is the same in both directions. It is the widest standard interval.', 'why_text', 'The octave''s 2:1 ratio means halving the frequency. The human ear groups notes an octave apart into the same "pitch class" — they share the same position in the musical alphabet. This is not a cultural convention but an acoustic reality: the overtone series of any note contains its octaves as the strongest partials.')
) WHERE slug = 'flow_interval_P8_desc';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The harmonic octave''s pure fusion is the most recognizable consonance. Your ear identifies it on contact.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Two notes an octave apart played together fuse so completely they can sound like a single, enriched tone. The consonance is absolute — there is no tension, no pull, no desire for resolution. It is pure stability.', 'why_text', 'The 2:1 ratio means every overtone of the upper note coincides exactly with an overtone of the lower note. There is zero beating and perfect alignment. This is why the octave is sometimes not even counted as a separate "sound" — it reinforces the original note rather than adding a new harmonic color. It is the definition of consonance itself.')
) WHERE slug = 'flow_interval_P8_harm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You correctly identify the octave as wider than the major 7th. The boundary between tension and resolution is clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The perfect octave (12 half steps) is wider than the major 7th (11 half steps). The octave sounds perfectly complete; the major 7th carries a bright, unresolved tension. That final half step is the difference between tension and total resolution.', 'why_text', 'The last half step — from 11 to 12 semitones — is the most dramatic single-semitone change in the entire interval spectrum. It transforms the major 7th''s bright dissonance into the octave''s pure consonance. This is the leading-tone resolution writ large: the strongest pull in tonal music, compressed into a single half step.')
) WHERE slug = 'flow_interval_P8_compare';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You read octaves on the staff instantly. Same letter name, different register — the visual cue is clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the staff, a perfect octave appears as two notes with the same letter name, one register apart — spanning all seven letter names and returning to the starting point. It is always exactly 12 half steps.', 'why_text', 'The octave is the only interval that is always "perfect" regardless of which note it starts on. Every natural note to its octave spans exactly 12 half steps, no exceptions. This invariance is unique among intervals and reflects the octave''s fundamental role as the frame within which all other intervals exist.')
) WHERE slug = 'flow_interval_P8_staff';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Twelve half steps — the full cycle. The octave''s count is the reference point for all other intervals.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A perfect octave spans exactly 12 half steps — six whole steps. This is the total number of semitones in Western equal temperament. Every interval and its inversion sum to 12.', 'why_text', 'The number 12 is the foundation of the chromatic system. Twelve equal divisions of the octave (equal temperament) allow modulation to any key while keeping all intervals nearly in tune. The octave''s 12-semitone size means that every interval has a complement that fills the remaining space: 1+11, 2+10, 3+9, 4+8, 5+7, 6+6.')
) WHERE slug = 'flow_interval_P8_halfsteps';

-- =============================================================================
-- Topic 4: Chord Quality Ear ID — Extended Feedback
-- 6 chains x 6 links = 36 UPDATE statements
-- =============================================================================

-- ---- chord_quality_major (Major Triad) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major character is registering clearly. Your ear catches the bright bottom third without hesitation.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Major-type chords have a major third (4 half steps) on the bottom. This wider interval creates a bright, open foundation. Listen for that brightness — it is the first thing to identify before worrying about the specific chord type.', 'why_text', 'The bottom third of a chord determines its overall character. A major third (5:4 ratio) produces strong overtone alignment that the ear perceives as brightness and stability. Whether the chord is a simple major triad or a complex extended chord, that major third on the bottom always signals a major-type sonority.')
) WHERE slug = 'flow_chord_quality_major_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You distinguish major from its closest alternatives with growing ease. The interval stack is becoming audible.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major triad is built from a major third (4 half steps) plus a minor third (3 half steps), creating a perfect fifth between root and top note. Its sound is bright, stable, and resolved — the most common chord quality in Western music.', 'why_text', 'The major triad''s interval stack (M3 + m3 = P5) places the widest interval at the bottom. This "wide base" is acoustically more stable than the "narrow base" of a minor triad (m3 + M3). The perfect fifth between root and fifth reinforces the stability, which is why the major triad sounds so naturally resolved.')
) WHERE slug = 'flow_chord_quality_major_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Among four close options, the major triad stands out to you. The brightness-plus-stability combination is a reliable fingerprint.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'When comparing major to minor, diminished, and augmented triads, listen for the combination of brightness and stability. Minor is dark but stable. Diminished is dark and tense. Augmented is bright but unstable. Major is uniquely both bright and stable.', 'why_text', 'Each triad quality has a distinct brightness/stability profile. Major: bright + stable. Minor: dark + stable. Diminished: dark + unstable. Augmented: bright + unstable. These two dimensions (brightness from the bottom third, stability from the fifth) form a 2x2 grid that accounts for all four triad qualities.')
) WHERE slug = 'flow_chord_quality_major_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You distinguish triads from seventh chords by the number of voices. The three-note structure is clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A major triad has three notes: root, major third, and perfect fifth. If you hear a fourth voice adding color or tension on top, that is a seventh chord. Triads sound simpler and more compact than seventh chords.', 'why_text', 'The distinction between three-note and four-note chords is fundamental. Triads define harmonic quality (major, minor, diminished, augmented). Adding a seventh introduces dissonance that creates forward motion. Training your ear to count voices helps you quickly categorize what you hear.')
) WHERE slug = 'flow_chord_quality_major_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You hear the major quality in context, surrounded by other chords. Real-world recognition is building.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a chord progression, major triads often serve as points of stability — they can function as the tonic (I), subdominant (IV), or dominant (V). Their brightness helps them stand out, especially after minor or diminished chords.', 'why_text', 'Identifying chord quality within a progression is harder than hearing isolated chords because surrounding harmonies create expectations. A major chord after a minor chord sounds especially bright by contrast. Context shapes perception — training with progressions builds the real-world skill of recognizing chords in the flow of music.')
) WHERE slug = 'flow_chord_quality_major_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You identify the major 7th chord type with confidence. The lush shimmer is a distinct signal.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A major 7th chord adds a major seventh interval (11 half steps from the root) to a major triad. The result is lush and dreamy — the seventh adds a shimmering dissonance that does not demand resolution the way a dominant 7th does.', 'why_text', 'The major 7th chord stacks M3 + m3 + M3. The top major third creates a major seventh interval from the root — just one half step below the octave. This half-step proximity produces a bright, crystalline dissonance. Unlike the dominant 7th (which contains a tritone), the major 7th has no tritone, so it sits rather than resolves.')
) WHERE slug = 'flow_chord_quality_major_l6';

-- ---- chord_quality_minor (Minor Triad) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor character is reading clearly. Your ear catches the dark bottom third reliably.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Minor-type chords have a minor third (3 half steps) on the bottom. This narrower interval creates a darker, more introspective foundation. The darkness is the first cue — it tells you the chord is minor-type before you need to identify the specific quality.', 'why_text', 'The bottom third is the primary marker of chord character. A minor third (6:5 ratio) is narrower than a major third (5:4), producing a darker coloring. This single interval difference is the foundation of the entire major/minor distinction that has defined Western music for centuries.')
) WHERE slug = 'flow_chord_quality_minor_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You pick the minor triad out of three options accurately. Its dark stability is a reliable identifier.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor triad stacks a minor third (3 half steps) plus a major third (4 half steps), still creating a perfect fifth between root and top note. It is dark but stable — the perfect fifth keeps it grounded.', 'why_text', 'The minor triad''s interval stack (m3 + M3 = P5) is the mirror of the major triad (M3 + m3 = P5). Both have a perfect fifth from root to fifth, which provides stability. The difference is which third is on the bottom — and that single swap changes the emotional character from bright to dark.')
) WHERE slug = 'flow_chord_quality_minor_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Among four close options, the minor triad''s dark-but-stable quality is your reliable guide.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor triad is dark and stable. Compare: diminished is dark and tense (the fifth is flattened). Major is bright and stable. Augmented is bright and unstable. The minor triad''s perfect fifth keeps it grounded despite the dark third.', 'why_text', 'Stability comes from the fifth. Both major and minor triads have a perfect fifth (7 half steps) from root to top, which is why both sound resolved. Diminished (6 half steps) and augmented (8 half steps) triads alter the fifth, breaking the stability. The fifth is the anchor; the third is the color.')
) WHERE slug = 'flow_chord_quality_minor_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Triads vs. seventh chords — you hear the difference in density. Three voices, no added tension.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A minor triad has three notes: root, minor third, and perfect fifth. It sounds clean and compact. Seventh chords add a fourth note that introduces new tension or color above the basic triad.', 'why_text', 'The triad is the harmonic skeleton. The seventh, when added, changes the chord''s harmonic function and voice-leading behavior. A minor triad can sit indefinitely; a minor 7th chord has mild forward motion. Learning to hear whether that fourth voice is present is a crucial step in chord identification.')
) WHERE slug = 'flow_chord_quality_minor_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You hear the minor quality in context. Real-world harmonic identification is strengthening.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In progressions, minor chords often function as ii, iii, or vi in major keys. They add depth, contrast, and emotional weight. After a bright major chord, a minor chord sounds especially dark by comparison.', 'why_text', 'Chord function depends on context. The same minor triad can feel sorrowful (as vi after a IV-V cadence), gently tense (as ii preparing a V), or colorful (as iii connecting I and IV). Training with progressions teaches your ear to hear not just quality but function — what role the chord plays in the harmonic story.')
) WHERE slug = 'flow_chord_quality_minor_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You identify the minor 7th chord type reliably. The warm, mellow extension is distinct from the dominant 7th.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A minor 7th chord adds a minor seventh interval (10 half steps from the root) to a minor triad. The result is warm and mellow — common in jazz and pop. It has gentle tension but is more restful than a dominant 7th.', 'why_text', 'The minor 7th chord stacks m3 + M3 + m3. There is no tritone in this chord, which is why it lacks the dominant 7th''s strong pull toward resolution. Instead, it creates a warm, slightly colored sound that can function as ii7, iii7, or vi7. The absence of the tritone makes it a "resting" seventh chord rather than a "resolving" one.')
) WHERE slug = 'flow_chord_quality_minor_l6';

-- ---- chord_quality_dim (Diminished Triad) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You correctly categorize diminished as minor-type. The shared bottom third is a reliable first step.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Diminished chords start with a minor third on the bottom, placing them in the minor-type family. But unlike a true minor triad, the diminished triad also flattens the fifth, creating a tritone. The first step is hearing that dark bottom third.', 'why_text', 'Classification by the bottom third is a triage strategy: first sort into major-type or minor-type, then refine. Both minor and diminished start with a minor third (3 half steps), so they share the dark character. The distinction comes next — the fifth. Minor has a perfect fifth; diminished has a diminished fifth (tritone).')
) WHERE slug = 'flow_chord_quality_dim_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You identify the diminished triad among three options. The tense, unstable quality sets it apart from stable triads.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The diminished triad stacks two minor thirds (3 + 3 = 6 half steps), creating a tritone from root to fifth. It sounds dark and tense — the reduced fifth robs the chord of the stability that perfect fifths provide.', 'why_text', 'Two stacked minor thirds create a symmetrical structure — the diminished triad divides the minor third equally. This symmetry and the tritone between root and fifth give the chord its restless quality. It can resolve in multiple directions, making it harmonically versatile but inherently unstable.')
) WHERE slug = 'flow_chord_quality_dim_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Among four options, the diminished triad''s dark tension is a distinct fingerprint. You separate it from minor with confidence.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The diminished triad is dark and tense. Minor is dark but stable (perfect fifth). Major is bright and stable. Augmented is bright and tense (raised fifth). The diminished triad''s tritone is what distinguishes it from the minor triad''s more grounded sound.', 'why_text', 'The tritone (6 half steps) between the root and fifth of a diminished triad is the key identifier. A minor triad has a perfect fifth (7 half steps) — one half step wider, but that single semitone changes the chord from stable to unstable. The diminished fifth compresses the chord, creating an inward tension that the ear perceives as urgency.')
) WHERE slug = 'flow_chord_quality_dim_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You hear the three-note structure of the diminished triad clearly. No seventh — just concentrated tension.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A diminished triad has three notes: root, minor third, and diminished fifth. Despite its intense tension, it is still a triad — three notes, not four. Adding a seventh creates a half-diminished or fully diminished 7th chord with a different character.', 'why_text', 'The diminished triad is relatively rare as a standalone chord in practice — it more often appears as part of a seventh chord (half-diminished or fully diminished). But hearing the triad in isolation teaches you to recognize the core quality: two stacked minor thirds with a tritone. This core persists in the extended forms.')
) WHERE slug = 'flow_chord_quality_dim_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You hear the diminished quality within a progression. Its tension stands out against more stable chords.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In progressions, diminished chords typically function as vii° — a leading-tone chord that resolves upward to the tonic. Their extreme tension makes them transitional; they rarely sit still. Listen for the moment of maximum instability.', 'why_text', 'The diminished triad''s tritone contains the leading tone (7th scale degree) and the 4th scale degree. These two notes have the strongest tendencies in tonal music — the leading tone pulls up to tonic, and the 4th pulls down to the 3rd. This double pull is why the diminished chord resolves so strongly and why it almost always functions as a dominant substitute.')
) WHERE slug = 'flow_chord_quality_dim_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You identify the half-diminished 7th reliably. The diminished triad plus minor seventh is a distinct combination.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Adding a minor seventh (10 half steps from root) to a diminished triad creates the half-diminished 7th chord. It is less tense than a fully diminished 7th and commonly functions as ii in minor keys — a preparatory chord before the dominant.', 'why_text', 'The half-diminished 7th (m3 + m3 + M3) adds a major third on top of the diminished triad. This major third places the seventh at 10 half steps from the root (minor seventh), making it "half" diminished — only the triad is diminished, not the seventh. Compare to the fully diminished 7th, which stacks three minor thirds and reduces the seventh to 9 half steps (diminished seventh).')
) WHERE slug = 'flow_chord_quality_dim_l6';

-- ---- chord_quality_aug (Augmented Triad) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You categorize augmented as major-type correctly. The bright bottom third connects it to the major family.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Augmented chords start with a major third on the bottom, placing them in the major-type family. But unlike a true major triad, the augmented triad also raises the fifth, creating a sense of upward expansion. The bright bottom third is the shared starting point.', 'why_text', 'Both major and augmented triads have a major third (4 half steps) from root to third. This shared foundation means they both sound bright. The difference is the fifth: major has a perfect fifth (7 half steps), augmented has an augmented fifth (8 half steps). That raised fifth adds instability to the augmented triad''s brightness.')
) WHERE slug = 'flow_chord_quality_aug_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You identify the augmented triad among three options. Its floating, unresolved quality is a clear signal.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The augmented triad stacks two major thirds (4 + 4 = 8 half steps), creating an augmented fifth from root to top note. It sounds bright but unstable — like something expanding outward that has not yet landed.', 'why_text', 'Two stacked major thirds create a symmetrical structure — the augmented triad divides the major third equally. This symmetry (like the diminished triad) makes the chord tonally ambiguous. The augmented fifth (8 half steps) is enharmonically equivalent to a minor sixth, which contributes to the chord''s floating, rootless quality.')
) WHERE slug = 'flow_chord_quality_aug_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Among four options, the augmented triad''s bright instability is distinctive. You hear its ethereal quality clearly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The augmented triad is bright and unstable. Major is bright and stable. Minor is dark and stable. Diminished is dark and unstable. The augmented triad''s widened fifth is what sets it apart from the major triad — both are bright, but only major is resolved.', 'why_text', 'The augmented fifth (8 half steps) exceeds the perfect fifth (7) by one half step. This single semitone removes the stability that the perfect fifth provides. The augmented triad essentially "stretches" the major triad upward, creating an expansive tension. Its whole-tone construction (the augmented triad is a subset of the whole-tone scale) gives it an otherworldly, floating character.')
) WHERE slug = 'flow_chord_quality_aug_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You hear the augmented triad as three voices. The compact structure is clear despite the unusual quality.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'An augmented triad has three notes: root, major third, and augmented fifth. Its unusual quality might suggest more complexity, but it is still a three-note chord. Adding a seventh would create an augmented 7th chord with a denser texture.', 'why_text', 'The augmented triad''s symmetry (equal division of the octave into three major thirds) means it only has four unique transpositions — any of its three notes can serve as the root. This ambiguity can make it sound more complex than a three-note chord, but structurally it is still a triad with a clear three-voice texture.')
) WHERE slug = 'flow_chord_quality_aug_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You recognize augmented quality within a progression. Its bright tension stands out against the surrounding harmony.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In progressions, augmented chords often appear as altered dominant chords (V+) or passing chords. They create a moment of bright, floating tension that resolves typically by the raised fifth moving up by half step. Listen for the moment that sounds ethereal or suspended.', 'why_text', 'The augmented triad creates what musicians call "chromatic voice leading" — the raised fifth naturally resolves upward by a half step, creating smooth melodic motion between chords. This is why augmented chords work so well as passing harmonies: they connect stable chords through half-step motion, adding color without disrupting the harmonic flow.')
) WHERE slug = 'flow_chord_quality_aug_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You identify the augmented major 7th chord type. A rare but recognizable sound in your growing vocabulary.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Adding a major seventh (11 half steps from root) to an augmented triad creates the augmented major 7th chord. It is rare and striking — the combination of an expanded fifth and a leading-tone seventh produces a uniquely luminous tension.', 'why_text', 'The augmented major 7th chord stacks M3 + M3 + m3. The major seventh interval adds a half-step tension near the octave, while the augmented fifth adds outward expansion. Together they create a chord that is simultaneously bright, expansive, and tense — an advanced sound found primarily in jazz and film scoring where its dramatic color is prized.')
) WHERE slug = 'flow_chord_quality_aug_l6';

-- ---- chord_quality_dom7 (Dominant 7th) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You hear the major-type foundation of the dominant 7th. The bright bottom third is the right first classification.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The dominant 7th is built on a major triad, so its bottom third is major (4 half steps). This gives it a bright foundation. The added minor seventh on top creates tension, but the base is unmistakably major-type.', 'why_text', 'Classifying by the bottom third first is efficient because it cuts the possibilities in half. The dominant 7th has a major third on the bottom, making it major-type — like major triads and major 7th chords. The tension comes from the top of the chord, not the foundation. This layered approach (base character first, then specific quality) mirrors how the ear naturally processes complex sounds.')
) WHERE slug = 'flow_chord_quality_dom7_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You distinguish the dominant 7th from major and minor triads. The added tension of the minor seventh is a clear signal.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The dominant 7th combines a major triad with a minor seventh — bright base, tense top. This creates a chord that sounds assertive and forward-leaning, unlike the restful major triad or the somber minor triad. It wants to move.', 'why_text', 'The dominant 7th is the only common chord that combines a major third with a minor seventh. This combination creates a tritone between the 3rd and the 7th — the engine of tonal resolution. The major triad lacks this tritone (no 7th), and the minor 7th chord has a minor third that prevents the tritone from forming. The dominant 7th is uniquely constructed for harmonic motion.')
) WHERE slug = 'flow_chord_quality_dom7_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Among four similar options, the dominant 7th''s specific tension profile is clear to you. You hear the tritone''s pull.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The dominant 7th sits between the major 7th (lush, no tritone) and the minor 7th (warm, no tritone). Only the dominant 7th contains a tritone — the interval between the major 3rd and the minor 7th. That tritone is what gives it its restless, resolving character.', 'why_text', 'The tritone in the dominant 7th chord is formed by the major 3rd (which is the leading tone in V7-I) and the minor 7th (which is the 4th scale degree). These two notes have the strongest resolution tendencies in tonal music. Together they create a tension that nearly forces resolution. No other common seventh chord has this specific tritone placement.')
) WHERE slug = 'flow_chord_quality_dom7_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You hear the four voices of the dominant 7th clearly. The added seventh is not just color — it is structural tension.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The dominant 7th has four pitch classes: root, major third, perfect fifth, and minor seventh. The fourth note (the seventh) transforms the stable major triad into a chord with forward momentum. That additional voice is what creates the tritone.', 'why_text', 'The transition from triad to seventh chord is not just about adding a note — it changes the chord''s harmonic function. A major triad can be I, IV, or V and sit comfortably. The moment you add a minor seventh, it becomes V7 with a strong pull to I. The seventh is the functional trigger that converts a static chord into a dynamic one.')
) WHERE slug = 'flow_chord_quality_dom7_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You identify the dominant 7th in a harmonic context. Its resolving tension is unmistakable in real progressions.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In progressions, the dominant 7th almost always functions as V7 — the chord that creates the strongest pull back to the tonic. It is the moment of maximum tension before resolution. Listen for the chord that feels like it is leaning forward, demanding the next chord.', 'why_text', 'The dominant 7th''s resolution to the tonic (V7 to I) is the most fundamental chord progression in tonal music. The tritone between the 3rd and 7th resolves by contrary motion: the 3rd (leading tone) moves up a half step to the tonic, and the 7th (4th scale degree) moves down a half step to the 3rd of the tonic chord. This efficient, satisfying resolution is why V7-I has been the anchor of tonal harmony for four centuries.')
) WHERE slug = 'flow_chord_quality_dom7_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You identify the dominant 7th chord type with precision. Its unique position among seventh chords is clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The dominant 7th is a major triad plus a minor seventh. Compare: the major 7th has a major seventh (lush, no pull). The minor 7th has a minor triad base (dark, mellow). The half-diminished has a diminished triad (tense, academic). The dominant 7th is the only one with both brightness and resolving tension.', 'why_text', 'Among seventh chords, the dominant 7th is unique: it is the only one with a major third and a minor seventh simultaneously. This specific combination creates the tritone that is absent from major 7th, minor 7th, and half-diminished chords (which have tritones in different positions or none at all). The dominant 7th''s tritone placement — between scale degrees 3 and 7 — is precisely what makes it the engine of resolution.')
) WHERE slug = 'flow_chord_quality_dom7_l6';

-- ---- chord_quality_maj7 (Major 7th) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major-type foundation of the major 7th chord is clear to you. Same bright base as dominant 7th, different extension.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 7th chord is built on a major triad, so the bottom third is major (4 half steps). It shares the bright foundation of the dominant 7th, but the quality of the seventh on top is different — major instead of minor, creating a completely different character.', 'why_text', 'Both the dominant 7th and major 7th have a major triad as their foundation, which is why both are major-type. The crucial difference is the seventh: minor seventh in the dominant 7th (creating a tritone), major seventh in the major 7th (no tritone). Same base, different extension, dramatically different harmonic behavior.')
) WHERE slug = 'flow_chord_quality_maj7_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You distinguish the major 7th from the dominant 7th and major triad. The lush shimmer is its identifying mark.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 7th chord adds a major seventh interval to a major triad — producing a lush, sophisticated sound. It is more colorful than a plain major triad (which sounds simple and stable) and more restful than a dominant 7th (which sounds tense and forward-leaning).', 'why_text', 'The major seventh interval (11 half steps) sits just one half step below the octave. This proximity creates a gentle, luminous dissonance — not the driving tension of the tritone in a dominant 7th, but a shimmering color. The major 7th chord does not demand resolution; it invites the listener to linger. This is why it is the signature chord of jazz ballads and bossa nova.')
) WHERE slug = 'flow_chord_quality_maj7_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Among four close options, the major 7th chord''s dreamy stability is distinctive. You separate it from the dominant 7th''s tension.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 7th chord sounds dreamy and open — no tritone means no strong pull to resolve. Compare to the dominant 7th (bright + tense), minor 7th (dark + warm), and augmented (bright + floating). The major 7th is bright + lush — a unique combination.', 'why_text', 'The absence of a tritone is the major 7th chord''s defining structural feature. The dominant 7th has a tritone between the 3rd and b7. The major 7th replaces that b7 with a natural 7, removing the tritone and replacing resolving tension with shimmering color. This single half-step change (b7 to natural 7) transforms the chord from an engine of motion into a resting point with sophistication.')
) WHERE slug = 'flow_chord_quality_maj7_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You hear four voices in the major 7th chord. The added seventh enriches without destabilizing.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 7th chord has four pitch classes: root, major third, perfect fifth, and major seventh. The seventh adds color and sophistication without the urgency that a minor seventh brings. It enriches the triad rather than destabilizing it.', 'why_text', 'In the major 7th chord, the seventh functions as a color tone rather than a functional dissonance. Where the dominant 7th''s minor seventh creates motion (it must resolve), the major 7th''s major seventh creates atmosphere (it can sit indefinitely). This distinction between functional dissonance and coloristic dissonance is fundamental to understanding jazz harmony, where major 7th chords serve as stable home base.')
) WHERE slug = 'flow_chord_quality_maj7_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You hear the major 7th chord''s role in a progression. It functions as a sophisticated resting point.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In progressions, major 7th chords typically function as I or IV — stable, resting harmonies. They add a layer of sophistication to what would otherwise be a plain major chord. Listen for the chord that sounds stable but somehow more nuanced than a simple triad.', 'why_text', 'The major 7th chord replaces the simple stability of a major triad with a more complex stability. In classical music, the major 7th was considered a dissonance requiring resolution. In jazz and modern pop, it became a consonance — a stable chord with added color. This shift reflects changing aesthetic preferences, but the acoustic reality has not changed: the half-step between the 7th and the octave is always present, adding a permanent shimmer to the chord''s otherwise stable foundation.')
) WHERE slug = 'flow_chord_quality_maj7_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You identify the major 7th chord type with clarity. Its position among seventh chords is well understood.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 7th chord is a major triad plus a major seventh. The half step between the seventh and the octave is its acoustic signature — a bright shimmer that distinguishes it from all other seventh chords. Compare to the dominant 7th, which has a whole step between the seventh and the octave.', 'why_text', 'The top interval is the final distinguishing feature: in a major 7th chord, the 7th is one half step below the octave (leading tone to tonic). In a dominant 7th, the 7th is a whole step below the octave. This difference — one half step versus one whole step — determines whether the chord shimmers in place (major 7th) or drives toward resolution (dominant 7th). Same triad, different seventh, fundamentally different musical role.')
) WHERE slug = 'flow_chord_quality_maj7_l6';
-- ============================================================
-- Topic 7: Scale Degree Feeling (42 cards)
-- ============================================================

-- ---- degree_1 (Do) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your sense of home is becoming instinctive — you''re locking onto the tonic without hesitation.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The tonic is the point of complete rest. Every other degree pulls toward it — this one just sits, settled and resolved.', 'why_text', 'Do is the gravitational center of the key. It''s the pitch that every melodic line ultimately wants to reach. When you hear it against the drone, there''s zero tension — just arrival.')
) WHERE slug = 'flow_degree_1_tonic_or_not';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re distinguishing the tonic from its neighbors reliably now. That clarity will anchor everything else.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The tonic has a quality of completeness that the other degrees lack. Listen for the pitch that feels like it has nowhere else to go.', 'why_text', 'Do is a unison or octave with the drone — the simplest possible ratio. That consonance is what makes it feel finished rather than in motion.')
) WHERE slug = 'flow_degree_1_far_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Even with closer options to compare, you''re identifying the tonic with confidence. Your ear knows what rest sounds like.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among these options, the tonic is the one that sounds completely at rest. The others carry some degree of tension or pull.', 'why_text', 'The tonic sits at a unison with the key center. Nearby degrees like Re or Ti have intervallic tension that makes them lean — Do does not lean anywhere.')
) WHERE slug = 'flow_degree_1_close_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re recognizing stability categories clearly. The tonic is the definition of stable — that distinction is solid in your ear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Do is the most stable degree in the scale. It''s the resolution point, the place where motion stops and tension disappears.', 'why_text', 'Stability in tonal music comes from proximity to the simplest frequency ratios. Do, as the tonic, is the ultimate reference point — it defines stability itself.')
) WHERE slug = 'flow_degree_1_tendency';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You understand that the tonic resolves — it doesn''t pull. That''s a fundamental insight about how tonal gravity works.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The tonic doesn''t tend toward any other degree. It''s the destination, not a waypoint. Everything else resolves to it.', 'why_text', 'Resolution tendency is about tension seeking release. Since Do carries no tension, it has no tendency — it is the point of release that other degrees seek.')
) WHERE slug = 'flow_degree_1_resolve';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing the tonic in melodic context — where it arrives and settles — shows real integration of your scale degree sense.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a melody, the tonic is the note that feels like a landing point. Phrases that end on it feel complete; phrases that pass through it feel momentarily grounded.', 'why_text', 'Melodic context adds rhythm and contour, but the tonic''s gravitational pull remains. It''s the note where forward motion can stop without feeling interrupted.')
) WHERE slug = 'flow_degree_1_pair';

-- ---- degree_5 (Sol) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re hearing Sol''s strong, grounded quality. It''s the pillar next to the tonic, and your ear is finding it reliably.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Sol is not the tonic — it has a strong, open quality but still carries a subtle pull back to Do. It''s stable, yet not home.', 'why_text', 'The fifth degree sits a perfect fifth above the tonic, the most consonant interval after the octave. That gives Sol its strength, but also its role as a support to Do rather than a replacement for it.')
) WHERE slug = 'flow_degree_5_tonic_or_not';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re distinguishing Sol from the other degrees with growing precision. Its dominant character is registering clearly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Sol has a bright, open, foundational sound — like a strong column supporting the key. It''s stable but not at rest the way the tonic is.', 'why_text', 'The perfect fifth is the second simplest frequency ratio (3:2). That near-perfect consonance is why Sol sounds so strong — close to the tonic''s stability, but distinctly not home.')
) WHERE slug = 'flow_degree_5_far_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Even among close options, Sol''s dominant quality stands out to your ear. That''s a well-trained instinct.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among these choices, Sol is the one that sounds strong and open without being fully at rest. It has a quality of confident expectation.', 'why_text', 'Sol''s perfect fifth relationship gives it a clarity that distinguishes it from the warmer third or the restless fourth. It''s the most consonant non-tonic degree.')
) WHERE slug = 'flow_degree_5_close_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re categorizing Sol''s stability correctly. It''s the strongest stable degree after the tonic — your ear is mapping the hierarchy.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Sol is a stable degree — the second most stable in the scale after Do. It can support harmonic weight without needing to resolve immediately.', 'why_text', 'The perfect fifth creates a relationship so consonant that Sol can function as a temporary resting point. It''s stable because its frequency ratio to the tonic is simple and clear.')
) WHERE slug = 'flow_degree_5_tendency';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You understand Sol''s tendency — it supports and returns to Do. That''s the dominant-tonic relationship at its core.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Sol tends to resolve down to Do, reinforcing the tonic. It''s the degree that most strongly points back to home.', 'why_text', 'The dominant-to-tonic motion (Sol to Do) is the most fundamental resolution in tonal music. Sol''s fifth relationship creates a gravitational pull back toward the tonic that defines the key.')
) WHERE slug = 'flow_degree_5_resolve';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Tracking Sol through a melody — hearing its supportive, anchoring role — shows your scale degree sense is maturing.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a melody, Sol often appears at structurally strong moments. It feels like a reliable platform — not a final destination, but a place you can pause with confidence.', 'why_text', 'Melodic phrases frequently use Sol as a midpoint or a springboard. Its stability gives it weight in a melodic line, but its dominant function means it usually leads back to Do eventually.')
) WHERE slug = 'flow_degree_5_pair';

-- ---- degree_3 (Mi) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re recognizing Mi''s characteristic color. That sense of bright stability is becoming familiar to your ear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Mi is not the tonic. It has a warm, colorful quality — stable enough to rest on briefly, but with a brightness (in major) or darkness (in minor) that sets it apart from Do.', 'why_text', 'The third degree defines the mode — major or minor. It sits at a major or minor third above the tonic, an interval consonant enough for stability but rich enough to carry strong emotional color.')
) WHERE slug = 'flow_degree_3_tonic_or_not';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re picking Mi out of the lineup with confidence. Its modal color is a reliable signature to your ear now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Mi has a warm, expressive quality distinct from Sol''s openness or Do''s neutrality. It''s the degree that gives the scale its emotional character.', 'why_text', 'The third is the interval that determines major or minor — the single most important color distinction in Western music. That''s why Mi sounds so characteristically warm or poignant.')
) WHERE slug = 'flow_degree_3_far_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Narrowing down to Mi among close options shows your ear is sensitive to the specific warmth of the third degree.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among these choices, Mi is the one with a warm, colored quality. It''s neither as neutral as Do nor as open as Sol — it carries the emotional signature of the key.', 'why_text', 'The major third (or minor third) creates a consonance with character. Compared to the perfect intervals of Do and Sol, Mi''s imperfect consonance gives it that distinctly expressive sound.')
) WHERE slug = 'flow_degree_3_close_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re correctly placing Mi in the stable category. It''s part of the tonic triad, and your ear recognizes that membership.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Mi is a stable degree. As the third of the tonic triad, it can rest without urgency — though it carries more color than Do or Sol.', 'why_text', 'Stability comes from membership in the tonic triad. Do, Mi, and Sol together define the home chord. Mi, as the third, is stable because it belongs to that fundamental structure.')
) WHERE slug = 'flow_degree_3_tendency';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You understand Mi''s tendencies — how it can hold its ground or move stepwise. That''s nuanced listening.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Mi tends to hold steady or move by step. It can resolve down to Re or up to Fa, but it doesn''t carry the urgent pull of leading tones or unstable degrees.', 'why_text', 'As a stable triad member, Mi doesn''t need to resolve, but in melodic motion it often moves stepwise. Its tendency is gentle — it participates in motion rather than demanding resolution.')
) WHERE slug = 'flow_degree_3_resolve';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing Mi''s expressive color in melodic context means you''re tracking scale degrees through real musical situations.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a melody, Mi often colors key emotional moments. Its warmth gives phrases their major or minor character — listen for the note that feels bright or tender.', 'why_text', 'Melodies lean on Mi for expression. Because it defines the mode, it often appears at points where the music''s emotional quality needs to be reinforced — arrivals, expressive peaks, or gentle resolutions.')
) WHERE slug = 'flow_degree_3_pair';

-- ---- degree_4 (Fa) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re sensing Fa''s characteristic pull — that "almost home" quality is becoming recognizable in your listening.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Fa is not the tonic. It has a leaning quality — like standing just outside the door. There''s a gentle pull downward toward Mi.', 'why_text', 'The fourth degree sits a half step above the stable Mi. That proximity creates a subtle but persistent downward pull, giving Fa its characteristic "almost there" feeling.')
) WHERE slug = 'flow_degree_4_tonic_or_not';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re distinguishing Fa''s subdominant energy from the other degrees. That leaning, expectant quality is clicking for you.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Fa has a warm but restless quality — it leans downward, wanting to settle into Mi. It''s neither as tense as Ti nor as stable as Sol.', 'why_text', 'Fa sits a perfect fourth above the tonic. While a fourth is consonant, it''s less stable than the fifth. Combined with the half-step proximity to Mi, Fa carries a gentle subdominant pull.')
) WHERE slug = 'flow_degree_4_far_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Finding Fa among closer options shows your ear is tuned to its specific restlessness. That half-step pull to Mi is distinctive.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among these choices, Fa is the one that leans — not with urgency, but with a gentle pull toward resolution. It sounds close to stable, but not quite settled.', 'why_text', 'The half step between Fa and Mi is critical. Half steps create the strongest melodic pulls in tonal music, and Fa''s proximity to the stable third gives it that characteristic "not quite home" feeling.')
) WHERE slug = 'flow_degree_4_close_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re correctly hearing Fa as unstable. Its subdominant pull is real, and you''re categorizing it accurately.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Fa is an unstable degree. Despite being a consonant fourth above the tonic, its half-step proximity to Mi gives it a leaning quality that prevents true rest.', 'why_text', 'Stability in scale degrees depends on both the interval with the tonic and relationships with neighboring degrees. Fa''s half step above Mi makes it lean downward, classifying it as unstable despite its consonant fourth.')
) WHERE slug = 'flow_degree_4_tendency';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You understand Fa''s resolution tendency — that downward pull to Mi. Your ear is mapping the gravitational landscape of the scale.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Fa tends to resolve down to Mi. That half-step descent is one of the most natural motions in tonal music — a gentle falling into stability.', 'why_text', 'The Fa-to-Mi resolution mirrors the Ti-to-Do resolution at the other end of the scale. Both involve half-step descents to stable triad members, but Fa''s pull is gentler because it targets the third, not the tonic.')
) WHERE slug = 'flow_degree_4_resolve';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing Fa''s subdominant lean in a melodic context means you''re tracking tension and release through real phrases.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a melody, Fa often appears as a passing tone or a moment of gentle tension. It colors the phrase with an "almost resolved" quality before settling to Mi.', 'why_text', 'Melodic phrases use Fa for motion and mild tension. It''s a natural neighbor to Mi, and melodies frequently pass through it or lean on it briefly before resolving downward.')
) WHERE slug = 'flow_degree_4_pair';

-- ---- degree_2 (Re) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re sensing Re''s passing quality — that gentle pull down to Do is becoming a reliable signal for your ear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Re is not the tonic. It has a transitional quality — like a step on the way somewhere. There''s a mild pull downward toward Do.', 'why_text', 'The second degree sits a whole step above the tonic. It''s close enough to feel related to home but far enough to carry forward motion. Re is a passing tone by nature — it connects rather than settles.')
) WHERE slug = 'flow_degree_2_tonic_or_not';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re identifying Re''s transitional character among the options. Its role as a connector is registering in your ear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Re has a light, mobile quality. It''s not as tense as Ti or as leaning as Fa — it simply passes through, gently pulling toward Do.', 'why_text', 'The whole step between Re and Do gives Re enough distance to feel in motion without urgency. It''s the most neutral of the unstable degrees — a natural passing tone between Do and Mi.')
) WHERE slug = 'flow_degree_2_far_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Finding Re among closer options shows you''re hearing its specific lightness. Not tense, not stable — just moving.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among these choices, Re is the degree that feels like motion. It doesn''t lean heavily or create tension — it simply wants to keep moving, usually down to Do.', 'why_text', 'Re occupies the space between two stable degrees (Do and Mi). A whole step from each, it serves as a bridge. Its quality is defined less by tension and more by momentum.')
) WHERE slug = 'flow_degree_2_close_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re correctly classifying Re as unstable. Its passing-tone nature is clear to your ear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Re is unstable. It''s not part of the tonic triad, so it doesn''t have a resting place in the home chord. Its role is to move, not to stay.', 'why_text', 'Degrees outside the tonic triad (Do-Mi-Sol) are inherently unstable. Re sits between Do and Mi without belonging to the tonic chord, which is why it always feels like a transition rather than a destination.')
) WHERE slug = 'flow_degree_2_tendency';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You understand Re''s resolution tendency — its gentle pull to Do. That''s the supertonic''s essential behavior.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Re tends to resolve downward to Do. The whole-step descent to the tonic is natural and gentle — not urgent, just gravitational.', 'why_text', 'As the supertonic, Re sits directly above the tonic. Gravity in tonal music tends downward, and Re''s whole-step relationship to Do makes the descent feel inevitable but unhurried.')
) WHERE slug = 'flow_degree_2_resolve';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Tracking Re''s passing quality through a melody means you''re hearing how motion and rest interact in real music.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a melody, Re often connects Do and Mi or serves as a brief departure from the tonic. It adds motion without drama.', 'why_text', 'Melodic lines use Re as connective tissue. It''s the degree that makes stepwise motion possible between the tonic and the third, giving phrases their smooth, flowing quality.')
) WHERE slug = 'flow_degree_2_pair';

-- ---- degree_6 (La) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re sensing La''s gentle warmth and its pull toward Sol. That sensitivity to the upper scale degrees is developing well.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'La is not the tonic. It has a relatively calm quality — warmer than Sol but not as settled. In major, it feels gently luminous; it leans toward Sol.', 'why_text', 'The sixth degree sits a major sixth above the tonic in major keys. It''s consonant enough to feel relatively stable, but its position above Sol gives it a mild tendency to descend toward the dominant.')
) WHERE slug = 'flow_degree_6_tonic_or_not';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re distinguishing La from its neighbors. Its specific quality — warm but not settled — is becoming clear to your ear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'La has a warm, moderately stable sound. It''s brighter than Fa and less tense than Ti, sitting in a comfortable middle ground with a gentle lean toward Sol.', 'why_text', 'The sixth degree forms a consonant major sixth with the tonic but isn''t part of the tonic triad. This gives it a pleasant sound with a slight restlessness — at home in the key but not at home in the chord.')
) WHERE slug = 'flow_degree_6_far_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Identifying La among closer options shows your ear is sensitive to its specific place in the scale — warm, high, gently leaning.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among these choices, La is the one that sounds warm and relatively relaxed but not fully at rest. It sits above Sol with a gentle downward inclination.', 'why_text', 'La''s whole step above Sol gives it a similar passing quality to Re''s relationship with Do, but higher in the scale. It connects the dominant region to the leading tone region.')
) WHERE slug = 'flow_degree_6_close_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re correctly hearing La''s relative stability. It''s one of the more nuanced degrees to classify, and you''re getting it right.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'La is relatively stable in major — more stable than Fa or Re, but less stable than Do, Mi, or Sol. It can linger without urgency but doesn''t fully settle.', 'why_text', 'La''s consonant sixth interval with the tonic gives it more stability than truly unstable degrees. In major, it often functions as a gentle resting point, though it''s not part of the tonic triad.')
) WHERE slug = 'flow_degree_6_tendency';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You understand La''s tendency to drift toward Sol. That sense of upper-scale gravity is becoming intuitive.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'La tends to resolve downward to Sol. The descent to the dominant is its most natural motion — a gentle step down to a more stable degree.', 'why_text', 'The sixth degree gravitates toward the fifth because Sol is more stable (a triad member). The whole-step descent from La to Sol mirrors the Re-to-Do relationship, creating a symmetry in the scale''s gravitational map.')
) WHERE slug = 'flow_degree_6_resolve';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing La''s warm color in melodic context shows you''re tracking the subtler degrees through real musical phrases.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a melody, La adds warmth and gentle height. It often appears in lyrical passages, coloring the phrase with its luminous quality before stepping down to Sol.', 'why_text', 'Melodies use La for its expressive warmth. It extends phrases upward from Sol without the tension of Ti, creating moments of gentle elevation before the line descends.')
) WHERE slug = 'flow_degree_6_pair';

-- ---- degree_7 (Ti) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re feeling Ti''s intense pull. That half-step tension pointing to Do is one of the strongest forces in tonal music, and your ear is locked onto it.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Ti is not the tonic — it''s the degree with the most tension. It sits a half step below Do and pulls upward with almost magnetic force. It''s the opposite of rest.', 'why_text', 'The leading tone is a half step below the tonic. That half-step proximity creates the strongest possible melodic pull in tonal music. Ti doesn''t just want to resolve — it demands it.')
) WHERE slug = 'flow_degree_7_tonic_or_not';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re identifying Ti''s urgent character among the options. Its leading-tone tension is unmistakable to your ear now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Ti has a sharp, tense, urgent quality unlike any other degree. It sounds like it''s leaning hard into the note above it — because it is.', 'why_text', 'The major seventh interval between Do and Ti is the most dissonant interval in the major scale against the tonic. That dissonance, combined with the half-step proximity to Do, creates Ti''s characteristic urgency.')
) WHERE slug = 'flow_degree_7_far_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Even among closer options, Ti''s tension stands out to your ear. Its quality is unique — no other degree pulls this hard.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among these choices, Ti is the one that sounds most tense and urgent. It has a sharpness that distinguishes it from every other degree.', 'why_text', 'Ti''s combination of dissonance (major seventh with the tonic) and proximity (half step to Do) makes it acoustically unique. No other degree has both qualities simultaneously, which is why it sounds so distinctive.')
) WHERE slug = 'flow_degree_7_close_id';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re correctly identifying Ti as the leading tone — the most actively unstable degree. That classification is deeply ingrained now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Ti is the leading tone — the most unstable degree in the scale. It carries maximum tension and exists almost entirely to resolve upward to Do.', 'why_text', 'The leading tone is categorized separately from merely unstable degrees because its pull is directional and urgent. While Re or Fa are unstable, Ti is actively leading — its instability has a specific target.')
) WHERE slug = 'flow_degree_7_tendency';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You understand Ti''s resolution tendency — that urgent half-step ascent to Do. This is the most fundamental leading-tone behavior in tonal music.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Ti resolves upward to Do. This half-step ascent is the strongest resolution tendency in the scale — the leading tone pulling to the tonic.', 'why_text', 'The Ti-to-Do resolution is the engine of tonal music. Half steps create the strongest melodic pulls, and when that pull targets the tonic itself, the result is the most powerful resolution available. This is why dominant chords feel so urgent.')
) WHERE slug = 'flow_degree_7_resolve';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing Ti''s urgency in melodic context — and its resolution to Do — shows you''re tracking tonal tension through real music.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a melody, Ti creates moments of peak tension. It''s the note that makes you hold your breath before the phrase resolves to Do.', 'why_text', 'Composers use Ti strategically — it often appears just before final cadences or at climactic moments. Its half-step pull to Do gives melodic phrases their sense of inevitability and arrival.')
) WHERE slug = 'flow_degree_7_pair';

-- ============================================================
-- Topic 10: Cadence Recognition (24 cards)
-- ============================================================

-- ---- cadence_authentic (V-I) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your ear is locking onto the authentic cadence''s sense of completion. That recognition of full resolution is becoming instinctive.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The authentic cadence feels fully resolved — like a sentence ending with a firm period. The tension releases completely, and the music arrives home.', 'why_text', 'The V-I motion combines the two strongest forces in tonal music: the leading tone (Ti to Do) pulling upward and the bass (Sol to Do) falling a fifth. Both voices converge on the tonic simultaneously, creating the most complete resolution possible.')
) WHERE slug = 'flow_cadence_authentic_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re distinguishing the authentic cadence from other types. Its finality is registering clearly against the alternatives.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The authentic cadence is the one that feels most final. Among the options, it''s the one where all tension dissolves and the music reaches a definitive stopping point.', 'why_text', 'The dominant chord contains both the leading tone (Ti) and the dominant note (Sol). When it moves to I, both of these active pitches resolve to tonic chord tones, creating a double resolution that no other cadence matches.')
) WHERE slug = 'flow_cadence_authentic_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Even with four cadence types to compare, you''re identifying the authentic cadence reliably. Its finality is unmistakable to your ear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among all four cadence types, the authentic cadence has the strongest sense of arrival. It''s the definitive ending — no lingering questions, no surprises.', 'why_text', 'The authentic cadence''s power comes from the bass motion of a descending fifth (or ascending fourth) to the tonic, combined with the leading tone resolution. This convergence of harmonic and melodic forces creates unmatched finality.')
) WHERE slug = 'flow_cadence_authentic_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re tracking the bass motion in the authentic cadence. Hearing Sol drop to Do in the bass is a fundamental listening skill.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In the authentic cadence, the bass moves from Sol down to Do — a descending fifth. This is the strongest possible bass motion to the tonic.', 'why_text', 'The descending fifth in the bass (Sol to Do) mirrors the fundamental harmonic relationship. The fifth is the most consonant interval after the octave, so moving from the fifth down to the root reinforces the tonic with maximum harmonic weight.')
) WHERE slug = 'flow_cadence_authentic_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You understand the authentic cadence''s structural role — how it confirms the key and closes phrases definitively. That''s real harmonic awareness.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The authentic cadence functions as a structural endpoint. It confirms the key and signals that a phrase, section, or piece has reached its conclusion.', 'why_text', 'In phrase structure, the authentic cadence provides the strongest punctuation. Composers place it at the ends of major sections and at the final conclusion. It''s the harmonic equivalent of "the end" — and listeners instinctively feel that finality.')
) WHERE slug = 'flow_cadence_authentic_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing authentic cadences in real musical context means you''re tracking harmonic structure through the texture. That skill transfers to all music you listen to.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In real music, the authentic cadence often appears at the end of phrases and sections. Listen for the moment where tension gathers and then releases completely — that''s usually V going to I.', 'why_text', 'Real musical context adds melody, rhythm, and texture on top of the harmonic progression. The authentic cadence remains recognizable because its resolution is so strong that it cuts through all the surface detail.')
) WHERE slug = 'flow_cadence_authentic_l6';

-- ---- cadence_plagal (IV-I) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re recognizing the plagal cadence''s gentle resolution. That soft landing quality is distinct from the authentic cadence''s firmness.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The plagal cadence resolves, but gently — like an afterthought or a sigh of agreement. It settles into the tonic without the urgency of a dominant chord.', 'why_text', 'The IV chord doesn''t contain the leading tone (Ti), so it lacks the sharp pull that drives the authentic cadence. Instead, the subdominant slides to the tonic with a warmer, less urgent motion — resolution without demand.')
) WHERE slug = 'flow_cadence_plagal_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re distinguishing the plagal cadence''s warmth from the authentic cadence''s authority. That contrast is becoming clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The plagal cadence is the gentle one. It reaches the tonic like the authentic cadence does, but the approach is softer — more of a settling than a snapping into place.', 'why_text', 'Without the leading tone, the plagal cadence relies on the descending motion of Fa to Mi and the bass moving from the fourth degree to the tonic. This stepwise motion is smoother and less directional than the dominant''s fifth-based pull.')
) WHERE slug = 'flow_cadence_plagal_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Identifying the plagal cadence among all four types shows your ear is sensitive to the quality of resolution, not just whether resolution happens.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among all four cadence types, the plagal cadence is the one that resolves softly. It reaches the tonic, but without the dramatic buildup of the authentic cadence or the surprise of the deceptive.', 'why_text', 'The plagal cadence occupies a unique space — it resolves (unlike the half cadence) but without the leading tone''s urgency (unlike the authentic). This makes it the most understated resolution, often used for confirmation rather than arrival.')
) WHERE slug = 'flow_cadence_plagal_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re tracking the bass motion in the plagal cadence — Fa descending to Do. That''s precise harmonic listening.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In the plagal cadence, the bass moves from Fa down to Do — a descending fourth. It''s a shorter drop than the authentic cadence''s fifth, which contributes to its gentler quality.', 'why_text', 'The descending fourth (Fa to Do) is a weaker resolution motion than the descending fifth. The fourth is less harmonically weighted, and the voice leading in the upper parts moves by step rather than by the compelling half-step pull of the leading tone.')
) WHERE slug = 'flow_cadence_plagal_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You understand the plagal cadence''s structural role — confirmation, not conclusion. That functional distinction is a sign of deepening harmonic understanding.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The plagal cadence functions as a confirmation. It often follows an authentic cadence, adding a final "amen" — an extra seal of closure rather than the primary ending.', 'why_text', 'In phrase structure, the plagal cadence is rarely the main point of arrival. It typically confirms a key that''s already been established, which is why it''s historically associated with the "amen" at the end of hymns — a gentle affirmation of what''s already been said.')
) WHERE slug = 'flow_cadence_plagal_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing plagal cadences in real musical context means you''re distinguishing between types of resolution in the music around you.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In real music, the plagal cadence often appears after the main ending, as a tag or coda. Listen for that extra settling motion — the music has already arrived, and this is a confirmation.', 'why_text', 'The plagal cadence in context is recognizable by its afterthought quality. It doesn''t drive toward resolution; it adds warmth to a resolution that''s already happened. In pop and rock, the IV-I motion is also common as a vamp, creating a gentle oscillation.')
) WHERE slug = 'flow_cadence_plagal_l6';

-- ---- cadence_half (x-V) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re hearing the half cadence''s incompleteness. Recognizing that "not yet" feeling is a key step in understanding harmonic phrasing.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The half cadence does not resolve. It stops on the dominant — like a sentence ending with a comma. There''s an expectation that something must follow.', 'why_text', 'The half cadence lands on V, the dominant chord, which is inherently unstable relative to the tonic. Stopping there creates suspense because the dominant''s leading tone and fifth-based tension are left unresolved. The ear expects continuation.')
) WHERE slug = 'flow_cadence_half_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re distinguishing the half cadence''s suspense from other cadence types. That sense of incompletion is clear to your ear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The half cadence is the one that feels suspended. It doesn''t resolve or deceive — it simply pauses, leaving the music hanging in expectation.', 'why_text', 'Unlike the authentic and plagal cadences (which land on I) or the deceptive cadence (which lands on vi), the half cadence lands on V. The dominant chord is built for tension, and stopping there is like holding your breath.')
) WHERE slug = 'flow_cadence_half_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Identifying the half cadence among all four types shows your ear is tracking not just resolution, but also the absence of resolution.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among all four cadence types, the half cadence is the only one that stops before reaching any form of tonic. It''s pure suspense — a deliberate pause mid-thought.', 'why_text', 'The half cadence is structurally incomplete by design. It marks a midpoint, not an endpoint. Composers use it to create antecedent phrases — musical questions that demand answering phrases with proper cadential resolution.')
) WHERE slug = 'flow_cadence_half_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re identifying the bass arrival on Sol in the half cadence. Hearing where the bass lands is fundamental to cadence recognition.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In the half cadence, the bass arrives on Sol — the dominant. The approach can vary (from many different chords), but the destination is always the fifth degree.', 'why_text', 'The half cadence is defined by its destination, not its approach. Any chord can precede V in a half cadence. What matters is that the bass lands on Sol, establishing the dominant as a point of suspense rather than resolution.')
) WHERE slug = 'flow_cadence_half_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You understand the half cadence''s structural function — creating a musical question. That awareness of phrase-level architecture is growing.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The half cadence functions as a question mark. It creates the first half of a question-and-answer phrase structure, setting up the need for a resolving cadence to follow.', 'why_text', 'Musical phrases often come in pairs: antecedent (ending on a half cadence) and consequent (ending on an authentic cadence). This question-answer structure is one of the most fundamental organizing principles in tonal music.')
) WHERE slug = 'flow_cadence_half_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing half cadences in real music means you''re sensing phrase structure — where music pauses, questions, and resumes. That''s deep listening.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In real music, the half cadence is the moment where the phrase pauses but doesn''t conclude. It often falls at the midpoint of a larger section, creating the sense that there''s more to come.', 'why_text', 'Half cadences in context are recognizable by the feeling of incompleteness. Even without identifying the specific chords, listeners sense the suspense — the music has stopped moving forward but hasn''t arrived. That feeling of expectation is the half cadence''s signature.')
) WHERE slug = 'flow_cadence_half_l6';

-- ---- cadence_deceptive (V-vi) ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re hearing the deceptive cadence''s redirection. That moment of subverted expectation is registering clearly in your ear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The deceptive cadence almost resolves — you hear the dominant chord building toward the tonic, but then it veers to an unexpected chord. Resolution is promised but withheld.', 'why_text', 'The V chord sets up a strong expectation of I. When vi arrives instead, the leading tone still resolves upward (Ti to Do), but the bass moves up to La instead of down to Do. The melodic resolution happens, but the harmonic resolution doesn''t — creating a feeling of surprise.')
) WHERE slug = 'flow_cadence_deceptive_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re distinguishing the deceptive cadence''s surprise from the half cadence''s suspension. Both avoid resolution, but in fundamentally different ways.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The deceptive cadence is the one that surprises. Unlike the half cadence (which simply pauses), the deceptive cadence actively misleads — it sounds like resolution is coming, then diverts.', 'why_text', 'The deceptive cadence is unique because it begins exactly like an authentic cadence. The dominant chord creates the same expectation of tonic resolution. The surprise comes at the moment of arrival, when vi appears where I was expected.')
) WHERE slug = 'flow_cadence_deceptive_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Identifying the deceptive cadence among all four types shows your ear is attuned to harmonic expectation and its violation. That''s sophisticated listening.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Among all four cadence types, the deceptive cadence is the one that sets up resolution and then sidesteps it. It shares the dominant chord''s buildup with the authentic cadence but delivers a different landing.', 'why_text', 'The deceptive cadence exploits the listener''s trained expectation. After hearing V, the ear predicts I so strongly that the arrival on vi feels like a gentle shock. The vi chord shares two notes with the I chord (Mi and Do), which softens the surprise while maintaining the sense of redirection.')
) WHERE slug = 'flow_cadence_deceptive_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re tracking the bass motion in the deceptive cadence — Sol rising to La instead of falling to Do. That''s the telltale sign.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In the deceptive cadence, the bass moves from Sol up to La instead of down to Do. That upward step, where a downward fifth was expected, is what creates the surprise.', 'why_text', 'The bass is the key to distinguishing the deceptive cadence. In the authentic cadence, the bass falls a fifth (Sol to Do). In the deceptive cadence, it rises a step (Sol to La). This unexpected upward motion in the bass is what makes the redirection audible even when the upper voices resolve normally.')
) WHERE slug = 'flow_cadence_deceptive_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You understand the deceptive cadence''s structural role — extension and continuation. That functional awareness adds depth to your harmonic listening.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The deceptive cadence functions as a phrase extender. It signals that the expected ending has been postponed — the music will need to circle back and try again for a real conclusion.', 'why_text', 'Composers use the deceptive cadence to prolong a section. By denying the expected resolution, it forces the phrase to continue, often leading to a more emphatic authentic cadence later. It''s a tool for building intensity and extending musical narrative.')
) WHERE slug = 'flow_cadence_deceptive_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing deceptive cadences in real music means you''re sensing the moments where composers play with your expectations. That awareness transforms how you experience music.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In real music, the deceptive cadence is a moment of surprise within a familiar structure. Listen for the moment when you expect an ending but the music continues with an unexpected twist.', 'why_text', 'The deceptive cadence in context is one of music''s most expressive tools. Composers from Bach to Adele use it to create emotional depth — the brief moment of "not yet" adds poignancy, longing, or dramatic tension that a straightforward resolution can''t achieve.')
) WHERE slug = 'flow_cadence_deceptive_l6';

-- =============================================================================
-- Extended Feedback: Topic 8 — Note Reading (42 cards)
-- Adds breakthrough_text, first_encounter_text, why_text
-- =============================================================================

-- ──────────────────────────────────────────────
-- Chain 1: note_treble_spaces
-- ──────────────────────────────────────────────

-- L1: note_name (basic note identification — F4)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'That space is locking in. F on the bottom space is becoming automatic.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The treble clef spaces spell F-A-C-E from bottom to top. F sits in the first (bottom) space.', 'why_text', 'The staff is a grid of five lines and four spaces. Each position represents a fixed pitch. In treble clef, the spaces happen to spell a word — FACE — which makes them easy to remember. F is the lowest space because the treble clef is centered around G (the clef symbol curls around the second line), and F falls one step below G.')
) WHERE slug = 'flow_note_treble_spaces_note_name';

-- L2: accidental (F#4)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Accidentals on space notes are clicking. The sharp symbol next to the note is registering faster.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A sharp (#) raises any note by one half step. The note sits in the same space — the accidental symbol appears to its left on the staff.', 'why_text', 'Accidentals modify pitch without changing the note''s position on the staff. A sharp raises by a half step, a flat lowers by a half step. The note stays on the same line or space because the letter name doesn''t change — only the pitch does.')
) WHERE slug = 'flow_note_treble_spaces_accidental';

-- L3: two_notes (F4 and A4)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reading two space notes together is getting smoother. The FACE pattern is doing its job.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Read from bottom to top. The spaces spell F-A-C-E. The 1st space is F and the 2nd space is A.', 'why_text', 'When you see multiple notes, always read from the lowest to highest. Staff notes ascend as you move up. Adjacent spaces are always a third apart (two letter names), so F to A skips over G. This interval pattern is consistent across the entire staff.')
) WHERE slug = 'flow_note_treble_spaces_two_notes';

-- L4: reverse (which space holds E?)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Mapping names back to positions shows the space pattern is solid.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count through F-A-C-E: F is the 1st space, A is the 2nd, C is the 3rd, E is the 4th (top) space.', 'why_text', 'Reversing the direction — from name to position — exercises a different recall path than reading notes off the staff. Both directions need to become automatic for fluent reading. The mnemonic FACE works in both directions: count up for position, spell out for identification.')
) WHERE slug = 'flow_note_treble_spaces_reverse';

-- L5: speed (C5, timed)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Recognition speed is improving. The space notes are becoming reflexive.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'C is the 3rd space in the treble clef — the middle letter of F-A-C-E. Try to recognize the position instantly rather than counting up.', 'why_text', 'Speed in note reading comes from pattern recognition, not sequential counting. Your brain needs to map the visual position directly to the note name. This is similar to reading words — you don''t spell out each letter, you recognize the shape. Repeated exposure builds this direct mapping.')
) WHERE slug = 'flow_note_treble_spaces_speed';

-- L6: degree (C5 in D major)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Connecting staff positions to scale degrees is coming together. That''s a deeper layer of reading.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First identify the note (C5 is in the 3rd space). Then count up from the key''s tonic: D(1)-E(2)-F#(3)-G(4)-A(5)-B(6)-C(7).', 'why_text', 'Scale degree tells you a note''s function within a key, not just its name. The same note (C) is the 7th degree in D major but the 1st degree in C major. Understanding degree means understanding the note''s role in the harmony, which is essential for reading music with meaning, not just naming pitches.')
) WHERE slug = 'flow_note_treble_spaces_degree';

-- ──────────────────────────────────────────────
-- Chain 2: note_treble_lines
-- ──────────────────────────────────────────────

-- L1: note_name (E4)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The bottom line is locking in. E on the first line is becoming automatic.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The treble clef lines spell E-G-B-D-F from bottom to top. A common mnemonic: Every Good Boy Does Fine. E is the first (bottom) line.', 'why_text', 'The five lines of the staff alternate with four spaces to create nine pitch positions. The treble clef (also called the G clef) fixes G on the second line — everything else follows alphabetically from there. E falls two steps below G, placing it on the bottom line.')
) WHERE slug = 'flow_note_treble_lines_note_name';

-- L2: accidental (Bb4)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Flats on line notes are registering. The accidental next to B is becoming clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A flat (b) lowers any note by one half step. Bb sits on the same line as B — the 3rd line. The flat symbol appears to its left.', 'why_text', 'Flats and sharps don''t change where a note sits on the staff. B and Bb occupy the same line because they share the same letter name. The accidental only modifies the pitch. This is why you must always check for accidentals — the position alone doesn''t tell you the full story.')
) WHERE slug = 'flow_note_treble_lines_accidental';

-- L3: two_notes (G4 and D5)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reading line notes in pairs is getting fluid. The E-G-B-D-F sequence is holding.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Read from bottom to top. G is the 2nd line and D is the 4th line. The lines spell E-G-B-D-F.', 'why_text', 'Two notes on lines that are two apart create a fifth (G to D). The staff is designed so that adjacent lines are always a third apart, and skipping a line produces a fifth. Recognizing these interval shapes visually speeds up reading considerably.')
) WHERE slug = 'flow_note_treble_lines_two_notes';

-- L4: reverse (which line holds B?)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Mapping names to line positions is solid. The middle line as B is an anchor point.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count through E-G-B-D-F: E is line 1, G is line 2, B is line 3 (the middle line), D is line 4, F is line 5.', 'why_text', 'The middle line (B) is a useful landmark. Once you know B is in the center, you can count up or down to find any line note quickly. Landmarks reduce the need to count from the bottom every time — experienced readers use them constantly.')
) WHERE slug = 'flow_note_treble_lines_reverse';

-- L5: speed (B4, timed)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Quick recognition of line notes is sharpening. The center-line B is now a reliable anchor.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'B sits on the 3rd (middle) line — the center of the staff. Use it as a landmark for quick identification.', 'why_text', 'Fluent readers don''t count lines from the bottom. They recognize landmark positions instantly — B in the middle, E at the bottom, F at the top — and navigate from there. Building these landmarks is the key to reading speed.')
) WHERE slug = 'flow_note_treble_lines_speed';

-- L6: degree (E4 in G major)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Linking line positions to scale degrees is developing well. Reading with harmonic context is the next level.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First identify the note (E4 is on line 1). Then count from the key''s tonic: G(1)-A(2)-B(3)-C(4)-D(5)-E(6).', 'why_text', 'Knowing that E is the 6th degree of G major tells you more than just the note name. The 6th degree has a specific melodic tendency — it often moves to the 5th or 7th. This functional understanding is what separates note reading from music reading.')
) WHERE slug = 'flow_note_treble_lines_degree';

-- ──────────────────────────────────────────────
-- Chain 3: note_bass_spaces
-- ──────────────────────────────────────────────

-- L1: note_name (A2)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The bass space pattern is setting in. A on the bottom space is becoming familiar.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The bass clef spaces spell A-C-E-G from bottom to top. A common mnemonic: All Cows Eat Grass. A is the first (bottom) space.', 'why_text', 'The bass clef (F clef) places F on the 4th line — the two dots of the clef symbol bracket that line. Everything else follows alphabetically. A falls in the first space because it comes after G (the bottom line) in the musical alphabet.')
) WHERE slug = 'flow_note_bass_spaces_note_name';

-- L2: accidental (C#3)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Accidentals in bass clef spaces are registering clearly now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'C# sits in the same space as C (the 2nd space in bass clef), raised by one half step. The sharp appears to its left.', 'why_text', 'Accidentals work identically in both clefs — a sharp raises by a half step, a flat lowers. The visual position doesn''t change. What changes between clefs is which note occupies which position, so you need separate fluency for each clef.')
) WHERE slug = 'flow_note_bass_spaces_accidental';

-- L3: two_notes (A2 and E3)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Pairs of bass space notes are reading cleanly. The A-C-E-G framework is holding.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Read from bottom to top. A is the 1st space and E is the 3rd space. The bass spaces spell A-C-E-G.', 'why_text', 'A to E spans a fifth — the same interval pattern you see when skipping one space on the staff. The staff layout is consistent: adjacent spaces are a third apart, and every other space is a fifth apart. This holds true in both clefs.')
) WHERE slug = 'flow_note_bass_spaces_two_notes';

-- L4: reverse (which space holds C in bass clef?)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reverse mapping in bass clef spaces is becoming reliable.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count through A-C-E-G: A is the 1st space, C is the 2nd, E is the 3rd, G is the 4th space.', 'why_text', 'C in bass clef (C3) is different from middle C (C4). Knowing which C you''re dealing with matters for pitch accuracy. The bass clef C3 sits in the 2nd space, while middle C sits on a ledger line above the bass staff. Position on the staff maps to a specific octave.')
) WHERE slug = 'flow_note_bass_spaces_reverse';

-- L5: speed (G3, timed)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Bass clef space recognition speed is building. The top space as G is becoming instant.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'G is the 4th (top) space in the bass clef — the last letter of A-C-E-G. Try to recognize the top-space position instantly.', 'why_text', 'The top space of the bass clef (G3) connects directly to the bottom line of the treble clef (E4) with only a few steps between them. Knowing these boundary notes helps when transitioning between clefs on the grand staff.')
) WHERE slug = 'flow_note_bass_spaces_speed';

-- L6: degree (C3 in F major)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Scale degree identification in bass clef is developing. Seeing function, not just names.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First identify the note (C3 is the 2nd space). Then count from the key''s tonic: F(1)-G(2)-A(3)-Bb(4)-C(5).', 'why_text', 'C is the 5th degree (dominant) of F major — the most important degree after the tonic. The dominant creates the strongest pull back to the tonic. Recognizing this function while reading bass clef is especially important because bass parts often outline these structural pitches.')
) WHERE slug = 'flow_note_bass_spaces_degree';

-- ──────────────────────────────────────────────
-- Chain 4: note_bass_lines
-- ──────────────────────────────────────────────

-- L1: note_name (G2)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The bass line pattern is taking hold. G on the bottom line is sticking.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The bass clef lines spell G-B-D-F-A from bottom to top. A common mnemonic: Good Boys Do Fine Always. G is the first (bottom) line.', 'why_text', 'The bass clef is also called the F clef because the two dots mark the F line (4th line). G sits on the bottom line because it''s the next letter below A, which occupies the first space. The entire bass staff sits roughly an octave below the treble staff.')
) WHERE slug = 'flow_note_bass_lines_note_name';

-- L2: accidental (Eb3)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Flats on bass line notes are clear. The accidental recognition is transferring across clefs.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Eb sits on the same position as E. In bass clef, E is between the 3rd space and 4th line. The flat lowers it by a half step.', 'why_text', 'Accidental reading is a transferable skill — once you recognize sharps and flats in treble clef, the same logic applies in bass clef. The challenge is combining accidental recognition with bass clef position reading, which requires practice in this specific context.')
) WHERE slug = 'flow_note_bass_lines_accidental';

-- L3: two_notes (B2 and F3)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reading bass line pairs is getting natural. The G-B-D-F-A sequence is solid.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Read from bottom to top. B is the 2nd line and F is the 4th line. The bass lines spell G-B-D-F-A.', 'why_text', 'B to F spans a diminished fifth (tritone) — an interval that sounds tense and wants to resolve. Recognizing intervals visually on the staff (two lines apart = fifth) trains both your reading and your ear simultaneously.')
) WHERE slug = 'flow_note_bass_lines_two_notes';

-- L4: reverse (which line holds D in bass clef?)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reverse mapping on bass lines is becoming second nature. D as the center line is an anchor.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count through G-B-D-F-A: G is line 1, B is line 2, D is line 3 (the middle), F is line 4, A is line 5.', 'why_text', 'Just like B is the middle line of the treble staff, D is the middle line of the bass staff. These center-line landmarks are among the most useful reference points for fast reading. From D you can count one line in either direction to find B or F.')
) WHERE slug = 'flow_note_bass_lines_reverse';

-- L5: speed (D3, timed)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Bass line recognition is getting faster. The middle-line D is a solid landmark now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'D sits on the 3rd (middle) line of the bass clef — the center of the staff. Use it as a reference point.', 'why_text', 'Speed in bass clef reading follows the same principle as treble: develop landmarks, not counting routines. D in the middle, G at the bottom, A at the top. Three anchor points let you identify any bass line note in one step.')
) WHERE slug = 'flow_note_bass_lines_speed';

-- L6: degree (D3 in Bb major)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Scale degrees in bass clef are connecting. Reading with harmonic awareness across both clefs is real progress.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First identify the note (D3 is on line 3). Then count from the key''s tonic: Bb(1)-C(2)-D(3).', 'why_text', 'D is the 3rd degree of Bb major — the mediant. The 3rd degree determines whether the key sounds major or minor. In bass parts, the 3rd often appears in specific voicing positions, so recognizing it quickly matters for understanding the harmonic context.')
) WHERE slug = 'flow_note_bass_lines_degree';

-- ──────────────────────────────────────────────
-- Chain 5: note_ledger_above
-- ──────────────────────────────────────────────

-- L1: note_name (A5)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Ledger lines above the staff are getting familiar. A on the first ledger line is registering.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The top line of the treble staff is F5. Count up: G5 is the space above, and A5 sits on the first ledger line above the staff.', 'why_text', 'Ledger lines extend the staff beyond its five lines. They follow the same alternating line-space pattern — the musical alphabet just keeps going. The first ledger line above treble is A because it continues from F (top line) through G (space) to A (ledger line).')
) WHERE slug = 'flow_note_ledger_above_note_name';

-- L2: accidental (Bb5)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Accidentals on ledger-line notes are reading clearly. The pattern extends naturally.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'B5 is the space above the first ledger line (A5). Bb5 flats that B by a half step. The flat appears to the left of the note.', 'why_text', 'Accidentals work the same on ledger lines as on the staff proper. The challenge is that ledger-line notes are harder to read quickly because there are fewer visual landmarks. Building comfort with accidentals here prevents hesitation in real music, where high notes with accidentals appear frequently.')
) WHERE slug = 'flow_note_ledger_above_accidental';

-- L3: two_notes (A5 and C6)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reading pairs above the staff is smoothing out. The ledger-line extension feels natural.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A5 is the 1st ledger line and C6 is the 2nd ledger line above the treble staff. Count up from the top staff line (F5): G, A, B, C.', 'why_text', 'Ledger lines continue the same line-space alternation. A is the 1st ledger line, B is the space above it, C is the 2nd ledger line. The interval from A to C is a third — the same distance as between any two adjacent lines on the staff. The system is perfectly consistent.')
) WHERE slug = 'flow_note_ledger_above_two_notes';

-- L4: reverse (first ledger line above = ?)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The ledger-line map above the staff is solid. Counting from F through the extension is reliable.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Start from the top line of the treble staff: F5. One space up is G5. The first ledger line is A5.', 'why_text', 'The key to ledger lines is always counting from the nearest staff line. For notes above the treble staff, the top line (F) is your anchor. For notes below, the bottom line (E) is your anchor. This counting-from-landmarks approach is faster than trying to memorize every ledger-line note independently.')
) WHERE slug = 'flow_note_ledger_above_reverse';

-- L5: speed (B5, timed)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Ledger-line speed is improving. The space above the first ledger line as B is quick now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'B5 is the space just above the first ledger line (A5). Try to see A and B as a pair — line then space.', 'why_text', 'Quick ledger-line reading relies on knowing the first ledger line (A) as an anchor and navigating from there. With practice, you recognize the visual pattern — one short line with a note on it vs. a note floating just above — without needing to count.')
) WHERE slug = 'flow_note_ledger_above_speed';

-- L6: degree (A5 in C major)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Scale degrees above the staff are connecting. Functional reading extends past the five lines.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First identify the note (A5 is the 1st ledger line). Then count from the key''s tonic: C(1)-D(2)-E(3)-F(4)-G(5)-A(6).', 'why_text', 'A is the 6th degree of C major — the submediant. High notes on ledger lines often appear at melodic peaks, where knowing the scale degree tells you about the phrase''s emotional shape. A as the 6th in C major has a particular brightness that composers use deliberately.')
) WHERE slug = 'flow_note_ledger_above_degree';

-- ──────────────────────────────────────────────
-- Chain 6: note_ledger_below
-- ──────────────────────────────────────────────

-- L1: note_name (C4 — middle C)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Middle C is becoming a reliable anchor. That ledger line below the staff is home base.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Middle C (C4) sits on the first ledger line below the treble staff. It is the most important reference note — the bridge between treble and bass clefs.', 'why_text', 'Middle C is the center of the piano keyboard and the meeting point of treble and bass clefs. It sits one ledger line below treble and one ledger line above bass. This single note anchors the entire staff system. Every other note''s position is ultimately defined relative to middle C.')
) WHERE slug = 'flow_note_ledger_below_note_name';

-- L2: accidental (C#4)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Accidentals on middle C are reading cleanly. The ledger-line sharp is registering.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'C# sits on the same ledger line as middle C, raised by one half step. The sharp symbol appears to its left.', 'why_text', 'Middle C with a sharp (C#4) is enharmonically the same pitch as Db4. Whether it''s written as C# or Db depends on the key and harmonic context. The staff position is the same for C and C# — only the accidental tells you the difference.')
) WHERE slug = 'flow_note_ledger_below_accidental';

-- L3: two_notes (B3 and C4)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The B-to-C pair below the staff is becoming natural. Half-step neighbors are visually close.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'B3 is the space just below middle C. C4 sits on the ledger line itself. They are right next to each other — a half step apart.', 'why_text', 'B and C are one of two natural half-step pairs in the musical alphabet (the other is E and F). On the staff, they appear on adjacent positions — B in the space below the ledger line, C on the ledger line. Recognizing these half-step pairs visually helps with both reading and understanding key signatures.')
) WHERE slug = 'flow_note_ledger_below_two_notes';

-- L4: reverse (middle C sits on...?)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The position of middle C is locked in. It is the definitive landmark for both clefs.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Middle C sits on the first ledger line below the treble staff. Count down from the bottom line (E4): D is the space below, C is the first ledger line.', 'why_text', 'Middle C is equidistant from both staves on a grand staff. In treble clef it needs one ledger line below; in bass clef it needs one ledger line above. This symmetry is by design — the two clefs divide the keyboard at its center, with middle C as the pivot.')
) WHERE slug = 'flow_note_ledger_below_reverse';

-- L5: speed (C4, timed)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Instant middle C recognition. That is the single most important landmark on the staff.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The note on the first ledger line below the treble staff is always middle C. Make this your most reliable visual anchor.', 'why_text', 'Middle C should be the fastest note you can identify. It appears constantly in both clefs and serves as the primary reference for counting to any other ledger-line note. Speed here pays dividends everywhere else in your reading.')
) WHERE slug = 'flow_note_ledger_below_speed';

-- L6: degree (C4 in G major)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Scale degree awareness at middle C is solid. The functional context below the staff is clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First identify the note (C4 is middle C). Then count from the key''s tonic: G(1)-A(2)-B(3)-C(4).', 'why_text', 'C is the 4th degree of G major — the subdominant. The 4th degree has a particular quality of wanting to move downward to the 3rd. In G major, C often appears in IV chords (C major) and helps define the key''s harmonic landscape.')
) WHERE slug = 'flow_note_ledger_below_degree';

-- ──────────────────────────────────────────────
-- Chain 7: note_grand_staff
-- ──────────────────────────────────────────────

-- L1: note_name (E3, bass clef)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Grand staff reading is clicking. Switching between clefs without hesitation.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'E3 is the 3rd space of the bass clef. The bass spaces spell A-C-E-G — E is the third letter.', 'why_text', 'The grand staff combines treble and bass clefs to cover the full range of the piano. Each clef has its own set of positions to memorize. The ability to read both without pausing is what makes the grand staff practical for keyboard music and full scores.')
) WHERE slug = 'flow_note_grand_staff_note_name';

-- L2: accidental (F#5, treble clef)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Accidentals on the grand staff are reading clearly across both clefs.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'F#5 sits on the top line of the treble clef (F5), raised by a half step. The sharp appears to the left of the note.', 'why_text', 'On the grand staff, accidentals apply only within their own clef and measure. A sharp in the treble clef does not affect the bass clef, even if the same letter name appears. This independence between clefs is essential to understand when reading piano music.')
) WHERE slug = 'flow_note_grand_staff_accidental';

-- L3: two_notes (C3 and C4, grand staff octave)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Seeing the same note across both clefs is becoming natural. The grand staff connection is forming.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Both notes are C — one in each clef. C3 sits in the 2nd space of bass clef. C4 (middle C) sits between the staves on its own ledger line.', 'why_text', 'The grand staff makes octave relationships visible. C3 and C4 are the same letter name one octave apart. On the grand staff, you can see how middle C bridges the two clefs — it belongs to both. This visual connection between the same note in different registers is fundamental to reading full scores.')
) WHERE slug = 'flow_note_grand_staff_two_notes';

-- L4: reverse (where does middle C appear?)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The grand staff layout is clear. Middle C as the bridge between both staves is second nature.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Middle C sits on a ledger line between the two staves. It is one ledger line below treble and one ledger line above bass.', 'why_text', 'The gap between the treble and bass staves isn''t empty — it''s where middle C lives. The grand staff is really one continuous system of 11 lines (5 treble + 1 middle C + 5 bass), but we remove the middle lines for clarity. Middle C is the hidden center line that connects everything.')
) WHERE slug = 'flow_note_grand_staff_reverse';

-- L5: speed (A3, bass clef, timed)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Quick identification across the grand staff is developing. Both clefs are reading fast.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A3 is the 5th (top) line of the bass clef. Bass lines spell G-B-D-F-A — A is the last letter.', 'why_text', 'The top of the bass staff (A3) is close to middle C (C4) — only a minor third apart. Knowing this boundary helps when your eye needs to jump between clefs. Fast reading on the grand staff requires fluency at these transition points between the two clefs.')
) WHERE slug = 'flow_note_grand_staff_speed';

-- L6: degree (A3 in F major)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Scale degree reading across the grand staff is coming together. Full functional reading.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First identify the note (A3 is the top bass line). Then count from the key''s tonic: F(1)-G(2)-A(3).', 'why_text', 'A is the 3rd degree of F major — the mediant. On the grand staff, the same scale degree can appear in either clef depending on the octave. Recognizing degrees regardless of which clef you''re reading in is the hallmark of fluent grand staff reading.')
) WHERE slug = 'flow_note_grand_staff_degree';


-- =============================================================================
-- Extended Feedback: Topic 6 — Chord Spelling (48 cards)
-- Adds breakthrough_text, first_encounter_text, why_text
-- =============================================================================

-- ──────────────────────────────────────────────
-- Chain 1: spell_major
-- ──────────────────────────────────────────────

-- L1: Interval formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major triad formula is settling in. R-M3-P5 is becoming second nature.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A major triad is built from three notes: the root, a major 3rd above it (4 half steps), and a perfect 5th above the root (7 half steps). The formula is R - M3 - P5.', 'why_text', 'The major triad is the most fundamental chord in Western music. The major 3rd (4 half steps) gives it brightness, and the perfect 5th (7 half steps) gives it stability. These two intervals — the 3rd and the 5th — are derived from the strongest overtones in the harmonic series, which is why the major triad sounds so naturally consonant.')
) WHERE slug = 'flow_spell_major_l1';

-- L2: Interval stack
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The stacked-thirds view is clicking. M3 on the bottom, m3 on top.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Think of it as two thirds stacked: a major 3rd (4 half steps) from root to 3rd, then a minor 3rd (3 half steps) from 3rd to 5th. Together they span a perfect 5th (7 half steps).', 'why_text', 'All triads are built by stacking thirds. What makes each triad quality unique is the order and size of those thirds. Major puts the larger third (M3) on the bottom. This bottom-heavy structure is what gives major chords their grounded, bright character. Reversing the order (m3 on bottom) produces a minor triad — same notes rearranged in third-size.')
) WHERE slug = 'flow_spell_major_l2';

-- L3: Name the 3rd
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major 3rd as the defining interval is clear. It is the single note that makes a chord major.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A major triad contains a major 3rd — an interval of 4 half steps above the root. The 3rd is the interval that determines whether a chord sounds major or minor.', 'why_text', 'The 3rd is the most important note in any triad because it defines the chord''s quality. A major 3rd (4 half steps) makes the chord major. A minor 3rd (3 half steps) makes it minor. The root identifies the chord, the 5th reinforces it, but the 3rd gives it its emotional color. This is why the 3rd is never omitted in voicings.')
) WHERE slug = 'flow_spell_major_l3';

-- L4: Difference from related chord
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major-to-minor distinction is clear. One half step on the 3rd changes everything.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Major and minor triads share the same root and perfect 5th. The only difference is the 3rd: major has M3 (4 half steps), minor has m3 (3 half steps). That single half step changes the entire character.', 'why_text', 'The fact that major and minor differ by just one half step on one note is remarkable — it shows how sensitive our ears are to small pitch changes. This half step shifts the chord from bright to dark, from triumphant to reflective. Understanding this minimal difference helps when you need to alter chords: to make any major chord minor, just lower the 3rd by a half step.')
) WHERE slug = 'flow_spell_major_l4';

-- L5: 7th connection
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The link between major triads and dominant 7ths is solid. Major triad + minor 7th = dominant tension.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Adding a minor 7th (10 half steps from the root) to a major triad creates a dominant 7th chord: R - M3 - P5 - m7. The combination of major 3rd and minor 7th produces the chord''s characteristic tension.', 'why_text', 'The dominant 7th is the most harmonically active chord in tonal music. The major 3rd and minor 7th form a tritone — the most unstable interval — which creates an urgent pull toward resolution. This is why V7 resolves so strongly to I. The major triad provides the foundation, and the minor 7th adds the harmonic engine.')
) WHERE slug = 'flow_spell_major_l5';

-- L6: Symbol -> formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Chord symbol reading for major triads is automatic. A bare letter name means major — no suffix needed.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In chord symbols, a letter name alone (C, G, Eb) always means a major triad. No suffix is needed. C = C major = R - M3 - P5.', 'why_text', 'The chord symbol system treats major as the default because it is the most common chord quality. Every other quality requires a modifier: m for minor, dim for diminished, aug for augmented, 7 for dominant. The absence of a modifier is itself information — it tells you the chord is major. This convention makes lead sheets and charts faster to read.')
) WHERE slug = 'flow_spell_major_l6';

-- ──────────────────────────────────────────────
-- Chain 2: spell_minor
-- ──────────────────────────────────────────────

-- L1: Interval formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor triad formula is locking in. R-m3-P5 is becoming automatic.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A minor triad is built from a root, a minor 3rd above it (3 half steps), and a perfect 5th above the root (7 half steps). The formula is R - m3 - P5.', 'why_text', 'The minor triad has the same perfect 5th as the major triad — only the 3rd changes. The minor 3rd (3 half steps) sits one half step lower than the major 3rd, and that small change dramatically alters the chord''s character from bright to dark. The perfect 5th remains, providing the same structural stability.')
) WHERE slug = 'flow_spell_minor_l1';

-- L2: Interval stack
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The reversed stack is clear. Minor is the mirror of major: m3 on bottom, M3 on top.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A minor triad stacks a minor 3rd (3 half steps) on the bottom and a major 3rd (4 half steps) on top. This is the exact reverse of a major triad.', 'why_text', 'Major and minor triads use the same two building blocks (M3 and m3) in reverse order. This symmetry is elegant: M3+m3 = major, m3+M3 = minor. Both add up to a perfect 5th (7 half steps). The only difference is which third sits on the bottom, closest to the root — and that bottom third defines the chord''s quality.')
) WHERE slug = 'flow_spell_minor_l2';

-- L3: Name the 3rd
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor 3rd as the defining interval is clear. Three half steps from the root means minor.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A minor triad contains a minor 3rd — 3 half steps above the root. This single interval is what makes any chord sound minor.', 'why_text', 'The minor 3rd is one half step smaller than a major 3rd. That compressed interval creates the darker, more introspective quality we associate with minor chords. The 3rd is the identity of the chord — if someone plays just the root and 3rd, you can already tell whether the chord is major or minor. The 5th merely reinforces.')
) WHERE slug = 'flow_spell_minor_l3';

-- L4: Difference from related chord
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor-to-major comparison is second nature. Lower the 3rd by a half step and you have minor.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Minor and major triads share the same root and perfect 5th. The minor triad lowers the 3rd by one half step: m3 instead of M3.', 'why_text', 'This one-note difference (lowering the 3rd) is the most common chord alteration in all of music. Composers use it constantly: a sudden shift from major to minor (or vice versa) in the middle of a phrase creates emotional contrast. Understanding that only the 3rd changes makes these shifts easy to spell and recognize.')
) WHERE slug = 'flow_spell_minor_l4';

-- L5: 7th connection
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor triad to minor 7th connection is solid. Both the 3rd and 7th are minor intervals.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Adding a minor 7th (10 half steps from the root) to a minor triad creates a minor 7th chord: R - m3 - P5 - m7.', 'why_text', 'The minor 7th chord has a consistent "minor" theme — both its 3rd and 7th are minor intervals. This gives the chord a cohesive, warm quality without the tension of the dominant 7th. Minor 7th chords are common as ii chords in major keys and as tonic chords in jazz, where their mellow sound serves as a resting point.')
) WHERE slug = 'flow_spell_minor_l5';

-- L6: Symbol -> formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The "m" suffix for minor is automatic. Cm, Gm, Ebm — all the same formula.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The lowercase "m" after a letter name indicates a minor triad. Cm = C minor = R - m3 - P5.', 'why_text', 'Chord symbol conventions use lowercase "m" (or sometimes "min" or "-") to indicate minor quality. This is the single most common modifier in chord symbols. Unlike major (which is the unmarked default), minor always requires explicit marking. When you see Cm, you know instantly: lower the 3rd by a half step from C major.')
) WHERE slug = 'flow_spell_minor_l6';

-- ──────────────────────────────────────────────
-- Chain 3: spell_dim
-- ──────────────────────────────────────────────

-- L1: Interval formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The diminished formula is sticking. R-m3-d5 — both intervals compressed.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A diminished triad has a minor 3rd (3 half steps) and a diminished 5th (6 half steps). The formula is R - m3 - d5. Both intervals are smaller than in a minor triad.', 'why_text', 'The diminished triad compresses both the 3rd and the 5th. The diminished 5th (also called a tritone — 6 half steps) is the most dissonant interval in tonal music. This built-in tension is why diminished chords sound unstable and want to resolve. They naturally appear on the 7th degree of major keys, where they function as leading tone chords.')
) WHERE slug = 'flow_spell_dim_l1';

-- L2: Interval stack
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Two minor thirds stacked — the symmetrical construction of diminished is clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A diminished triad stacks two minor 3rds: m3 + m3. Root to 3rd is 3 half steps, 3rd to 5th is another 3 half steps. Total: 6 half steps (a tritone).', 'why_text', 'The symmetry of m3+m3 is significant. Because both thirds are the same size, the diminished triad divides the tritone evenly. This equal division creates an inherently unstable sound — there is no clear "bottom" to the chord''s gravity. Compare this to major (M3+m3) or minor (m3+M3), where the unequal thirds create a sense of direction.')
) WHERE slug = 'flow_spell_dim_l2';

-- L3: Name the 3rd
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor 3rd in diminished is clear. Same 3rd as minor — it is the 5th that changes.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A diminished triad has a minor 3rd (3 half steps), the same as a minor triad. The difference between diminished and minor is in the 5th, not the 3rd.', 'why_text', 'This is an important pattern: diminished and minor triads share the same 3rd (m3). The only difference is the 5th — perfect in minor, diminished in diminished. Knowing which intervals are shared between chord types makes it easier to transform one chord into another and to recognize relationships between chord qualities.')
) WHERE slug = 'flow_spell_dim_l3';

-- L4: Difference from related chord
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The diminished-to-minor comparison is solid. Lower the 5th by a half step and minor becomes diminished.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Compare R-m3-d5 (diminished) with R-m3-P5 (minor). The 3rd is the same. The 5th drops by one half step — from perfect to diminished.', 'why_text', 'This half-step change to the 5th has a dramatic effect. The perfect 5th provides stability; the diminished 5th creates a tritone with the root, which is inherently unstable. Moving from minor to diminished is like removing the floor from under the chord — the harmonic ground disappears, and the chord urgently needs to resolve.')
) WHERE slug = 'flow_spell_dim_l4';

-- L5: 7th connection
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Diminished triad plus minor 7th equals half-diminished. The naming logic makes sense now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Adding a minor 7th to a diminished triad creates a half-diminished 7th: R - m3 - d5 - m7. It is called "half-diminished" because the 7th is minor (not diminished).', 'why_text', 'The name "half-diminished" tells you exactly what it is: a diminished triad with a 7th that is only "half" diminished — meaning minor instead of diminished. A fully diminished 7th chord would use a diminished 7th interval (9 half steps). The half-diminished version with its minor 7th (10 half steps) is more common and appears naturally as the ii chord in minor keys.')
) WHERE slug = 'flow_spell_dim_l5';

-- L6: Symbol -> formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The "dim" suffix is reading clearly. Cdim means both the 3rd and 5th are compressed.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The "dim" suffix indicates a diminished triad: R - m3 - d5. Some charts use a small circle instead of "dim".', 'why_text', 'You may see diminished written three ways: Cdim, C with a small circle, or sometimes Cmb5. All mean the same thing: R - m3 - d5. The "dim" suffix tells you that both the 3rd (minor) and 5th (diminished) are compressed. In practice, diminished triads often have a 7th added, so the bare "dim" symbol (without a 7) specifically means just the triad.')
) WHERE slug = 'flow_spell_dim_l6';

-- ──────────────────────────────────────────────
-- Chain 4: spell_aug
-- ──────────────────────────────────────────────

-- L1: Interval formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The augmented formula is sticking. R-M3-A5 — the expanded major triad.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'An augmented triad has a major 3rd (4 half steps) and an augmented 5th (8 half steps). The formula is R - M3 - A5. The 5th is raised one half step beyond perfect.', 'why_text', 'The augmented triad takes the major triad and stretches it. Where the major triad has a perfect 5th (7 half steps), the augmented raises it to 8. This widening creates an unresolved, floating quality — the chord sounds like it wants to move somewhere but doesn''t have a clear destination. Composers use augmented chords for moments of harmonic ambiguity and suspense.')
) WHERE slug = 'flow_spell_aug_l1';

-- L2: Interval stack
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Two major thirds stacked — the symmetrical construction of augmented is clear.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'An augmented triad stacks two major 3rds: M3 + M3. Root to 3rd is 4 half steps, 3rd to 5th is another 4 half steps. Total: 8 half steps.', 'why_text', 'Like the diminished triad (m3+m3), the augmented triad is symmetrical (M3+M3). This equal division means the augmented triad divides the octave into three equal parts. In fact, there are only four distinct augmented triads — C aug, Db aug, D aug, and Eb aug — because the symmetry causes others to be enharmonic equivalents. This property makes augmented chords useful for modulating between distant keys.')
) WHERE slug = 'flow_spell_aug_l2';

-- L3: Name the 3rd
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major 3rd in augmented is clear. Same 3rd as major — it is the 5th that changes.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'An augmented triad has a major 3rd (4 half steps), the same as a major triad. The difference between augmented and major is in the 5th, not the 3rd.', 'why_text', 'This mirrors the diminished pattern: just as diminished and minor share a 3rd (m3), augmented and major share a 3rd (M3). The quality pairs are: major/augmented share M3, minor/diminished share m3. The distinguishing factor in each pair is the 5th — perfect vs. altered. This framework makes it easy to derive any triad from the major or minor starting point.')
) WHERE slug = 'flow_spell_aug_l3';

-- L4: Difference from related chord
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The augmented-to-major comparison is solid. Raise the 5th by a half step and major becomes augmented.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Compare R-M3-A5 (augmented) with R-M3-P5 (major). The 3rd is the same. The 5th rises by one half step — from perfect to augmented.', 'why_text', 'Raising the 5th creates a wider, more tense sound. While lowering the 5th (diminished) creates inward compression, raising it (augmented) creates outward expansion. The augmented 5th wants to resolve upward, which is why augmented chords often lead to chords with a note one half step above the raised 5th.')
) WHERE slug = 'flow_spell_aug_l4';

-- L5: 7th connection
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Augmented triad plus major 7th — the jazz voicing connection is forming.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Adding a major 7th to an augmented triad creates an augmented major 7th (maj7#5): R - M3 - A5 - M7. This lush chord appears in jazz and film music.', 'why_text', 'The augmented major 7th is one of the most colorful chords in tonal harmony. The major 7th sits just one half step below the octave, creating a gentle dissonance with the root, while the augmented 5th adds its own tension. Together they produce a shimmering, unresolved sound. This chord often appears on the III chord in harmonic minor, giving that scale its distinctive character.')
) WHERE slug = 'flow_spell_aug_l5';

-- L6: Symbol -> formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The "aug" suffix is reading clearly. Caug means the 5th is raised one half step beyond perfect.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The "aug" suffix indicates an augmented triad: R - M3 - A5. Some charts use a "+" symbol instead of "aug".', 'why_text', 'You may see augmented written as Caug, C+, or C(#5). All mean the same thing: a major triad with a raised 5th. The "+" symbol is common in jazz charts and reflects the idea that the 5th has been raised (added to). In classical analysis, augmented triads are notated differently, but the underlying structure is identical.')
) WHERE slug = 'flow_spell_aug_l6';

-- ──────────────────────────────────────────────
-- Chain 5: spell_dom7
-- ──────────────────────────────────────────────

-- L1: Interval formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The dominant 7th formula is locking in. R-M3-P5-m7 — the engine of harmonic motion.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The dominant 7th is a major triad with a minor 7th added: R - M3 - P5 - m7. The major 3rd is 4 half steps from the root, the perfect 5th is 7, and the minor 7th is 10.', 'why_text', 'The dominant 7th chord is the single most important chord for creating harmonic motion. The major 3rd and minor 7th form a tritone — the interval of maximum tension in tonal music. This tritone wants to resolve: the M3 pulls upward by a half step and the m7 pulls downward by a half step. Together they converge on the tonic chord. This is the fundamental mechanism behind V7-I resolution.')
) WHERE slug = 'flow_spell_dom7_l1';

-- L2: Interval stack
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The M3+m3+m3 stack is clear. Major triad on the bottom, one more minor third on top.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Stack three thirds: M3 (4 half steps) + m3 (3) + m3 (3) = 10 half steps total. The bottom is a major triad, then one more minor 3rd reaches the minor 7th.', 'why_text', 'The dominant 7th adds one more third to the major triad''s M3+m3 stack. That extra m3 on top creates the minor 7th interval from the root. Every 7th chord is built by stacking a third on top of a triad — the type of third determines the type of 7th. For dominant: adding m3 to a major triad gives m7. For major 7th: adding M3 to a major triad gives M7.')
) WHERE slug = 'flow_spell_dom7_l2';

-- L3: Name the 3rd
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major 3rd in the dominant 7th is clear. It partners with the minor 7th to form the tritone.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The dominant 7th has a major 3rd (4 half steps above the root). This M3 combines with the m7 to form a tritone — the interval that drives the chord toward resolution.', 'why_text', 'The major 3rd in a dominant 7th serves a dual purpose: it makes the triad portion sound major, and it creates a tritone with the minor 7th. This tritone (M3 to m7 = 6 half steps) is the harmonic engine of the chord. Without the major 3rd, there is no tritone, and without the tritone, there is no dominant function. This is why the 3rd is never omitted from a dominant 7th voicing.')
) WHERE slug = 'flow_spell_dom7_l3';

-- L4: Difference from related chord
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The dominant-to-major-7th distinction is clear. One half step on the 7th separates tension from resolution.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Compare R-M3-P5-m7 (dominant 7th) with R-M3-P5-M7 (major 7th). Same triad, different 7th. The dominant uses m7 (10 half steps), the major uses M7 (11 half steps).', 'why_text', 'That one half step between m7 and M7 transforms the chord''s function entirely. The minor 7th creates a tritone with the major 3rd, producing tension and a need to resolve. The major 7th does not form a tritone and instead creates a gentle, stable dissonance. Dominant 7ths move music forward; major 7ths let music rest. Same triad, opposite harmonic roles.')
) WHERE slug = 'flow_spell_dom7_l4';

-- L5: 7th connection (reverse — remove 7th)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The triad inside the dominant 7th is clear. Strip the 7th and a major triad remains.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Remove the minor 7th from R-M3-P5-m7 and you have R-M3-P5 — a major triad. Every 7th chord is a triad with an added 7th.', 'why_text', 'Understanding 7th chords as triads-plus-a-7th is the key to navigating chord families. Every 7th chord type is defined by two things: which triad forms the base, and which type of 7th is added. Dominant = major triad + m7. Major 7th = major triad + M7. Minor 7th = minor triad + m7. Half-diminished = diminished triad + m7. This framework covers the four most common 7th chord types.')
) WHERE slug = 'flow_spell_dom7_l5';

-- L6: Symbol -> formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'A bare "7" means dominant. C7 is R-M3-P5-m7 — no extra modifiers needed.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A number 7 alone after a letter name (C7, G7, Bb7) always means dominant 7th: major triad + minor 7th.', 'why_text', 'The chord symbol system treats the dominant 7th as the "default" 7th chord, just as it treats major as the default triad. This is because the dominant 7th is by far the most common 7th chord in tonal music. Any other 7th type requires a modifier: maj7, m7, m7b5, dim7. The bare "7" is reserved for dominant because of its prevalence.')
) WHERE slug = 'flow_spell_dom7_l6';

-- ──────────────────────────────────────────────
-- Chain 6: spell_maj7
-- ──────────────────────────────────────────────

-- L1: Interval formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major 7th formula is settling in. R-M3-P5-M7 — all major intervals with a perfect 5th.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 7th chord is a major triad with a major 7th added: R - M3 - P5 - M7. The major 7th interval is 11 half steps above the root — just one half step below the octave.', 'why_text', 'The major 7th chord is built entirely on "major" and "perfect" intervals, giving it a pure, luminous quality. The M7 sits just one half step below the octave, creating a gentle tension that never feels urgent. Unlike the dominant 7th, the major 7th does not demand resolution — it can serve as a resting chord. This is why jazz standards often end on major 7th chords rather than plain triads.')
) WHERE slug = 'flow_spell_maj7_l1';

-- L2: Interval stack
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The M3+m3+M3 stack is clear. Two major thirds framing a minor third in the middle.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Stack three thirds: M3 (4) + m3 (3) + M3 (4) = 11 half steps total. The outer thirds are both major, with a minor 3rd sandwiched between them.', 'why_text', 'The symmetrical framing of the major 7th chord (M3-m3-M3) gives it a balanced, open sound. Compare this to the dominant 7th (M3-m3-m3), where the top gets progressively smaller. The major 7th''s final M3 leap from the 5th to the 7th creates brightness at the top of the chord, which is why it sounds lush rather than tense.')
) WHERE slug = 'flow_spell_maj7_l2';

-- L3: Name the 3rd
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The major 3rd in the major 7th chord is clear. Both the 3rd and 7th share the "major" quality.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The major 7th chord has a major 3rd (4 half steps above the root). Both the 3rd and the 7th are major intervals — this consistency is what defines the chord.', 'why_text', 'The major 7th chord pairs its M3 with an M7, but crucially, these two notes do NOT form a tritone — they form a perfect 5th. This is the key difference from the dominant 7th, where M3 and m7 create a tritone. No tritone means no urgent need to resolve, which is why major 7th chords feel stable and can function as tonic chords.')
) WHERE slug = 'flow_spell_maj7_l3';

-- L4: Difference from related chord
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The maj7-to-dom7 distinction is clear. Raising the 7th by a half step removes the tritone and the tension.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Compare R-M3-P5-M7 (major 7th) with R-M3-P5-m7 (dominant 7th). Same triad. The major 7th raises the 7th by one half step — from minor to major.', 'why_text', 'Raising the 7th from minor to major eliminates the tritone between the 3rd and 7th. In a dominant 7th (M3 to m7 = tritone), the chord is tense and needs to resolve. In a major 7th (M3 to M7 = perfect 5th), the chord is stable and complete. This single half step change converts a chord of motion into a chord of rest.')
) WHERE slug = 'flow_spell_maj7_l4';

-- L5: 7th connection (reverse — remove 7th)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The triad inside the major 7th is clear. It shares a major triad with the dominant 7th — only the 7th differs.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Remove the major 7th from R-M3-P5-M7 and you have R-M3-P5 — a major triad. The same triad underlies both maj7 and dom7 chords.', 'why_text', 'Both the dominant 7th and major 7th are built on the same major triad. The type of 7th added determines the chord''s harmonic function. This means that if you can spell a major triad, you can build both chord types by adding either m7 (dominant, tension) or M7 (major 7th, rest). Mastering the triad opens the door to all its 7th-chord extensions.')
) WHERE slug = 'flow_spell_maj7_l5';

-- L6: Symbol -> formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Cmaj7 is automatic. The "maj" prefix before the 7 distinguishes it from the dominant C7.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The "maj7" suffix specifies a major 7th chord: major triad + major 7th. Cmaj7 = R - M3 - P5 - M7.', 'why_text', 'The critical distinction in chord symbols: C7 is dominant (m7), Cmaj7 is major (M7). The "maj" prefix is essential — it overrides the default "7 = dominant" convention. You may also see this written as CM7 or C with a triangle. All mean the same thing: major triad with a major 7th. Misreading C7 for Cmaj7 (or vice versa) changes the chord''s function entirely.')
) WHERE slug = 'flow_spell_maj7_l6';

-- ──────────────────────────────────────────────
-- Chain 7: spell_min7
-- ──────────────────────────────────────────────

-- L1: Interval formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor 7th chord formula is locking in. R-m3-P5-m7 — minor 3rd and minor 7th together.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor 7th chord is a minor triad with a minor 7th added: R - m3 - P5 - m7. The minor 3rd is 3 half steps, the perfect 5th is 7, and the minor 7th is 10.', 'why_text', 'The minor 7th chord pairs a minor triad with a minor 7th. Both the 3rd and 7th are "minor" intervals, which gives the chord a cohesive, warm quality. It lacks the tritone tension of the dominant 7th and the brightness of the major 7th. This neutral-yet-dark character makes it one of the most versatile chords in jazz, R&B, and pop.')
) WHERE slug = 'flow_spell_min7_l1';

-- L2: Interval stack
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The m3+M3+m3 stack is clear. Two minor thirds framing a major third in the middle.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Stack three thirds: m3 (3) + M3 (4) + m3 (3) = 10 half steps total. The outer thirds are both minor, with a major 3rd in the middle.', 'why_text', 'The minor 7th''s stack (m3+M3+m3) is the inversion of the major 7th''s stack (M3+m3+M3). Where the major 7th frames a minor 3rd with two major thirds, the minor 7th frames a major 3rd with two minor thirds. This mirror relationship between major 7th and minor 7th chords reflects the broader major-minor duality that runs through all of tonal harmony.')
) WHERE slug = 'flow_spell_min7_l2';

-- L3: Name the 3rd
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor 3rd as the defining interval of the minor 7th chord is solid.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The minor 7th chord has a minor 3rd (3 half steps above the root), inherited from the minor triad. The minor quality of the chord comes from this interval.', 'why_text', 'In any 7th chord, the 3rd still determines the basic quality (major or minor), and the 7th adds color. The minor 7th chord has a minor 3rd (dark quality) and a minor 7th (warm extension). Neither interval creates a tritone with the other, so the chord is relatively stable — it can function as a tonic in jazz or as a pre-dominant in classical harmony.')
) WHERE slug = 'flow_spell_min7_l3';

-- L4: Difference from related chord
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The min7-to-dom7 comparison is clear. Same 7th, different 3rd.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Compare R-m3-P5-m7 (minor 7th) with R-M3-P5-m7 (dominant 7th). Both have a minor 7th and perfect 5th. The 3rd changes: m3 in minor, M3 in dominant.', 'why_text', 'Minor 7th and dominant 7th share two notes: the 5th and the 7th. The only difference is the 3rd. But that difference is transformative: the dominant''s M3 creates a tritone with the m7, producing tension and forward motion. The minor''s m3 does not create a tritone, so the chord sits comfortably without needing to resolve. Same 5th, same 7th, completely different function.')
) WHERE slug = 'flow_spell_min7_l4';

-- L5: 7th connection (reverse — remove 7th)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor triad inside the minor 7th is clear. Triad plus 7th — the building-block approach works.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Remove the minor 7th from R-m3-P5-m7 and you have R-m3-P5 — a minor triad.', 'why_text', 'The minor 7th chord is the minor counterpart to the dominant 7th in the triad-plus-7th framework. Minor triad + m7 = minor 7th chord. The same minor 7th interval appears in both dominant and minor 7th chords, but the different triads underneath give them entirely different functions. Recognizing the triad inside any 7th chord is the fastest way to understand its structure.')
) WHERE slug = 'flow_spell_min7_l5';

-- L6: Symbol -> formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Cm7 reads instantly. The "m" for minor triad plus "7" for the added 7th.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The "m7" suffix indicates a minor 7th chord: minor triad + minor 7th. Cm7 = R - m3 - P5 - m7.', 'why_text', 'In chord symbols, "m7" combines two pieces of information: "m" tells you the triad is minor, and "7" adds a minor 7th. Compare: C7 is major triad + m7 (dominant), Cm7 is minor triad + m7. The "m" modifies the triad, and the bare "7" always adds a minor 7th. Only "maj7" adds a major 7th. This parsing logic — modifier for triad, then 7th type — applies to all chord symbols.')
) WHERE slug = 'flow_spell_min7_l6';

-- ──────────────────────────────────────────────
-- Chain 8: spell_halfdim7
-- ──────────────────────────────────────────────

-- L1: Interval formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The half-diminished formula is sticking. R-m3-d5-m7 — diminished triad with a minor 7th.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The half-diminished 7th is a diminished triad with a minor 7th: R - m3 - d5 - m7. The minor 3rd is 3 half steps, the diminished 5th is 6, and the minor 7th is 10.', 'why_text', 'The half-diminished 7th combines the instability of the diminished triad (with its tritone between root and 5th) with the relative mildness of a minor 7th. It is called "half" diminished because a fully diminished 7th would have a diminished 7th interval (9 half steps) instead of a minor 7th (10 half steps). The extra half step softens the chord, making it less harsh than a fully diminished 7th.')
) WHERE slug = 'flow_spell_halfdim7_l1';

-- L2: Interval stack
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The m3+m3+M3 stack is clear. Two minor thirds below, one major third on top.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Stack three thirds: m3 (3) + m3 (3) + M3 (4) = 10 half steps total. The bottom two are minor thirds (forming the diminished triad), with a major 3rd on top reaching the minor 7th.', 'why_text', 'The half-diminished stack starts with two minor thirds (the diminished triad pattern) and finishes with a major third. That final M3 is what distinguishes it from a fully diminished 7th (which would be m3+m3+m3). The larger top interval softens the chord and gives it a more open quality, which is why half-diminished chords sound melancholic rather than purely tense.')
) WHERE slug = 'flow_spell_halfdim7_l2';

-- L3: Name the 3rd
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The minor 3rd in half-diminished is clear. Same 3rd as diminished and minor — the pattern holds.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The half-diminished 7th has a minor 3rd (3 half steps), inherited from the diminished triad. The minor 3rd is shared with minor triads and minor 7th chords.', 'why_text', 'Three of the four common 7th chords have a minor 3rd: minor 7th (m3-P5-m7), half-diminished (m3-d5-m7), and fully diminished (m3-d5-d7). Only the dominant and major 7th chords have a major 3rd. When you see a minor 3rd, narrow down the chord type by checking the 5th: perfect = minor 7th, diminished = half-diminished or fully diminished. Then check the 7th to finish.')
) WHERE slug = 'flow_spell_halfdim7_l3';

-- L4: Difference from related chord
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The half-dim to min7 comparison is solid. Same 3rd and 7th — only the 5th changes.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Compare R-m3-d5-m7 (half-diminished) with R-m3-P5-m7 (minor 7th). Same 3rd (m3) and same 7th (m7). The 5th drops by one half step: d5 instead of P5.', 'why_text', 'The half-diminished 7th is essentially a minor 7th chord with a lowered 5th. This is why the symbol "m7b5" is commonly used — it literally describes the alteration: take a minor 7th chord and flat the 5th. The lowered 5th introduces the tritone between root and 5th, adding tension that the minor 7th chord lacks. This tension makes it ideal as a ii chord in minor keys, where it naturally leads to V7.')
) WHERE slug = 'flow_spell_halfdim7_l4';

-- L5: 7th connection (reverse — remove 7th)
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The diminished triad inside the half-diminished is clear. Same base triad, different 7th than fully diminished.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Remove the minor 7th from R-m3-d5-m7 and you have R-m3-d5 — a diminished triad.', 'why_text', 'The diminished triad can support two different 7ths: a minor 7th (creating half-diminished) or a diminished 7th (creating fully diminished). Half-diminished is more common in tonal music because it naturally occurs as vii in major keys and ii in minor keys. Fully diminished requires a diminished 7th interval, which only occurs naturally on the 7th degree of harmonic minor.')
) WHERE slug = 'flow_spell_halfdim7_l5';

-- L6: Symbol -> formula
UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Cm7b5 reads clearly. Minor 7th chord with a flatted 5th — the name describes the recipe.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The "m7b5" suffix means: start with a minor 7th chord (m7) and lower the 5th (b5). Cm7b5 = R - m3 - d5 - m7.', 'why_text', 'You may see half-diminished written as Cm7b5, or with a circle that has a line through it. Both mean the same thing. The "m7b5" notation is more descriptive — it tells you exactly what to do: build a minor 7th chord, then flat the 5th. The circle-with-line notation is more compact but less self-explanatory. In practice, reading "m7b5" as an instruction makes spelling the chord straightforward.')
) WHERE slug = 'flow_spell_halfdim7_l6';

-- ============================================================
-- Topic 13: Circle of Fifths (2 chains x 6 links = 12 cards)
-- ============================================================
-- ---- cof_clockwise ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The fifth above C is the most fundamental interval on the circle — everything else builds from here.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A fifth above C lands on G. Think of it as counting up seven half-steps, or five letter names: C-D-E-F-G.', 'why_text', 'The circle of fifths is built on this single interval. From any note, go up a perfect fifth (seven semitones) to find the next note clockwise. C to G is the starting point for the entire pattern.')
) WHERE slug = 'flow_cof_clockwise_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'G to D — the pattern holds. Each clockwise step adds one sharp.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'From G, the next fifth up is D. The same interval that took you from C to G now takes you from G to D.', 'why_text', 'Every clockwise move on the circle applies the same operation: go up a perfect fifth. G to D follows the same logic as C to G. Notice the key signatures — G has one sharp, D has two.')
) WHERE slug = 'flow_cof_clockwise_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Two fifths from D lands on E — you''re navigating the sharp keys with confidence.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Two clockwise steps from D: D goes to A, then A goes to E. Each step is another fifth up.', 'why_text', 'When counting multiple steps on the circle, chain the fifths one at a time. D to A is one fifth, A to E is another. This puts you at E, which carries four sharps in its key signature.')
) WHERE slug = 'flow_cof_clockwise_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Six steps — the exact halfway point. C and F# sit at opposite poles of the circle.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count clockwise from C: G, D, A, E, B, F# — that''s six steps. F# is the farthest point from C on the circle.', 'why_text', 'The circle has twelve positions, so the maximum distance between any two notes is six steps. C to F# spans six fifths, which equals a tritone — the interval that divides the octave exactly in half.')
) WHERE slug = 'flow_cof_clockwise_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'D and E flank A on the circle — its nearest neighbors by fifths.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'On the circle, A sits between D (one step counterclockwise) and E (one step clockwise). These are A''s closest relatives by fifth.', 'why_text', 'Each note on the circle has two immediate neighbors. D is a fifth below A, E is a fifth above. In the key of A major, D is the IV chord and E is the V — the circle literally maps the most important harmonic relationships.')
) WHERE slug = 'flow_cof_clockwise_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'C and F#/Gb are tritone opposites — the most distant pair on the circle.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The tritone opposite sits directly across the circle. From C, count six steps in either direction and you land on F#/Gb.', 'why_text', 'The tritone divides the octave into two equal halves, and on the circle of fifths it connects diametrically opposite points. C and F#/Gb share no common tones in their major scales — they are maximally distant in every sense.')
) WHERE slug = 'flow_cof_clockwise_l6';

-- ---- cof_counterclockwise ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'A fourth above C is F — the counterclockwise direction mirrors the clockwise one perfectly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A fourth above C lands on F. Going counterclockwise on the circle means moving up by fourths instead of fifths.', 'why_text', 'Counterclockwise movement uses perfect fourths — the inversion of a fifth. A fifth up from C is G, but a fourth up from C is F. These two directions give the circle its symmetry, and the flat keys live on the counterclockwise side.')
) WHERE slug = 'flow_cof_counterclockwise_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'F to Bb — each counterclockwise step adds one flat. The pattern is consistent.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'From F, a fourth up lands on Bb. Just as clockwise steps add sharps, counterclockwise steps add flats.', 'why_text', 'The counterclockwise side builds flat keys. F has one flat, Bb has two. Each step adds the next flat in order: Bb, Eb, Ab, Db, Gb, Cb. The new flat is always the note one counterclockwise step ahead.')
) WHERE slug = 'flow_cof_counterclockwise_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Two fourths from Bb reaches Eb — you''re moving through the flat keys smoothly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Two counterclockwise steps from Bb: Bb goes to Eb, then Eb goes to Ab — but we only need two steps, landing on Eb.', 'why_text', 'Chain the fourths just like you chain fifths going clockwise. Bb up a fourth is Eb. Eb has three flats in its key signature. The deeper you go counterclockwise, the more flats accumulate.')
) WHERE slug = 'flow_cof_counterclockwise_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Six steps counterclockwise from C reaches Gb — the same halfway point, approached from the other direction.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count counterclockwise from C: F, Bb, Eb, Ab, Db, Gb — six steps. Gb is the same pitch as F#, the farthest point from C.', 'why_text', 'Whether you count six steps clockwise (reaching F#) or six counterclockwise (reaching Gb), you arrive at the same pitch. This enharmonic meeting point is where the sharp and flat sides of the circle converge.')
) WHERE slug = 'flow_cof_counterclockwise_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Bb and Ab bracket Eb — its two nearest neighbors on the flat side of the circle.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Eb sits between Bb (one step clockwise) and Ab (one step counterclockwise). These are Eb''s immediate neighbors on the circle.', 'why_text', 'Just as on the sharp side, neighbors on the circle represent the strongest harmonic relationships. In the key of Eb, Bb is the dominant (V) and Ab is the subdominant (IV). The circle encodes these relationships for every key.')
) WHERE slug = 'flow_cof_counterclockwise_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The tritone opposite of Gb is C — the circle comes full circle.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Directly across from Gb on the circle sits C. Six steps in either direction from Gb returns you to the starting point.', 'why_text', 'Tritone opposites are always mutual — if C''s opposite is F#/Gb, then Gb''s opposite is C. This symmetry means the tritone relationship works identically from either end. It''s the axis around which the entire circle is balanced.')
) WHERE slug = 'flow_cof_counterclockwise_l6';

-- ============================================================
-- Topic 12: Enharmonics (3 chains x 6 links = 18 cards)
-- ============================================================
-- ---- enharmonic_notes ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Those enharmonic pairs are becoming automatic — same pitch, different name.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'An enharmonic equivalent is just another spelling for the same pitch. C# and Db sound identical — only the name changes.', 'why_text', 'Every pitch on the keyboard can be spelled at least two ways. C# and Db are the same key, same frequency. The spelling you choose depends on the musical context — which scale or key you''re working in.')
) WHERE slug = 'flow_enharmonic_notes_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re hearing through the spelling to the actual pitch. That''s the core of enharmonic thinking.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'These two notes look different on the page but sound the same. Focus on where they land on the keyboard or fretboard — same physical location, same pitch.', 'why_text', 'Enharmonic equivalence means two names for one sound. If you play C# and then Db, you press the same key. The notation system has more names than it has pitches — that redundancy is what makes enharmonics possible.')
) WHERE slug = 'flow_enharmonic_notes_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Reading from the staff and respelling fluently — that''s a real notation skill taking shape.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'First identify the note on the staff, then think about what other name describes the same pitch. A note on a line or space always has at least one enharmonic twin.', 'why_text', 'When you see a note on the staff with a sharp, think one half-step up from the natural. That same pitch can also be described as the note name above it with a flat. Reversing that logic works too — a flat can become the sharp of the note below.')
) WHERE slug = 'flow_enharmonic_notes_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re connecting enharmonic notes to the key signatures they belong to. That''s where this knowledge becomes practical.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Some keys are enharmonic pairs — they sound identical but are spelled with sharps in one version and flats in the other. F# major and Gb major are the same set of pitches.', 'why_text', 'Enharmonic key pairs appear where the circle of fifths overlaps. F# major (6 sharps) and Gb major (6 flats) contain the same seven pitches, just spelled differently. Recognizing these pairs helps you choose the simpler spelling when sight-reading.')
) WHERE slug = 'flow_enharmonic_notes_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Choosing the right spelling for the context — that''s how theory serves real music-making.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Context determines spelling. In a sharp key, write C# not Db. In a flat key, write Db not C#. The goal is to keep the notation consistent with the key signature.', 'why_text', 'Correct enharmonic spelling keeps each scale degree on its own staff line or space. If you''re in D major, the seventh degree is C# — writing Db would put two notes on the same line and leave a gap elsewhere. Consistent spelling makes music readable.')
) WHERE slug = 'flow_enharmonic_notes_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Respelling intervals enharmonically while keeping the sound — you''re thinking like an arranger now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'An interval can be respelled by changing both note names while keeping the same two pitches. An augmented fourth and a diminished fifth sound identical — the spelling changes the interval''s name.', 'why_text', 'Enharmonic intervals have the same sound but different names because the notes are respelled. C to F# (augmented 4th) and C to Gb (diminished 5th) are the same distance in half-steps. The note names determine the interval name, not the sound.')
) WHERE slug = 'flow_enharmonic_notes_l6';

-- ---- enharmonic_intervals ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re seeing that the same sonic distance can carry different interval names. That''s the foundation of enharmonic intervals.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Two intervals are enharmonic when they span the same number of half-steps but have different names. An augmented unison and a minor second both span one half-step.', 'why_text', 'Interval naming depends on the letter-name distance between the two notes. C to C# is an augmented unison (same letter), but C to Db is a minor second (adjacent letters). Same sound, different theoretical meaning — and that meaning matters in harmonic analysis.')
) WHERE slug = 'flow_enharmonic_intervals_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Matching enharmonic interval pairs with confidence — the half-step count is your anchor.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count the half-steps in both intervals. If the count matches, they''re enharmonic equivalents — even though the interval names and note spellings differ.', 'why_text', 'An augmented second (e.g., C to D#, 3 half-steps) sounds the same as a minor third (C to Eb, 3 half-steps). The difference is structural: augmented seconds imply a different scale context than minor thirds. Composers choose the spelling that reflects the harmonic function.')
) WHERE slug = 'flow_enharmonic_intervals_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re handling the augmented-diminished swap naturally. That pairing is the most common enharmonic interval relationship.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Augmented and diminished intervals are frequent enharmonic partners. An augmented fourth and diminished fifth both span six half-steps — the tritone.', 'why_text', 'When you augment an interval, you widen it by a half-step. When you diminish the interval one size larger, you narrow it by a half-step. They meet in the middle at the same pitch distance. That''s why augmented 4th = diminished 5th, augmented 5th = minor 6th, and so on.')
) WHERE slug = 'flow_enharmonic_intervals_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Respelling compound intervals enharmonically — you''re extending this skill beyond the single octave.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The same enharmonic logic applies to intervals larger than an octave. A compound augmented fourth is still enharmonic with a compound diminished fifth — just add the octave.', 'why_text', 'Compound intervals are simple intervals plus one or more octaves. Their enharmonic relationships mirror the simple versions exactly. If an augmented 4th equals a diminished 5th within one octave, an augmented 11th equals a diminished 12th across two octaves. The half-step count stays consistent.')
) WHERE slug = 'flow_enharmonic_intervals_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Choosing the correct interval spelling for a given harmonic context — that''s analysis-level thinking.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In context, the interval name should reflect the scale degrees involved. A raised fourth degree creates an augmented fourth, not a diminished fifth — even though they sound the same.', 'why_text', 'Interval spelling follows function. In a C major context, F# is a raised 4th (augmented 4th above C), while Gb would be a lowered 5th (diminished 5th above C). The first implies motion upward toward G; the second implies motion downward toward F. Spelling reveals intent.')
) WHERE slug = 'flow_enharmonic_intervals_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re navigating the full map of enharmonic interval equivalences. This fluency unlocks faster harmonic analysis.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'At this level, think systematically: every augmented interval has a simpler enharmonic partner one interval-size larger. Build the full table in your mind and the pairs become predictable.', 'why_text', 'The complete enharmonic interval table follows a pattern: augmented unison = minor 2nd, augmented 2nd = minor 3rd, augmented 3rd = perfect 4th, augmented 4th = diminished 5th, augmented 5th = minor 6th, augmented 6th = minor 7th. Once you see the system, you can derive any pair without memorization.')
) WHERE slug = 'flow_enharmonic_intervals_l6';

-- ---- enharmonic_keys ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re recognizing that two key signatures can describe the same set of pitches. That''s enharmonic key equivalence.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Enharmonic keys share the same pitches but use different note names. B major (5 sharps) and Cb major (7 flats) sound identical — every note in one is the enharmonic twin of a note in the other.', 'why_text', 'The circle of fifths wraps around — at the bottom, sharp keys and flat keys overlap. B major and Cb major contain the same seven frequencies. Musicians choose the spelling with fewer accidentals for ease of reading, unless a specific harmonic context demands the other.')
) WHERE slug = 'flow_enharmonic_keys_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Pairing enharmonic keys by their position on the circle — the overlap zone is becoming familiar territory.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'There are three major enharmonic key pairs: B/Cb, F#/Gb, and C#/Db. Each pair sits at the bottom of the circle of fifths where sharps and flats meet.', 'why_text', 'The circle of fifths has 15 major keys but only 12 distinct pitch collections. The three extras create the enharmonic pairs. B major (5#) = Cb major (7b), F# major (6#) = Gb major (6b), and C# major (7#) = Db major (5b). The pair with equal accidentals — F#/Gb at 6 each — sits at the exact bottom of the circle.')
) WHERE slug = 'flow_enharmonic_keys_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Matching minor enharmonic key pairs — the relative minor relationship carries the enharmonic equivalence forward.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Minor keys have enharmonic pairs too. If B major equals Cb major, then their relative minors — G# minor and Ab minor — are also enharmonic equivalents.', 'why_text', 'Every major key''s enharmonic pair implies a minor key enharmonic pair through the relative minor relationship. G# minor (5#) = Ab minor (7b), D# minor (6#) = Eb minor (6b), A# minor (7#) = Bb minor (5b). The accidental counts mirror the major pairs exactly because they share the same key signatures.')
) WHERE slug = 'flow_enharmonic_keys_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re choosing the practical key spelling — fewer accidentals, easier reading. That''s real-world musicianship.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'When two enharmonic keys are available, prefer the one with fewer sharps or flats. Db major (5 flats) is standard; C# major (7 sharps) is theoretically valid but rarely used.', 'why_text', 'Readability drives key choice. Seven accidentals means every note is altered — that''s hard to read and error-prone. Five accidentals is manageable. That''s why Db major appears in standard repertoire while C# major is almost never written. The exception is when a modulation path makes the complex spelling clearer in context.')
) WHERE slug = 'flow_enharmonic_keys_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Navigating enharmonic key changes in modulation — you''re reading the composer''s intent behind the respelling.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Composers sometimes respell a key enharmonically mid-piece to make the new key easier to read. A shift from F# major to Gb major changes nothing sonically but simplifies the notation for what follows.', 'why_text', 'Enharmonic key changes are a notational convenience. If a piece in F# major modulates to a flat-side key, the composer may respell F# as Gb at the transition point. This avoids double-sharps and keeps the notation clean. The pivot chord — the moment of respelling — usually functions clearly in both spellings.')
) WHERE slug = 'flow_enharmonic_keys_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Full command of enharmonic key relationships — you can now read through any respelling a composer throws at you.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'At this level, consider all dimensions: the enharmonic key, its relative minor equivalent, the parallel key, and how they connect on the circle of fifths. Every key sits in a web of enharmonic relationships.', 'why_text', 'Mastering enharmonic keys means understanding them as part of a system, not isolated pairs. Db major = C# major, their relative minors Bb minor = A# minor, and their parallel keys Db minor (= C# minor, which is the standard spelling). These relationships form a network that skilled musicians navigate fluidly during analysis and transposition.')
) WHERE slug = 'flow_enharmonic_keys_l6';

-- ============================================================
-- Topic 11: Harmonic Function (3 chains x 6 links = 18 cards)
-- ============================================================
-- ---- hf_tonic ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'That sense of arrival is real — tonic function is the sound of being home.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Tonic function feels like rest, like the music has arrived somewhere stable. Listen for that settled quality.', 'why_text', 'Tonic function represents harmonic stability — the point of rest in a key. The I chord is its purest form. When you hear resolution, when tension dissolves, that''s tonic function at work.')
) WHERE slug = 'flow_hf_tonic_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re connecting the chord to the function — that''s where real harmonic hearing begins.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The I chord is the most direct expression of tonic function. It sounds grounded, complete, at rest.', 'why_text', 'Tonic function belongs to chords built on scale degrees that express stability — primarily I. The chord''s quality matters less than its role: does it sound like home? That feeling of resolution is tonic function.')
) WHERE slug = 'flow_hf_tonic_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You can feel where tonic wants to go — that forward motion is the harmonic cycle in action.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'From tonic, the harmonic cycle moves toward subdominant territory. Think of it as leaving home — the first step of the journey.', 'why_text', 'The harmonic cycle flows Tonic → Subdominant → Dominant → Tonic. From rest, harmony moves toward pre-dominant tension before reaching dominant urgency. Tonic is the starting point of this cycle, not a dead end.')
) WHERE slug = 'flow_hf_tonic_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re hearing tonic as the low-tension anchor — everything else pulls away from or back toward it.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Tonic is the point of lowest tension. Movement away from tonic increases tension; movement toward it releases tension.', 'why_text', 'Tension in tonal music is measured relative to tonic. Tonic function sits at the bottom of the tension curve. Subdominant adds moderate tension, dominant adds maximum tension, and resolution back to tonic releases it. This arc drives all tonal motion.')
) WHERE slug = 'flow_hf_tonic_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing tonic function in a substitute chord means you''re listening past the surface to the role underneath.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Chords like iii and vi can share tonic function because they contain many of the same notes as I. They sound stable, just colored differently.', 'why_text', 'Tonic substitutes work because of shared pitch content. The vi chord shares two notes with I, and iii shares two as well. They inherit that restful quality while adding a different shade. Function is about role, not just root — if it sounds like arrival, it''s acting as tonic.')
) WHERE slug = 'flow_hf_tonic_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re tracking tonic function inside real progressions — that''s functional hearing at work.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a progression, tonic function appears wherever the music sounds resolved. It''s usually at the beginning and end, but it can appear mid-phrase too.', 'why_text', 'Tonic function in context means hearing where rest occurs within motion. A progression like I–IV–V–I starts and ends with tonic function, framing the journey. Training your ear to spot these moments of arrival, even when surrounded by tension, is how harmonic listening matures.')
) WHERE slug = 'flow_hf_tonic_l6';

-- ---- hf_dominant ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'That urgency you''re feeling is dominant function — the strongest pull in tonal music.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Dominant function feels urgent, unfinished, like the music needs to move somewhere. Listen for that restless tension.', 'why_text', 'Dominant function creates maximum tension in a key. It''s the point furthest from rest, and it demands resolution. That feeling of incompleteness, of needing to go somewhere — that''s dominant function pulling toward tonic.')
) WHERE slug = 'flow_hf_dominant_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re locking onto the V chord as the engine of harmonic motion — it drives everything back to tonic.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The V chord is the primary carrier of dominant function. It contains the leading tone, which sits a half-step below the tonic and creates intense pull.', 'why_text', 'The V chord''s power comes from the leading tone — scale degree 7, sitting a half-step below tonic. That proximity creates the strongest melodic pull in the key. Combined with the fifth-to-root bass motion, V→I is the most powerful resolution in tonal music.')
) WHERE slug = 'flow_hf_dominant_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You can feel dominant''s one-way pull — it has a single destination, and you''re hearing it clearly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Dominant function has one job: resolve to tonic. In the harmonic cycle, dominant is the last stop before home.', 'why_text', 'The harmonic cycle flows T→S→D→T. Dominant sits at the peak of tension, and its only natural resolution is tonic. This isn''t a rule imposed from outside — it''s how the acoustic relationships between these chords work. Dominant wants tonic the way a raised ball wants to fall.')
) WHERE slug = 'flow_hf_dominant_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re hearing dominant as the peak of the tension curve. That''s the architecture of tonal music becoming audible.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Dominant function sits at maximum tension. It''s the farthest point from rest in the harmonic cycle — the moment just before resolution.', 'why_text', 'If tonic is zero tension and the harmonic cycle is a hill, dominant is the summit. Subdominant builds the climb, dominant reaches the peak, and the resolution to tonic is the descent. This tension arc is why V–I cadences feel so satisfying — maximum tension releasing to complete rest.')
) WHERE slug = 'flow_hf_dominant_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing dominant function in vii° means you''re listening for the role, not just the chord name. That''s the right instinct.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The vii° chord shares dominant function with V because it contains the same leading tone and creates the same pull toward tonic.', 'why_text', 'The vii° chord is essentially a V7 without its root. It contains the leading tone and the tritone interval that define dominant tension. Because it shares these critical tendency tones with V, it creates the same urgent need to resolve — same function, different voicing.')
) WHERE slug = 'flow_hf_dominant_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Spotting dominant function in a real progression means you''re hearing the structure, not just the chords.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a progression, dominant function appears at the moment of highest tension — usually just before a resolution to tonic. Listen for the point where the music most urgently needs to move.', 'why_text', 'Dominant function in context is the climax of harmonic tension. In a phrase like I–IV–V–I, the V is where tension peaks. Learning to feel that peak — the moment the music is most charged, most insistent on resolving — is how you start hearing harmony as a living structure rather than a sequence of chords.')
) WHERE slug = 'flow_hf_dominant_l6';

-- ---- hf_subdominant ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'That middle-ground tension is subdominant — not at rest, but not yet urgent. You''re hearing the space between.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Subdominant function feels like departure without urgency. The music has left home but isn''t desperate to return yet.', 'why_text', 'Subdominant function occupies the middle of the tension spectrum — more active than tonic but without dominant''s insistence. It''s the sound of motion that still has options, a journey underway but not yet committed to a destination.')
) WHERE slug = 'flow_hf_subdominant_l1';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'The IV chord''s warmth and weight are registering — that''s subdominant function made audible.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The IV chord is the primary subdominant. It sounds warm and open — like stepping out the front door. There''s movement, but it''s not tense.', 'why_text', 'The IV chord sits a fifth below tonic, creating a complementary relationship. Where V pulls toward I from above, IV relates to I from below. This gives subdominant its distinctive character — present and active, but without the leading tone''s urgent pull that defines dominant function.')
) WHERE slug = 'flow_hf_subdominant_l2';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re hearing subdominant as the bridge between rest and tension — the middle chapter of the harmonic story.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In the harmonic cycle, subdominant comes after tonic and before dominant. It''s the transitional phase — away from rest, heading toward tension.', 'why_text', 'The harmonic cycle T→S→D→T gives subdominant a specific structural role: it prepares dominant. Think of it as building momentum. Tonic is stillness, subdominant is motion, dominant is urgency, and the return to tonic is resolution. Subdominant is the ramp that makes the peak meaningful.')
) WHERE slug = 'flow_hf_subdominant_l3';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You can feel subdominant''s moderate tension — higher than tonic, lower than dominant. That gradient is the shape of tonal music.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Subdominant sits at moderate tension — above tonic''s rest but below dominant''s peak. It''s the rising slope of the harmonic arc.', 'why_text', 'Tension in tonal music isn''t binary. Subdominant function proves this — it creates genuine forward motion without the crisis of dominant. This middle ground is what makes harmonic progressions feel like journeys rather than switches. The climb through subdominant is what gives the dominant peak its height.')
) WHERE slug = 'flow_hf_subdominant_l4';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Hearing the ii chord as subdominant means you''re feeling function through different chord colors. That''s deep listening.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The ii chord shares subdominant function with IV because they have two notes in common. It has the same moderate tension, just with a minor quality.', 'why_text', 'The ii chord is a subdominant substitute because it shares most of IV''s pitch content — two of three notes are identical. What changes is the color: ii is minor where IV is major. But the function stays the same — moderate tension, preparing dominant. The ii–V–I progression is so common precisely because ii carries subdominant function so effectively.')
) WHERE slug = 'flow_hf_subdominant_l5';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Tracking subdominant function in context means you''re hearing the full harmonic architecture — rest, departure, tension, return.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In a progression, subdominant function appears where the music has left tonic but hasn''t reached dominant urgency. It''s the preparatory zone.', 'why_text', 'Subdominant function in context is the connective tissue of harmonic motion. In I–IV–V–I, the IV is where momentum builds. In I–ii–V–I, the ii does the same job with different color. Recognizing this function in real music means you''re hearing the deeper logic — not just what chord is playing, but what role it serves in the phrase''s journey from rest through tension and back.')
) WHERE slug = 'flow_hf_subdominant_l6';

-- ============================================================
-- Topic 9: Rhythm (5 chains x 6 links = 30 cards)
-- ============================================================
-- ---- rhythm_4_4 ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Those note values in 4/4 are becoming automatic. You''re reading durations without hesitating.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Each note shape tells you exactly how many beats it lasts. In 4/4, a whole note fills the entire measure — four beats. A half note takes two, a quarter note takes one.', 'why_text', 'Note values are proportional: each level doubles or halves. A whole note = 2 half notes = 4 quarter notes = 8 eighth notes. Once you see that ratio, every duration falls into place regardless of time signature.')
) WHERE slug = 'flow_rhythm_4_4_beat_count';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re adding up beat values in 4/4 measures with confidence now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'To find the total beats in a 4/4 measure, add up each note''s value. Every measure must total exactly four beats — no more, no less.', 'why_text', 'The top number in 4/4 tells you the measure holds four beats. If your note values don''t sum to four, re-examine each note''s duration. Rests count too — they occupy time just like sounded notes.')
) WHERE slug = 'flow_rhythm_4_4_total_beats';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your ear is connecting what you hear in 4/4 to what you see on the page. That bridge is essential.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Listen for where the strong beats land and how the shorter notes fill the spaces between them. In 4/4, beat one carries the most weight — use it as your anchor.', 'why_text', 'When matching 4/4 rhythms by ear, focus on the pattern of long and short sounds relative to a steady pulse. Tap along to find the beat, then notice which notes land on the beat versus between beats.')
) WHERE slug = 'flow_rhythm_4_4_audio_match';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re reading and tapping 4/4 rhythms in real time. The coordination between eye and hand is clicking.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count steadily — "1, 2, 3, 4" — and tap each note exactly when the count reaches its beat. Hold longer notes for their full value before moving on.', 'why_text', 'Tapping rhythm is about subdividing time evenly. If you rush or drag, try counting eighth notes — "1-and-2-and-3-and-4-and" — to give yourself a finer grid. Each note should land precisely on its subdivision.')
) WHERE slug = 'flow_rhythm_4_4_tap_rhythm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Dotted and tied notes in 4/4 no longer trip you up. You''re tracking those extended durations cleanly.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A dot adds half the note''s value — a dotted half note lasts three beats instead of two. A tie connects two notes into one longer sound. Both extend duration, just through different notation.', 'why_text', 'Dots and ties both lengthen notes, but serve different purposes. A dot extends within simple math (note + half its value). A tie bridges notes across barlines or creates durations that a single note symbol can''t represent, like five beats.')
) WHERE slug = 'flow_rhythm_4_4_dotted_tied';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re spotting syncopation in 4/4 — hearing the emphasis shift off the strong beats is a real skill.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Syncopation places emphasis where you don''t expect it — on weak beats or between beats. In 4/4, if a note lands on "and" instead of on the numbered beat, that''s syncopation.', 'why_text', 'In 4/4, beats 1 and 3 are naturally strong. Syncopation disrupts that expectation by accenting beats 2 or 4, or the "ands" between beats. Look for notes that start on a weak beat and sustain through a strong one — that''s the telltale pattern.')
) WHERE slug = 'flow_rhythm_4_4_syncopation';

-- ---- rhythm_3_4 ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Note values in 3/4 are landing naturally. You know what fits inside three beats.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'The note values themselves don''t change between time signatures — a quarter note is still one beat. But in 3/4, the longest single note that fills a measure is a dotted half note, not a whole note.', 'why_text', 'Note durations are absolute, but what fits in a measure depends on the time signature. In 3/4, you have three quarter-note beats to work with. A whole note would overflow the measure — that''s why dotted half notes appear so often here.')
) WHERE slug = 'flow_rhythm_3_4_beat_count';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Counting to three per measure feels natural now. You''re tracking 3/4 beat totals accurately.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In 3/4, every measure must total exactly three beats. Count each note''s value and make sure they add up — a quarter rest counts as one beat of silence.', 'why_text', 'The waltz feel of 3/4 comes from grouping beats in threes. If your total seems off, check whether you''ve accidentally applied 4/4 thinking. There is no beat 4 here — the pattern resets after three.')
) WHERE slug = 'flow_rhythm_3_4_total_beats';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re hearing that 3/4 feel — the lilting three-beat pattern — and matching it to notation reliably.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Listen for the grouping of three. In 3/4, there''s a strong beat followed by two lighter ones — STRONG-weak-weak. That waltz-like pattern is your best clue.', 'why_text', 'Distinguishing 3/4 from 4/4 by ear comes down to feeling where the pattern repeats. If the music circles back every three beats rather than four, you''re in triple meter. Anchor to beat one and count how many beats pass before the next strong pulse.')
) WHERE slug = 'flow_rhythm_3_4_audio_match';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Tapping in three feels steady and controlled. Your internal metronome is adapting to triple meter.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count "1, 2, 3, 1, 2, 3" at a steady pace. Tap each note where it falls in that count. The trick in 3/4 is resisting the urge to add a fourth beat.', 'why_text', 'If tapping in 3/4 feels uneven, slow down and emphasize beat one slightly. The asymmetry of three beats can feel unusual if you''re used to four. Practice at a tempo where you can comfortably feel the triple grouping before speeding up.')
) WHERE slug = 'flow_rhythm_3_4_tap_rhythm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Dotted and tied values in 3/4 are clear to you now — you know exactly how they fill a three-beat measure.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A dotted half note lasts exactly three beats — it perfectly fills one measure of 3/4. Ties in 3/4 often connect notes across barlines to create longer phrases that span multiple measures.', 'why_text', 'In 3/4, the dotted half note is the measure-filling value, playing the role the whole note plays in 4/4. When you see ties here, they''re often creating durations like four or five beats that require crossing a barline.')
) WHERE slug = 'flow_rhythm_3_4_dotted_tied';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Spotting syncopation within triple meter is sophisticated work. You''re reading 3/4 rhythms at a deeper level.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In 3/4, beat one is strong and beats two and three are weak. Syncopation here means stressing beat two or three, or placing notes on the "ands" between beats.', 'why_text', 'Syncopation in triple meter can feel more disorienting than in 4/4 because the cycle is shorter — there''s less time to re-establish the pulse. Look for notes that begin on a weak beat and hold through where the next strong beat would fall.')
) WHERE slug = 'flow_rhythm_3_4_syncopation';

-- ---- rhythm_6_8 ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re clear on note values in 6/8. The eighth note as the beat unit is second nature now.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In 6/8, the bottom number tells you the eighth note gets one beat. A quarter note lasts two beats here, not one. This shift from 4/4 thinking is the key to reading compound meter.', 'why_text', 'The "8" in 6/8 changes everything about how you count. An eighth note = 1 beat, a quarter note = 2 beats, a dotted quarter = 3 beats. Mentally relabel each note value relative to the eighth note, and compound meter becomes straightforward.')
) WHERE slug = 'flow_rhythm_6_8_beat_count';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Totaling six eighth-note beats per measure is consistent for you now. Compound meter math is clicking.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Every measure in 6/8 contains six eighth-note beats, grouped in two sets of three. A dotted quarter note fills one group, and two dotted quarters fill the whole measure.', 'why_text', 'The six beats in 6/8 divide into two big pulses of three. Think of it as two groups: beats 1-2-3 and beats 4-5-6. When counting note values, make sure they sum to six eighth-note beats, and verify the grouping makes musical sense.')
) WHERE slug = 'flow_rhythm_6_8_total_beats';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Your ear is tuned to compound meter now. You''re hearing that rolling, triplet-like feel and matching it accurately.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Compound meter has a distinctive lilt — beats group in threes, giving a "ONE-two-three-FOUR-five-six" feel. If the music swings rather than marches, you''re likely hearing 6/8.', 'why_text', 'The difference between 6/8 and 3/4 is grouping: 6/8 has two groups of three (TWO big beats), while 3/4 has three groups of two (THREE big beats). Listen for where the secondary strong beat falls — in 6/8, it arrives halfway through the measure.')
) WHERE slug = 'flow_rhythm_6_8_audio_match';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Tapping in compound meter is flowing. You''re feeling those two big pulses subdivided into three.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count "1-2-3-4-5-6" but feel two big beats — one on "1" and one on "4." Tap each note where it falls in that six-count. The three-note grouping should feel like a gentle rocking motion.', 'why_text', 'If 6/8 tapping feels unstable, anchor yourself to just the two big beats first (1 and 4), then gradually fill in the subdivisions. The compound feel comes from nesting three within two — practice slowly until the grouping feels organic.')
) WHERE slug = 'flow_rhythm_6_8_tap_rhythm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Dotted notes in compound meter are making sense — you understand why dots are so central to 6/8 notation.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In 6/8, the dotted quarter note is the natural "big beat" — it lasts three eighth notes, filling one complete group. The dot isn''t an exception here; it''s the norm for expressing compound beats.', 'why_text', 'Compound meter and dotted notes are deeply connected. Since beats group in threes, the primary beat unit is naturally dotted: a dotted quarter = 3 eighth notes = one big beat. A dotted half note fills the entire measure. Ties in 6/8 typically create durations that cross the midpoint of the measure.')
) WHERE slug = 'flow_rhythm_6_8_dotted_tied';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Finding syncopation in compound meter is advanced rhythmic reading. You''re handling 6/8 with real fluency.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Syncopation in 6/8 happens when accents fall outside the two main pulses — on beats 2, 3, 5, or 6 instead of 1 and 4. It disrupts the expected rolling feel of compound meter.', 'why_text', 'In 6/8, the expected stress pattern is on beats 1 and 4. Syncopation shifts emphasis to the weaker beats within each three-beat group. A common pattern is accenting beat 2 or tying beat 3 into beat 4, blurring the boundary between the two groups.')
) WHERE slug = 'flow_rhythm_6_8_syncopation';

-- ---- rhythm_2_4 ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Note values in 2/4 are clear. You know what fits in that compact two-beat measure.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In 2/4, you only have two quarter-note beats per measure. The note values work the same as 4/4, but the measure is half as long — a half note fills the entire bar.', 'why_text', 'Think of 2/4 as the most economical simple meter. With only two beats, every note must earn its place. The same note values apply as in 4/4, but a whole note would overflow — the half note is the maximum single-note duration per measure.')
) WHERE slug = 'flow_rhythm_2_4_beat_count';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Counting to two per measure is precise and consistent. You''re nailing the tight structure of 2/4.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Every measure in 2/4 totals exactly two beats. It''s the simplest count to verify — if your note values add up to more or fewer than two, something''s off.', 'why_text', 'The brevity of 2/4 measures means errors stand out quickly. With only two beats, there''s no room for miscounting. Verify each note value carefully — a misread eighth note as a quarter note immediately breaks the math.')
) WHERE slug = 'flow_rhythm_2_4_total_beats';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re hearing that brisk, march-like two-beat pattern and matching it to the right notation.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Listen for a strong-weak, strong-weak pattern — like a march. In 2/4, the pulse cycles every two beats, giving the music a driving, forward quality.', 'why_text', 'The 2/4 feel is the most direct meter — STRONG-weak repeating rapidly. It can sound similar to 4/4 at first, but notice how often the strong beat returns. If emphasis comes every two beats rather than every four, you''re hearing duple meter.')
) WHERE slug = 'flow_rhythm_2_4_audio_match';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Tapping in 2/4 is tight and controlled. That march-like precision is exactly right.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count "1, 2, 1, 2" at a steady pace. With only two beats per measure, the pattern resets quickly — stay focused and keep the tempo even.', 'why_text', 'The short cycle of 2/4 demands rhythmic discipline. Because the barline comes every two beats, any timing error compounds fast. Practice with a metronome and emphasize beat one slightly to anchor each measure.')
) WHERE slug = 'flow_rhythm_2_4_tap_rhythm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Dotted and tied notes in 2/4 are no longer confusing. You understand how they extend beyond the short measure.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'A dotted quarter note in 2/4 lasts one and a half beats — it spills past beat two, so it almost always requires a tie into the next measure. This is where 2/4 notation gets interesting.', 'why_text', 'In 2/4, dotted notes frequently cross barlines because the measure is so short. A dotted quarter note (1.5 beats) can''t start on beat 2 without overflowing. Ties become essential for any duration longer than two beats, connecting notes across the barline.')
) WHERE slug = 'flow_rhythm_2_4_dotted_tied';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Syncopation in 2/4 hits hard, and you''re reading it accurately. That off-beat emphasis in a short meter is tricky to catch.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In 2/4, syncopation often means accenting beat two or the "and" of beat one. With only two beats to work with, even a small rhythmic shift creates a strong pull against the meter.', 'why_text', 'Syncopation feels especially pronounced in 2/4 because the meter is so short. There''s less time to re-establish the pulse before the next disruption. Look for eighth notes on the "ands" that are tied over the beat — that sustained off-beat note is the hallmark of 2/4 syncopation.')
) WHERE slug = 'flow_rhythm_2_4_syncopation';

-- ---- rhythm_5_4 ----

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Note values in 5/4 are reading clearly. You''re comfortable working inside an asymmetric measure.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'In 5/4, note values work the same as any simple meter — a quarter note still gets one beat. The difference is that the measure holds five beats, which is an unusual but not uncommon grouping.', 'why_text', 'Five beats per measure means no single note value fills it evenly in a familiar way. A whole note leaves one beat empty; a dotted whole would overflow. You''ll typically see combinations — a half note plus a dotted half, or various quarter and eighth note patterns that sum to five.')
) WHERE slug = 'flow_rhythm_5_4_beat_count';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Summing to five beats per measure is second nature now. Asymmetric meter math is no obstacle.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Every measure in 5/4 must total exactly five beats. The five beats typically group as 3+2 or 2+3 — this internal grouping affects the feel but not the total count.', 'why_text', 'The key to 5/4 is accepting the odd total. Don''t try to force it into 4+1 or stretch it to 6. Five is its own thing. When checking your count, verify the grouping too — composers usually indicate whether the measure feels like 3+2 or 2+3 through beaming and note placement.')
) WHERE slug = 'flow_rhythm_5_4_total_beats';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'You''re hearing 5/4 and recognizing it — that asymmetric pulse is distinctive, and your ear has locked onto it.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Asymmetric meters like 5/4 have a lopsided feel — the phrase length doesn''t divide evenly. Listen for a pattern that feels like "long-short" (3+2) or "short-long" (2+3) rather than the even groupings of 4/4 or 3/4.', 'why_text', 'The 5/4 feel is unmistakable once you learn to hear it. Count along and notice where the natural accent falls after beat one — if the next strong pulse comes on beat 3, you''re hearing 2+3; if on beat 4, it''s 3+2. Think of the "Mission: Impossible" theme or "Take Five" as reference points for this meter.')
) WHERE slug = 'flow_rhythm_5_4_audio_match';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Tapping in 5/4 flows naturally now. You''re feeling the asymmetric grouping instead of fighting it.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Count "1-2-3-4-5" steadily, but feel it as either "1-2-3, 1-2" or "1-2, 1-2-3." The internal grouping makes tapping in five feel natural rather than awkward.', 'why_text', 'If 5/4 tapping feels unstable, choose a grouping — 3+2 or 2+3 — and practice that pattern until it''s internalized. Accent the first beat of each sub-group slightly. Once the grouping is in your body, the five-beat cycle will feel as natural as any other meter.')
) WHERE slug = 'flow_rhythm_5_4_tap_rhythm';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Dotted and tied notes in 5/4 are clear to you. You understand how extended durations interact with asymmetric bar lengths.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Dotted notes in 5/4 often align with the internal grouping — a dotted half note (3 beats) fits perfectly in the "3" portion of a 3+2 measure. Ties frequently bridge the two sub-groups or cross the barline.', 'why_text', 'In 5/4, dotted and tied notes serve a structural role: they reinforce or obscure the internal 3+2 or 2+3 grouping. A dotted half note starting on beat one defines a 3+2 feel. A tie from beat 2 through beat 4 blurs the grouping entirely. Read these notes in context of the sub-groups.')
) WHERE slug = 'flow_rhythm_5_4_dotted_tied';

UPDATE card_templates SET feedback = jsonb_build_object(
  'correct', (feedback->'correct') || jsonb_build_object('breakthrough_text', 'Syncopation in 5/4 — that''s advanced territory, and you''re navigating it. The interplay between asymmetric meter and off-beat accents is genuinely complex.'),
  'incorrect', (feedback->'incorrect') || jsonb_build_object('first_encounter_text', 'Syncopation in 5/4 displaces accents within an already asymmetric framework. The off-beat emphasis plays against both the main downbeat and the internal sub-group boundaries.', 'why_text', 'In 5/4, syncopation operates on two levels: against the five-beat measure and against the internal 3+2 or 2+3 grouping. An accent on beat 2 in a 3+2 pattern disrupts the sub-group; a note tied from beat 3 into beat 4 blurs the boundary between groups. Identify the grouping first, then locate where the rhythm pushes against it.')
) WHERE slug = 'flow_rhythm_5_4_syncopation';
