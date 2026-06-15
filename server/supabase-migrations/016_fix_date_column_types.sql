-- Fix date column types to prevent timezone shifts
-- Changes due_date and reminder_date from timestamptz to date type
-- This ensures calendar dates are stored without timezone conversion

-- Change goals.due_date from timestamptz to date
-- The USING clause converts existing timestamptz values to date
ALTER TABLE public.goals 
  ALTER COLUMN due_date TYPE date USING due_date::date;

-- Change goals.reminder_date from timestamptz to date
-- The USING clause converts existing timestamptz values to date
ALTER TABLE public.goals 
  ALTER COLUMN reminder_date TYPE date USING reminder_date::date;

-- Note: goal_items.due_date is already text type (no change needed)
-- Text type works fine for task due dates as they're stored as strings

-- After this migration:
-- - Goal due dates will be stored as YYYY-MM-DD without timezone
-- - Goal reminder dates will be stored as YYYY-MM-DD without timezone
-- - No more 1-day shifts when users select dates!
