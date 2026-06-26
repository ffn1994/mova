-- AI Coach Brain additional tables
-- Run AFTER supabase-schema.sql

-- ─── user_fitness_profile ─────────────────────────────────────────────────────
create table public.user_fitness_profile (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  goal         text not null check (goal in ('lose_weight','build_muscle','improve_endurance')),
  fitness_level text not null check (fitness_level in ('beginner','intermediate','advanced')),
  days_per_week int not null check (days_per_week between 1 and 7),
  equipment    text not null check (equipment in ('none','dumbbells','gym')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.user_fitness_profile enable row level security;
create policy "owner only" on public.user_fitness_profile for all using (auth.uid() = user_id);

-- ─── daily_readiness ──────────────────────────────────────────────────────────
create table public.daily_readiness (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  date                 date not null default current_date,
  sleep_hours          numeric(3,1) not null,
  sleep_quality        int not null check (sleep_quality between 1 and 5),
  energy_level         int not null check (energy_level between 1 and 5),
  physical_work_fatigue int not null check (physical_work_fatigue between 0 and 3),
  stress_level         int not null check (stress_level between 1 and 5),
  hydration            int not null check (hydration between 1 and 5),
  nutrition_yesterday  int not null check (nutrition_yesterday between 1 and 5),
  user_fatigue         int not null check (user_fatigue between 1 and 5),
  notes                text,
  created_at           timestamptz not null default now(),
  unique (user_id, date)
);
alter table public.daily_readiness enable row level security;
create policy "owner only" on public.daily_readiness for all using (auth.uid() = user_id);

-- ─── workout_sessions ─────────────────────────────────────────────────────────
create table public.workout_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  date             date not null default current_date,
  session_type     text not null,
  duration_minutes int,
  overall_rpe      numeric(3,1) check (overall_rpe between 1 and 10),
  notes            text,
  created_at       timestamptz not null default now()
);
alter table public.workout_sessions enable row level security;
create policy "owner only" on public.workout_sessions for all using (auth.uid() = user_id);

-- ─── workout_exercises ────────────────────────────────────────────────────────
create table public.workout_exercises (
  id                 uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id        text not null,   -- slug from exercise library
  exercise_name      text not null,
  sort_order         int not null default 0,
  target_muscles     text[] not null default '{}',
  created_at         timestamptz not null default now()
);
alter table public.workout_exercises enable row level security;
create policy "session owner" on public.workout_exercises for all
  using (exists (
    select 1 from public.workout_sessions ws
    where ws.id = workout_session_id and ws.user_id = auth.uid()
  ));

-- ─── exercise_sets ────────────────────────────────────────────────────────────
create table public.exercise_sets (
  id                  uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  set_number          int not null,
  weight_kg           numeric(6,2),
  reps                int,
  rpe                 numeric(3,1) check (rpe between 1 and 10),
  notes               text,
  created_at          timestamptz not null default now()
);
alter table public.exercise_sets enable row level security;
create policy "session owner" on public.exercise_sets for all
  using (exists (
    select 1 from public.workout_exercises we
    join public.workout_sessions ws on ws.id = we.workout_session_id
    where we.id = workout_exercise_id and ws.user_id = auth.uid()
  ));

-- ─── exercise_feedback ────────────────────────────────────────────────────────
create table public.exercise_feedback (
  id                  uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null unique references public.workout_exercises(id) on delete cascade,
  technique_confidence int not null check (technique_confidence between 1 and 5),
  difficulty          int not null check (difficulty between 1 and 5),
  weight_feel         text not null check (weight_feel in ('too_light','appropriate','too_heavy')),
  soreness_prediction text check (soreness_prediction in ('none','mild','moderate','severe')),
  created_at          timestamptz not null default now()
);
alter table public.exercise_feedback enable row level security;
create policy "session owner" on public.exercise_feedback for all
  using (exists (
    select 1 from public.workout_exercises we
    join public.workout_sessions ws on ws.id = we.workout_session_id
    where we.id = workout_exercise_id and ws.user_id = auth.uid()
  ));

-- ─── ai_coaching_sessions ─────────────────────────────────────────────────────
create table public.ai_coaching_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  date         date not null default current_date,
  readiness_id uuid references public.daily_readiness(id),
  decision     jsonb not null,
  created_at   timestamptz not null default now(),
  unique (user_id, date)
);
alter table public.ai_coaching_sessions enable row level security;
create policy "owner only" on public.ai_coaching_sessions for all using (auth.uid() = user_id);
