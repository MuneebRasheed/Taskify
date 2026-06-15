# Timezone Issue Analysis - Task Due Date Validation

## The Problem Flow

### 1. Frontend Creates Date (User's Local Timezone)
User in timezone: **Asia/Kolkata (UTC+5:30)** selects Feb 10, 2026

```javascript
// In PreMadeGoalDetailScreen.tsx or date picker
const dueDate = new Date(2026, 1, 10); // Feb 10, 2026 in LOCAL timezone
// This represents: Feb 10, 2026 00:00:00 in Asia/Kolkata (UTC+5:30)
```

### 2. Frontend Sends to Backend
```javascript
// In GoalsContext.tsx line 260
dueDate: goal.dueDate.getTime()  // Converts to Unix timestamp (milliseconds)
// Returns: 1770777600000 (represents Feb 9, 2026 18:30:00 UTC)
```

### 3. Backend Receives and Formats
```javascript
// In goals.ts line 209
due_date: body.dueDate ? formatDateOnly(new Date(body.dueDate)) : null

// formatDateOnly function (line 17):
function formatDateOnly(date: Date): string {
  const year = date.getFullYear();      // Uses SERVER's timezone!
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

**KEY ISSUE**: When `new Date(1770777600000)` is called on the server:
- The timestamp represents an absolute point in time: Feb 9, 2026 18:30:00 UTC
- But `getDate()`, `getMonth()`, `getFullYear()` return values in the **SERVER's local timezone**
- If server is in UTC: extracts Feb 9, 2026 (NOT Feb 10!)
- If server is in UTC+5:30: extracts Feb 10, 2026 (correct by accident)

### 4. The Mismatch

**Scenario A: User in UTC+5:30, Server in UTC** ⚠️
```
User picks: Feb 10, 2026 00:00 (local)
↓
Timestamp sent: 1770777600000 (Feb 9, 2026 18:30 UTC)
↓
Server receives timestamp
↓
new Date(1770777600000) in UTC timezone = Feb 9, 2026 18:30 UTC
↓
formatDateOnly() extracts: "2026-02-09" ❌ (Lost a day!)
```

**Scenario B: User in UTC-5, Server in UTC** ⚠️
```
User picks: Feb 10, 2026 00:00 (local)
↓
Timestamp sent: 1770838800000 (Feb 10, 2026 05:00 UTC)
↓
Server receives timestamp
↓
new Date(1770838800000) in UTC timezone = Feb 10, 2026 05:00 UTC
↓
formatDateOnly() extracts: "2026-02-10" ✓ (Works by chance)
```

### 5. Task Due Date Processing

When tasks have `dueDate: "2026-02-10"` (string format):

```javascript
// Backend line 241
const raw = String(it.dueDate);  // "2026-02-10"
const parsedTs = Date.parse(raw); // Parses as 2026-02-10T00:00:00Z (UTC!)
dueDateFormatted = formatDateOnly(new Date(parsedTs));
```

**Another Timezone Problem**:
- `Date.parse("2026-02-10")` interprets as UTC midnight
- If server is in UTC-5, `new Date(parsedTs)` = Feb 9, 2026 19:00 local
- `formatDateOnly()` extracts: "2026-02-09" ❌

### 6. Validation Failure

```javascript
Goal due date:    User picks Feb 10 → Timestamp → Server formats → "2026-02-09" 
Task due date:    String "2026-02-10" → Date.parse → Server formats → "2026-02-10" or "2026-02-09"

Validation: if (dueDateFormatted > goalRow.due_date)
            if ("2026-02-10" > "2026-02-09")  → TRUE
            → Throws error: "Task due date cannot be after the goal due date" ❌
```

## The Root Cause

**Calendar dates (date-only values) should NEVER go through timezone conversions!**

When a user picks "February 10, 2026", they mean the **calendar date**, not a specific moment in time. But the current flow:

1. ✅ User picks calendar date: Feb 10, 2026
2. ❌ Frontend converts to timestamp in local timezone
3. ❌ Timestamp sent to backend (absolute UTC time)
4. ❌ Backend interprets timestamp in server's timezone
5. ❌ Result: Calendar date shifts by ±1 day!

## Why String Comparison Failed Too

My previous "fix" using string comparison didn't address the root cause:
- Goal's `due_date` was ALREADY wrong in the database ("2026-02-09" instead of "2026-02-10")
- Task's `dueDate` was being parsed incorrectly too
- Comparing two wrong dates doesn't fix the underlying problem!

## Correct Solution Approaches (DO NOT IMPLEMENT YET)

### Option 1: Send Dates as YYYY-MM-DD Strings ⭐ (RECOMMENDED)
Format dates in the frontend before sending to backend.

**Pros:**
- No timezone conversions
- Preserves calendar date exactly
- Backend receives ready-to-store values
- Minimal backend changes

**Cons:**
- Need to change all date sending code

**Implementation:**
```javascript
// Add helper in GoalsContext.tsx
function formatDateForAPI(date: Date | null): string | null {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Use when sending to API
dueDate: formatDateForAPI(goal.dueDate),
reminderDate: formatDateForAPI(goal.reminderDate),

// Backend receives string directly
due_date: body.dueDate,  // Already "2026-02-10"
```

### Option 2: Always Use UTC Methods
Force everything to use UTC throughout.

**Pros:**
- Consistent timezone handling
- No date shifts

**Cons:**
- More changes required on both frontend and backend
- User's local date picker still creates local dates
- Need to convert everywhere

**Implementation:**
```javascript
// Frontend - when creating timestamp
dueDate: goal.dueDate ? Date.UTC(
  goal.dueDate.getFullYear(),
  goal.dueDate.getMonth(),
  goal.dueDate.getDate()
) : null

// Backend - use UTC methods
function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

### Option 3: Store Timestamps, Fix Parsing
Keep timestamps but fix how they're parsed.

**Pros:**
- Minimal changes

**Cons:**
- Still mixing concepts (timestamps for calendar dates)
- Complex to maintain
- Error-prone

## Recommended Approach: Option 1

**Send formatted date strings from frontend to backend.**

### Why This is Best:
1. ✅ Calendar dates stay as calendar dates
2. ✅ No timezone conversions at all
3. ✅ Matches how task due dates are already handled
4. ✅ Easy to understand and maintain
5. ✅ Backend validation becomes trivial (string comparison)

### Changes Required:

#### 1. Frontend: GoalsContext.tsx
```javascript
// Add helper function at top
function formatDateForAPI(date: Date | null): string | null {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Change in addGoal (line ~260):
dueDate: formatDateForAPI(goal.dueDate),
reminderDate: formatDateForAPI(goal.reminderDate),

// Change in restoreGoal (similar)
// Change in updateGoalDetails (similar)
```

#### 2. Frontend: Task Due Date Handling
Tasks already use string format, but ensure consistency:
```javascript
// In PreMadeGoalDetailScreen, tasks should have:
dueDate: t.dueDate ?? formatDateForAPI(goalDueDate)
```

#### 3. Backend: goals.ts
```javascript
// Line ~209 - Remove formatDateOnly conversion
due_date: body.dueDate,  // Already a string "2026-02-10" or null
reminder_date: body.reminderDate,  // Already a string or null

// Add validation
if (body.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)) {
  res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  return;
}

// Line ~241 - Remove Date.parse conversion for tasks
dueDateFormatted = String(it.dueDate);  // Already "2026-02-10"

// Validation becomes simple string comparison
if (type === 'task' && goalRow.due_date && dueDateFormatted) {
  if (dueDateFormatted > goalRow.due_date) {
    throw new Error('Task due date cannot be after the goal due date');
  }
}
```

#### 4. Backend: Reading from Database
The `GET /goals` endpoint needs to return strings, not timestamps:
```javascript
// Line ~147 - Remove parseDateStringToTimestamp
dueDate: g.due_date,  // Return as string "2026-02-10"
reminderDate: g.reminder_date,  // Return as string "2026-02-10"
```

#### 5. Frontend: GoalsContext - Receiving from API
```javascript
// In apiGoalToSavedGoal function
dueDate: g.dueDate ? new Date(g.dueDate + 'T00:00:00') : null,
reminderDate: g.reminderDate ? new Date(g.reminderDate + 'T00:00:00') : null,
```
Adding `T00:00:00` ensures it's parsed as local midnight, not UTC.

## Testing Strategy

### Test Case 1: Goal Creation
```
User timezone: UTC+5:30
Picks date: Feb 10, 2026
Expected in DB: "2026-02-10"
Expected on retrieval: Feb 10, 2026 (local)
```

### Test Case 2: Task Validation
```
Goal due date: Feb 10, 2026 → "2026-02-10"
Task due date: Feb 10, 2026 → "2026-02-10"
Expected: ✅ Passes validation (equal dates)

Task due date: Feb 11, 2026 → "2026-02-11"
Expected: ❌ Fails validation (after goal date)
```

### Test Case 3: Cross-Timezone
```
User creates goal in UTC+5:30: Feb 10
Backend stores: "2026-02-10"
User views in UTC-5: Should still show Feb 10
```

## Impact Areas to Review:

### High Priority:
- ✅ Goal creation (addGoal)
- ✅ Goal restoration (restoreGoal)
- ✅ Goal updates (updateGoalDetails)
- ✅ Task due date validation
- ✅ API date transmission (createGoal, updateGoal)

### Medium Priority:
- Date display in UI (already handles Date objects)
- Calendar functionality
- Reminder scheduling
- Date filtering/sorting

### Low Priority:
- Date formatting for display
- Relative date calculations ("3 days ago")
- Achievement date tracking
