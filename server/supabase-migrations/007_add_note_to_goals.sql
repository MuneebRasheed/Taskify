-- Add note column to goals table
-- This allows storing goal-level notes in addition to item-level notes

ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS note text null;

-- Add comment to document the column
COMMENT ON COLUMN public.goals.note IS 'Optional note/description for the goal';
