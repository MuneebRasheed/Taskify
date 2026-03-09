import { API_BASE_URL } from './config';

export type ForgotPasswordResult = { success: true } | { success: false; error: string };
export type CheckEmailResult = { exists: true } | { exists: false; error?: string };
export type VerifyOtpResult = { success: true } | { success: false; error: string };
export type VerifyAndSetPasswordResult = { success: true } | { success: false; error: string };

export const INVALID_RESPONSE_MSG =
  'Server returned an invalid response. Check that the API URL is correct and the server is running.';

async function parseJsonResponse<T>(res: Response): Promise<{ data?: T; error: string }> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed || trimmed.startsWith('<')) {
    return { error: INVALID_RESPONSE_MSG };
  }
  try {
    const data = JSON.parse(trimmed) as T;
    return { data, error: '' };
  } catch {
    return { error: INVALID_RESPONSE_MSG };
  }
}

export async function checkEmailExists(email: string): Promise<CheckEmailResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    const { data, error: parseError } = await parseJsonResponse<{ exists?: boolean; error?: string }>(res);
    if (parseError) {
      return { exists: false, error: parseError };
    }
    if (!data) {
      return { exists: false, error: INVALID_RESPONSE_MSG };
    }
    if (!res.ok) {
      return { exists: false, error: data.error ?? 'Something went wrong' };
    }
    return data.exists ? { exists: true } : { exists: false, error: data.error };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { exists: false, error: message || 'Network error. Please try again.' };
  }
}

export async function verifyResetOtp(email: string, otp: string): Promise<VerifyOtpResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
    });
    const { data, error: parseError } = await parseJsonResponse<{ success?: boolean; error?: string }>(res);
    if (parseError || !data) {
      return { success: false, error: parseError || INVALID_RESPONSE_MSG };
    }
    if (!res.ok) {
      return { success: false, error: data.error ?? 'Something went wrong' };
    }
    if (data.error) {
      return { success: false, error: data.error };
    }
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message || 'Network error. Please try again.' };
  }
}

export async function requestForgotPasswordOtp(email: string): Promise<ForgotPasswordResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    const { data, error: parseError } = await parseJsonResponse<{ success?: boolean; error?: string }>(res);
    if (parseError || !data) {
      return { success: false, error: parseError || INVALID_RESPONSE_MSG };
    }
    if (!res.ok) {
      return { success: false, error: data.error ?? 'Something went wrong' };
    }
    if (data.error) {
      return { success: false, error: data.error };
    }
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message || 'Network error. Please try again.' };
  }
}

export async function verifyResetOtpAndSetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<VerifyAndSetPasswordResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-reset-otp-and-set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      }),
    });
    const { data, error: parseError } = await parseJsonResponse<{ success?: boolean; error?: string }>(res);
    if (parseError || !data) {
      return { success: false, error: parseError || INVALID_RESPONSE_MSG };
    }
    if (!res.ok) {
      return { success: false, error: data.error ?? 'Something went wrong' };
    }
    if (data.error) {
      return { success: false, error: data.error };
    }
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message || 'Network error. Please try again.' };
  }
}
