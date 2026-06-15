/**
 * Timezone-aware Notification Helper
 * 
 * This module provides utilities for scheduling notifications that respect user timezones.
 * 
 * IMPORTANT CONCEPTS:
 * 
 * 1. All notification times in the database should be stored in UTC
 * 2. When a user sets a reminder time (e.g., "8:00 AM"), convert it from their timezone to UTC before storing
 * 3. When displaying reminder times to users, convert from UTC to their timezone
 * 4. Expo Push Notifications are sent immediately, so schedule them for the UTC time that corresponds to the user's local time
 * 
 * EXAMPLE WORKFLOW:
 * 
 * User in New York (UTC-5) wants a reminder at 8:00 AM their time:
 * 1. User selects 8:00 AM in the UI
 * 2. Convert: 8:00 AM EST = 1:00 PM UTC
 * 3. Store in database: reminder_time = "13:00:00" (UTC)
 * 4. Server/notification service runs at UTC times
 * 5. At 1:00 PM UTC, send notification to user (which is 8:00 AM in New York)
 * 
 * User in Tokyo (UTC+9) wants a reminder at 8:00 AM their time:
 * 1. User selects 8:00 AM in the UI
 * 2. Convert: 8:00 AM JST = 11:00 PM UTC (previous day)
 * 3. Store in database: reminder_time = "23:00:00" (UTC)
 * 4. At 11:00 PM UTC, send notification (which is 8:00 AM next day in Tokyo)
 * 
 * IMPLEMENTATION NOTES:
 * 
 * For proper timezone handling, consider:
 * - Install a timezone library like `date-fns-tz` or `luxon` for accurate conversions
 * - When scheduling notifications, use the user's timezone from their profile
 * - Account for daylight saving time changes
 * - Handle edge cases like notifications scheduled during DST transitions
 * 
 * BASIC CONVERSION FORMULA (pseudo-code):
 * 
 * // Converting user's local time to UTC for storage:
 * const userLocalTime = "08:00"; // User wants reminder at 8 AM
 * const userTimezone = "America/New_York"; // From user profile
 * const utcTime = convertToUTC(userLocalTime, userTimezone);
 * // Store utcTime in database
 * 
 * // Converting UTC time to user's local time for display:
 * const storedUtcTime = "13:00"; // From database
 * const userTimezone = "America/New_York"; // From user profile
 * const localTime = convertToLocal(storedUtcTime, userTimezone);
 * // Display localTime to user
 */

import { supabase } from '../supabase/client';

/**
 * Get user's timezone from their profile
 * @param userId - The user's ID
 * @returns The user's timezone string (IANA format) or null if not found
 */
export async function getUserTimezone(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Timezone Helper] Error fetching user timezone:', error);
      return null;
    }

    return data?.timezone || null;
  } catch (error) {
    console.error('[Timezone Helper] Exception:', error);
    return null;
  }
}

/**
 * Convert a local time string and date to UTC timestamp
 * 
 * Note: This is a basic implementation. For production, use a proper timezone library
 * like date-fns-tz or luxon for accurate conversions including DST handling.
 * 
 * @param localTime - Time in format "HH:mm" (e.g., "08:00")
 * @param localDate - Date in the user's timezone
 * @param timezone - IANA timezone string (e.g., "America/New_York")
 * @returns UTC timestamp
 */
export function convertLocalTimeToUTC(
  localTime: string,
  localDate: Date,
  timezone: string
): Date {
  // For now, this is a placeholder
  // In production, implement with proper timezone library
  // Example with date-fns-tz:
  // import { zonedTimeToUtc } from 'date-fns-tz';
  // const [hours, minutes] = localTime.split(':').map(Number);
  // const zonedDate = new Date(localDate);
  // zonedDate.setHours(hours, minutes, 0, 0);
  // return zonedTimeToUtc(zonedDate, timezone);
  
  console.warn('[Timezone Helper] convertLocalTimeToUTC needs proper timezone library implementation');
  return localDate;
}

/**
 * Convert a UTC timestamp to local time in user's timezone
 * 
 * Note: This is a basic implementation. For production, use a proper timezone library.
 * 
 * @param utcDate - UTC timestamp
 * @param timezone - IANA timezone string
 * @returns Local time string in format "HH:mm"
 */
export function convertUTCToLocalTime(utcDate: Date, timezone: string): string {
  // For now, this is a placeholder
  // In production, implement with proper timezone library
  // Example with date-fns-tz:
  // import { utcToZonedTime, format } from 'date-fns-tz';
  // const zonedDate = utcToZonedTime(utcDate, timezone);
  // return format(zonedDate, 'HH:mm', { timeZone: timezone });
  
  console.warn('[Timezone Helper] convertUTCToLocalTime needs proper timezone library implementation');
  return utcDate.toTimeString().substring(0, 5);
}

/**
 * Example: Schedule a notification for a user at a specific local time
 * 
 * This is a conceptual example showing how timezone-aware scheduling should work.
 * Actual implementation depends on your notification service architecture.
 */
export async function scheduleNotificationAtLocalTime(
  userId: string,
  localTime: string,
  localDate: Date,
  message: string
): Promise<void> {
  // 1. Get user's timezone
  const timezone = await getUserTimezone(userId);
  if (!timezone) {
    console.error('[Notification] User timezone not found, using UTC');
    // Fallback or error handling
    return;
  }

  // 2. Convert local time to UTC
  const utcTime = convertLocalTimeToUTC(localTime, localDate, timezone);

  // 3. Schedule notification for UTC time
  // This depends on your notification service implementation
  // Could be:
  // - Storing in database with scheduled_time column
  // - Using a job queue like Bull or Agenda
  // - Using expo-notifications schedulePushNotificationAsync with trigger
  
  console.log('[Notification] Would schedule notification:', {
    userId,
    localTime,
    timezone,
    utcTime: utcTime.toISOString(),
    message,
  });
}
