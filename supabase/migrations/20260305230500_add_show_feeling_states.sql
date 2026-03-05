-- Add show_feeling_states toggle to profiles (default on)
ALTER TABLE profiles
  ADD COLUMN show_feeling_states BOOLEAN DEFAULT true;
