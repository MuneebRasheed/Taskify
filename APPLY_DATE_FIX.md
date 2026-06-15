# Apply Date Fix - Complete Guide

## Problem
Goal and task dates are being stored 1 day earlier due to timezone conversion issues.

**Example:**
- Select: June 10
- Stored: June 9 ❌

## Root Cause
The `goals.due_date` and `goals.reminder_date` columns use `timestamptz` (timestamp with timezone) type, which causes PostgreSQL to perform timezone conversions. For calendar dates, we need the `date` type instead.

## Solution Overview
1. ✅ Server code already updated (formatDateOnly, parseDateStringToTimestamp functions)
2. ⏳ Database schema needs update (change column types)
3. ⏳ Run migration
4. ⏳ Test

---

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your Taskify project
4. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Migration

1. Click **New Query** button
2. Copy the entire content from:
   ```
   server/supabase-migrations/016_fix_date_column_types.sql
   ```

3. Paste it into the SQL Editor

4. Click **Run** button

5. ✅ You should see: "Success. No rows returned"

### Step 3: Verify the Changes

Run this query to verify the column types were changed:

```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'goals'
  AND column_name IN ('due_date', 'reminder_date')
ORDER BY column_name;
```

**Expected Result:**
```
column_name    | data_type | is_nullable
---------------|-----------|------------
due_date       | date      | YES
reminder_date  | date      | YES
```

✅ Both should show `date` type (NOT `timestamp with time zone`)

### Step 4: Restart Your Server

```bash
cd server
# Stop current server (Ctrl+C if running)
npm run dev
```

### Step 5: Test the Fix

#### Test 1: Create New Goal
1. Open your app
2. Create a new goal
3. Set due date: **June 10, 2026**
4. Set reminder date: **June 9, 2026**
5. Save the goal
6. Navigate away and come back
7. ✅ **Expected:** Should still show June 10 and June 9

#### Test 2: Verify in Database
Run this query in Supabase SQL Editor:

```sql
SELECT 
  title,
  due_date,
  reminder_date,
  created_at
FROM goals
ORDER BY created_at DESC
LIMIT 5;
```

✅ **Expected:** Dates should match what you selected in the app

#### Test 3: Create Goal with Tasks
1. Create a goal with tasks
2. Set task due dates
3. Save and verify tasks show correct dates

#### Test 4: Update Existing Goal
1. Edit an existing goal
2. Change due date to a new date
3. Save and verify it's stored correctly

---

## What This Migration Does

### Before (Broken):
```
Column Type: timestamptz (timestamp with time zone)
Stored Value: "2026-06-10 00:00:00+00" (UTC)
User in PKT sees: June 9 ❌
```

### After (Fixed):
```
Column Type: date
Stored Value: "2026-06-10"
User in PKT sees: June 10 ✅
User in USA sees: June 10 ✅
Everyone sees: June 10 ✅
```

---

## Existing Data

### Will existing goals be affected?

**YES - They will be automatically fixed!**

The migration uses `USING due_date::date` which means:
- Existing `timestamptz` values are converted to `date` type
- The date portion is extracted and stored
- Example: `"2026-06-10 00:00:00+00"` becomes `"2026-06-10"`

### Do I need to manually update old goals?

**NO - The migration handles it automatically.**

However, if some goals have the wrong date stored (from before the fix), you can:
1. Edit them in the app
2. Change the date to the correct one
3. Save - they'll be stored correctly now

---

## Rollback (If Needed)

If you need to rollback this migration for any reason:

```sql
-- Rollback: Change back to timestamptz (NOT RECOMMENDED)
ALTER TABLE public.goals 
  ALTER COLUMN due_date TYPE timestamptz USING due_date::timestamptz;

ALTER TABLE public.goals 
  ALTER COLUMN reminder_date TYPE timestamptz USING reminder_date::timestamptz;
```

---

## Troubleshooting

### Issue: Migration fails with "column does not exist"

**Solution:** The column might have a different name. Check with:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'goals';
```

### Issue: Still seeing date shifts after migration

**Checklist:**
1. ✅ Migration ran successfully?
2. ✅ Server restarted?
3. ✅ Testing with NEW goal (not old data)?
4. ✅ Column type is `date` (not timestamptz)?

Run the verification query from Step 3 to confirm.

### Issue: App crashes after migration

**Likely Cause:** Server not restarted or old server code running.

**Solution:** 
```bash
# Kill any running server processes
killall node

# Start fresh
cd server
npm run dev
```

---

## Files Changed

### Migration File (NEW):
- `server/supabase-migrations/016_fix_date_column_types.sql`

### Server Code (Already Updated):
- `server/src/routes/goals.ts`
  - Added `formatDateOnly()` function
  - Added `parseDateStringToTimestamp()` function
  - Updated all date handling

### No Client Changes Needed:
- Client code already sends dates correctly
- No React Native changes required

---

## Success Criteria

✅ **Fixed When:**
- Select June 10 → Stores June 10 → Shows June 10
- Select June 9 → Stores June 9 → Shows June 9
- Works for all users regardless of timezone
- Dates don't shift when navigating away and back

❌ **Still Broken If:**
- Select June 10 → Shows June 9
- Dates change when reloading the app
- Different users see different dates

---

## Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Verify all steps were completed
3. Check server logs for errors
4. Verify database column types

---

**Status:** Ready to Apply  
**Migration File:** `server/supabase-migrations/016_fix_date_column_types.sql`  
**Estimated Time:** 5 minutes  
**Risk:** Low (automatically converts existing data)  
**Reversible:** Yes (rollback query provided)
