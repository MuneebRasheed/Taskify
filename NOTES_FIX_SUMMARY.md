# Notes Fix Summary

## Problem
Notes added to goals, habits, and tasks were **NOT being saved to the database** and **NOT being displayed** in the goal detail screen.

## Root Causes Identified

### 1. Missing `note` column in `goals` table
- ✅ `goal_items` table HAD a `note` column (for habits and tasks)
- ❌ `goals` table DID NOT have a `note` column (for the goal itself)

### 2. Goal-level notes not passed through the flow
- `GoalPlanner.tsx` captured note from route params but never sent it to `addGoal()`
- `SavedGoal` interface didn't have a `note` field
- API payload types didn't include `note` at the goal level

### 3. Goal detail screen showed hardcoded note
- `MyGoalDetailScreen.tsx` displayed a hardcoded `DEFAULT_NOTE` constant
- Never showed the actual goal note from the database

### 4. Item-level notes not being saved
- Notes were captured in UI but not passed when creating goal items
- Missing `note` field when mapping habits and tasks to `GoalItem[]`

---

## Changes Implemented

### 1. Database Schema ✅
**File:** `server/supabase-migrations/007_add_note_to_goals.sql`
```sql
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS note text null;
```

### 2. TypeScript Interfaces ✅

**File:** `src/context/GoalsContext.tsx`
- Added `note?: string | null;` to `SavedGoal` interface
- Updated `addGoal()` to include note in API call
- Updated `apiGoalToSavedGoal()` to map note from API response
- Updated `restoreGoal()` to include note when restoring

**File:** `src/lib/api/goalsApi.ts`
- Added `note?: string | null;` to `GoalsPayload` type
- Added `note?: string | null;` to `createGoal()` body parameter

### 3. Goal Creation Screens ✅

**File:** `src/screens/GoalPlanner.tsx`
- Added `note: note.trim() || null` when calling `addGoal()`
- Added `note: habit.note ?? undefined` when mapping habits
- Added `note: task.note ?? undefined` when mapping tasks

**File:** `src/screens/PreMadeGoalDetailScreen.tsx`
- Added `note: preMadeGoal.note ?? null` when creating pre-made goals
- Added `note: selfMadePayload.note ?? null` when creating self-made goals
- Added `note: h.note ?? undefined` when mapping habits
- Added `note: t.note ?? undefined` when mapping tasks

### 4. Goal Display Screen ✅

**File:** `src/screens/MyGoalDetailScreen.tsx`
- Changed from `{DEFAULT_NOTE}` to `{displayGoal.note || DEFAULT_NOTE}`
- Now displays actual goal note from database, with fallback to default

---

## How to Apply the Fix

### Step 1: Run Database Migration
Execute the SQL migration in your Supabase SQL Editor:
```bash
# Navigate to Supabase dashboard → SQL Editor
# Run the file: server/supabase-migrations/007_add_note_to_goals.sql
```

Or run directly:
```sql
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS note text null;
```

### Step 2: Restart Your App
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### Step 3: Test the Fix
1. Create a new goal with a note
2. Add habits with notes
3. Add tasks with notes
4. Save the goal
5. Open the goal detail screen
6. Verify:
   - Goal note is displayed (not the hardcoded text)
   - Habit notes are saved (check database)
   - Task notes are saved (check database)

---

## Expected Results After Fix

### ✅ Goal Notes
- Saved to `goals.note` column in database
- Displayed in goal detail screen
- Persists across app restarts

### ✅ Habit Notes
- Saved to `goal_items.note` column in database
- Accessible in habit detail screen
- Can be edited and updated

### ✅ Task Notes
- Saved to `goal_items.note` column in database
- Accessible in task detail screen
- Can be edited and updated

### ✅ Notes Travel with Goals
- When duplicating goals
- When sharing goals
- When restoring deleted goals

---

## Database Verification

After applying the fix, verify in Supabase:

```sql
-- Check goals table has note column
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'goals' AND column_name = 'note';

-- Check goal_items table has note column (should already exist)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'goal_items' AND column_name = 'note';

-- View goals with notes
SELECT id, title, note FROM goals WHERE note IS NOT NULL;

-- View goal items with notes
SELECT id, goal_id, type, title, note FROM goal_items WHERE note IS NOT NULL;
```

---

## Files Modified

1. ✅ `server/supabase-migrations/007_add_note_to_goals.sql` (NEW)
2. ✅ `src/context/GoalsContext.tsx`
3. ✅ `src/lib/api/goalsApi.ts`
4. ✅ `src/screens/GoalPlanner.tsx`
5. ✅ `src/screens/PreMadeGoalDetailScreen.tsx`
6. ✅ `src/screens/MyGoalDetailScreen.tsx`

---

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Create a new goal with a note → Note saves to database
- [ ] Create a habit with a note → Note saves to database
- [ ] Create a task with a note → Note saves to database
- [ ] View goal detail screen → Goal note displays correctly
- [ ] Edit habit → Habit note displays in detail screen
- [ ] Edit task → Task note displays in detail screen
- [ ] Delete and restore goal → Notes are preserved
- [ ] App restart → Notes persist

---

## Notes

- The fix is **backward compatible** - existing goals without notes will show the default note
- The `note` column is nullable, so it's optional
- All note fields use `text` type for unlimited length
- Notes are trimmed before saving (empty strings become null)
