# 🚀 EXECUTE THESE MIGRATIONS NOW

## ⚠️ IMPORTANT: Run these in Supabase SQL Editor

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project
2. Click **SQL Editor** in left sidebar
3. Click **New Query**

---

### Step 2: Run Migration 021 (Add UTC Columns)

**Copy and paste this entire content:**

```sql
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
```

**Click "RUN" or press Ctrl+Enter**

✅ **Expected:** "Success. No rows returned"

---

### Step 3: Run Migration 022 (Create Notifications Table)

**Copy and paste this entire content:**

```sql
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
```

**Click "RUN" or press Ctrl+Enter**

✅ **Expected:** "Success. No rows returned"

---

### Step 4: Verify Migrations

**Run this query to verify:**

```sql
-- Check goals table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'goals' 
  AND column_name IN ('reminder_utc', 'reminder_timezone');

-- Check upcoming_notifications table exists
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_name = 'upcoming_notifications';

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'upcoming_notifications';
```

**Expected Result:**
- 2 rows for goals columns (reminder_utc, reminder_timezone)
- 1 for table_exists
- 6 rows for indexes

---

## ✅ Migration Complete!

Once both migrations run successfully, proceed with:

1. **Deploy Backend Code**
   ```bash
   cd server
   npm install
   npm run build
   npm start
   ```

2. **Backfill Existing Data** (if you have existing goals)
   ```bash
   npm run backfill-notifications
   ```

3. **Verify Everything Works**
   ```bash
   npm run verify-timezone-fix
   ```

---

## 🆘 Troubleshooting

### Error: "column already exists"
- ✅ **Safe to ignore** - column was already added
- Or drop and re-add: `ALTER TABLE goals DROP COLUMN IF EXISTS reminder_utc;`

### Error: "table already exists"
- ✅ **Safe to ignore** - table was already created
- Or drop and recreate: `DROP TABLE IF EXISTS upcoming_notifications CASCADE;`

### Error: "permission denied"
- Make sure you're running as superuser or database owner
- Check you're in the correct Supabase project

---

## 📋 Next Steps After Migrations

1. ✅ Migrations complete
2. ⏳ Deploy backend code
3. ⏳ Run backfill script (if needed)
4. ⏳ Test notification creation
5. ⏳ Test timezone change
6. ⏳ Monitor cron job logs

See `TIMEZONE_FIX_QUICK_START.md` for complete deployment guide.

---

**Status:** Ready to execute migrations now! 🚀
