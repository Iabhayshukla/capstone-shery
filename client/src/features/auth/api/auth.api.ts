import { supabase } from '../../../lib/supabase';
import type { SignUpCredentials, LoginCredentials } from '../types/auth.types';

const API_BASE = import.meta.env.VITE_API_URL as string;

/**
 * Sign up a new user via our backend (which uses service role to auto-confirm).
 */
export async function signUp(credentials: SignUpCredentials) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Sign up failed.');
  return data;
}

/**
 * Log in with email + password via our backend.
 */
export async function login(credentials: LoginCredentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Login failed.');

  // Set the Supabase session in the browser to sync the client-side library
  if (data.accessToken && data.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
    });
    if (error) {
      console.error('[auth.api] failed to set browser Supabase session:', error.message);
    }
  }

  return data; // { accessToken, refreshToken, user }
}

/**
 * Log out the current user — clears Supabase local session.
 */
export async function logout(accessToken: string) {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  // Always sign out locally regardless of server response
  await supabase.auth.signOut();
}

/**
 * Get the Google OAuth redirect URL from the backend.
 */
export async function getGoogleOAuthUrl(redirectTo?: string): Promise<string> {
  const params = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';
  const res = await fetch(`${API_BASE}/auth/google${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to start Google sign-in.');
  return data.url as string;
}

/**
 * Send a password reset email.
 */
export async function sendPasswordReset(email: string, redirectTo?: string) {
  const params = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';
  const res = await fetch(`${API_BASE}/auth/password-reset${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to send reset email.');
  return data;
}

/**
 * Fetch the currently authenticated user's profile.
 */
export async function getMe(accessToken: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to fetch profile.');
  return data;
}