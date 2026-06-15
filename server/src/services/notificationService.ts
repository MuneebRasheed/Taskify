// Notification Service - Handles sending push notifications for goals, habits, and tasks
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { format, parseISO, isToday, getDay } from 'date-fns';
import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const expo = new Expo();

interface NotificationToSend {
  userId: string;
  goalId: string;
  itemId: string | null;
  type: 'goal_reminder' | 'goal_due' | 'habit_reminder' | 'task_due';
  title: string;
  body: string;
  scheduledDate: string;
  scheduledTime: string;
}

/**
 * Parse time string like "09:00 AM" to 24-hour format "09:00"
 */
function parseTimeTo24Hour(timeStr: string): string {
  if (!timeStr) return '09:00';
  
  // Already in 24-hour format (e.g., "09:00")
  if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
    return timeStr.padStart(5, '0');
  }
  
  // Parse 12-hour format (e.g., "09:00 AM")
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return '09:00';
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Check if current time is within tolerance of scheduled time
 */
function isTimeMatch(scheduledTime: string, currentTime: Date, toleranceMinutes = 5): boolean {
  const time24 = parseTimeTo24Hour(scheduledTime);
  const [hours, minutes] = time24.split(':').map(Number);
  
  const scheduledTotalMinutes = hours * 60 + minutes;
  const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  // Calculate difference: positive means current time is AFTER scheduled time
  const difference = currentTotalMinutes - scheduledTotalMinutes;
  
  // Only trigger if current time is AT or AFTER scheduled time (difference >= 0)
  // and within the tolerance window (difference <= toleranceMinutes)
  // Using 5 minutes to prevent early triggering while ensuring notifications aren't missed
  const match = difference >= 0 && difference <= toleranceMinutes;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[TimeMatch] Scheduled: ${scheduledTime} (${time24}), Current: ${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}, Diff: ${difference} min, Match: ${match}`);
  }
  
  return match;
}

/**
 * Check if notification was already sent today at this specific time
 */
async function wasNotificationSent(
  userId: string,
  goalId: string,
  itemId: string | null,
  notificationType: string,
  scheduledDate: string,
  scheduledTime: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('notification_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('goal_id', goalId)
    .eq('notification_type', notificationType)
    .eq('scheduled_date', scheduledDate)
    .eq('scheduled_time', scheduledTime)
    .maybeSingle();
  
  if (error) {
    console.error('[Notification] Error checking if notification was sent:', error);
    return false; // If error, assume not sent to avoid missing notifications
  }
  
  return !!data;
}

/**
 * Log notification to database
 */
async function logNotification(
  userId: string,
  goalId: string,
  itemId: string | null,
  notificationType: string,
  scheduledDate: string,
  scheduledTime: string,
  status: 'sent' | 'failed' | 'no_token',
  errorMessage?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('notification_logs').insert({
      user_id: userId,
      goal_id: goalId,
      item_id: itemId,
      notification_type: notificationType,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      status,
      error_message: errorMessage || null,
    });
    
    if (error) {
      // Don't crash if logging fails - just log the error
      console.error('[Notification] Error logging notification (non-critical):', error.message);
    }
  } catch (error) {
    // Catch any unexpected errors in logging
    console.error('[Notification] Exception logging notification (non-critical):', error);
  }
}

/**
 * Send push notification via Expo
 */
async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  console.log(`[Notification] 📱 Attempting to send: "${title}" to token: ${token.substring(0, 35)}...`);
  
  if (!Expo.isExpoPushToken(token)) {
    console.log(`[Notification] ❌ Invalid Expo push token format`);
    return { success: false, error: 'Invalid Expo push token' };
  }
  
  try {
    // Generate unique notification ID to prevent grouping
    const notificationId = `${data.type}-${data.itemId || data.goalId}-${Date.now()}`;
    
    const messages: ExpoPushMessage[] = [
      {
        to: token,
        sound: 'default',
        title,
        body,
        data: {
          ...data,
          notificationId, // Unique ID helps prevent grouping
        },
        priority: 'high',
        channelId: 'default',
        // Add category/tag to prevent OS from grouping identical notifications
        badge: 1,
      },
    ];
    
    console.log(`[Notification] 📤 Sending message:`, { title, body });
    
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];
    
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }
    
    console.log(`[Notification] 📬 Received ${tickets.length} ticket(s)`);
    
    // Check if any tickets have errors
    for (const ticket of tickets) {
      console.log(`[Notification] Ticket status: ${ticket.status}`);
      
      if (ticket.status === 'error') {
        console.error('[Notification] ❌ Push notification error:', ticket.message, ticket.details);
        return { success: false, error: ticket.message };
      }
    }
    
    console.log(`[Notification] ✅ Notification sent successfully!`);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Notification] ❌ Exception sending push notification:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Find and send all due notifications using the upcoming_notifications table
 */
export async function processNotifications(): Promise<void> {
  console.log('[Notification] Starting notification processing...');
  console.log(`[Notification] Current UTC time: ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  let sentCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  
  try {
    const currentUTC = new Date();
    const toleranceMinutes = 5;
    
    // Calculate time window: from (now - tolerance) to now
    const windowStart = new Date(currentUTC.getTime() - toleranceMinutes * 60 * 1000);
    
    // Get all pending notifications that should fire now
    const { data: notifications, error: notificationsError } = await supabase
      .from('upcoming_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_utc', currentUTC.toISOString())
      .gte('scheduled_utc', windowStart.toISOString())
      .order('scheduled_utc', { ascending: true });
    
    if (notificationsError) {
      console.error('[Notification] Error fetching notifications:', notificationsError);
      return;
    }
    
    if (!notifications || notifications.length === 0) {
      console.log('[Notification] No notifications due at this time');
      return;
    }
    
    console.log(`[Notification] Found ${notifications.length} notifications to process`);
    
    // Get user push tokens for these notifications
    const userIds = [...new Set(notifications.map(n => n.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, expo_push_token')
      .in('id', userIds)
      .not('expo_push_token', 'is', null);
    
    if (profilesError) {
      console.error('[Notification] Error fetching profiles:', profilesError);
      return;
    }
    
    // Create a map of userId -> pushToken for quick lookup
    const pushTokenMap = new Map<string, string>();
    if (profiles) {
      profiles.forEach(p => {
        if (p.expo_push_token) {
          pushTokenMap.set(p.id, p.expo_push_token);
        }
      });
    }
    
    // Process each notification
    for (const notification of notifications) {
      const pushToken = pushTokenMap.get(notification.user_id);
      
      if (!pushToken) {
        console.log(`[Notification] No push token for user ${notification.user_id}, marking as no_token`);
        
        // Mark as sent (with no_token status logged separately if needed)
        await supabase
          .from('upcoming_notifications')
          .update({ status: 'sent' })
          .eq('id', notification.id);
        
        await logNotification(
          notification.user_id,
          notification.goal_id,
          notification.item_id,
          notification.notification_type,
          notification.scheduled_date,
          notification.scheduled_time,
          'no_token'
        );
        
        skippedCount++;
        continue;
      }
      
      // Check if already sent (duplicate prevention)
      const alreadySent = await wasNotificationSent(
        notification.user_id,
        notification.goal_id,
        notification.item_id,
        notification.notification_type,
        notification.scheduled_date,
        notification.scheduled_time
      );
      
      if (alreadySent) {
        console.log(`[Notification] Already sent: ${notification.notification_type} for goal ${notification.goal_id}`);
        
        // Mark as sent in upcoming_notifications
        await supabase
          .from('upcoming_notifications')
          .update({ status: 'sent' })
          .eq('id', notification.id);
        
        skippedCount++;
        continue;
      }
      
      // Determine notification title and body based on type
      let title = '';
      let body = '';
      
      // Get goal title
      const { data: goal } = await supabase
        .from('goals')
        .select('title')
        .eq('id', notification.goal_id)
        .single();
      
      const goalTitle = goal?.title || 'Your Goal';
      
      switch (notification.notification_type) {
        case 'goal_reminder':
          title = '🎯 Goal Reminder';
          body = goalTitle;
          break;
        case 'goal_due':
          title = '⏰ Goal Due Today';
          body = `${goalTitle} is due today!`;
          break;
        case 'habit_reminder':
          // Get habit title
          const { data: habit } = await supabase
            .from('goal_items')
            .select('title')
            .eq('id', notification.item_id)
            .single();
          title = '✅ Habit Reminder';
          body = `${habit?.title || 'Habit'} - ${goalTitle}`;
          break;
        case 'task_due':
          // Get task title
          const { data: task } = await supabase
            .from('goal_items')
            .select('title')
            .eq('id', notification.item_id)
            .single();
          title = '📋 Task Due';
          body = `${task?.title || 'Task'} - ${goalTitle}`;
          break;
      }
      
      // Send notification
      const result = await sendPushNotification(
        pushToken,
        title,
        body,
        { 
          goalId: notification.goal_id, 
          itemId: notification.item_id,
          type: notification.notification_type 
        }
      );
      
      if (result.success) {
        sentCount++;
        console.log(`[Notification] ✅ Sent ${notification.notification_type} to user ${notification.user_id}`);
      } else {
        failedCount++;
        console.log(`[Notification] ❌ Failed ${notification.notification_type}: ${result.error}`);
      }
      
      // Mark as sent in upcoming_notifications
      await supabase
        .from('upcoming_notifications')
        .update({ status: 'sent' })
        .eq('id', notification.id);
      
      // Log in notification_logs
      await logNotification(
        notification.user_id,
        notification.goal_id,
        notification.item_id,
        notification.notification_type,
        notification.scheduled_date,
        notification.scheduled_time,
        result.success ? 'sent' : 'failed',
        result.error
      );
      
      // Add small delay between notifications to prevent rate limiting
      // This helps iOS/Android deliver multiple notifications reliably
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Notification] Job completed in ${duration}s - Sent: ${sentCount}, Failed: ${failedCount}, Skipped: ${skippedCount}`);
  } catch (error) {
    console.error('[Notification] Error processing notifications:', error);
  }
}
