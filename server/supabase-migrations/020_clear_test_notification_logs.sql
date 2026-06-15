-- OPTIONAL: Clear notification logs for testing
-- Run this ONLY if you want to re-test notifications that already fired today

-- Clear all notification logs for today (for testing purposes)
-- DELETE FROM public.notification_logs 
-- WHERE scheduled_date = CURRENT_DATE;

-- Or clear for a specific user and date
-- DELETE FROM public.notification_logs 
-- WHERE user_id = 'be823b20-17e6-492a-a7d2-1477e0a5e71e' 
-- AND scheduled_date = '2026-06-05';

-- Or view all notifications sent today
SELECT 
  notification_type,
  scheduled_date,
  scheduled_time,
  sent_at,
  status
FROM public.notification_logs 
WHERE scheduled_date = CURRENT_DATE
ORDER BY sent_at DESC;
