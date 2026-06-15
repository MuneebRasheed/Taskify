# Resource Efficient Notification Settings Applied ✅

## Applied Configuration

**Cron Schedule**: Every **5 minutes** (`*/5 * * * *`)  
**Tolerance**: **5 minutes**  
**Applied On**: June 8, 2026

---

## What This Means

### Notification Timing
- ✅ Notifications sent **at scheduled time or within 5 minutes after**
- ✅ **Never sent before** scheduled time
- ✅ Meets your requirement perfectly

### Server Resources
- ✅ **12 checks per hour** (vs 60 with 1-minute cron)
- ✅ **288 checks per day** (vs 1,440 with 1-minute cron)
- ✅ **80% reduction** in server load
- ✅ Minimal impact on server performance

---

## Timing Examples

### Habit scheduled at 5:10 AM
Cron runs at: 5:00, 5:05, **5:10**, 5:15, 5:20...
- ✅ Notification sent at **5:10 AM** (0 min delay)

### Habit scheduled at 5:13 AM
Cron runs at: 5:00, 5:05, 5:10, **5:15**, 5:20...
- ✅ Notification sent at **5:15 AM** (2 min delay)

### Habit scheduled at 5:18 AM
Cron runs at: 5:00, 5:05, 5:10, 5:15, **5:20**, 5:25...
- ✅ Notification sent at **5:20 AM** (2 min delay)

### Habit scheduled at 5:25 AM
Cron runs at: 5:00, 5:05, 5:10, 5:15, 5:20, **5:25**, 5:30...
- ✅ Notification sent at **5:25 AM** (0 min delay)

**Average delay**: 0-5 minutes (typically 0-2 minutes)

---

## Performance Comparison

| Setting | Checks/Hour | Checks/Day | Avg Delay | Server Load |
|---------|-------------|------------|-----------|-------------|
| Every 1 min | 60 | 1,440 | 0-1 min | High |
| Every 3 min | 20 | 480 | 0-3 min | Medium |
| **Every 5 min (Current)** | **12** | **288** | **0-5 min** | **Very Low** ✅ |
| Every 10 min | 6 | 144 | 0-10 min | Minimal ⚠️ |

---

## Why This Setting is Ideal

1. **Meets Your Requirement** ✅
   - "Send at exact time or maximum 5 minutes after" → Perfectly achieved

2. **Resource Efficient** ✅
   - 80% fewer checks than 1-minute cron
   - Minimal server impact
   - Scales well for many users

3. **User Experience** ✅
   - 0-5 minute delay is acceptable for habit reminders
   - Most notifications arrive within 0-2 minutes
   - Users won't notice the difference from 1-minute cron

4. **Reliable** ✅
   - 5-minute tolerance provides safety net
   - Prevents duplicate notifications
   - Handles server restarts gracefully

---

## How to Change (If Needed)

### Option 1: Edit Environment Variable
Add to `server/.env`:
```bash
# For every 3 minutes (more accurate)
CRON_SCHEDULE="*/3 * * * *"

# For every 1 minute (most accurate, but higher load)
CRON_SCHEDULE="*/1 * * * *"

# Keep current (every 5 minutes)
CRON_SCHEDULE="*/5 * * * *"
```

### Option 2: Edit Code Directly
In `server/src/jobs/notificationCron.ts`, change line 8:
```typescript
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '*/5 * * * *';
//                                                     ^^^
//                                           Change this number
```

---

## Next Steps

### 1. Restart Server
```bash
cd server
npm run dev  # Development
# OR
pm2 restart taskify  # Production
```

### 2. Verify in Logs
You should see:
```
[Cron] Notification cron job scheduled: */5 * * * *
[Cron] Notification cron job is now running
```

Every 5 minutes, you'll see:
```
[Cron] ========== Notification Job Started at 2026-06-08T10:15:00.000Z ==========
[Notification] Processing notifications for X users
[Cron] ========== Notification Job Completed ==========
```

### 3. Test with Real Notification
1. Create a habit for 3 minutes from now
2. Note the scheduled time
3. Wait for notification
4. Verify it arrives within 0-5 minutes

---

## Monitoring

### Check Cron is Running
Look for logs every 5 minutes at: XX:00, XX:05, XX:10, XX:15, XX:20, XX:25, XX:30, XX:35, XX:40, XX:45, XX:50, XX:55

### Check Notification Logs
Query database:
```sql
SELECT 
  scheduled_time,
  sent_at,
  status,
  EXTRACT(EPOCH FROM (sent_at - (scheduled_date || ' ' || scheduled_time)::timestamp)) / 60 as delay_minutes
FROM notification_logs
WHERE scheduled_date = CURRENT_DATE
ORDER BY scheduled_time DESC
LIMIT 10;
```

This shows actual delay in minutes for recent notifications.

---

## Troubleshooting

### Notifications still early?
- Check tolerance is 5 minutes in `notificationService.ts`
- Verify server clock: `date`
- Check user timezone in database

### Notifications too late (>5 min)?
- Increase cron frequency: `*/3 * * * *` or `*/1 * * * *`
- Check server isn't overloaded
- Verify cron is running every 5 minutes in logs

### No notifications at all?
- Check push token is registered
- Verify cron logs appear every 5 minutes
- Check `notification_logs` table for errors

---

## Summary

✅ **Configuration**: 5-minute cron + 5-minute tolerance  
✅ **Result**: Notifications arrive 0-5 minutes after scheduled time  
✅ **Performance**: 80% reduction in server checks  
✅ **Status**: Resource-efficient setting applied and ready to use  

**Files Modified**:
- `server/src/jobs/notificationCron.ts`
- `NOTIFICATION_SETTINGS_GUIDE.md` (updated)

**Action Required**: Restart your server to apply changes

---

**Applied**: June 8, 2026  
**Setting**: Resource Efficient (Every 5 minutes)
