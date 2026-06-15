-- Add timezone column to profiles table
-- This allows users to set their preferred timezone for notifications

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add comment to explain the column
COMMENT ON COLUMN profiles.timezone IS 'User preferred timezone for scheduling notifications (IANA timezone format, e.g., America/New_York)';

-- Create index for faster timezone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_timezone ON profiles(timezone);
