-- Fix RLS policies for profiles table to allow expo_push_token updates
-- This ensures authenticated users can update their own push tokens

-- Drop existing policies to recreate them
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Recreate policies with explicit permissions
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Verify RLS is enabled
alter table public.profiles enable row level security;

-- Grant necessary permissions to authenticated users
grant select, insert, update on public.profiles to authenticated;

-- Verify the index exists for expo_push_token
create index if not exists idx_profiles_expo_push_token on public.profiles(expo_push_token);
