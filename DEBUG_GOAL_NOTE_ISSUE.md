# 🔍 Debug: Goal Note Not Showing

## Issue
Goal notes are saving to DB but showing dummy text in My Goals screen.

## Root Cause Analysis

The code is correct:
- ✅ Backend fetches note: `note: g.note ?? null`
- ✅ Frontend displays note: `{displayGoal.note && displayGoal.note.trim() ? displayGoal.note : DEFAULT_NOTE}`

**Possible causes:**
1. Database migration not run
2. Testing with old goals (created before migration)
3. Backend not restarted after code changes
4. App cache not cleared

---

## Step-by-Step Debug

### Step 1: Verify Database Has Note Column

Run this in Supabase SQL Editor:

```sql
-- Check if note column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'goals' AND column_name = 'note';
```

**Expected Result:**
```
column_name | data_type | is_nullable
note        | text      | YES
```

**If column doesn't exist:**
```sql
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS note text null;
```

### Step 2: Check If Your Goal Has Note in Database

```sql
-- Replace 'New goals 02' with your actual goal title
SELECT id, title, note, source, created_at 
FROM goals 
WHERE title = 'New goals 02';
```

**What to look for:**
- If `note` column doesn't appear → Migration not run (go to Step 1)
- If `note` is `NULL` → Goal was created before fix or note wasn't saved
- If `note` has your text → Backend issue or frontend cache issue

### Step 3: Check Backend Logs

When you open the goal in My Goals, check backend console for:

```
[goals] GET /goals — request received
[goals] GET /goals — user id: xxx
[goals] GET /goals — goals count: X goalIds: [...]
[goals] GET /goals — success: goals= X itemCompletions keys= Y
```

**Add this to see the actual note value:**

In `server/src/routes/goals.ts`, after line 137, add:
```typescript
note: g.note ?? null,
```

Change to:
```typescript
note: (() => {
  console.log('[goals] GET /goals — goal:', g.id, 'note:', g.note);
  return g.note ?? null;
})(),
```

### Step 4: Check Frontend Logs

In React Native console, look for:
```
[MyGoalDetailScreen] displayGoal: goal-xxx note: your note text
```

**What it means:**
- If note is `null` → Backend not returning note
- If note is empty string `""` → Note saved as empty
- If note shows your text → UI rendering issue

### Step 5: Force Refresh

```bash
# Stop everything
# Kill backend server (Ctrl+C)
# Kill React Native (Ctrl+C)

# Rebuild backend
cd server
rm -rf dist
npm run build

# Start backend
npm run dev

# In new terminal, clear app cache
cd ..
rm -rf node_modules/.cache
npm start -- --reset-cache
```

---

## Quick Test

### Create a Brand New Goal

1. **Create new goal with unique title:**
   - Title: "Test Goal Debug 001"
   - Note: "This is my debug test note"
   - Add 1 habit
   - Add 1 task
   - Save

2. **Check database immediately:**
```sql
SELECT id, title, note, created_at 
FROM goals 
WHERE title = 'Test Goal Debug 001';
```

**Expected:** note = "This is my debug test note"

3. **Open goal in My Goals**
   - Should show "This is my debug test note"
   - If shows dummy text → Check console logs

---

## Common Issues & Solutions

### Issue 1: "column 'note' does not exist" in backend logs
**Solution:** Run database migration
```sql
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS note text null;
```
Then restart backend.

### Issue 2: Note is NULL in database
**Cause:** Goal was created before the fix
**Solution:** 
- Delete the old goal
- Create a NEW goal after all fixes applied
- Or manually update:
```sql
UPDATE goals 
SET note = 'Your note text here' 
WHERE id = 'your-goal-id';
```

### Issue 3: Note shows in database but not in app
**Cause:** App cache or backend not restarted
**Solution:**
```bash
# Restart backend
cd server
npm run build
npm run dev

# Clear app cache
npm start -- --reset-cache
```

### Issue 4: Note shows in console log but not in UI
**Cause:** UI rendering issue
**Solution:** Check if note is empty string
```typescript
// In MyGoalDetailScreen.tsx, the fix is already applied:
{displayGoal.note && displayGoal.note.trim() ? displayGoal.note : DEFAULT_NOTE}
```

---

## Verification Checklist

- [ ] Database migration run (note column exists)
- [ ] Backend rebuilt (`npm run build`)
- [ ] Backend restarted (`npm run dev`)
- [ ] Backend shows no errors
- [ ] App cache cleared (`npm start -- --reset-cache`)
- [ ] Created BRAND NEW goal (not old one)
- [ ] Goal note saved to database (verified with SQL)
- [ ] Backend log shows note value
- [ ] Frontend log shows note value
- [ ] UI displays note (not dummy text)

---

## If Still Not Working

### Check Backend Response

Add this temporary debug code in `src/context/GoalsContext.tsx` after line where goals are fetched:

```typescript
// Around line 150, after setGoals
setGoals(data.goals.map(apiGoalToSavedGoal));
console.log('[GoalsContext] Goals loaded:', data.goals.map(g => ({ 
  id: g.id, 
  title: g.title, 
  note: g.note 
})));
```

This will show you exactly what the backend is returning.

### Check Goal Object Structure

Add this in `MyGoalDetailScreen.tsx` after displayGoal is defined:

```typescript
const displayGoal = goal || deletedGoalRef.current?.goal;
console.log('[MyGoalDetailScreen] Full goal object:', JSON.stringify(displayGoal, null, 2));
```

This will show you the complete goal structure.

---

## Expected Flow

1. User creates goal with note
2. Frontend sends note to backend
3. Backend saves note to `goals.note` column
4. Backend returns goal with note
5. Frontend stores goal in context
6. MyGoalDetailScreen displays note

**If any step fails, the note won't show.**

---

## Contact Points

Check these files if debugging:

1. **Database:** `goals` table, `note` column
2. **Backend API:** `server/src/routes/goals.ts` line 137
3. **Frontend Context:** `src/context/GoalsContext.tsx` line ~150
4. **Display Screen:** `src/screens/MyGoalDetailScreen.tsx` line ~395

---

**Next Steps:**
1. Run Step 1 (verify database)
2. Run Step 2 (check your specific goal)
3. If note is NULL, create a new goal
4. If note exists but not showing, check logs (Steps 3-4)
