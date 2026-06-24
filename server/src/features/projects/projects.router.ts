import { Router, Request, Response, NextFunction } from 'express';
import { authGuard, AuthenticatedRequest } from '../../middleware/authGuard';
import { sanitise } from '../../middleware/sanitise';
import { createError } from '../../middleware/errorHandler';
import {
  getUserProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  getConversations,
  addConversationMessage,
} from './projects.service';
import { CreateProjectBody, UpdateProjectBody, AddConversationBody } from './projects.types';

const router = Router();

router.use(authGuard);
router.use(sanitise);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const projects = await getUserProjects(userId);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const project = await getProjectById(userId, req.params.id);
    res.json({ project });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as CreateProjectBody;

    if (!body.name || body.name.trim().length === 0) {
      return next(createError('Project name is required.', 400));
    }
    if (body.name.trim().length > 100) {
      return next(createError('Project name must be 100 characters or fewer.', 400));
    }

    const project = await createProject(userId, body);
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as UpdateProjectBody;

    if (body.name !== undefined && body.name.trim().length === 0) {
      return next(createError('Project name cannot be empty.', 400));
    }
    if (body.name !== undefined && body.name.trim().length > 100) {
      return next(createError('Project name must be 100 characters or fewer.', 400));
    }

    const project = await updateProject(userId, req.params.id, body);
    res.json({ project });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    await deleteProject(userId, req.params.id);
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// ─── Conversations ──────────────────────────────────────────────────────────

router.get('/:id/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    // Verify project ownership — throws 404 if not found or not owned
    await getProjectById(userId, req.params.id);
    const messages = await getConversations(req.params.id);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as AddConversationBody;

    if (!body.role || !['user', 'assistant'].includes(body.role)) {
      return next(createError('role must be "user" or "assistant".', 400));
    }
    if (!body.content || body.content.trim().length === 0) {
      return next(createError('content is required.', 400));
    }

    // Verify project ownership
    await getProjectById(userId, req.params.id);

    const message = await addConversationMessage(req.params.id, body);
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});

export default router;