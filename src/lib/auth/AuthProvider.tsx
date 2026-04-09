import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { supabase } from '../supabase/client';
import * as authService from './authService';
import {
  logOutRevenueCat,
  syncRevenueCatUserIdentity,
} from '../purchasesService';
import { useOfferingsStore } from '../../../store/offeringsStore';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<authService.AuthResult>;
  signInWithGoogle: () => Promise<authService.AuthResult>;
  signInWithApple: () => Promise<authService.AuthResult>;
  signUp: (email: string, password: string) => Promise<authService.AuthResult>;
  signOut: () => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setCustomerInfo = useOfferingsStore((state) => state.setCustomerInfo);

  const validateCurrentSession = useCallback(async () => {
    const { session: activeSession } = await authService.getSession();
    if (!activeSession) {
      setSession(null);
      setUser(null);
      return;
    }

    const { user: freshUser, error: userError } = await authService.getUser();
    if (userError || !freshUser) {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      return;
    }

    setSession(activeSession);
    setUser(freshUser);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await validateCurrentSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [validateCurrentSession]);

  useEffect(() => {
    let cancelled = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!nextSession) {
        if (cancelled) return;
        setSession(null);
        setUser(null);
        return;
      }

      // Same validation as on startup: if the user was deleted, kill the local session.
      const { user: freshUser, error: userError } = await authService.getUser();
      if (userError || !freshUser) {
        await supabase.auth.signOut();
        if (cancelled) return;
        setSession(null);
        setUser(null);
        return;
      }

      if (cancelled) return;
      setSession(nextSession);
      setUser(freshUser);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void validateCurrentSession();
      }
    });
    return () => subscription.remove();
  }, [validateCurrentSession]);

  useEffect(() => {
    const syncIdentity = async () => {
      if (!user?.id) {
        await logOutRevenueCat();
        setCustomerInfo(null);
        return;
      }
      const customerInfo = await syncRevenueCatUserIdentity(user.id, user.email);
      if (customerInfo) {
        setCustomerInfo(customerInfo);
      }
    };
    void syncIdentity();
  }, [setCustomerInfo, user?.email, user?.id]);

  const signIn = useCallback(authService.signIn, []);
  const signInWithGoogle = useCallback(authService.signInWithGoogle, []);
  const signInWithApple = useCallback(authService.signInWithApple, []);
  const signUp = useCallback(authService.signUp, []);
  const signOut = useCallback(async () => {
    await logOutRevenueCat();
    setCustomerInfo(null);
    return authService.signOut();
  }, [setCustomerInfo]);

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
