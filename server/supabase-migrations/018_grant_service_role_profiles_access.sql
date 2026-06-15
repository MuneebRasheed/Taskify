-- Grant service_role access to profiles table for notification system
-- This allows the notification cron job to query users with push tokens

-- Grant necessary permissions to service_role
GRANT SELECT ON public.profiles TO service_role;

-- Also ensure service_role can read goals and goal_items for notifications
GRANT SELECT ON public.goals TO service_role;
GRANT SELECT ON public.goal_items TO service_role;

-- Grant permissions for notification_logs sequence (for INSERT)
GRANT USAGE, SELECT ON SEQUENCE public.notification_logs_id_seq TO service_role;

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with push tokens and timezone info. Service role needs SELECT access for notification cron job.';
