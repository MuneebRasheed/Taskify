-- Add optional category to user-created goals
alter table if exists public.goals
add column if not exists category text null;
