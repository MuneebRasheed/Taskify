// Notification Scheduler Service
// Manages upcoming_notifications table and handles timezone changes

import { createClient } from '@supabase/supabase-js';
import { 
  convertLocalToUTC, 
  generateHabitOccurrences,
  convertUTCToLocal 
} from './timezoneHelper';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Schedule a goal reminder notification
 */
export async function scheduleGoalReminder(
  userId: string,
  goalId: string,
  reminderDate: string, // YYYY-MM-DD
  reminderTime: string, // HH:MM AM/PM
  timezone: string
): Promise<void> {
  try {
    // Convert to UTC
    const scheduledUTC = convertLocalToUTC(reminderDate, reminderTime, timezone);
    
    // Check if already scheduled
    const { data: existing } = await supabase
      .from('upcoming_notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('item_id', null)
      .eq('notification_type', 'goal_reminder')
      .eq('status', 'pending')
      .maybeSingle();
    
    if (existing) {
      // Update existing
      await supabase
        .from('upcoming_notifications')
        .update({
          scheduled_utc: scheduledUTC,
          scheduled_date: reminderDate,
          scheduled_time: reminderTime,
          timezone: timezone,
        })
        .eq('id', existing.id);
      
      console.log(`[Scheduler] Updated goal reminder for goal ${goalId}`);
    } else {
      // Insert new
      await supabase
        .from('upcoming_notifications')
        .insert({
          user_id: userId,
          goal_id: goalId,
          item_id: null,
          notification_type: 'goal_reminder',
          scheduled_utc: scheduledUTC,
          scheduled_date: reminderDate,
          scheduled_time: reminderTime,
          timezone: timezone,
          status: 'pending',
        });
      
      console.log(`[Scheduler] Scheduled goal reminder for goal ${goalId}`);
    }
  } catch (error) {
    console.error('[Scheduler] Error scheduling goal reminder:', error);
    throw error;
  }
}

/**
 * Schedule goal due date notification
 */
export async function scheduleGoalDue(
  userId: string,
  goalId: string,
  dueDate: string, // YYYY-MM-DD
  timezone: string,
  dueTime: string = '09:00 AM' // Default time for due date notifications
): Promise<void> {
  try {
    const scheduledUTC = convertLocalToUTC(dueDate, dueTime, timezone);
    
    const { data: existing } = await supabase
      .from('upcoming_notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('item_id', null)
      .eq('notification_type', 'goal_due')
      .eq('status', 'pending')
      .maybeSingle();
    
    if (existing) {
      await supabase
        .from('upcoming_notifications')
        .update({
          scheduled_utc: scheduledUTC,
          scheduled_date: dueDate,
          scheduled_time: dueTime,
          timezone: timezone,
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('upcoming_notifications')
        .insert({
          user_id: userId,
          goal_id: goalId,
          item_id: null,
          notification_type: 'goal_due',
          scheduled_utc: scheduledUTC,
          scheduled_date: dueDate,
          scheduled_time: dueTime,
          timezone: timezone,
          status: 'pending',
        });
    }
    
    console.log(`[Scheduler] Scheduled goal due notification for goal ${goalId}`);
  } catch (error) {
    console.error('[Scheduler] Error scheduling goal due:', error);
    throw error;
  }
}

/**
 * Schedule habit reminder notifications (next 30 days)
 */
export async function scheduleHabitReminders(
  userId: string,
  goalId: string,
  itemId: string,
  selectedDays: number[], // [0=Mon, 1=Tue, ..., 6=Sun]
  reminderTime: string,
  timezone: string
): Promise<void> {
  try {
    // Delete existing pending notifications for this habit
    await supabase
      .from('upcoming_notifications')
      .delete()
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('item_id', itemId)
      .eq('notification_type', 'habit_reminder')
      .eq('status', 'pending');
    
    // Generate next 30 occurrences
    const occurrences = generateHabitOccurrences(selectedDays, reminderTime, timezone, 30);
    
    // Insert new notifications
    const notifications = occurrences.map(utcTime => {
      const { localDate, localTime } = convertUTCToLocal(utcTime, timezone);
      return {
        user_id: userId,
        goal_id: goalId,
        item_id: itemId,
        notification_type: 'habit_reminder',
        scheduled_utc: utcTime,
        scheduled_date: localDate,
        scheduled_time: localTime,
        timezone: timezone,
        status: 'pending',
      };
    });
    
    await supabase
      .from('upcoming_notifications')
      .insert(notifications);
    
    console.log(`[Scheduler] Scheduled ${occurrences.length} habit reminders for habit ${itemId}`);
  } catch (error) {
    console.error('[Scheduler] Error scheduling habit reminders:', error);
    throw error;
  }
}

/**
 * Schedule task due notification
 */
export async function scheduleTaskDue(
  userId: string,
  goalId: string,
  itemId: string,
  dueDate: string,
  reminderTime: string,
  timezone: string
): Promise<void> {
  try {
    const scheduledUTC = convertLocalToUTC(dueDate, reminderTime, timezone);
    
    const { data: existing } = await supabase
      .from('upcoming_notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('item_id', itemId)
      .eq('notification_type', 'task_due')
      .eq('status', 'pending')
      .maybeSingle();
    
    if (existing) {
      await supabase
        .from('upcoming_notifications')
        .update({
          scheduled_utc: scheduledUTC,
          scheduled_date: dueDate,
          scheduled_time: reminderTime,
          timezone: timezone,
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('upcoming_notifications')
        .insert({
          user_id: userId,
          goal_id: goalId,
          item_id: itemId,
          notification_type: 'task_due',
          scheduled_utc: scheduledUTC,
          scheduled_date: dueDate,
          scheduled_time: reminderTime,
          timezone: timezone,
          status: 'pending',
        });
    }
    
    console.log(`[Scheduler] Scheduled task due notification for task ${itemId}`);
  } catch (error) {
    console.error('[Scheduler] Error scheduling task due:', error);
    throw error;
  }
}

/**
 * Cancel all notifications for a goal
 */
export async function cancelGoalNotifications(
  userId: string,
  goalId: string
): Promise<void> {
  try {
    await supabase
      .from('upcoming_notifications')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('status', 'pending');
    
    console.log(`[Scheduler] Cancelled notifications for goal ${goalId}`);
  } catch (error) {
    console.error('[Scheduler] Error cancelling goal notifications:', error);
    throw error;
  }
}

/**
 * Cancel notifications for a specific item (habit or task)
 */
export async function cancelItemNotifications(
  userId: string,
  goalId: string,
  itemId: string
): Promise<void> {
  try {
    await supabase
      .from('upcoming_notifications')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('item_id', itemId)
      .eq('status', 'pending');
    
    console.log(`[Scheduler] Cancelled notifications for item ${itemId}`);
  } catch (error) {
    console.error('[Scheduler] Error cancelling item notifications:', error);
    throw error;
  }
}

/**
 * Recalculate all notifications for a user (when timezone changes)
 */
export async function recalculateUserNotifications(
  userId: string,
  newTimezone: string
): Promise<void> {
  try {
    console.log(`[Scheduler] Recalculating notifications for user ${userId} with new timezone ${newTimezone}`);
    
    // Get all user's goals with items
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);
    
    if (goalsError) throw goalsError;
    if (!goals || goals.length === 0) {
      console.log('[Scheduler] No goals found for user');
      return;
    }
    
    const goalIds = goals.map(g => g.id);
    
    const { data: items, error: itemsError } = await supabase
      .from('goal_items')
      .select('*')
      .in('goal_id', goalIds);
    
    if (itemsError) throw itemsError;
    
    // Cancel all pending notifications
    await supabase
      .from('upcoming_notifications')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('status', 'pending');
    
    console.log('[Scheduler] Cancelled all pending notifications');
    
    // Reschedule all notifications with new timezone
    let rescheduledCount = 0;
    
    for (const goal of goals) {
      // Reschedule goal reminder
      if (goal.reminder_date && goal.reminder_time) {
        await scheduleGoalReminder(
          userId,
          goal.id,
          goal.reminder_date,
          goal.reminder_time,
          newTimezone
        );
        rescheduledCount++;
      }
      
      // Reschedule goal due date
      if (goal.due_date) {
        const dueTime = process.env.NOTIFICATION_DEFAULT_TIME || '09:00 AM';
        await scheduleGoalDue(userId, goal.id, goal.due_date, newTimezone, dueTime);
        rescheduledCount++;
      }
    }
    
    // Reschedule habits and tasks
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.type === 'habit' && item.reminder_time && item.selected_days) {
          const selectedDays = Array.isArray(item.selected_days)
            ? item.selected_days
            : JSON.parse(item.selected_days);
          
          await scheduleHabitReminders(
            userId,
            item.goal_id,
            item.id,
            selectedDays,
            item.reminder_time,
            newTimezone
          );
          rescheduledCount++;
        } else if (item.type === 'task' && item.due_date && item.reminder_time) {
          await scheduleTaskDue(
            userId,
            item.goal_id,
            item.id,
            item.due_date,
            item.reminder_time,
            newTimezone
          );
          rescheduledCount++;
        }
      }
    }
    
    console.log(`[Scheduler] ✅ Recalculated ${rescheduledCount} notifications for new timezone`);
  } catch (error) {
    console.error('[Scheduler] Error recalculating user notifications:', error);
    throw error;
  }
}
