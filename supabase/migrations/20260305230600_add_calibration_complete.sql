-- Add calibration_complete flag to onboarding_results
ALTER TABLE onboarding_results
  ADD COLUMN calibration_complete BOOLEAN DEFAULT false;
