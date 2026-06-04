import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export interface AuthenticatedRequest extends Request {
  userId: string;
  userEmail: string;
  accessToken: string;
  userName?: string;
}

/**
 * Middleware that validates the JWT from the Authorization header.
 * On success, attaches userId, userEmail, and accessToken to the request.
 * On failure, responds with 401 — fail-closed, no partial auth.
 */
export async function authGuard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Your session has expired or is invalid. Please log in again.',
      });
      return;
    }

    // Attach user context to the request object
    const authReq = req as AuthenticatedRequest;
    authReq.userId = data.user.id;
    authReq.userEmail = data.user.email ?? '';
    authReq.accessToken = token;
    authReq.userName = data.user.user_metadata?.full_name;

    next();
  } catch (err) {
    // Fail-closed: any unexpected error rejects the request
    console.error('[authGuard] Unexpected error during JWT validation:', err);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Session validation failed. Please log in again.',
    });
  }
}