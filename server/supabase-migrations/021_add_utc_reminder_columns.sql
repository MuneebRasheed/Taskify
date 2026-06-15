-- Add UTC reminder columns for proper timezone handling
-- This migration adds new columns to store reminder times in UTC for consistent notifications

-- 1. Add UTC reminder column to goals table
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS reminder_utc TIMESTAMPTZ;

-- 2. Add timezone reference to goals (for display purposes)
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS reminder_timezone TEXT;

-- 3. Add timezone reference to goal_items (for habits and tasks)
ALTER TABLE goal_items
ADD COLUMN IF NOT EXISTS reminder_timezone TEXT;

-- 4. Create index for efficient UTC time lookups
CREATE INDEX IF NOT EXISTS idx_goals_reminder_utc ON goals(reminder_utc) WHERE reminder_utc IS NOT NULL;

-- 5. Add comments for documentation
COMMENT ON COLUMN goals.reminder_utc IS 'Reminder date/time in UTC for consistent notifications across timezones. Calculated from reminder_date, reminder_time, and user timezone.';
COMMENT ON COLUMN goals.reminder_timezone IS 'Original timezone when reminder was set (for display and recalculation purposes)';
COMMENT ON COLUMN goal_items.reminder_timezone IS 'Original timezone when reminder was set (for habits/tasks)';

-- 6. For existing data, we'll need to backfill in application code
-- since we need user timezone information to convert properly
COMMENT ON TABLE goals IS 'Goals table - reminder_utc should be populated by application when reminder_date and reminder_time are set';
