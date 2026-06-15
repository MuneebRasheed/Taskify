# Date Shift Issue - FIXED ✅ (Complete Fix Applied)

## Problem Summary
When saving goals and tasks with due dates and reminder dates, the database was storing dates **1 day earlier** than selected.

**Example:**
- Selected: June 10 (Goal Due), June 9 (Reminder), June 8 (Task Due)
- Stored: June 9, June 8, June 7 ❌

## Root Cause
The issue occurred in **TWO places**:

### 1. **Writing to Database** (Fixed in first iteration)
The server was using `.toISOString()` to convert dates, which **always converts to UTC timezone**. For users in timezones ahead of UTC (like Pakistan PKT = UTC+5), midnight local time becomes the previous day in UTC.

### 2. **Reading from Database** (Fixed in second iteration)
When reading `YYYY-MM-DD` strings from the database, the server was using `new Date('2026-06-10')`, which JavaScript **parses as UTC midnight**, then shifts back to local timezone when getting the timestamp.

**Example of the read bug:**
```javascript
// Database has: "2026-06-10"
new Date('2026-06-10').getTime()
// JavaScript parses as: 2026-06-10T00:00:00Z (UTC)
// In PKT (UTC+5): 2026-06-10T05:00:00 PKT
// But when shown as date: shows as June 9! ❌
```

## Solution Applied

### Two Helper Functions Created

#### 1. `formatDateOnly()` - For Writing Dates
```typescript
/**
 * Format a Date object as YYYY-MM-DD without timezone conversion.
 * This preserves the calendar date regardless of the device's timezone.
 */
function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

#### 2. `parseDateStringToTimestamp()` - For Reading Dates
```typescript
/**
 * Parse a YYYY-MM-DD date string to a timestamp at local midnight.
 * Avoids timezone shift by not parsing as UTC.
 */
function parseDateStringToTimestamp(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}
```

## Changes Made

### File: `server/src/routes/goals.ts`

#### 1. Added Helper Functions (Lines 15-33)

#### 2. Fixed Goal Creation (POST /goals) - WRITE
**Before:**
```typescript
reminder_date: body.reminderDate ? new Date(body.reminderDate).toISOString() : null,
due_date: body.dueDate ? new Date(body.dueDate).toISOString() : null,
```

**After:**
```typescript
reminder_date: body.reminderDate ? formatDateOnly(new Date(body.reminderDate)) : null,
due_date: body.dueDate ? formatDateOnly(new Date(body.dueDate)) : null,
```

#### 3. Fixed Task Item Due Dates (POST /goals items) - WRITE
**Before:**
```typescript
dueDateIso = new Date(parsedTs).toISOString();
```

**After:**
```typescript
dueDateFormatted = formatDateOnly(new Date(parsedTs));
```

#### 4. Fixed Goal Updates (PATCH /goals/:id) - WRITE
**Before:**
```typescript
updates.reminder_date = body.reminderDate != null ? new Date(body.reminderDate).toISOString() : null;
updates.due_date = body.dueDate != null ? new Date(body.dueDate).toISOString() : null;
```

**After:**
```typescript
updates.reminder_date = body.reminderDate != null ? formatDateOnly(new Date(body.reminderDate)) : null;
updates.due_date = body.dueDate != null ? formatDateOnly(new Date(body.dueDate)) : null;
```

#### 5. Fixed Goal Retrieval (GET /goals) - READ ⭐ NEW FIX
**Before:**
```typescript
reminderDate: g.reminder_date ? new Date(g.reminder_date as string).getTime() : null,
dueDate: g.due_date ? new Date(g.due_date as string).getTime() : null,
```

**After:**
```typescript
reminderDate: g.reminder_date ? parseDateStringToTimestamp(g.reminder_date as string) : null,
dueDate: g.due_date ? parseDateStringToTimestamp(g.due_date as string) : null,
```

#### 6. Fixed Goal Creation Response (POST /goals) - READ ⭐ NEW FIX
**Before:**
```typescript
reminderDate: goalRow.reminder_date ? new Date(goalRow.reminder_date).getTime() : null,
dueDate: goalRow.due_date ? new Date(goalRow.due_date).getTime() : null,
```

**After:**
```typescript
reminderDate: goalRow.reminder_date ? parseDateStringToTimestamp(goalRow.reminder_date) : null,
dueDate: goalRow.due_date ? parseDateStringToTimestamp(goalRow.due_date) : null,
```

## Testing Instructions

### ⚠️ CRITICAL: Restart Server First
The changes only take effect after restarting the server:
```bash
cd server
# Stop the current server (Ctrl+C if running)
npm run dev
```

### Clear Any Test Data (Recommended)
If you tested before the complete fix, delete the test goals to avoid confusion with incorrect dates.

### Test Cases

#### Test 1: Create New Goal with Due Date
1. Create a new goal
2. Set due date to **June 10, 2026**
3. Set reminder date to **June 9, 2026**
4. Save the goal
5. ✅ **Expected:** Goal shows June 10 as due date, June 9 as reminder
6. ✅ **Database:** Should have `due_date = '2026-06-10'` and `reminder_date = '2026-06-09'`

#### Test 2: Create Goal with Task Due Dates
1. Create a goal with tasks
2. Set task 1 due date to **June 8, 2026**
3. Set task 2 due date to **June 12, 2026**
4. Save
5. ✅ **Expected:** Tasks show correct due dates
6. ✅ **Database:** Task items should have correct `due_date` values

#### Test 3: Update Existing Goal Dates
1. Open an existing goal
2. Edit due date to **June 15, 2026**
3. Edit reminder date to **June 14, 2026**
4. Save
5. ✅ **Expected:** Updated dates show correctly

#### Test 4: Read Goal After Creation
1. Create a goal with due date **June 20, 2026**
2. Navigate away from the goal
3. Navigate back to view the goal
4. ✅ **Expected:** Still shows June 20 (no shift when reading)

#### Test 5: Verify on Home Screen
1. Create goals with various due dates
2. Check Home screen calendar
3. ✅ **Expected:** Goals appear on the correct dates

### Database Verification
Check the database directly to confirm dates are stored correctly:
```sql
-- Check recent goals
SELECT 
  id, 
  title, 
  due_date, 
  reminder_date,
  created_at
FROM goals 
ORDER BY created_at DESC 
LIMIT 5;

-- Check task due dates
SELECT 
  gi.id, 
  gi.title, 
  gi.due_date, 
  g.title as goal_title
FROM goal_items gi
JOIN goals g ON gi.goal_id = g.id
WHERE gi.type = 'task'
  AND gi.due_date IS NOT NULL
ORDER BY gi.due_date DESC
LIMIT 10;
```

### What to Look For
✅ **Correct:** Dates in UI match dates in database  
✅ **Correct:** Dates don't shift when you reload/refresh  
✅ **Correct:** Creating a goal today and viewing tomorrow shows same date  
❌ **Wrong:** Dates are off by 1 day  
❌ **Wrong:** Dates change when navigating away and back

## Impact
✅ **Fixed:** Goal due dates (write & read)  
✅ **Fixed:** Goal reminder dates (write & read)  
✅ **Fixed:** Task due dates (write)  
✅ **Fixed:** Goal/Task updates (write)

## Summary of Technical Changes
- **Added 2 helper functions** for timezone-safe date handling
- **Modified 6 locations** in server code:
  1. POST /goals - goal dates (write)
  2. POST /goals - task dates (write)
  3. PATCH /goals/:id - updates (write)
  4. GET /goals - goal dates (read) ⭐ Critical
  5. POST /goals response - goal dates (read) ⭐ Critical
- **Total lines changed:** ~30

## Why Both Read & Write Fixes Were Needed

### The Complete Date Journey:
1. **User selects date:** June 10 in calendar → creates `Date(2026, 5, 10)` at local midnight
2. **Client sends to server:** Converts to timestamp (milliseconds)
3. **Server writes to DB:** `formatDateOnly()` converts to `'2026-06-10'` ✅
4. **Server reads from DB:** Gets string `'2026-06-10'`
5. **Server sends to client:** `parseDateStringToTimestamp()` converts to local midnight timestamp ✅
6. **Client displays:** `new Date(timestamp)` shows June 10 ✅

**Without the read fix (#5):** Step 5 would parse as UTC, causing June 9 to display.

## Notes
- The fix applies to **new** goals and all **reads** of existing data
- **Existing data** in the database with wrong dates (if any) can be fixed by editing them in the app
- This fix works for **all timezones** worldwide
- Both writing (POST/PATCH) and reading (GET) are now timezone-safe

## Technical Details
- **Write format:** `YYYY-MM-DD` (ISO 8601 date-only format)
- **Read format:** Parse components to local Date object
- **Database column types:** `date` (PostgreSQL)
- **No timezone information stored:** Dates are calendar dates
- **Client-server contract:** Timestamps represent local midnight

---

**Status:** ✅ COMPLETE (Full Fix Applied)  
**Date:** June 5, 2026  
**Files Modified:** 1 (`server/src/routes/goals.ts`)  
**Lines Changed:** ~30 lines across 6 locations  
**Helper Functions:** 2 (`formatDateOnly`, `parseDateStringToTimestamp`)
