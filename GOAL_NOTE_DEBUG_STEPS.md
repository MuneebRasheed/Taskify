# Goal Note Display Issue - Debug Steps

## Problem
Goal notes are saving to the database but not displaying in My Goals screen (showing DEFAULT_NOTE dummy text instead).

## Status
- ✅ Habit notes: Working correctly
- ✅ Task notes: Working correctly  
- ❌ Goal notes: Saving to DB but NOT displaying

## Debug Steps to Follow

### Step 1: Verify Database Migration
Run this SQL query in your Supabase SQL editor:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'goals' AND column_name = 'note';
```

Expected result: Should show the `note` column exists as `text` type.

### Step 2: Check Existing Goal Notes in Database
```sql
SELECT id, title, note, source, created_at 
FROM goals 
ORDER BY created_at DESC 
LIMIT 10;
```

This will show if notes are actually being saved. Old goals created before the migration won't have notes.

### Step 3: Restart Backend Server
```bash
cd server
npm run build
npm run dev
```

The backend must be restarted after code changes to pick up the new note field handling.

### Step 4: Clear React Native Cache and Restart
```bash
# Stop the current Metro bundler (Ctrl+C)
npm start -- --reset-cache
```

Then rebuild the app on your device/simulator.

### Step 5: Create a BRAND NEW Goal
**IMPORTANT:** You must create a completely new goal to test. Old goals won't have notes.

For AI-made goals:
1. Go to Home → Create AI-made goal
2. Enter a prompt (e.g., "Learn Spanish")
3. Add a note in the Note section
4. Continue through the flow and save

For Self-made goals:
1. Go to Home → Create Self-made goal
2. Enter goal title
3. Add a note in the Note section
4. Set up category, due date, etc.
5. Create the goal

### Step 6: Check Console Logs
After creating the goal and viewing it in My Goals, check the console for these logs:

**When creating the goal:**
```
[GoalsContext] addGoal called with: { title: "...", note: "...", source: "..." }
[GoalsContext] Created newGoal: { id: "...", note: "..." }
```

**When fetching goals:**
```
[GoalsContext] fetchGoals response — goalsCount: X
[GoalsContext] apiGoalToSavedGoal - Goal: ... Note: ...
```

**When viewing the goal:**
```
[MyGoalDetailScreen] displayGoal: { id: "...", note: "...", noteType: "string", ... }
```

### Step 7: Analyze the Logs

#### If note is NULL in addGoal:
The note is not being passed from the screen (AiMade, GoalPlanner, or PreMadeGoalDetail).
- Check `AiMade.tsx` line 652 (selfMadePayload)
- Check `GoalPlanner.tsx` line 265 (addGoal call)
- Check `PreMadeGoalDetailScreen.tsx` line 652 (addGoal call)

#### If note is present in addGoal but NULL in fetchGoals:
The backend is not saving or returning the note correctly.
- Check backend response in Network tab
- Verify `server/src/routes/goals.ts` POST and GET endpoints

#### If note is present in fetchGoals but NULL in MyGoalDetailScreen:
The note is being lost in the context or navigation.
- Check if the goal is being found correctly
- Check if `displayGoal.note` is accessible

#### If note is present in MyGoalDetailScreen logs but still shows DEFAULT_NOTE:
There's a rendering issue with the conditional logic.
- The condition `{displayGoal.note && displayGoal.note.trim() ? displayGoal.note : DEFAULT_NOTE}` should work
- Check if note is an empty string instead of null

## Expected Console Output for Working Flow

```
[GoalsContext] addGoal called with: {
  title: "Learn Spanish",
  source: "aiMade",
  note: "This is my goal note",
  noteType: "string",
  noteLength: 20
}

[GoalsContext] Created newGoal: {
  id: "goal-1234567890-1",
  title: "Learn Spanish",
  note: "This is my goal note",
  noteType: "string"
}

[GoalsContext] fetchGoals response — goalsCount: 5

[GoalsContext] apiGoalToSavedGoal - Goal: goal-1234567890-1 Title: Learn Spanish Note: This is my goal note Source: aiMade

[MyGoalDetailScreen] displayGoal: {
  id: "goal-1234567890-1",
  title: "Learn Spanish",
  note: "This is my goal note",
  noteType: "string",
  noteLength: 20,
  source: "aiMade"
}
```

## Common Issues

### Issue 1: Empty String vs Null
If the note is an empty string `""` instead of `null`, the trim check will fail.

**Fix:** Ensure all screens pass `note.trim() || null` instead of just `note`.

### Issue 2: Old Goals
Goals created before the migration won't have notes in the database.

**Fix:** Only test with newly created goals.

### Issue 3: Backend Not Restarted
If the backend wasn't rebuilt and restarted, it won't handle the note field.

**Fix:** Always restart backend after code changes.

### Issue 4: Cache Issues
React Native might be using cached code that doesn't include note handling.

**Fix:** Clear cache with `npm start -- --reset-cache`.

## Files Modified

1. `server/supabase-migrations/007_add_note_to_goals.sql` - Added note column
2. `server/src/routes/goals.ts` - Added note to POST and GET endpoints
3. `src/context/GoalsContext.tsx` - Added note to SavedGoal interface and handling
4. `src/lib/api/goalsApi.ts` - Added note to API types
5. `src/screens/MyGoalDetailScreen.tsx` - Display note with fallback to DEFAULT_NOTE
6. `src/screens/GoalPlanner.tsx` - Pass note when creating goals
7. `src/screens/AiMade.tsx` - Pass note in selfMadePayload
8. `src/screens/PreMadeGoalDetailScreen.tsx` - Pass note when creating goals

## Next Steps

1. Follow the debug steps above in order
2. Share the console logs from Step 6
3. Share the database query results from Steps 1 and 2
4. Based on the logs, we can identify exactly where the note is being lost
