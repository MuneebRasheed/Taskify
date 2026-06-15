// Timezone Helper Service
// Handles conversion between user local time and UTC for notifications

import { parseISO, format } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * Parse time string like "09:00 AM" or "21:00" to 24-hour format "HH:mm"
 */
export function parseTimeTo24Hour(timeStr: string): string {
  if (!timeStr) return '09:00';
  
  // Already in 24-hour format (e.g., "09:00" or "21:00")
  if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
    return timeStr.padStart(5, '0');
  }
  
  // Parse 12-hour format (e.g., "09:00 AM" or "9:00 PM")
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
 * Convert local date and time to UTC timestamp
 * 
 * @param localDate - Date string in YYYY-MM-DD format
 * @param localTime - Time string in "HH:MM AM/PM" or "HH:MM" format
 * @param timezone - IANA timezone (e.g., "Asia/Karachi", "America/New_York")
 * @returns UTC timestamp as ISO string
 */
export function convertLocalToUTC(
  localDate: string,
  localTime: string,
  timezone: string
): string {
  try {
    // Parse time to 24-hour format
    const time24 = parseTimeTo24Hour(localTime);
    const [hours, minutes] = time24.split(':').map(Number);
    
    // Parse the date (YYYY-MM-DD)
    const [year, month, day] = localDate.split('-').map(Number);
    
    // Create a date object in the user's local timezone
    // Note: We create it as if it's in the local timezone, then convert to UTC
    const localDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    // Convert from user's timezone to UTC
    const utcDateTime = fromZonedTime(localDateTime, timezone);
    
    return utcDateTime.toISOString();
  } catch (error) {
    console.error('[TimezoneHelper] Error in convertLocalToUTC:', {
      localDate,
      localTime,
      timezone,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Convert UTC timestamp to local time in user's timezone
 * 
 * @param utcTimestamp - UTC timestamp (ISO string or Date)
 * @param timezone - IANA timezone
 * @returns Object with localDate (YYYY-MM-DD) and localTime (HH:MM AM/PM)
 */
export function convertUTCToLocal(
  utcTimestamp: string | Date,
  timezone: string
): { localDate: string; localTime: string } {
  const utcDate = typeof utcTimestamp === 'string' ? parseISO(utcTimestamp) : utcTimestamp;
  
  // Convert to user's timezone
  const localDate = formatInTimeZone(utcDate, timezone, 'yyyy-MM-dd');
  const localTime = formatInTimeZone(utcDate, timezone, 'hh:mm a');
  
  return { localDate, localTime };
}

/**
 * Get next occurrence of a time on a specific day of week
 * Used for generating habit notifications
 * 
 * @param dayOfWeek - 0=Monday, 1=Tuesday, ..., 6=Sunday
 * @param time - Time string "HH:MM AM/PM"
 * @param timezone - User's timezone
 * @param startDate - Start searching from this date (defaults to today)
 * @returns UTC timestamp of next occurrence
 */
export function getNextOccurrenceUTC(
  dayOfWeek: number,
  time: string,
  timezone: string,
  startDate: Date = new Date()
): string {
  // Convert current time to user's timezone
  const localNow = toZonedTime(startDate, timezone);
  const currentDayOfWeek = localNow.getDay();
  
  // Convert day index: our system uses Mon=0, date-fns uses Sun=0
  // So we need to adjust: Mon=0→1, Tue=1→2, ..., Sun=6→0
  const targetDayDateFns = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
  
  // Calculate days until target day
  let daysUntilTarget = targetDayDateFns - currentDayOfWeek;
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7; // Next week
  } else if (daysUntilTarget === 0) {
    // Same day - check if time has passed
    const time24 = parseTimeTo24Hour(time);
    const [targetHours, targetMinutes] = time24.split(':').map(Number);
    const currentHours = localNow.getHours();
    const currentMinutes = localNow.getMinutes();
    
    if (
      currentHours > targetHours ||
      (currentHours === targetHours && currentMinutes >= targetMinutes)
    ) {
      // Time has passed today, schedule for next week
      daysUntilTarget = 7;
    }
  }
  
  // Create target date
  const targetDate = new Date(localNow);
  targetDate.setDate(targetDate.getDate() + daysUntilTarget);
  const targetDateStr = format(targetDate, 'yyyy-MM-dd');
  
  // Convert to UTC
  return convertLocalToUTC(targetDateStr, time, timezone);
}

/**
 * Generate next N occurrences for a recurring habit
 * 
 * @param selectedDays - Array of day indices [0=Mon, 1=Tue, ..., 6=Sun]
 * @param time - Time string "HH:MM AM/PM"
 * @param timezone - User's timezone
 * @param count - Number of occurrences to generate (default: 30)
 * @returns Array of UTC timestamps
 */
export function generateHabitOccurrences(
  selectedDays: number[],
  time: string,
  timezone: string,
  count: number = 30
): string[] {
  const occurrences: string[] = [];
  let currentDate = new Date();
  
  while (occurrences.length < count) {
    for (const day of selectedDays.sort()) {
      if (occurrences.length >= count) break;
      
      const utcTime = getNextOccurrenceUTC(day, time, timezone, currentDate);
      occurrences.push(utcTime);
      
      // Move to next day to avoid duplicates
      currentDate = new Date(utcTime);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return occurrences.sort();
}

/**
 * Check if a UTC timestamp should trigger now (within tolerance)
 * 
 * @param scheduledUTC - Scheduled UTC timestamp
 * @param currentUTC - Current UTC time (defaults to now)
 * @param toleranceMinutes - Tolerance window in minutes (default: 5)
 * @returns true if notification should be sent
 */
export function shouldTriggerNotification(
  scheduledUTC: string | Date,
  currentUTC: Date = new Date(),
  toleranceMinutes: number = 5
): boolean {
  const scheduled = typeof scheduledUTC === 'string' ? parseISO(scheduledUTC) : scheduledUTC;
  
  const diffMs = currentUTC.getTime() - scheduled.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  // Trigger if current time is AT or AFTER scheduled time
  // and within tolerance window
  return diffMinutes >= 0 && diffMinutes <= toleranceMinutes;
}
