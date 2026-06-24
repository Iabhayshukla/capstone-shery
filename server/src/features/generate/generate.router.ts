import { Router, Request, Response, NextFunction } from 'express';
import { authGuard, AuthenticatedRequest } from '../../middleware/authGuard';
import { rateLimiter } from '../../middleware/rateLimiter';
import { createError } from '../../middleware/errorHandler';
import { generateAndStream } from './generate.service';
import { checkTokenQuota } from '../usage/usage.service';
import { GenerateRequestBody } from './generate.types';

const router = Router();

router.use(authGuard);
router.use(rateLimiter);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as GenerateRequestBody;
  const { userId } = req as AuthenticatedRequest;

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

  // Check token quota before proceeding
  try {
    await checkTokenQuota(userId);
  } catch (err: any) {
    return next(err);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch {}
  }, 20_000);

  const cleanup = () => {
    clearInterval(heartbeat);
    if (!res.writableEnded) {
      try { res.end(); } catch {}
    }
  };
  req.on('close', cleanup);
  req.on('abort', cleanup);

  try {
    console.log(
      `[generate] userId=${userId} projectId=${body.projectId} sectionId=${body.sectionId ?? 'none'}`
    );
    await generateAndStream(body, userId, res);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'LLM generation failed. Please try again.';
    console.error('[generate] Stream error:', message);
    try {
      res.write(
        `event: error\ndata: ${JSON.stringify({ message: 'Generation failed. Please try again.' })}\n\n`
      );
    } catch {}
  } finally {
    cleanup();
    res.end();
  }
});

export default router;