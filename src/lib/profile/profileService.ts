/**
 * Profile Service
 * 
 * Manages user profile operations including timezone preferences
 */

import { supabase } from '../supabase/client';

export interface UserProfile {
  id: string;
  email?: string;
  timezone?: string;
  expo_push_token?: string;
  updated_at: string;
}

/**
 * Fetch user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Profile Service] Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[Profile Service] Exception:', error);
    return null;
  }
}

/**
 * Update user's timezone preference
 */
export async function updateUserTimezone(
  userId: string,
  timezone: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          timezone,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      );

    if (error) {
      console.error('[Profile Service] Error updating timezone:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Profile Service] Exception:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get user's timezone or return default
 */
export async function getUserTimezoneOrDefault(userId: string): Promise<string> {
  const profile = await getUserProfile(userId);
  return profile?.timezone || 'UTC';
}
