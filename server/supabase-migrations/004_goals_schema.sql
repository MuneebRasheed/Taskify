-- Taskify goals data model
-- Run this in Supabase SQL Editor for the project used by the app.

create table if not exists public.goals (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  cover_index integer not null default 0,
  source text not null default 'selfMade',
  habits_total integer not null default 0,
  habits_done integer not null default 0,
  tasks_total integer not null default 0,
  tasks_done integer not null default 0,
  due_date timestamptz null,
  achieved boolean not null default false,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at timestamptz null
);

create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_goals_created_at on public.goals(created_at desc);

create table if not exists public.goal_items (
  id text primary key,
  goal_id text not null references public.goals(id) on delete cascade,
  type text not null check (type in ('habit', 'task')),
  title text not null,
  reminder_time text null,
  note text null,
  selected_days jsonb null,
  due_date text null,
  paused boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_goal_items_goal_id on public.goal_items(goal_id);

create table if not exists public.item_completions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.goal_items(id) on delete cascade,
  completion_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_id, completion_date)
);

create index if not exists idx_item_completions_user_id on public.item_completions(user_id);
create index if not exists idx_item_completions_item_id on public.item_completions(item_id);
