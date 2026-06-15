-- Update existing Asia/Karachi timezone entries
-- Note: We keep the timezone value as 'Asia/Karachi' because that's the official IANA identifier
-- The app will display it as 'Islamabad (Pakistan)' in the UI

-- This migration doesn't change any data because Asia/Karachi is the correct IANA timezone
-- identifier for all of Pakistan including Islamabad.
-- The display label is handled in the frontend code.

-- Add a comment to document this
COMMENT ON COLUMN profiles.timezone IS 'User preferred timezone for scheduling notifications (IANA timezone format). Asia/Karachi is used for Pakistan (includes Islamabad, Karachi, Lahore, etc.)';

-- Optional: If you want to see which users are using Pakistan timezone
-- SELECT id, email, timezone FROM profiles WHERE timezone = 'Asia/Karachi';
