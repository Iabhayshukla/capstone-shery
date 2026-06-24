import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authGuard';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory store: userId → { count, windowStart }
// For production scale, replace with Redis/Upstash.
const store = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '10', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10);

/**
 * Per-user rate limiter for LLM generation endpoints.
 * Defaults to 10 requests per 60 seconds per user.
 * Must be used AFTER authGuard so req.userId is available.
 */
export function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userId = (req as AuthenticatedRequest).userId;

  if (!userId) {
    // authGuard should have caught this — defensive check
    res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
    return;
  }

  const now = Date.now();
  const entry = store.get(userId);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // New window
    store.set(userId, { count: 1, windowStart: now });
    next();
    return;
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    res.status(429).json({
      error: 'Too Many Requests',
      message: `You've reached the limit of ${MAX_REQUESTS} generations per minute. Please wait ${retryAfterSeconds} seconds before trying again.`,
      retryAfter: retryAfterSeconds,
    });
    return;
  }

  entry.count += 1;
  store.set(userId, entry);
  next();
}

// Periodically clean up expired entries to prevent memory leaks
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [userId, entry] of store.entries()) {
    if (now - entry.windowStart >= WINDOW_MS) {
      store.delete(userId);
    }
  }
}, WINDOW_MS);

// Allow clean shutdown
if (typeof process !== 'undefined') {
  process.once('SIGTERM', () => clearInterval(cleanupInterval));
  process.once('SIGINT', () => clearInterval(cleanupInterval));
}