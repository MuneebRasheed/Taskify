import { Router, Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const router = Router();
const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const send = (
  res: Response,
  body: { success?: boolean; error?: string; exists?: boolean },
  status: number
) => res.status(status).json(body);

const OTP_EXPIRY_MINUTES = 15;
const OTP_LENGTH = 6;

/** Simple email format validation (RFC 5322 simplified). */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(value: string): boolean {
  return value.length > 0 && value.length <= 254 && EMAIL_REGEX.test(value);
}

function generateOtp(): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: port === '465',
    auth: { user, pass },
  });
}

async function sendOtpEmail(to: string, otp: string): Promise<{ error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[auth] SMTP not configured (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS); skipping OTP email');
    return {};
  }
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@taskify.com';
  try {
    await transporter.sendMail({
      from,
      to,
      subject: 'Your Taskify password reset code',
      text: `Your verification code is: ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
      html: `<p>Your verification code is: <strong>${otp}</strong></p><p>It expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
    });
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}

async function findUserByEmail(
  admin: SupabaseClient,
  email: string
): Promise<{ id: string } | null> {
  const normalized = email.trim().toLowerCase();
  let page = 1;
  const perPage = 100;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users) return null;
    const user = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (user) return { id: user.id };
    if (data.users.length < perPage) return null;
    page++;
  }
}

/** In-memory rate limit: max 5 requests per 15 minutes per IP for sensitive auth routes. */
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimitForgotPassword(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }
  if (now >= entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }
  next();
}

router.post('/delete-user', async (req: Request, res: Response) => {
  const log = (msg: string, data?: unknown) => {
    console.log(`[delete-user] ${msg}`, data !== undefined ? data : '');
  };
  const logError = (msg: string, err: unknown) => {
    console.error(`[delete-user] ${msg}`, err);
  };

  try {
    log('Request received');
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      log('Rejected: missing or invalid Authorization header');
      return send(res, { error: 'Missing or invalid Authorization header' }, 200);
    }

    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser();
    if (userError || !user) {
      logError('getUser failed', { userError: userError ?? null, hasUser: !!user });
      return send(res, { error: userError?.message ?? 'Invalid token or user not found' }, 200);
    }
    log('User resolved', { userId: user.id, email: user.email });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const hasServiceRole = !!supabaseServiceRoleKey;
    log('Admin client created', { hasServiceRole });

    log('Deleting profile', { userId: user.id });
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);
    if (profileError) {
      logError('Profile delete failed', profileError);
      return send(res, { error: profileError.message ?? 'Failed to remove profile' }, 200);
    }
    log('Profile deleted');

    log('Calling auth.admin.deleteUser', { userId: user.id });
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      logError('auth.admin.deleteUser failed', deleteError);
      return send(res, { error: deleteError.message }, 200);
    }
    log('User deleted successfully');
    return send(res, { success: true }, 200);
  } catch (e) {
    logError('Unexpected error', e);
    return send(res, { error: String(e) }, 200);
  }
});

// Check if an email is registered before sending OTP (no side effects)
router.post('/check-email', rateLimitForgotPassword, async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email) {
      return send(res, { error: 'Email is required', exists: false }, 400);
    }
    if (!isValidEmail(email)) {
      return send(res, { error: 'Please enter a valid email address', exists: false }, 400);
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const user = await findUserByEmail(supabaseAdmin, email);
    return send(res, { exists: !!user }, 200);
  } catch (e) {
    console.error('[check-email]', e);
    return send(res, { exists: false, error: 'Something went wrong' }, 500);
  }
});

router.post('/forgot-password', rateLimitForgotPassword, async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email) {
      return send(res, { error: 'Email is required' }, 400);
    }
    if (!isValidEmail(email)) {
      return send(res, { error: 'Please enter a valid email address' }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const user = await findUserByEmail(supabaseAdmin, email);
    if (!user) {
      return send(res, { error: 'No account found with this email.' }, 200);
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        password_reset_otp: otp,
        password_reset_otp_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[forgot-password] Profile update failed', updateError);
      return send(res, { error: 'Something went wrong. Please try again later.' }, 500);
    }

    const mailResult = await sendOtpEmail(email, otp);
    if (mailResult.error) {
      console.error('[forgot-password] Send OTP email failed', mailResult.error);
      return send(res, { error: 'Failed to send email. Please try again.' }, 500);
    }

    return send(res, { success: true }, 200);
  } catch (e) {
    console.error('[forgot-password]', e);
    return send(res, { error: 'Something went wrong' }, 500);
  }
});

router.post('/verify-reset-otp', async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';

    if (!email || !otp) {
      return send(res, { error: 'Email and code are required' }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const user = await findUserByEmail(supabaseAdmin, email);
    if (!user) {
      return send(res, { error: 'Invalid or expired code. Please request a new one.' }, 400);
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('password_reset_otp, password_reset_otp_expires_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return send(res, { error: 'Invalid or expired code. Please request a new one.' }, 400);
    }

    const storedOtp = profile.password_reset_otp;
    const expiresAt = profile.password_reset_otp_expires_at;
    if (!storedOtp || !expiresAt || new Date(expiresAt) < new Date()) {
      return send(res, { error: 'Invalid or expired code. Please request a new one.' }, 400);
    }
    if (storedOtp !== otp) {
      return send(res, { error: 'Invalid or expired code. Please request a new one.' }, 400);
    }

    return send(res, { success: true }, 200);
  } catch (e) {
    console.error('[verify-reset-otp]', e);
    return send(res, { error: 'Something went wrong' }, 500);
  }
});

router.post('/verify-reset-otp-and-set-password', async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword.trim() : '';

    if (!email || !otp) {
      return send(res, { error: 'Email and code are required' }, 400);
    }
    if (newPassword.length < 6) {
      return send(res, { error: 'Password must be at least 6 characters' }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const user = await findUserByEmail(supabaseAdmin, email);
    if (!user) {
      return send(res, { error: 'Invalid or expired code. Please request a new one.' }, 400);
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('password_reset_otp, password_reset_otp_expires_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return send(res, { error: 'Invalid or expired code. Please request a new one.' }, 400);
    }

    const storedOtp = profile.password_reset_otp;
    const expiresAt = profile.password_reset_otp_expires_at;
    if (!storedOtp || !expiresAt || new Date(expiresAt) < new Date()) {
      return send(res, { error: 'Invalid or expired code. Please request a new one.' }, 400);
    }
    if (storedOtp !== otp) {
      return send(res, { error: 'Invalid or expired code. Please request a new one.' }, 400);
    }

    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (updateAuthError) {
      return send(res, { error: updateAuthError.message ?? 'Failed to update password' }, 400);
    }

    await supabaseAdmin
      .from('profiles')
      .update({
        password_reset_otp: null,
        password_reset_otp_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return send(res, { success: true }, 200);
  } catch (e) {
    console.error('[verify-reset-otp-and-set-password]', e);
    return send(res, { error: 'Something went wrong' }, 500);
  }
});

router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return send(res, { error: 'Missing or invalid Authorization header' }, 401);
    }

    const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!currentPassword) {
      return send(res, { error: 'Current password is required' }, 400);
    }
    if (newPassword.length < 6) {
      return send(res, { error: 'New password must be at least 6 characters' }, 400);
    }

    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser();
    if (userError || !user?.email) {
      return send(res, { error: userError?.message ?? 'Invalid token or user not found' }, 401);
    }

    const supabaseVerify = createClient(supabaseUrl, supabaseAnonKey);
    const { error: signInError } = await supabaseVerify.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      return send(res, { error: 'Current password is incorrect' }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (updateError) {
      return send(res, { error: updateError.message ?? 'Failed to update password' }, 400);
    }

    return send(res, { success: true }, 200);
  } catch (e) {
    console.error('[change-password]', e);
    return send(res, { error: 'Something went wrong' }, 500);
  }
});

export default router;
