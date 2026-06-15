-- Stop deleting goal_items automatically when a goal is deleted.
-- Keep the relationship, but set goal_id to NULL instead of cascading delete.

do $$
declare
  fk_name text;
begin
  select c.conname
  into fk_name
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where c.contype = 'f'
    and n.nspname = 'public'
    and t.relname = 'goal_items'
    and c.confrelid = 'public.goals'::regclass
  limit 1;

  if fk_name is not null then
    execute format('alter table public.goal_items drop constraint %I', fk_name);
  end if;
end $$;

alter table public.goal_items
  alter column goal_id drop not null;

alter table public.goal_items
  add constraint goal_items_goal_id_fkey
  foreign key (goal_id)
  references public.goals(id)
  on delete set null;
