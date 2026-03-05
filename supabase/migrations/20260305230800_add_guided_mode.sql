-- Add guided_mode toggle to profiles
ALTER TABLE profiles
  ADD COLUMN guided_mode BOOLEAN DEFAULT false;
