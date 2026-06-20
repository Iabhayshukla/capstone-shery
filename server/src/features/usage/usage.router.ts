import { Router, Request, Response, NextFunction } from 'express';
import { authGuard, AuthenticatedRequest } from '../../middleware/authGuard';
import { getTokenUsage } from './usage.service';

const router = Router();
router.use(authGuard);

router.get('/tokens', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const usage = await getTokenUsage(userId);
    res.json(usage);
  } catch (err) {
    next(err);
  }
});

export default router;