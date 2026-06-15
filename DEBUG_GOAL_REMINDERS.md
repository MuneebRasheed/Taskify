# Debug Goal Reminders - Run These Queries

## 1. Check if goals have reminder data

Run in Supabase SQL Editor:

```sql
SELECT 
  id,
  title,
  reminder_date,
  reminder_time,
  reminder_utc,
  reminder_timezone,
  source,
  created_at
FROM goals
WHERE reminder_date IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:** You should see goals with:
- `reminder_date`: YYYY-MM-DD format
- `reminder_time`: "HH:MM AM/PM" format  
- `reminder_utc`: ISO timestamp (e.g., "2026-06-09T16:00:00Z")
- `reminder_timezone`: Your timezone (e.g., "Asia/Karachi")

**If reminder_utc is NULL:** The UTC conversion failed during creation.

---

## 2. Check upcoming_notifications for goal reminders

```sql
SELECT 
  id,
  goal_id,
  notification_type,
  scheduled_utc,
  scheduled_date,
  scheduled_time,
  timezone,
  status,
  created_at
FROM upcoming_notifications
WHERE notification_type = 'goal_reminder'
  AND status = 'pending'
ORDER BY scheduled_utc
LIMIT 20;
```

**Expected:** You should see entries for each goal reminder with:
- `notification_type`: "goal_reminder"
- `scheduled_utc`: UTC timestamp when notification should fire
- `status`: "pending"

**If no rows:** Goal reminders are NOT being scheduled.

---

## 3. Check what time it is now vs scheduled time

```sql
SELECT 
  NOW() as current_utc_time,
  scheduled_utc,
  scheduled_utc - NOW() as time_until_notification,
  EXTRACT(EPOCH FROM (scheduled_utc - NOW())) / 60 as minutes_until,
  *
FROM upcoming_notifications
WHERE notification_type = 'goal_reminder'
  AND status = 'pending'
ORDER BY scheduled_utc
LIMIT 10;
```

**Expected:** 
- `minutes_until` should show positive number = future notification
- `minutes_until` negative = notification is overdue

---

## 4. Check notification logs for goal reminders

```sql
SELECT 
  goal_id,
  notification_type,
  scheduled_date,
  scheduled_time,
  status,
  sent_at,
  error_message
FROM notification_logs
WHERE notification_type = 'goal_reminder'
ORDER BY sent_at DESC
LIMIT 20;
```

**Expected:** See history of sent/failed goal reminders.

---

## 5. Find goals created today

```sql
SELECT 
  g.id,
  g.title,
  g.reminder_date,
  g.reminder_time,
  g.reminder_utc,
  g.source,
  COUNT(un.id) as scheduled_notifications
FROM goals g
LEFT JOIN upcoming_notifications un 
  ON un.goal_id = g.id 
  AND un.notification_type = 'goal_reminder'
  AND un.status = 'pending'
WHERE g.created_at > NOW() - INTERVAL '24 hours'
GROUP BY g.id
ORDER BY g.created_at DESC;
```

**Expected:** Shows today's goals and how many reminders they have scheduled.

---

## Common Issues & Solutions

### Issue 1: reminder_utc is NULL
**Cause:** UTC conversion failed  
**Solution:** Check server logs for "Error converting reminder time to UTC"

### Issue 2: No rows in upcoming_notifications
**Cause:** scheduleGoalReminder not being called or failing silently  
**Solution:** Check server logs for "Scheduling goal reminder" and "✅ Goal reminder scheduled"

### Issue 3: scheduled_utc is in the past
**Cause:** Wrong timezone conversion or clock skew  
**Solution:** Verify user's timezone in profiles table

### Issue 4: Notification sent but not received
**Cause:** Device/OS issue, not scheduling issue  
**Solution:** Run `npm run test-push` to test push token

---

## Quick Test

1. Create a goal with reminder set to 5 minutes from now
2. Wait 1 minute
3. Run query #2 to check if notification is scheduled
4. Wait for reminder time
5. Check server logs for "Found X notifications to process"
6. If found but not received → Device issue
7. If not found → Scheduling issue

---

## Debug Checklist

- [ ] Goals table has reminder_date, reminder_time, reminder_utc filled
- [ ] upcoming_notifications has entries for goal_reminder type
- [ ] scheduled_utc is in the future (or within last 5 minutes if testing)
- [ ] User has expo_push_token in profiles table
- [ ] Cron job is running (check logs every 5 minutes)
- [ ] Server logs show "Scheduling goal reminder" when creating goals
- [ ] Server logs show "Found X notifications" when cron runs
