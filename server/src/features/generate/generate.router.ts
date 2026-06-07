import { Router, Request, Response, NextFunction } from 'express';
import { authGuard, AuthenticatedRequest } from '../../middleware/authGuard';
import { rateLimiter } from '../../middleware/rateLimiter';
import { createError } from '../../middleware/errorHandler';
import { generateAndStream } from './generate.service';
import { GenerateRequestBody } from './generate.types';

const router = Router();

// ─── Middleware chain: auth → rate-limit ─────────────────────────────────────
// NOTE: sanitise is intentionally NOT applied here.
// The prompt is free-form text sent to the LLM — XSS-encoding HTML entities
// (e.g. <, >, &) corrupts the instruction before it reaches the model.
// Sanitization is applied on project/auth routes where data is written to the DB.
router.use(authGuard);
router.use(rateLimiter);

/**
 * POST /api/generate
 *
 * Accepts a prompt and optional sectionId, streams HTML back via SSE.
 *
 * Request body:
 *   { prompt: string; projectId: string; sectionId?: string; currentHtml?: string }
 *
 * SSE events emitted:
 *   event: chunk  — { text: string }             streamed token fragment
 *   event: done   — { html: string }             full final HTML on completion
 *   event: error  — { message: string }          something went wrong
 *   event: retry  — { attempt, maxRetries }      transient failure, retrying
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as GenerateRequestBody;
  const { userId } = req as AuthenticatedRequest;

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
    return next(createError('prompt is required and must be a non-empty string.', 400));
  }

  if (body.prompt.trim().length > 2000) {
    return next(createError('prompt must be 2000 characters or fewer.', 400));
  }

  if (!body.projectId || typeof body.projectId !== 'string') {
    return next(createError('projectId is required.', 400));
  }

  if (body.sectionId && !body.currentHtml) {
    return next(createError('currentHtml is required when sectionId is provided.', 400));
  }

  // ── SSE Setup ────────────────────────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering if behind proxy
  res.flushHeaders();

  // Keep connection alive with a comment every 20s (prevents proxy timeouts)
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 20_000);

  const cleanup = () => clearInterval(heartbeat);
  req.on('close', cleanup);
  req.on('abort', cleanup);

  // ── Stream generation ────────────────────────────────────────────────────────
  try {
    console.log(
      `[generate] userId=${userId} projectId=${body.projectId} sectionId=${body.sectionId ?? 'none'}`
    );
    await generateAndStream(body, res);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'LLM generation failed. Please try again.';

    console.error('[generate] Stream error:', message);

    // Try to send an error SSE event before closing
    try {
      res.write(
        `event: error\ndata: ${JSON.stringify({ message: 'Generation failed. Please try again.' })}\n\n`
      );
    } catch {
      // Response may already be closed — ignore
    }
  } finally {
    cleanup();
    res.end();
  }
});

export default router;
