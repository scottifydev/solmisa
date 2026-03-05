-- Add tap_rhythm to response_type CHECK constraint on card_templates
ALTER TABLE card_templates DROP CONSTRAINT IF EXISTS card_templates_response_type_check;
ALTER TABLE card_templates ADD CONSTRAINT card_templates_response_type_check
  CHECK (response_type IN (
    'select_one', 'select_degree', 'select_interval', 'select_chord',
    'sing', 'play', 'sequence', 'toggle_set', 'free_response',
    'tap_rhythm'
  ));
