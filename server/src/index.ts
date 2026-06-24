import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables — root .env takes priority
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import { errorHandler } from './middleware/errorHandler';
import authRouter from './features/auth/auth.router';
import projectsRouter from './features/projects/projects.router';
import generateRouter from './features/generate/generate.router';
import usageRouter from './features/usage/usage.router'; // ← new

const app = express();
const PORT = process.env.PORT ?? 5000;

if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_ORIGIN) {
  console.warn('⚠️  WARNING: CLIENT_ORIGIN is not set. CORS will reject all cross-origin requests in production.');
}

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_ORIGIN ?? false
    : true,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'AI Website Builder API is running.' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'API server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

// Auth routes (signup, login, logout, refresh, Google OAuth)
app.use('/api/auth', authRouter);

// Project CRUD routes (protected — require valid JWT)
app.use('/api/projects', projectsRouter);

// LLM generation route — streams HTML via SSE (protected + rate-limited)
app.use('/api/generate', generateRouter);

// Token usage route (protected)
app.use('/api/usage', usageRouter); // ← new

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested endpoint does not exist.' });
});

// ─── Central Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('=========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👉 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth:   http://localhost:${PORT}/api/auth`);
  console.log(`📁 Projects: http://localhost:${PORT}/api/projects`);
  console.log(`🤖 Generate: http://localhost:${PORT}/api/generate`);
  console.log(`📊 Usage:   http://localhost:${PORT}/api/usage`);   // ← new
  console.log('=========================================');
});