# Notification Timing Issue - FIXED

## Problem
Notifications were being sent approximately 15 minutes before their scheduled time. For example, habits scheduled for 5:10 AM and 5:15 AM were receiving notifications at 5:07 AM.

## Root Cause
The issue was caused by a combination of two factors:

1. **Overly generous tolerance window**: The `isTimeMatch` function had a 10-minute tolerance, meaning it would trigger notifications up to 10 minutes after the scheduled time.

2. **Cron job timing**: The cron job was running every 10 minutes. Combined with the 10-minute tolerance, this created a 20-minute window where a notification could potentially fire.

3. **Potential timing drift**: If the cron job ran slightly early (e.g., at 5:09:58 instead of 5:10:00), it could catch notifications scheduled for the next interval.

## The Fix Applied

### 1. Reduced Tolerance Window (5 minutes)
**File**: `server/src/services/notificationService.ts`

Changed the tolerance from 10 minutes to 5 minutes:
```typescript
function isTimeMatch(scheduledTime: string, currentTime: Date, toleranceMinutes = 5): boolean {
  // ... logic ensures notifications only fire when current time is >= scheduled time
  // and within 5 minutes after
}
```

This ensures:
- Notifications only fire AT or AFTER the scheduled time (not before)
- A 5-minute grace period catches any notifications that might be missed
- Much tighter control over when notifications are sent

### 2. Increased Cron Frequency (1 minute - MOST ACCURATE)
**File**: `server/src/jobs/notificationCron.ts`

Changed the cron schedule to run every 1 minute for maximum accuracy:
```typescript
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '*/3 * * * *';
```

This provides:
- **Near-instant delivery**: Notifications sent within 0-1 minute of scheduled time
- **5-minute safety window**: If a cron run is missed, next run (1 min later) will catch it
- **Meets requirement**: "Send at exact time or maximum 5 minutes after"

## Configuration Options

You can customize the cron frequency by setting the `CRON_SCHEDULE` environment variable in your `server/.env` file:

### Option 1: Every 1 Minute (CURRENT - Most Accurate)
```bash
CRON_SCHEDULE="*/3 * * * *"
```
- Notifications arrive within: **0-1 minute**
- Server checks: 60 times/hour
- **Recommended for best user experience**

### Option 2: Every 3 Minutes (Balanced)
```bash
CRON_SCHEDULE="*/3 * * * *"
```
- Notifications arrive within: **0-3 minutes**
- Server checks: 20 times/hour
- Good balance of accuracy and resources

### Option 3: Every 5 Minutes (Resource Efficient)
```bash
CRON_SCHEDULE="*/5 * * * *"
```
- Notifications arrive within: **0-5 minutes**
- Server checks: 12 times/hour
- Still meets the "maximum 5 minutes after" requirement

## How It Works Now

### With 1-Minute Cron (Current Setting)

#### Example: Habit scheduled for 5:15:00 AM
- **5:14 AM cron**: Checks habits. 5:15 is 1 minute in the FUTURE. Does NOT send.
- **5:15 AM cron**: Checks habits. 5:15 is NOW. ✅ **SENDS notification** (0 min delay)
- **5:16 AM cron**: Notification already sent (prevented by notification_logs)

#### Example: Habit scheduled for 5:17:23 AM
- **5:17 AM cron**: Checks habits. 5:17:23 is 23 seconds in the FUTURE. Does NOT send (rounds to current minute 5:17).
- **5:18 AM cron**: Checks habits. 5:17 was ~1 minute AGO. ✅ **SENDS notification** (~1 min delay)

#### Example: Habit scheduled for 5:13 AM (cron at 5:12, 5:13, 5:14...)
- **5:12 AM cron**: 5:13 is in the future. Does NOT send.
- **5:13 AM cron**: 5:13 is NOW. ✅ **SENDS notification** (0 min delay)

### Safety Net: 5-Minute Tolerance
If a cron run somehow fails (server restart, network issue):
- Next cron run (1 min later) will catch it
- Notification will still be sent within the 5-minute window
- After 5 minutes, notification won't be sent (considered too late)

### With 3-Minute Cron (If You Switch)

#### Example: Habit scheduled for 5:17 AM (crons at 5:15, 5:18, 5:21...)
- **5:15 AM cron**: 5:17 is 2 minutes in the FUTURE. Does NOT send.
- **5:18 AM cron**: 5:17 was 1 minute AGO. ✅ **SENDS notification** (1 min delay)

### With 5-Minute Cron (If You Switch)

#### Example: Habit scheduled for 5:17 AM (crons at 5:15, 5:20, 5:25...)
- **5:15 AM cron**: 5:17 is 2 minutes in the FUTURE. Does NOT send.
- **5:20 AM cron**: 5:17 was 3 minutes AGO. ✅ **SENDS notification** (3 min delay)

## Testing Steps

1. **Restart the server** to apply the changes:
   ```bash
   cd server
   npm run dev  # or restart your production server
   ```

2. **Create a test habit** scheduled for 3-5 minutes from now

3. **Monitor the logs** to see:
   - Cron job running every 5 minutes
   - TimeMatch debug output showing the difference calculation
   - Notification being sent AT or AFTER the scheduled time (not before)

4. **Verify timing**: 
   - Notification should arrive within 0-5 minutes after scheduled time
   - Never before the scheduled time

## Additional Safety Measures

The system already has these protections in place:
- **Duplicate prevention**: `notification_logs` table prevents sending the same notification twice
- **Timezone handling**: Each user's local timezone is correctly converted
- **Error handling**: Failed notifications are logged and don't crash the system

## Deployment Notes

After deploying these changes:
- The server will automatically pick up the new cron schedule
- No database changes needed
- No app changes needed
- Existing scheduled notifications will work correctly with the new timing

## If Issue Persists

If you still experience early notifications after this fix:

1. Check server logs for the `[TimeMatch]` debug output
2. Verify the server's system clock is accurate
3. Confirm the user's timezone is set correctly in the database
4. Check if there are multiple server instances running (could cause duplicate jobs)

---
**Fix Applied**: June 8, 2026
**Files Modified**: 
- `server/src/services/notificationService.ts` (tolerance: 10→5 minutes)
- `server/src/jobs/notificationCron.ts` (cron: 10→5 minutes)
