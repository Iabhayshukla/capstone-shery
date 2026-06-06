import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../../lib/supabase';
import { LoginCredentials, SignUpCredentials } from '../types/auth.types';
import { login as apiLogin, signUp as apiSignUp, logout as apiLogout } from '../api/auth.api';
import { AuthContext } from './AuthContextDef';

// Re-export the type for external consumers
export type { AuthContextType } from './AuthContextDef';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<import('../types/auth.types').AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initialize from existing session (handles page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.full_name,
        });
        setAccessToken(session.access_token);
      }
      setLoading(false);
    });

    // 2. Subscribe to future auth state changes (login, logout, token refresh, OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.full_name,
        });
        setAccessToken(session.access_token);
      } else {
        setUser(null);
        setAccessToken(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    // Calls API. Note that apiLogin already calls supabase.auth.setSession() internally
    // which triggers the onAuthStateChange listener.
    await apiLogin(credentials);
  };

  const handleSignup = async (credentials: SignUpCredentials) => {
    await apiSignUp(credentials);
    // After signup, log in to establish session
    await handleLogin({ email: credentials.email, password: credentials.password });
  };

  const handleLogout = async () => {
    if (accessToken) {
      try {
        await apiLogout(accessToken);
      } catch (err) {
        console.warn('[AuthContext] Server-side logout warning:', err);
      }
    }
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
  };

  const handleLoginWithGoogle = async (redirectTo?: string) => {
    const redirectUrl = window.location.origin + (redirectTo || '/dashboard');
    const { getGoogleOAuthUrl } = await import('../api/auth.api');
    const url = await getGoogleOAuthUrl(redirectUrl);
    window.location.href = url;
  };

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    loginWithGoogle: handleLoginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
