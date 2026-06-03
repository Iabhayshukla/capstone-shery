import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Central error handling middleware.
 * Always responds with JSON and never exposes internal stack traces to clients.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;

  // Log the full error server-side for debugging
  console.error(`[errorHandler] ${statusCode} - ${err.message}`, {
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Respond with a user-friendly message — never expose raw DB or stack details
  res.status(statusCode).json({
    error: httpStatusText(statusCode),
    message: clientSafeMessage(statusCode, err.message),
    ...(process.env.NODE_ENV === 'development' && { debug: err.message }),
  });
}

function httpStatusText(code: number): string {
  const map: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  };
  return map[code] ?? 'Error';
}

function clientSafeMessage(code: number, originalMessage: string): string {
  if (code < 500) return originalMessage; // Client errors are safe to surface
  // Never expose internal server error details to clients
  return 'Something went wrong on our end. Please try again in a moment.';
}

/**
 * Helper to create typed AppErrors from anywhere in the app.
 */
export function createError(message: string, statusCode = 500, code?: string): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.code = code;
  return err;
}