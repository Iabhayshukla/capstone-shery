import { Router, Request, Response, NextFunction } from 'express';
import { sanitise } from '../../middleware/sanitise';
import { authGuard, AuthenticatedRequest } from '../../middleware/authGuard';
import {
  signUpWithEmail,
  loginWithEmail,
  refreshSession,
  getGoogleOAuthUrl,
  logoutUser,
} from './auth.service';
import { SignUpBody, LoginBody, PasswordResetBody } from './auth.types';
import { supabaseAdmin } from '../../lib/supabase';
import { createError } from '../../middleware/errorHandler';

const router = Router();

// Apply XSS sanitisation to all auth routes
router.use(sanitise);

/**
 * POST /api/auth/signup
 * Register a new user with email + password.
 */
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as SignUpBody;

    if (!email || !password) {
      return next(createError('Email and password are required.', 400));
    }
    if (password.length < 8) {
      return next(createError('Password must be at least 8 characters.', 400));
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return next(createError('Please enter a valid email address.', 400));
    }

    const result = await signUpWithEmail(email, password);
    res.status(201).json({ message: 'Account created successfully.', user: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Log in with email + password. Returns JWT access and refresh tokens.
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
      return next(createError('Email and password are required.', 400));
    }

    const result = await loginWithEmail(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/refresh
 * Exchange a refresh token for a new access token (session persistence).
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
      return next(createError('Refresh token is required.', 400));
    }

    const result = await refreshSession(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 * Invalidate the current session server-side.
 */
router.post('/logout', authGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    await logoutUser(authReq.accessToken);
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/google
 * Redirect the client to Google OAuth consent screen.
 * Query param: redirectTo — the URL Supabase should redirect back to after OAuth.
 */
router.get('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redirectTo = (req.query.redirectTo as string) || `${req.protocol}://${req.get('host')}`;
    const oauthUrl = await getGoogleOAuthUrl(redirectTo);
    res.json({ url: oauthUrl });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/password-reset
 * Send a password reset email.
 */
router.post('/password-reset', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as PasswordResetBody;

    if (!email) {
      return next(createError('Email is required.', 400));
    }

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);

    if (error) {
      throw createError('Failed to send password reset email.', 500);
    }

    // Always respond with 200 even if email doesn't exist — prevents email enumeration
    res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 */
router.get('/me', authGuard, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  res.json({
    id: authReq.userId,
    email: authReq.userEmail,
  });
});

export default router;