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
} from './projects.service';
import { CreateProjectBody, UpdateProjectBody } from './projects.types';

const router = Router();

// All project routes require a valid session
router.use(authGuard);
// Sanitize all inputs
router.use(sanitise);

/**
 * GET /api/projects
 * Returns all projects for the authenticated user.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const projects = await getUserProjects(userId);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/projects/:id
 * Returns a single project by ID (must belong to the authenticated user).
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const project = await getProjectById(userId, req.params.id);
    res.json({ project });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/projects
 * Create a new project.
 */
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

/**
 * PUT /api/projects/:id
 * Update a project's name or current code.
 */
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

/**
 * DELETE /api/projects/:id
 * Permanently delete a project (and its generations via cascade in DB).
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    await deleteProject(userId, req.params.id);
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;