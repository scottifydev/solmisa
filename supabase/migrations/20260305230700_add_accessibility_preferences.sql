-- Add accessibility preferences JSONB to profiles
ALTER TABLE profiles
  ADD COLUMN accessibility_preferences JSONB DEFAULT '{}'::jsonb;
