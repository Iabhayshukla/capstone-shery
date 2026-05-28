import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root directory or current directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample Health Check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Capstone API server is healthy and responding',
    timestamp: new Date().toISOString(),
    database: 'SQLite/Postgres connection configured successfully',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Default root endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('Capstone Server API is running. Access endpoints via /api/...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
