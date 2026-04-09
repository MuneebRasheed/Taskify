-- Fix client read permissions for pre_made_goals.
-- Required when table was created outside migration flow or grants were not applied.

grant usage on schema public to anon, authenticated;
grant select on table public.pre_made_goals to anon, authenticated;

alter table public.pre_made_goals enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'pre_made_goals'
      and policyname = 'pre_made_goals_read_all_anon_auth'
  ) then
    create policy pre_made_goals_read_all_anon_auth
      on public.pre_made_goals
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;
