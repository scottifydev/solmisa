-- Add configurable review session cap to profiles
ALTER TABLE profiles
  ADD COLUMN review_session_cap INTEGER DEFAULT 20;
