import { supabaseAdmin } from '../../lib/supabase';
import { createError } from '../../middleware/errorHandler';

export async function signUpWithEmail(email: string, password: string, name?: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm for dev; set to false + enable email confirmations in prod
    user_metadata: name ? { full_name: name } : undefined,
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      throw createError('An account with this email already exists.', 409);
    }
    throw createError('Failed to create account. Please try again.', 500);
  }

  return {
    userId: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.full_name,
  };
}

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Never reveal whether the email or password is wrong specifically
    throw createError('Invalid email or password.', 401);
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.full_name,
    },
  };
}

export async function refreshSession(refreshToken: string) {
  const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session) {
    throw createError('Session refresh failed. Please log in again.', 401);
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

export async function getGoogleOAuthUrl(redirectTo: string) {
  const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error || !data.url) {
    throw createError('Failed to initiate Google sign-in.', 500);
  }

  return data.url;
}

export async function logoutUser(accessToken: string) {
  // Revoke the session server-side
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
  if (error) {
    // Non-fatal: token may already be expired
    console.warn('[auth.service] logout warning:', error.message);
  }
}