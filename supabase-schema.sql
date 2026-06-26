-- Run this in the Supabase SQL editor to set up the database.

create extension if not exists "pgcrypto";

-- ─── chat_sessions ───────────────────────────────────────────────────────────
create table public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'New Chat',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;

create policy "owner only" on public.chat_sessions
  for all using (auth.uid() = user_id);

-- ─── chat_messages ───────────────────────────────────────────────────────────
create table public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.chat_sessions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "owner only" on public.chat_messages
  for all using (auth.uid() = user_id);

-- Auto-bump session updated_at when a new message arrives
create or replace function public.touch_session_updated_at()
returns trigger language plpgsql as $$
begin
  update public.chat_sessions
  set updated_at = now()
  where id = new.session_id;
  return new;
end;
$$;

create trigger on_new_message
  after insert on public.chat_messages
  for each row execute function public.touch_session_updated_at();

-- ─── workout_plans ───────────────────────────────────────────────────────────
create table public.workout_plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'My Workout Plan',
  content     text not null,
  inputs      jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.workout_plans enable row level security;

create policy "owner only" on public.workout_plans
  for all using (auth.uid() = user_id);
