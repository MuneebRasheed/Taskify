-- Fix notification_logs unique constraint to include scheduled_time
-- This allows multiple notifications for the same item on the same day at different times

-- Drop the old constraint that only checked date
ALTER TABLE public.notification_logs 
DROP CONSTRAINT IF EXISTS unique_notification_per_day;

-- Add new constraint that includes scheduled_time
-- This allows multiple notifications at different times on the same day
ALTER TABLE public.notification_logs
ADD CONSTRAINT unique_notification_per_datetime 
UNIQUE(user_id, goal_id, item_id, notification_type, scheduled_date, scheduled_time);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT unique_notification_per_datetime ON public.notification_logs IS 
'Prevents duplicate notifications for the same user/goal/item at the same date AND time. Multiple notifications at different times on the same day are allowed (e.g., habit at 9AM and 5PM).';
