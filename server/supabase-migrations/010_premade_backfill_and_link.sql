-- Link user goals to global pre-made templates and backfill templates

-- 1) Track which pre_made_goals template a user joined.
alter table if exists public.goals
add column if not exists pre_made_template_id text null references public.pre_made_goals(id) on delete set null;

create index if not exists idx_goals_pre_made_template_id
  on public.goals(pre_made_template_id);

-- Ensure pre_made_goals has the columns expected by this backfill.
alter table if exists public.pre_made_goals
  add column if not exists user_count text not null default '+0 users',
  add column if not exists habits jsonb not null default '[]'::jsonb,
  add column if not exists tasks jsonb not null default '[]'::jsonb,
  add column if not exists note text not null default '',
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- 2) Backfill pre_made_goals from existing goals + goal_items where source='preMade'.
--    This keeps habits/tasks sourced from goal_items as requested.
insert into public.pre_made_goals (
  id,
  title,
  category,
  cover_index,
  habits_count,
  tasks_count,
  user_count,
  habits,
  tasks,
  note,
  sort_order,
  is_active,
  created_at,
  updated_at
)
select
  g.id,
  g.title,
  coalesce(g.category, 'General') as category,
  coalesce(g.cover_index, 0) as cover_index,
  count(*) filter (where gi.type = 'habit') as habits_count,
  count(*) filter (where gi.type = 'task') as tasks_count,
  '+0 users' as user_count,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'title', gi.title,
        'selectedDays', coalesce(gi.selected_days, '[]'::jsonb),
        'reminderTime', gi.reminder_time
      )
      order by gi.created_at
    ) filter (where gi.type = 'habit'),
    '[]'::jsonb
  ) as habits,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'title', gi.title,
        'dueDate', gi.due_date,
        'reminderTime', gi.reminder_time
      )
      order by gi.created_at
    ) filter (where gi.type = 'task'),
    '[]'::jsonb
  ) as tasks,
  '' as note,
  row_number() over (order by g.created_at asc) as sort_order,
  true as is_active,
  now() as created_at,
  now() as updated_at
from public.goals g
left join public.goal_items gi on gi.goal_id = g.id
where g.source = 'preMade'
group by g.id, g.title, g.category, g.cover_index, g.created_at
on conflict (id) do update
set
  title = excluded.title,
  category = excluded.category,
  cover_index = excluded.cover_index,
  habits_count = excluded.habits_count,
  tasks_count = excluded.tasks_count,
  habits = excluded.habits,
  tasks = excluded.tasks,
  updated_at = now();

-- 3) Link existing user preMade goals to their same-id templates when present.
update public.goals g
set pre_made_template_id = g.id
where g.source = 'preMade'
  and exists (
    select 1
    from public.pre_made_goals pm
    where pm.id = g.id
  );
