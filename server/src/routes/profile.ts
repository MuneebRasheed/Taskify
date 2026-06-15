// server/src/routes/profile.ts

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '../lib/auth';
import { recalculateUserNotifications } from '../services/notificationScheduler';

const router = Router();
const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}

/**
 * PATCH /profile/timezone
 * Updates user's timezone and recalculates all notifications
 * Body: { timezone: string }
 */
router.patch('/timezone', async (req: Request, res: Response) => {
  const { user, error } = await getAuthenticatedUser(req, res);
  if (error) return;

  const admin = getAdminClient();
  const userId = user!.id;
  const { timezone } = req.body ?? {};

  if (!timezone || typeof timezone !== 'string') {
    res.status(400).json({ error: 'timezone is required and must be a string' });
    return;
  }

  // Validate timezone format (basic check)
  if (!timezone.includes('/') && timezone !== 'UTC') {
    res.status(400).json({ error: 'Invalid timezone format. Use IANA format (e.g., Asia/Karachi)' });
    return;
  }

  console.log(`[profile] Updating timezone for user ${userId} to ${timezone}`);

  try {
    // Update user profile
    const { error: updateError } = await admin
      .from('profiles')
      .update({
        timezone: timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[profile] Error updating timezone:', updateError);
      res.status(500).json({ error: 'Failed to update timezone' });
      return;
    }

    // Recalculate all notifications with new timezone
    console.log('[profile] Recalculating notifications for new timezone...');
    await recalculateUserNotifications(userId, timezone);

    res.json({ 
      success: true, 
      message: 'Timezone updated and notifications recalculated',
      timezone: timezone 
    });
  } catch (error) {
    console.error('[profile] Error in timezone update:', error);
    res.status(500).json({ error: 'Failed to update timezone and recalculate notifications' });
  }
});

/**
 * GET /profile
 * Returns user profile information
 */
router.get('/', async (req: Request, res: Response) => {
  const { user, error } = await getAuthenticatedUser(req, res);
  if (error) return;

  const admin = getAdminClient();
  const userId = user!.id;

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('[profile] Error fetching profile:', profileError);
    res.status(500).json({ error: 'Failed to fetch profile' });
    return;
  }

  res.json(profile);
});

export default router;
