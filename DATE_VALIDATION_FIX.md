# Date Validation Fix - Task Due Date Error

## Issue
When creating goals from AI-made or pre-made templates, users were receiving the error:
```
WARN [GoalsContext] createGoal failed: Task due date cannot be after the goal due date
```

## Root Cause
The issue had two parts:

### 1. Timezone Issues in Date Comparison (Backend)
In `server/src/routes/goals.ts`, the date validation was creating `Date` objects from YYYY-MM-DD strings:

```typescript
const goalDueDate = new Date(goalRow.due_date);  // "2026-02-10"
const taskDueDate = new Date(dueDateFormatted);  // "2026-02-10"
```

When JavaScript parses a date string like `"2026-02-10"`, it interprets it as **UTC midnight**. Depending on the user's timezone, this could represent a different local calendar date.

For example, in UTC-5 timezone:
- `new Date("2026-02-10")` = Feb 10, 2026 00:00:00 UTC = **Feb 9, 2026 19:00:00 local**

This caused incorrect date comparisons where the task date appeared to be "after" the goal date even when they were the same.

### 2. ISO String Conversion (Frontend)
In `PreMadeGoalDetailScreen.tsx`, when tasks didn't have explicit due dates, they were falling back to:

```typescript
dueDate: t.dueDate ?? dueDate.toISOString()
```

This produced full ISO timestamps like `"2026-02-10T00:00:00.000Z"` instead of simple date strings, which could introduce additional timezone-related issues.

## Solution

### Backend Changes (`server/src/routes/goals.ts`)
**Changed date validation to compare YYYY-MM-DD strings directly** instead of creating Date objects:

```typescript
// Before
if (type === 'task' && goalRow.due_date && dueDateFormatted) {
  const goalDueDate = new Date(goalRow.due_date);
  const taskDueDate = new Date(dueDateFormatted);
  if (taskDueDate.getTime() > goalDueDate.getTime()) {
    throw new Error('Task due date cannot be after the goal due date');
  }
}

// After
if (type === 'task' && goalRow.due_date && dueDateFormatted) {
  if (dueDateFormatted > goalRow.due_date) {
    throw new Error('Task due date cannot be after the goal due date');
  }
}
```

Since both dates are already in `YYYY-MM-DD` format, string comparison works correctly and avoids timezone issues.

Applied the same fix to the PATCH endpoint for updating goal items.

### Frontend Changes (`PreMadeGoalDetailScreen.tsx`)
**Changed to format dates as YYYY-MM-DD** instead of using ISO strings:

```typescript
// Before
dueDate: t.dueDate ?? dueDate.toISOString()

// After
let taskDueDate: string | undefined;
if (t.dueDate) {
  taskDueDate = t.dueDate;
} else if (dueDate) {
  const year = dueDate.getFullYear();
  const month = String(dueDate.getMonth() + 1).padStart(2, '0');
  const day = String(dueDate.getDate()).padStart(2, '0');
  taskDueDate = `${year}-${month}-${day}`;
}
return { ...item, dueDate: taskDueDate };
```

This ensures task dates are formatted consistently with the goal's due date format.

## Files Modified
1. `/Users/unknown001/Desktop/projects/Taskify/server/src/routes/goals.ts`
   - Line ~248-256: POST /goals endpoint validation
   - Line ~395-403: PATCH /goals/:goalId/items/:itemId endpoint validation

2. `/Users/unknown001/Desktop/projects/Taskify/src/screens/PreMadeGoalDetailScreen.tsx`
   - Line ~430-450: handleAddGoal task mapping

## Testing
After these changes:
1. Create goals from pre-made templates - should work without date validation errors
2. Create goals from AI-made suggestions - should work without date validation errors
3. Verify that tasks with explicit future due dates (after goal due date) are still correctly rejected
4. Test across different timezones to ensure consistency

## Technical Notes
- YYYY-MM-DD string comparison works lexicographically because the format ensures proper ordering
- Example: `"2026-02-15" > "2026-02-10"` returns `true` correctly
- This approach avoids all timezone-related Date parsing issues
- The fix maintains the same validation logic but uses a timezone-safe comparison method
