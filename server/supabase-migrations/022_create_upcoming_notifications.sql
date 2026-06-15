-- Create upcoming_notifications table for pre-generated notification schedules
-- This allows efficient notification checks and handles timezone changes

CREATE TABLE IF NOT EXISTS upcoming_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id TEXT NOT NULL,
  item_id TEXT, -- NULL for goal reminders, populated for habits/tasks
  notification_type TEXT NOT NULL CHECK (notification_type IN ('goal_reminder', 'goal_due', 'habit_reminder', 'task_due')),
  scheduled_utc TIMESTAMPTZ NOT NULL,
  scheduled_date TEXT NOT NULL, -- YYYY-MM-DD in user's timezone (for display)
  scheduled_time TEXT NOT NULL, -- HH:MM AM/PM in user's timezone (for display)
  timezone TEXT NOT NULL, -- User's timezone when scheduled
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_upcoming_notifications_user_id ON upcoming_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_upcoming_notifications_goal_id ON upcoming_notifications(goal_id);
CREATE INDEX IF NOT EXISTS idx_upcoming_notifications_item_id ON upcoming_notifications(item_id) WHERE item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_upcoming_notifications_scheduled_utc ON upcoming_notifications(scheduled_utc) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_upcoming_notifications_status ON upcoming_notifications(status);

-- Compound index for cron job queries (most important!)
CREATE INDEX IF NOT EXISTS idx_upcoming_notifications_pending_utc 
ON upcoming_notifications(status, scheduled_utc) 
WHERE status = 'pending';

-- Enable RLS
ALTER TABLE upcoming_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own upcoming notifications"
ON upcoming_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own upcoming notifications"
ON upcoming_notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own upcoming notifications"
ON upcoming_notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own upcoming notifications"
ON upcoming_notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant service role full access for cron job
GRANT ALL ON upcoming_notifications TO service_role;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION set_upcoming_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_upcoming_notifications_updated_at ON upcoming_notifications;
CREATE TRIGGER update_upcoming_notifications_updated_at
BEFORE UPDATE ON upcoming_notifications
FOR EACH ROW
EXECUTE FUNCTION set_upcoming_notifications_updated_at();

-- Add comments
COMMENT ON TABLE upcoming_notifications IS 'Pre-generated notification schedules in UTC for efficient cron job processing. Recalculated when user changes timezone.';
COMMENT ON COLUMN upcoming_notifications.scheduled_utc IS 'Exact UTC timestamp when notification should be sent';
COMMENT ON COLUMN upcoming_notifications.scheduled_date IS 'Date in user timezone (for display and logging)';
COMMENT ON COLUMN upcoming_notifications.scheduled_time IS 'Time in user timezone (for display and logging)';
COMMENT ON COLUMN upcoming_notifications.timezone IS 'User timezone when this notification was scheduled';
