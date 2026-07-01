-- Grant service_role UPDATE access to profiles table
-- Required for PATCH /profile/timezone which uses the service role client
-- Migration 018 only granted SELECT, which caused timezone updates to fail with 500

GRANT SELECT, INSERT, UPDATE ON public.profiles TO service_role;

COMMENT ON TABLE public.profiles IS 'User profiles with push tokens and timezone info. Service role needs SELECT/INSERT/UPDATE for notification cron job and timezone updates.';
