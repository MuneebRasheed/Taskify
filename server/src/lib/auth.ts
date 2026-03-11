// server/src/lib/auth.ts

import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';

/**
 * Resolves the current user from the request's Bearer token.
 * Use this in routes that require authentication.
 * Returns { user, error } — if error is set, the response was already sent (401).
 */
export async function getAuthenticatedUser(
  req: Request,
  res: Response
): Promise<{ user: User | null; error?: string }> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return { user: null, error: 'unauthorized' };
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) {
    res.status(401).json({ error: error?.message ?? 'Invalid or expired token' });
    return { user: null, error: 'unauthorized' };
  }
  return { user, error: undefined };
}