-- Add chord_progression to drill_type CHECK constraint on drills
ALTER TABLE drills DROP CONSTRAINT IF EXISTS drills_drill_type_check;
ALTER TABLE drills ADD CONSTRAINT drills_drill_type_check
  CHECK (drill_type IN (
    'degree_id', 'interval_id', 'chord_quality', 'degree_discrimination',
    'meter_id', 'minor_form_id', 'rhythm_tap', 'rhythm_echo',
    'note_reading', 'key_signature_id', 'scale_construction',
    'roman_numeral_id', 'melodic_dictation', 'harmonic_dictation',
    'chord_progression'
  ));
