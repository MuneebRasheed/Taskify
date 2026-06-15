-- Create notification logs table to track sent notifications and prevent duplicates
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id TEXT,
  item_id TEXT,
  notification_type TEXT NOT NULL, -- 'goal_reminder', 'goal_due', 'habit_reminder', 'task_due'
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'no_token'
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate notifications for same user/goal/item on same date
  CONSTRAINT unique_notification_per_day 
    UNIQUE(user_id, goal_id, item_id, notification_type, scheduled_date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_goal_id ON public.notification_logs(goal_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_item_id ON public.notification_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON public.notification_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_scheduled ON public.notification_logs(scheduled_date, scheduled_time);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.notification_logs TO service_role;
GRANT SELECT ON public.notification_logs TO authenticated;

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notification logs
DROP POLICY IF EXISTS notification_logs_select_own ON public.notification_logs;
CREATE POLICY notification_logs_select_own
  ON public.notification_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.notification_logs IS 'Tracks all sent push notifications to prevent duplicates and provide audit trail';
COMMENT ON COLUMN public.notification_logs.notification_type IS 'Types: goal_reminder (goal reminder date), goal_due (goal due date), habit_reminder (habit on selected days), task_due (task due date)';
COMMENT ON COLUMN public.notification_logs.status IS 'Status: sent (successfully sent), failed (send failed), no_token (user has no push token)';
