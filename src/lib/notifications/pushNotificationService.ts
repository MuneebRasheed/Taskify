import Constants from 'expo-constants';
import { supabase } from '../supabase/client';

/**
 * Request notification permissions and register Expo push token with Supabase.
 * This can be called multiple times safely - it will update the token if permissions are granted.
 * 
 * @param userId - The authenticated user's ID
 * @returns The Expo push token if successful, null otherwise
 */
export async function registerPushNotifications(userId: string): Promise<string | null> {
  try {
    console.log('[Push Notifications] Starting registration for user:', userId);

    // Dynamically import expo-notifications
    const Notifications = await import('expo-notifications');

    // Check current permissions
    const currentPermissions = await Notifications.getPermissionsAsync();
    console.log('[Push Notifications] Current permissions:', {
      status: currentPermissions.status,
      granted: currentPermissions.granted,
      canAskAgain: currentPermissions.canAskAgain,
    });

    let finalStatus = currentPermissions.status;

    // Request permissions if not granted
    if (finalStatus !== 'granted') {
      console.log('[Push Notifications] Requesting permissions...');
      const requestedPermissions = await Notifications.requestPermissionsAsync();
      finalStatus = requestedPermissions.status;
      console.log('[Push Notifications] Permission request result:', {
        status: requestedPermissions.status,
        granted: requestedPermissions.granted,
      });
    }

    // If still not granted, return null
    if (finalStatus !== 'granted') {
      console.log('[Push Notifications] ❌ Permissions not granted. Cannot get token.');
      return null;
    }

    // Get the Expo push token
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? undefined;

    console.log('[Push Notifications] Getting token with project ID:', projectId ?? 'NOT SET');

    const tokenResponse = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    const token = tokenResponse.data ?? null;

    if (!token) {
      console.log('[Push Notifications] ❌ Failed to get token from Expo');
      return null;
    }

    console.log('[Push Notifications] ✅ Token obtained:', token);

    // Get device timezone as default
    let deviceTimezone = 'UTC';
    try {
      const Localization = await import('expo-localization');
      
      // Try getLocales first
      try {
        const locales = Localization.getLocales();
        if (locales && locales[0] && locales[0].timeZone) {
          deviceTimezone = locales[0].timeZone;
          console.log('[Push] Timezone from getLocales:', deviceTimezone);
        }
      } catch (e) {
        console.warn('[Push] getLocales failed, trying getCalendars');
      }
      
      // If still UTC, try getCalendars
      if (deviceTimezone === 'UTC') {
        try {
          const calendars = Localization.getCalendars();
          if (calendars && calendars[0] && calendars[0].timeZone) {
            deviceTimezone = calendars[0].timeZone;
            console.log('[Push] Timezone from getCalendars:', deviceTimezone);
          }
        } catch (e) {
          console.warn('[Push] getCalendars failed');
        }
      }
      
      // Last resort: Intl API
      if (deviceTimezone === 'UTC') {
        try {
          deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          console.log('[Push] Timezone from Intl:', deviceTimezone);
        } catch (e) {
          console.warn('[Push] Intl API failed, using UTC');
        }
      }
    } catch (error) {
      console.warn('[Push Notifications] Could not detect device timezone');
    }

    // Check if profile already has a timezone
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('id', userId)
      .single();

    const updatePayload: {
      id: string;
      expo_push_token: string;
      timezone?: string;
      updated_at: string;
    } = {
      id: userId,
      expo_push_token: token,
      updated_at: new Date().toISOString(),
    };

    // Only set timezone if not already set
    if (!existingProfile?.timezone) {
      updatePayload.timezone = deviceTimezone;
    }

    // Store the token in Supabase profiles table using upsert
    // This ensures the row exists and updates the token
    const { error } = await supabase
      .from('profiles')
      .upsert(updatePayload, { onConflict: 'id' });

    if (error) {
      console.error('[Push Notifications] ❌ Failed to save token to database:', error);
      return null;
    }

    console.log('[Push Notifications] ✅ Token successfully saved to database for user:', userId);
    return token;
  } catch (error) {
    console.error('[Push Notifications] ❌ Error during registration:', {
      message: error instanceof Error ? error.message : String(error),
      error,
    });
    return null;
  }
}

/**
 * Remove the push token from the user's profile (useful for sign-out)
 * 
 * @param userId - The authenticated user's ID
 */
export async function unregisterPushNotifications(userId: string): Promise<void> {
  try {
    console.log('[Push Notifications] Unregistering token for user:', userId);

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          expo_push_token: null,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'id'
        }
      );

    if (error) {
      console.error('[Push Notifications] ❌ Failed to remove token from database:', error);
      return;
    }

    console.log('[Push Notifications] ✅ Token removed from database');
  } catch (error) {
    console.error('[Push Notifications] ❌ Error during unregistration:', error);
  }
}

/**
 * Get the current Expo push token without registering it
 * Useful for checking if notifications are set up
 * 
 * @returns The current Expo push token or null
 */
export async function getCurrentPushToken(): Promise<string | null> {
  try {
    const Notifications = await import('expo-notifications');

    const currentPermissions = await Notifications.getPermissionsAsync();
    if (currentPermissions.status !== 'granted') {
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? undefined;

    const tokenResponse = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    return tokenResponse.data ?? null;
  } catch (error) {
    console.error('[Push Notifications] Error getting current token:', error);
    return null;
  }
}
