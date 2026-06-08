import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Recursively sanitize a value against XSS attacks.
 */
function sanitizeValue(value: unknown, key?: string): unknown {
  if (key === 'currentCode') {
    return value; // Bypass XSS sanitization for generated website HTML code
  }
  if (typeof value === 'string') {
    return xss(value.trim());
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeValue(v));
  }
  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      sanitized[k] = sanitizeValue(v, k);
    }
    return sanitized;
  }
  return value;
}

/**
 * Middleware that sanitizes req.body, req.params, and req.query
 * to prevent XSS payloads from reaching the database or LLM.
 */
export function sanitise(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params) as Record<string, string>;
  }
  if (req.query) {
    req.query = sanitizeValue(req.query) as Record<string, string>;
  }
  next();
}