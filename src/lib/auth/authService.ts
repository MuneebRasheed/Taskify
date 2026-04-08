import { supabase } from '../supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { sha256 } from 'js-sha256';

export type AuthResult = {
  data: { user: User; session: Session } | null;
  error: Error | null;
};

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { data: null, error };
  }
  // Ensure profile row exists with email (in case DB trigger didn't run)
  if (data?.user) {
    await supabase
      .from('profiles')
      .upsert(
        {
          id: data.user.id,
          email: data.user.email ?? undefined,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
  }
  return {
    data: data?.user && data?.session ? { user: data.user, session: data.session } : null,
    error: null,
  };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return {
    data: data?.user && data?.session ? { user: data.user, session: data.session } : null,
    error: error ?? null,
  };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  let statusCodes:
    | {
        SIGN_IN_CANCELLED?: string;
        IN_PROGRESS?: string;
        PLAY_SERVICES_NOT_AVAILABLE?: string;
      }
    | undefined;

  try {
    if (Constants.appOwnership === 'expo') {
      return {
        data: null,
        error: new Error(
          'Google Sign-In is not available in Expo Go. Please run a development build.'
        ),
      };
    }

    const googleModule = await import('@react-native-google-signin/google-signin');
    const GoogleSignin = googleModule.GoogleSignin;
    statusCodes = googleModule.statusCodes;

    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
    });

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices();
    }

    const userInfo = await GoogleSignin.signIn();
    const idToken = (userInfo.data as { idToken?: string } | undefined)?.idToken;

    if (!idToken) {
      if (userInfo.data === null) {
        return { data: null, error: null };
      }
      return { data: null, error: new Error('No ID token from Google') };
    }

    // Supabase Google provider must have "Skip nonce check" enabled for this native flow.
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      return { data: null, error };
    }

    return {
      data: data?.user && data?.session ? { user: data.user, session: data.session } : null,
      error: data?.session ? null : new Error('No session returned'),
    };
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };

    if (e?.message?.includes('RNGoogleSignin')) {
      return {
        data: null,
        error: new Error(
          'Google Sign-In native module is not available in this build. Create a dev/client build and run the app again.'
        ),
      };
    }

    if (e?.code === statusCodes?.SIGN_IN_CANCELLED) {
      return { data: null, error: null };
    }

    if (
      e?.code === statusCodes?.IN_PROGRESS ||
      e?.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE
    ) {
      return { data: null, error: new Error(e?.message ?? 'Google sign-in failed') };
    }

    return {
      data: null,
      error: e instanceof Error ? e : new Error(String(e?.message ?? 'Google sign-in failed')),
    };
  }
}

function generateNonce(length = 32): string {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export async function signInWithApple(): Promise<AuthResult> {
  try {
    console.log('[auth][apple] Starting Apple sign-in flow');

    if (Platform.OS !== 'ios') {
      console.log('[auth][apple] Blocked: platform is not iOS', { platform: Platform.OS });
      return {
        data: null,
        error: new Error('Apple Sign-In is only available on iOS.'),
      };
    }

    const AppleAuthentication = await import('expo-apple-authentication');
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    console.log('[auth][apple] AppleAuthentication availability', { isAvailable });

    if (!isAvailable) {
      return {
        data: null,
        error: new Error('Apple Sign-In is not available on this device.'),
      };
    }

    const rawNonce = generateNonce();
    const hashedNonce = sha256(rawNonce);

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    console.log('[auth][apple] Apple credential received', {
      hasIdentityToken: Boolean(credential.identityToken),
      hasAuthorizationCode: Boolean(credential.authorizationCode),
      user: credential.user,
      email: credential.email ?? null,
      fullName: credential.fullName ?? null,
      realUserStatus: credential.realUserStatus ?? null,
      state: credential.state ?? null,
    });

    if (!credential.identityToken) {
      return { data: null, error: new Error('No identity token from Apple') };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });
    console.log('[auth][apple] Supabase signInWithIdToken result', {
      hasUser: Boolean(data?.user),
      hasSession: Boolean(data?.session),
      errorMessage: error?.message ?? null,
      errorName: error?.name ?? null,
      errorStatus: (error as { status?: number } | null)?.status ?? null,
      errorCode: (error as { code?: string } | null)?.code ?? null,
    });

    if (error) {
      return { data: null, error };
    }

    return {
      data: data?.user && data?.session ? { user: data.user, session: data.session } : null,
      error: data?.session ? null : new Error('No session returned'),
    };
  } catch (err: unknown) {
    const e = err as {
      code?: string | number;
      message?: string;
      domain?: string;
      userInfo?: unknown;
      nativeStackIOS?: unknown;
      stack?: string;
    };
    console.log('[auth][apple] Exception during Apple sign-in', {
      code: e?.code ?? null,
      domain: e?.domain ?? null,
      message: e?.message ?? null,
      userInfo: e?.userInfo ?? null,
      nativeStackIOS: e?.nativeStackIOS ?? null,
      stack: e?.stack ?? null,
      rawError: err,
    });

    if (e?.code === 'ERR_REQUEST_CANCELED') {
      return { data: null, error: null };
    }

    return {
      data: null,
      error: e instanceof Error ? e : new Error(String(e?.message ?? 'Apple sign in failed')),
    };
  }
}

export async function signOut(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error ?? null };
}

export async function getSession(): Promise<{ session: Session | null; error: Error | null }> {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session ?? null, error: error ?? null };
}

export async function getUser(): Promise<{ user: User | null; error: Error | null }> {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user ?? null, error: error ?? null };
}