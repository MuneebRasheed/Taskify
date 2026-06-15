# Notification Timing Settings - Quick Reference

## Current Settings (Resource Efficient - Recommended)

✅ **Cron Frequency**: Every **5 minutes**  
✅ **Tolerance**: **5 minutes**  
✅ **Result**: Notifications sent within **0-5 minutes** of scheduled time

This meets your requirement: *"Send notification at exact time or maximum 5 minutes after"* while being very light on server resources (only 12 checks per hour vs 60).

---

## How to Change Settings

### Method 1: Environment Variable (Recommended)
Add to `server/.env`:
```bash
CRON_SCHEDULE="*/3 * * * *"  # Every 1 minute (current)
```

### Method 2: Directly in Code
Edit `server/src/jobs/notificationCron.ts`:
```typescript
const CRON_SCHEDULE = '*/3 * * * *';  // Change this value
```

---

## Available Cron Schedules

| Schedule | Frequency | Notification Delay | Server Load | Recommended For |
|----------|-----------|-------------------|-------------|-----------------|
| `*/1 * * * *` | Every 1 min | **0-1 min** ⭐ | High | **Best accuracy** |
| `*/2 * * * *` | Every 2 min | 0-2 min | Medium-High | Great accuracy |
| `*/3 * * * *` | Every 3 min | 0-3 min | Medium | Balanced |
| `*/5 * * * *` | Every 5 min | 0-5 min | Low | Resource efficient |
| `*/10 * * * *` | Every 10 min | 0-10 min ⚠️ | Very Low | **Not recommended** |

---

## Understanding the Timing Logic

### The Formula
```
Notification sends when:
  (Current Time - Scheduled Time) >= 0 AND <= 5 minutes
```

### Example Timeline (1-minute cron)

```
5:10:00 - Habit scheduled for 5:15
          Cron runs: Current < Scheduled → NO SEND

5:15:00 - Cron runs: Current = Scheduled → ✅ SEND (0 min delay)

5:16:00 - Cron runs: Already sent → SKIP (logged in database)
```

### Example Timeline (3-minute cron)

```
5:10:00 - Habit scheduled for 5:15
          Cron runs at 5:12: Current < Scheduled → NO SEND

5:15:00 - (No cron this minute)

5:15:00 - Cron runs at 5:15: Current = Scheduled → ✅ SEND (0 min delay)

5:18:00 - (If somehow missed) Cron: Within tolerance → Would send
```

---

## Performance Considerations

### 1-Minute Cron (Current)
- **Checks per hour**: 60
- **Checks per day**: 1,440
- **Impact**: Minimal for modern servers
- **Recommended**: Unless you have thousands of users

### 3-Minute Cron
- **Checks per hour**: 20
- **Checks per day**: 480
- **Impact**: Very low
- **Recommended**: For high-traffic apps

### 5-Minute Cron
- **Checks per hour**: 12
- **Checks per day**: 288
- **Impact**: Negligible
- **Recommended**: For very high-traffic or limited resources

---

## Tolerance Setting

Current: **5 minutes**

### When to Change Tolerance

**Increase to 10 minutes:**
```typescript
// In notificationService.ts
function isTimeMatch(scheduledTime: string, currentTime: Date, toleranceMinutes = 10)
```
- Use if: Server might be unreliable, frequent restarts
- Trade-off: Notifications can arrive up to 10 minutes late

**Decrease to 3 minutes:**
```typescript
function isTimeMatch(scheduledTime: string, currentTime: Date, toleranceMinutes = 3)
```
- Use if: You want stricter timing (notifications expire after 3 min)
- Trade-off: Missed notifications if server has issues

**Decrease to 1 minute:**
```typescript
function isTimeMatch(scheduledTime: string, currentTime: Date, toleranceMinutes = 1)
```
- Use if: Using 1-minute cron AND want exact timing only
- Trade-off: No safety net if a cron run is missed
- **Not recommended** unless you have very reliable infrastructure

---

## Recommended Combinations

### For Your Use Case (0-5 min delay max)

**Option A: Best Accuracy (CURRENT)**
- Cron: `*/3 * * * *`
- Tolerance: `5 minutes`
- Result: 0-1 min delay, 5 min safety net ⭐

**Option B: Balanced**
- Cron: `*/3 * * * *`
- Tolerance: `5 minutes`
- Result: 0-3 min delay, 5 min safety net

**Option C: Resource Efficient**
- Cron: `*/5 * * * *`
- Tolerance: `5 minutes`
- Result: 0-5 min delay, 5 min safety net

---

## Testing Your Settings

### 1. Check Current Cron Schedule
Look at server logs on startup:
```
[Cron] Notification cron job scheduled: */3 * * * *
```

### 2. Test a Notification
1. Create a habit for 2 minutes from now
2. Watch server logs for:
   ```
   [Cron] ========== Notification Job Started ==========
   [TimeMatch] Scheduled: 05:15 AM, Current: 5:15, Diff: 0 min, Match: true
   [Notification] 📱 Attempting to send...
   [Notification] ✅ Notification sent successfully!
   ```

### 3. Verify Timing
- Note when notification was scheduled
- Note when notification arrived on device
- Difference should match your cron frequency (1-5 minutes)

---

## Troubleshooting

### Notifications still arriving early?
1. Check tolerance setting in `notificationService.ts`
2. Verify server system clock is accurate: `date`
3. Check user timezone in database

### Notifications arriving late?
1. Increase cron frequency (decrease minutes)
2. Check server load during notification time
3. Verify cron is running: Look for logs every 1/3/5 minutes

### No notifications at all?
1. Check push token is registered
2. Verify cron job is running (check logs)
3. Check notification_logs table for errors

---

## Summary

**Current optimal setup for "0-5 minutes max delay" (Resource Efficient):**

✅ Cron runs every **5 minutes**  
✅ Tolerance window: **5 minutes**  
✅ Result: Notifications arrive within **0-5 minutes** (with 5-min safety net)  
✅ Server load: **Very low** (only 12 checks per hour)

**To change**: Update `CRON_SCHEDULE` in `server/.env` or `server/src/jobs/notificationCron.ts`

---

**Last Updated**: June 8, 2026
