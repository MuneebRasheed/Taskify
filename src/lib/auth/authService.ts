import { supabase } from '../supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AuthResult = {
  data: { user: User; session: Session } | null;
  error: Error | null;
};

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