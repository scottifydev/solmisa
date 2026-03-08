-- SCO-324: Backfill profiles for auth.users created before the handle_new_user trigger
-- The trigger was deployed after the first user(s) signed up, so their profiles row
-- was never created. This caused FK violations on lesson_progress, user_card_state,
-- review_records, etc. — silently breaking the entire Learn → Review pipeline.

INSERT INTO profiles (id, onboarding_complete)
SELECT u.id, true FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);
