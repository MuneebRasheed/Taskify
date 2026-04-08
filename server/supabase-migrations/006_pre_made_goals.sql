-- Pre-made goals catalog (shared templates for Explore / Pre-made screens)

create table if not exists public.pre_made_goals (
  id text primary key,
  title text not null,
  category text not null,
  cover_index integer not null default 0,
  habits_count integer not null default 0,
  tasks_count integer not null default 0,
  user_count text not null default '+0 users',
  habits jsonb not null default '[]'::jsonb,
  tasks jsonb not null default '[]'::jsonb,
  note text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pre_made_goals_active_sort
  on public.pre_made_goals (is_active, sort_order, created_at);

alter table public.pre_made_goals enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'pre_made_goals'
      and policyname = 'pre_made_goals_read_all'
  ) then
    create policy pre_made_goals_read_all
      on public.pre_made_goals
      for select
      using (true);
  end if;
end $$;

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
  is_active
)
values
  (
    '1',
    'Learn New Skills',
    'Learning',
    0,
    5,
    4,
    '+15.2K users',
    '[
      {"title":"Practice vocabulary for 15 minutes","selectedDays":[0,2,4],"reminderTime":"09:00 AM"},
      {"title":"Complete a short listening exercise","selectedDays":[1,3,5],"reminderTime":"10:00 AM"},
      {"title":"Engage with native speakers","selectedDays":[0,1,2,3,4]},
      {"title":"Review grammar lessons","selectedDays":[2,4,6],"reminderTime":"14:00"},
      {"title":"Label objects in your environment","selectedDays":[0,3,5],"reminderTime":"08:00 AM"}
    ]'::jsonb,
    '[
      {"title":"Choose a learning method","dueDate":"Today"},
      {"title":"Set realistic goals","dueDate":"Dec 31, 2025","reminderTime":"09:00 AM"},
      {"title":"Find learning resources","dueDate":"Jan 15, 2026"},
      {"title":"Schedule a weekly review","dueDate":"Ongoing","reminderTime":"18:00"}
    ]'::jsonb,
    'Focus on consistency. Daily practice, even for short periods, is more effective than sporadic cramming sessions. Make learning fun: choose activities you enjoy to stay motivated.',
    1,
    true
  ),
  (
    '2',
    'Exercise Regularly',
    'Health',
    1,
    4,
    6,
    '+12.4K users',
    '[
      {"title":"Morning stretch for 10 minutes","selectedDays":[0,1,2,3,4,5,6],"reminderTime":"07:00 AM"},
      {"title":"Walk or run 30 minutes","selectedDays":[0,2,4],"reminderTime":"06:30 AM"},
      {"title":"Strength training","selectedDays":[1,3,5],"reminderTime":"17:00"},
      {"title":"Track daily steps","selectedDays":[0,1,2,3,4,5,6]}
    ]'::jsonb,
    '[
      {"title":"Set weekly exercise goals","dueDate":"Today"},
      {"title":"Create a workout schedule","dueDate":"This week"},
      {"title":"Find a workout buddy","dueDate":"Next week"},
      {"title":"Buy workout gear if needed","dueDate":"Optional"},
      {"title":"Join a gym or class","dueDate":"This month"},
      {"title":"Review progress weekly","dueDate":"Ongoing","reminderTime":"Sunday 18:00"}
    ]'::jsonb,
    'Start small and build up. Consistency beats intensity. Find activities you enjoy so you stick with them long term.',
    2,
    true
  ),
  (
    '3',
    'Learn a New Language',
    'Learning',
    2,
    6,
    5,
    '+19.2K users',
    '[
      {"title":"Practice vocabulary for 15 minutes","selectedDays":[0,2,4],"reminderTime":"09:00 AM"},
      {"title":"Complete a short listening exercise","selectedDays":[1,3,5],"reminderTime":"10:00 AM"},
      {"title":"Engage with native speakers","selectedDays":[0,1,2,3,4]},
      {"title":"Review grammar lessons","selectedDays":[2,4,6],"reminderTime":"14:00"},
      {"title":"Label objects in your environment","selectedDays":[0,3,5],"reminderTime":"08:00 AM"},
      {"title":"Listen to related podcasts","selectedDays":[1,4,6],"reminderTime":"19:00"}
    ]'::jsonb,
    '[
      {"title":"Choose a language learning method","dueDate":"Today"},
      {"title":"Set realistic goals","dueDate":"Dec 31, 2025","reminderTime":"09:00 AM"},
      {"title":"Find language learning resources","dueDate":"Jan 15, 2026"},
      {"title":"Immerse yourself in the language","dueDate":"Ongoing"},
      {"title":"Schedule a weekly review","dueDate":"Ongoing","reminderTime":"18:00"}
    ]'::jsonb,
    'Focus on consistency. Daily practice, even for short periods, is more effective than sporadic cramming sessions. Make learning fun: Choose activities you enjoy, like watching movies or listening to music, to stay motivated. Don''t be afraid to make mistakes—they are part of the learning process.',
    3,
    true
  ),
  (
    '4',
    'Build Better Sleep Routine',
    'Health',
    3,
    5,
    4,
    '+10.7K users',
    '[
      {"title":"Go to bed at a consistent time","selectedDays":[0,1,2,3,4,5,6],"reminderTime":"10:30 PM"},
      {"title":"Wake up at a consistent time","selectedDays":[0,1,2,3,4,5,6],"reminderTime":"06:30 AM"},
      {"title":"No screens 30 minutes before bed","selectedDays":[0,1,2,3,4,5,6],"reminderTime":"10:00 PM"},
      {"title":"Avoid caffeine after 2 PM","selectedDays":[0,1,2,3,4,5,6]},
      {"title":"Do a 5-minute wind-down routine","selectedDays":[0,1,2,3,4,5,6],"reminderTime":"10:15 PM"}
    ]'::jsonb,
    '[
      {"title":"Set your target sleep schedule","dueDate":"Today"},
      {"title":"Prepare bedroom for better sleep","dueDate":"This week"},
      {"title":"Track sleep for 14 days","dueDate":"Ongoing"},
      {"title":"Review and adjust routine","dueDate":"In 2 weeks","reminderTime":"08:00 PM"}
    ]'::jsonb,
    'Prioritize consistency over perfection. Small nightly habits improve sleep quality and daytime energy over time.',
    4,
    true
  ),
  (
    '5',
    'Read 20 Books This Year',
    'Learning',
    4,
    4,
    5,
    '+13.9K users',
    '[
      {"title":"Read 20 minutes daily","selectedDays":[0,1,2,3,4,5,6],"reminderTime":"09:00 PM"},
      {"title":"Highlight one key idea per session","selectedDays":[0,2,4,6]},
      {"title":"Write a 3-line summary","selectedDays":[1,3,5],"reminderTime":"09:30 PM"},
      {"title":"Plan next reading slot","selectedDays":[0,1,2,3,4,5,6]}
    ]'::jsonb,
    '[
      {"title":"Create your yearly reading list","dueDate":"Today"},
      {"title":"Finish your first book","dueDate":"This month"},
      {"title":"Join a reading community","dueDate":"Optional"},
      {"title":"Track progress monthly","dueDate":"Ongoing","reminderTime":"Last day 07:00 PM"},
      {"title":"Share one review per book","dueDate":"Ongoing"}
    ]'::jsonb,
    'Use short, focused sessions and track insights. Reading consistently is more effective than occasional long sessions.',
    5,
    true
  ),
  (
    '6',
    'Save Money for Emergency Fund',
    'Wealth',
    5,
    5,
    5,
    '+18.1K users',
    '[
      {"title":"Track every expense","selectedDays":[0,1,2,3,4,5,6],"reminderTime":"08:30 PM"},
      {"title":"Set a daily spending limit","selectedDays":[0,1,2,3,4,5,6]},
      {"title":"Transfer savings automatically","selectedDays":[0],"reminderTime":"09:00 AM"},
      {"title":"Review subscriptions","selectedDays":[6],"reminderTime":"11:00 AM"},
      {"title":"Pack lunch instead of buying out","selectedDays":[0,1,2,3,4]}
    ]'::jsonb,
    '[
      {"title":"Set emergency fund target amount","dueDate":"Today"},
      {"title":"Create monthly budget categories","dueDate":"This week"},
      {"title":"Automate weekly transfer","dueDate":"This week","reminderTime":"09:00 AM"},
      {"title":"Reach first $500 milestone","dueDate":"This month"},
      {"title":"Review progress every month","dueDate":"Ongoing","reminderTime":"1st day 08:00 PM"}
    ]'::jsonb,
    'Start with manageable targets and automate contributions. A steady system builds financial security without overwhelm.',
    6,
    true
  )
on conflict (id) do nothing;
