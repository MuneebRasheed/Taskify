-- Add optional goal-level reminder fields
alter table if exists public.goals
add column if not exists reminder_date timestamptz null;

alter table if exists public.goals
add column if not exists reminder_time text null;
