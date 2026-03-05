-- Solmisa: Consolidated Schema (reflects actual DB state as of 2026-03-04)
-- ============================================================================
-- This file replaces the original 00001 and consolidates 47 incremental
-- migrations that were applied via Supabase MCP during development.
-- It is a reference snapshot — NOT intended to be re-applied.
-- ============================================================================

-- ==============================================
-- Utility Functions
-- ==============================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users (managed by Supabase, not re-creatable via migration)
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute function handle_new_user();

-- ==============================================
-- Profiles (extends auth.users)
-- ==============================================
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  instrument text,
  experience_level text check (experience_level in ('beginner','intermediate','advanced','professional')),
  musical_background text check (musical_background in ('none','childhood','literate','advanced')),
  goals text[],
  primary_solfege_system text default 'moveable_do',
  onboarding_complete boolean default false,
  streak_days integer default 0,
  streak_last_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "own_data" on profiles for all using (auth.uid() = id);
create trigger trg_profiles_updated_at before update on profiles for each row execute function set_updated_at();

-- ==============================================
-- Modules
-- ==============================================
create table modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  module_order integer not null unique,
  unlock_criteria jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table modules enable row level security;
create policy "read_all" on modules for select using (auth.role() = 'authenticated');

-- ==============================================
-- Lessons
-- ==============================================
create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id),
  title text not null,
  description text,
  lesson_order integer not null,
  drone_key text not null default 'C',
  stages jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  unique (module_id, lesson_order)
);

alter table lessons enable row level security;
create policy "read_all" on lessons for select using (auth.role() = 'authenticated');
create index idx_lessons_module on lessons (module_id, lesson_order);

-- ==============================================
-- Card Templates
-- ==============================================
create table card_templates (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id),
  slug text not null unique,
  card_category text not null default 'declarative'
    check (card_category in ('perceptual','declarative','rhythm')),
  response_type text not null
    check (response_type in ('select_one','select_degree','select_interval','select_chord','sing','play','sequence','toggle_set','free_response')),
  prompt_text text not null,
  prompt_audio jsonb,
  difficulty_tiers jsonb not null default '{}'::jsonb,
  playback jsonb default '{}'::jsonb,
  feedback jsonb default '{}'::jsonb,
  block_scoring jsonb default '{}'::jsonb,
  dimensions text[] default '{}'::text[],
  is_parametric boolean default false,
  parameters jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table card_templates enable row level security;
create policy "read_all" on card_templates for select using (auth.role() = 'authenticated');
create index idx_card_templates_lesson on card_templates (lesson_id);

-- ==============================================
-- Card Instances
-- ==============================================
create table card_instances (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references card_templates(id),
  instance_parameters jsonb default '{}'::jsonb,
  prompt_rendered text not null,
  answer_data jsonb not null,
  options_data jsonb,
  audio_ref text,
  created_at timestamptz default now()
);

alter table card_instances enable row level security;
create policy "read_all" on card_instances for select using (auth.role() = 'authenticated');
create policy "insert_instances" on card_instances for insert with check (auth.role() = 'authenticated');
create index idx_card_instances_template on card_instances (template_id);

-- ==============================================
-- User Card State (SRS)
-- ==============================================
create table user_card_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  card_instance_id uuid not null references card_instances(id),
  srs_stage text not null default 'apprentice_1'
    check (srs_stage in ('apprentice_1','apprentice_2','apprentice_3','apprentice_4','journeyman_1','journeyman_2','adept_1','adept_2','virtuoso_1','virtuoso_2','mastered')),
  difficulty_tier text default 'intro'
    check (difficulty_tier in ('intro','core','stretch')),
  ease_factor real default 2.5,
  interval_days real default 0,
  next_review_at timestamptz,
  correct_streak integer default 0,
  total_reviews integer default 0,
  total_correct integer default 0,
  dimension_accuracy jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, card_instance_id)
);

alter table user_card_state enable row level security;
create policy "own_data" on user_card_state for all using (auth.uid() = user_id);
create trigger trg_user_card_state_updated_at before update on user_card_state for each row execute function set_updated_at();
create index idx_user_card_state_review on user_card_state (user_id, next_review_at) where srs_stage <> 'mastered';
create index idx_user_card_state_stage on user_card_state (user_id, srs_stage);

-- ==============================================
-- Review Records
-- ==============================================
create table review_records (
  id uuid primary key default gen_random_uuid(),
  user_card_state_id uuid not null references user_card_state(id) on delete cascade,
  response jsonb not null,
  correct boolean not null,
  response_time_ms integer,
  srs_stage_before text,
  srs_stage_after text,
  created_at timestamptz default now()
);

alter table review_records enable row level security;
create policy "own_data" on review_records for all
  using (auth.uid() = (select user_id from user_card_state where id = review_records.user_card_state_id));
create index idx_review_records_state on review_records (user_card_state_id, created_at desc);

-- ==============================================
-- Lesson Progress
-- ==============================================
create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id),
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','completed')),
  current_stage_index integer default 0,
  score real,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, lesson_id)
);

alter table lesson_progress enable row level security;
create policy "own_data" on lesson_progress for all using (auth.uid() = user_id);
create trigger trg_lesson_progress_updated_at before update on lesson_progress for each row execute function set_updated_at();
create index idx_lesson_progress_user on lesson_progress (user_id, lesson_id);

-- ==============================================
-- Module Progress
-- ==============================================
create table module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  module_id uuid not null references modules(id),
  status text not null default 'locked'
    check (status in ('locked','available','in_progress','completed')),
  lessons_completed integer default 0,
  unlocked_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, module_id)
);

alter table module_progress enable row level security;
create policy "own_data" on module_progress for all using (auth.uid() = user_id);
create trigger trg_module_progress_updated_at before update on module_progress for each row execute function set_updated_at();
create index idx_module_progress_user on module_progress (user_id, module_id);

-- ==============================================
-- Skill Axes (12-axis radar)
-- ==============================================
create table skill_axes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  axis_name text not null
    check (axis_name in ('key_signatures','intervals','scales_modes','chords_harmony','ear_training','rhythm_meter','performance','sight_reading','practice_discipline','active_listening','composition','music_literacy')),
  score real default 0,
  source text default 'lesson',
  updated_at timestamptz default now(),
  unique (user_id, axis_name)
);

alter table skill_axes enable row level security;
create policy "own_data" on skill_axes for all using (auth.uid() = user_id);
create index idx_skill_axes_user on skill_axes (user_id);

-- ==============================================
-- Assessment Questions
-- ==============================================
create table assessment_questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  category text not null,
  options jsonb not null,
  axis_weights jsonb not null,
  display_order integer,
  is_onboarding boolean not null default false
);

alter table assessment_questions enable row level security;
create policy "Anyone can read assessment questions" on assessment_questions for select using (true);
create policy "Service role manages assessment questions" on assessment_questions for all using (auth.role() = 'service_role');
create policy "read_all" on assessment_questions for select using (auth.role() = 'authenticated');

-- ==============================================
-- Assessment Responses
-- ==============================================
create table assessment_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  question_id uuid not null references assessment_questions(id),
  selected_option integer not null,
  created_at timestamptz default now(),
  unique (user_id, question_id)
);

alter table assessment_responses enable row level security;
create policy "own_data" on assessment_responses for all using (auth.uid() = user_id);

-- ==============================================
-- Activity Logs
-- ==============================================
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  activity_type text not null,
  duration_minutes integer,
  notes text,
  axis_impacts jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table activity_logs enable row level security;
create policy "own_data" on activity_logs for all using (auth.uid() = user_id);

-- ==============================================
-- RPCs
-- ==============================================

create or replace function seed_lesson_cards(
  p_user_id uuid,
  p_lesson_id uuid,
  p_card_data jsonb
) returns jsonb as $$
declare
  item jsonb;
  v_instance_id uuid;
  v_template record;
  v_result jsonb := '[]'::jsonb;
begin
  for item in select * from jsonb_array_elements(p_card_data)
  loop
    select * into v_template from card_templates where id = (item->>'template_id')::uuid;

    if v_template.is_parametric then
      insert into card_instances (template_id, instance_parameters, prompt_rendered, answer_data, options_data, audio_ref)
      values (
        v_template.id,
        coalesce(item->'instance_parameters', '{}'::jsonb),
        item->>'prompt_rendered',
        item->'answer_data',
        item->'options_data',
        item->>'audio_ref'
      )
      returning id into v_instance_id;
    else
      select id into v_instance_id from card_instances where template_id = v_template.id limit 1;
    end if;

    insert into user_card_state (user_id, card_instance_id, srs_stage, next_review_at)
    values (p_user_id, v_instance_id, 'apprentice_1', now() + interval '4 hours')
    on conflict (user_id, card_instance_id) do nothing;

    v_result := v_result || jsonb_build_object('instance_id', v_instance_id, 'template_id', v_template.id);
  end loop;

  insert into lesson_progress (user_id, lesson_id, status, completed_at)
  values (p_user_id, p_lesson_id, 'completed', now())
  on conflict (user_id, lesson_id) do update set
    status = 'completed',
    completed_at = now();

  return v_result;
end;
$$ language plpgsql security definer;

create or replace function process_review_answer(
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
begin
  select srs_stage, user_id into v_old_stage, v_user_id
  from user_card_state where id = p_user_card_state_id;

  if v_user_id != auth.uid() then
    raise exception 'Unauthorized';
  end if;

  insert into review_records (user_card_state_id, response, correct, response_time_ms, srs_stage_before, srs_stage_after)
  values (p_user_card_state_id, p_response, p_correct, p_response_time_ms, v_old_stage, p_new_stage);

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

-- ==============================================
-- Notes
-- ==============================================
-- 1. Duplicate unique index on assessment_responses (assessment_responses_user_question_unique)
--    exists in DB alongside the constraint-based one. Harmless but could be cleaned up.
-- 2. The handle_new_user trigger on auth.users is managed by Supabase dashboard,
--    not in this migration file.
-- 3. There is a legacy update_updated_at() function that duplicates set_updated_at().
--    Both exist but only set_updated_at() is used by current triggers.
