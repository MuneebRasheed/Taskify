# Debug Date Shift Issue - Complete Analysis

## Current Status
Still showing 1-day shift after all fixes applied.

## Let's Debug Step by Step

### Step 1: Verify Migration Ran Successfully

Run this in Supabase SQL Editor:
```sql
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'goals'
  AND column_name IN ('due_date', 'reminder_date')
ORDER BY column_name;
```

**Expected Result:**
```
column_name    | data_type | udt_name
---------------|-----------|----------
due_date       | date      | date
reminder_date  | date      | date
```

**If you see `timestamptz` or `timestamp with time zone`:**
- ❌ Migration did NOT run or failed
- → Go back and run migration again

---

### Step 2: Check What's Actually Stored in Database

Create a test goal with due date **June 10, 2026**, then run:

```sql
SELECT 
  id,
  title,
  due_date,
  reminder_date,
  pg_typeof(due_date) as due_date_type,
  pg_typeof(reminder_date) as reminder_date_type
FROM goals
ORDER BY created_at DESC
LIMIT 1;
```

**What to look for:**
- `due_date` should show: `2026-06-10` (NOT `2026-06-09`)
- `due_date_type` should show: `date`

**If you see `2026-06-09`:**
- ❌ Server code not running the updated version
- → Restart server

---

### Step 3: Check Server Logs

I added debug logging. After restarting server, create a test goal and check the server terminal output:

**Look for these lines:**
```
[goals] POST /goals — Date Debug:
  Received body.dueDate: <timestamp>
  Received body.reminderDate: <timestamp>
  Converted due_date: 2026-06-10
  Converted reminder_date: 2026-06-09
```

**Then when you reload:**
```
[goals] GET /goals — Date Debug for first goal:
  Raw due_date from DB: 2026-06-10
  Raw reminder_date from DB: 2026-06-09
  Converted dueDate: <timestamp>
  Converted reminderDate: <timestamp>
```

**Analysis:**
1. If "Converted due_date" shows June 9 → formatDateOnly() not working
2. If "Raw due_date from DB" shows June 9 → Database storing wrong date
3. If both show June 10 but app shows June 9 → Client-side display issue

---

### Step 4: Test the Helper Functions Directly

Add this test endpoint to your server temporarily:

```typescript
// Add to server/src/routes/goals.ts
router.get('/test-dates', async (req: Request, res: Response) => {
  const testTimestamp = 1781049600000; // June 10, 2026 00:00 PKT
  const testDate = new Date(testTimestamp);
  
  res.json({
    input: {
      timestamp: testTimestamp,
      dateObject: testDate.toString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    formatDateOnly: formatDateOnly(testDate),
    parseDateStringToTimestamp: parseDateStringToTimestamp('2026-06-10'),
    roundTrip: formatDateOnly(new Date(parseDateStringToTimestamp('2026-06-10'))),
  });
});
```

Then visit: `http://your-server/goals/test-dates`

**Expected:**
```json
{
  "input": {...},
  "formatDateOnly": "2026-06-10",
  "parseDateStringToTimestamp": 1781049600000,
  "roundTrip": "2026-06-10"
}
```

---

### Step 5: Check Client-Side Display

The issue might be in how the client displays the date, not how it's stored.

Check `src/context/GoalsContext.tsx` line 164-176:

```typescript
dueDate: g.dueDate != null ? new Date(g.dueDate) : null,
```

When the client receives timestamp from server, it creates a Date object. Check if the Date object is correct:

Add console.log in GoalsContext:
```typescript
console.log('Received from server:', g.dueDate);
console.log('Created Date object:', new Date(g.dueDate));
console.log('Display string:', new Date(g.dueDate).toLocaleDateString());
```

---

## Possible Root Causes

### Cause 1: Migration Not Run ✅ Easy to Fix
- **Symptom:** Column type is still `timestamptz`
- **Fix:** Run the migration in Supabase
- **Verify:** Step 1 above

### Cause 2: Server Not Restarted ✅ Easy to Fix
- **Symptom:** Old code still running
- **Fix:** Restart server: `npm run dev`
- **Verify:** Check server logs for debug output

### Cause 3: Using Old/Cached Goal Data ✅ Easy to Fix
- **Symptom:** Old goals show wrong date, new goals correct
- **Fix:** Create a brand NEW goal for testing
- **Verify:** Compare old vs new goal dates

### Cause 4: Server Timezone Issue ⚠️ Complex
- **Symptom:** formatDateOnly() producing wrong date
- **Check:** Server timezone setting
- **Debug:** Step 4 test endpoint

### Cause 5: Client Display Issue ⚠️ Complex
- **Symptom:** Database correct, server logs correct, but app shows wrong date
- **Check:** How client formats dates for display
- **Debug:** Step 5 client-side logging

### Cause 6: Database Timezone Setting ⚠️ Rare
- **Symptom:** Even with `date` type, PostgreSQL applying timezone
- **Check:** Database timezone setting
- **Query:**
  ```sql
  SHOW timezone;
  ```

---

## Action Plan

### Do This Now:

1. **Restart server with debug logging:**
   ```bash
   cd server
   # Stop current server
   npm run dev
   ```

2. **Run Step 1 query** (verify column types)

3. **Create NEW test goal** with due date June 10, 2026

4. **Check server terminal** - you should see debug logs

5. **Run Step 2 query** (check what's in database)

6. **Report back with:**
   - Column types from Step 1
   - Database value from Step 2
   - Server debug logs from terminal
   - What the app displays

---

## What to Send Me

Copy and paste:

1. **Column types:**
```
[Paste Step 1 query result]
```

2. **Database value:**
```
[Paste Step 2 query result]
```

3. **Server logs:**
```
[Paste the debug lines from terminal]
```

4. **App displays:**
```
I selected: June 10
App shows: [what you see]
```

With this info, I can pinpoint exactly where the issue is happening!
