-- Taskify auth/profile schema for new Supabase projects
-- Run this after 004_goals_schema.sql in Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  password_reset_otp text,
  password_reset_otp_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep `updated_at` fresh for app/server updates.
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at_timestamp();

-- Backfill missing columns for projects that already had a minimal `profiles` table.
alter table public.profiles
  add column if not exists email text,
  add column if not exists expo_push_token text,
  add column if not exists password_reset_otp text,
  add column if not exists password_reset_otp_expires_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Auto-create a profile row when a new auth user is created.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, created_at, updated_at)
  values (new.id, new.email, now(), now())
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

-- Ensure existing auth users also have profile rows.
insert into public.profiles (id, email, created_at, updated_at)
select u.id, u.email, now(), now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- Row-level security for client-side profile reads/writes.
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_expo_push_token on public.profiles(expo_push_token);
