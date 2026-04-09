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

-- Permissions + RLS (required for client-side access via anon key)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.goals to authenticated, service_role;
grant select, insert, update, delete on table public.goal_items to authenticated, service_role;
grant select, insert, update, delete on table public.item_completions to authenticated, service_role;
grant usage, select on sequence public.item_completions_id_seq to authenticated, service_role;

alter table public.goals enable row level security;
alter table public.goal_items enable row level security;
alter table public.item_completions enable row level security;

drop policy if exists goals_select_own on public.goals;
create policy goals_select_own
on public.goals
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists goals_insert_own on public.goals;
create policy goals_insert_own
on public.goals
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists goals_update_own on public.goals;
create policy goals_update_own
on public.goals
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists goals_delete_own on public.goals;
create policy goals_delete_own
on public.goals
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists goal_items_select_own on public.goal_items;
create policy goal_items_select_own
on public.goal_items
for select
to authenticated
using (
  exists (
    select 1
    from public.goals g
    where g.id = goal_items.goal_id
      and g.user_id = auth.uid()
  )
);

drop policy if exists goal_items_insert_own on public.goal_items;
create policy goal_items_insert_own
on public.goal_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.goals g
    where g.id = goal_items.goal_id
      and g.user_id = auth.uid()
  )
);

drop policy if exists goal_items_update_own on public.goal_items;
create policy goal_items_update_own
on public.goal_items
for update
to authenticated
using (
  exists (
    select 1
    from public.goals g
    where g.id = goal_items.goal_id
      and g.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.goals g
    where g.id = goal_items.goal_id
      and g.user_id = auth.uid()
  )
);

drop policy if exists goal_items_delete_own on public.goal_items;
create policy goal_items_delete_own
on public.goal_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.goals g
    where g.id = goal_items.goal_id
      and g.user_id = auth.uid()
  )
);

drop policy if exists item_completions_select_own on public.item_completions;
create policy item_completions_select_own
on public.item_completions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists item_completions_insert_own on public.item_completions;
create policy item_completions_insert_own
on public.item_completions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists item_completions_update_own on public.item_completions;
create policy item_completions_update_own
on public.item_completions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists item_completions_delete_own on public.item_completions;
create policy item_completions_delete_own
on public.item_completions
for delete
to authenticated
using (auth.uid() = user_id);
