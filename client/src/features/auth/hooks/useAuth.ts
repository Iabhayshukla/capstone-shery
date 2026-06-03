import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { AuthUser } from '../types/auth.types';

export interface UseAuthReturn {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

/**
 * Hook that subscribes to Supabase auth state changes.
 * Persists session across browser refreshes via Supabase's built-in localStorage.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize from existing session (handles page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
        setAccessToken(session.access_token);
      }
      setLoading(false);
    });

    // Subscribe to future auth state changes (login, logout, token refresh, OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
        setAccessToken(session.access_token);
      } else {
        setUser(null);
        setAccessToken(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, accessToken, loading, signOut };
}