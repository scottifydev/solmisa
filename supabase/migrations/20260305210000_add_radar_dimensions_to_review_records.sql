-- SCO-210: Add radar_dimensions to review_records for per-dimension accuracy tracking
-- Denormalized from card_templates at write time so historical queries don't need template joins

ALTER TABLE review_records ADD COLUMN radar_dimensions TEXT[] DEFAULT '{}';
CREATE INDEX idx_review_records_radar ON review_records USING GIN (radar_dimensions);

-- Update process_review_answer to copy radar_dimensions from card_template
CREATE OR REPLACE FUNCTION process_review_answer(
  p_user_card_state_id uuid,
  p_response jsonb,
  p_correct boolean,
  p_response_time_ms integer,
  p_new_stage text,
  p_new_ease_factor real,
  p_new_interval_days real,
  p_next_review_at timestamptz,
  p_new_difficulty_tier text default null,
  p_dimension_accuracy jsonb default null
) returns jsonb as $$
declare
  v_old_stage text;
  v_user_id uuid;
  v_radar_dims text[];
begin
  select srs_stage, user_id into v_old_stage, v_user_id
  from user_card_state where id = p_user_card_state_id;

  if v_user_id != auth.uid() then
    raise exception 'Unauthorized';
  end if;

  -- Look up radar_dimensions from the card template
  select coalesce(ct.radar_dimensions, '{}')
  into v_radar_dims
  from user_card_state ucs
  join card_instances ci on ci.id = ucs.card_instance_id
  join card_templates ct on ct.id = ci.template_id
  where ucs.id = p_user_card_state_id;

  insert into review_records (user_card_state_id, response, correct, response_time_ms, srs_stage_before, srs_stage_after, radar_dimensions)
  values (p_user_card_state_id, p_response, p_correct, p_response_time_ms, v_old_stage, p_new_stage, coalesce(v_radar_dims, '{}'));

  update user_card_state set
    srs_stage = p_new_stage,
    ease_factor = p_new_ease_factor,
    interval_days = p_new_interval_days,
    next_review_at = p_next_review_at,
    correct_streak = case when p_correct then correct_streak + 1 else 0 end,
    total_reviews = total_reviews + 1,
    total_correct = total_correct + case when p_correct then 1 else 0 end,
    difficulty_tier = coalesce(p_new_difficulty_tier, difficulty_tier),
    dimension_accuracy = coalesce(p_dimension_accuracy, dimension_accuracy)
  where id = p_user_card_state_id;

  return jsonb_build_object(
    'stage_before', v_old_stage,
    'stage_after', p_new_stage,
    'correct', p_correct
  );
end;
$$ language plpgsql security definer;
