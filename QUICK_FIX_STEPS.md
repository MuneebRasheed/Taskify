# Quick Fix Steps - Date Shift Issue

## 🚀 Apply Fix in 3 Steps (5 minutes)

### Step 1: Run Migration in Supabase
1. Go to Supabase Dashboard → SQL Editor
2. Open file: `server/supabase-migrations/016_fix_date_column_types.sql`
3. Copy entire content
4. Paste in SQL Editor
5. Click **Run**
6. ✅ Should see "Success. No rows returned"

### Step 2: Restart Server
```bash
cd server
npm run dev
```

### Step 3: Test
1. Create new goal with due date June 10
2. Navigate away and back
3. ✅ Should still show June 10 (not June 9)

---

## ✅ Verify It Worked

Run this in Supabase SQL Editor:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'goals'
  AND column_name IN ('due_date', 'reminder_date');
```

**Expected:**
- `due_date` → `date`
- `reminder_date` → `date`

---

## 📋 What Changed

### Files:
- ✅ `server/src/routes/goals.ts` - Already updated (code fix)
- ✅ `server/supabase-migrations/016_fix_date_column_types.sql` - NEW migration

### Database:
- Changed `goals.due_date` from `timestamptz` → `date`
- Changed `goals.reminder_date` from `timestamptz` → `date`

### Result:
- No more timezone conversion
- Calendar dates stay as selected
- Works for all timezones worldwide

---

## 🐛 If Still Not Working

1. **Verify column types changed:**
   ```sql
   \d goals
   ```
   Look for `due_date` and `reminder_date` - should be `date` type

2. **Check server is using new code:**
   - Restart server again
   - Check server logs for errors

3. **Test with NEW goal:**
   - Don't test with old goals (they have old data)
   - Create fresh goal after migration

4. **Clear app cache:**
   - Close and reopen the app
   - Or clear app data/cache

---

## 📖 Full Documentation

See `APPLY_DATE_FIX.md` for detailed instructions and troubleshooting.
