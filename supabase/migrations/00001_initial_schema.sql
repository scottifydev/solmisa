-- Solmisa M1: Initial Database Schema
-- ==============================================

-- Custom types
create type experience_level as enum ('beginner', 'intermediate', 'advanced');
create type srs_stage as enum ('apprentice', 'journeyman', 'adept', 'virtuoso', 'mastered');
create type lesson_stage_type as enum ('aural_teach', 'theory_teach', 'aural_quiz', 'theory_quiz', 'practice');
create type card_category as enum ('perceptual', 'declarative');
create type review_result as enum ('correct', 'incorrect', 'skip');

-- ==============================================
-- Profiles (extends auth.users)
-- ==============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  instrument text,
  experience_level experience_level,
  onboarding_completed boolean not null default false,
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ==============================================
-- Modules
-- ==============================================
create table modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  "order" integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table modules enable row level security;

create policy "Authenticated users can read published modules"
  on modules for select to authenticated
  using (is_published = true);

-- ==============================================
-- Lessons
-- ==============================================
create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules on delete cascade,
  title text not null,
  description text,
  "order" integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table lessons enable row level security;

create policy "Authenticated users can read published lessons"
  on lessons for select to authenticated
  using (is_published = true);

create index idx_lessons_module_id on lessons (module_id);

-- ==============================================
-- Lesson stages
-- ==============================================
create table lesson_stages (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons on delete cascade,
  stage_type lesson_stage_type not null,
  config jsonb not null default '{}'::jsonb,
  "order" integer not null default 0
);

alter table lesson_stages enable row level security;

create policy "Authenticated users can read lesson stages"
  on lesson_stages for select to authenticated
  using (true);

create index idx_lesson_stages_lesson_id on lesson_stages (lesson_id);

-- ==============================================
-- SRS Cards
-- ==============================================
create table srs_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  lesson_id uuid not null references lessons on delete cascade,
  card_category card_category not null default 'perceptual',
  front text not null,
  back text not null,
  "interval" integer not null default 0,
  ease_factor real not null default 2.5,
  due_at timestamptz not null default now(),
  stage srs_stage not null default 'apprentice',
  created_at timestamptz not null default now()
);

alter table srs_cards enable row level security;

create policy "Users can manage own cards"
  on srs_cards for all using (auth.uid() = user_id);

create index idx_srs_cards_user_due on srs_cards (user_id, due_at);
create index idx_srs_cards_user_stage on srs_cards (user_id, stage);

-- ==============================================
-- SRS Reviews
-- ==============================================
create table srs_reviews (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references srs_cards on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  result review_result not null,
  response_time_ms integer,
  reviewed_at timestamptz not null default now()
);

alter table srs_reviews enable row level security;

create policy "Users can manage own reviews"
  on srs_reviews for all using (auth.uid() = user_id);

create index idx_srs_reviews_card on srs_reviews (card_id);
create index idx_srs_reviews_user_date on srs_reviews (user_id, reviewed_at);

-- ==============================================
-- Skill Axes (radar chart data)
-- ==============================================
create table skill_axes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  axis_name text not null,
  score real not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, axis_name)
);

alter table skill_axes enable row level security;

create policy "Users can manage own skill axes"
  on skill_axes for all using (auth.uid() = user_id);

-- ==============================================
-- Assessment Questions
-- ==============================================
create table assessment_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons on delete set null,
  question_text text not null,
  correct_answer text not null,
  distractors jsonb not null default '[]'::jsonb,
  axis_weights jsonb
);

alter table assessment_questions enable row level security;

create policy "Authenticated users can read assessment questions"
  on assessment_questions for select to authenticated
  using (true);

-- ==============================================
-- Assessment Responses
-- ==============================================
create table assessment_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  question_id uuid not null references assessment_questions on delete cascade,
  answer text not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

alter table assessment_responses enable row level security;

create policy "Users can manage own responses"
  on assessment_responses for all using (auth.uid() = user_id);

-- ==============================================
-- Activity Log
-- ==============================================
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table activity_log enable row level security;

create policy "Users can manage own activity log"
  on activity_log for all using (auth.uid() = user_id);

create index idx_activity_log_user_date on activity_log (user_id, created_at);

-- ==============================================
-- User Lesson Progress
-- ==============================================
create table user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  lesson_id uuid not null references lessons on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table user_lesson_progress enable row level security;

create policy "Users can manage own lesson progress"
  on user_lesson_progress for all using (auth.uid() = user_id);
