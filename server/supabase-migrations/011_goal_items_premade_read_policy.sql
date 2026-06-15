-- Allow authenticated users to read goal_items that belong to shared pre-made templates.
-- This is needed because pre-made templates are public, and their habits/tasks now come
-- from goal_items instead of JSON fields on pre_made_goals.

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'goal_items'
      and policyname = 'goal_items_select_premade_templates'
  ) then
    create policy goal_items_select_premade_templates
      on public.goal_items
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.pre_made_goals pm
          where pm.id = goal_items.goal_id
            and pm.is_active = true
        )
      );
  end if;
end $$;
