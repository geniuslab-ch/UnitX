import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { setupCronJobs } from './jobs/cron';
import { closePool } from './database/connection';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';

const app: Application = express();

// Trust proxy for Railway (CRITICAL - must be before other middleware)
app.set('trust proxy', 1);

const API_VERSION = process.env.API_VERSION || 'v1';

// PORT doit être un number (Railway fournit PORT en string)
const PORT = Number(process.env.PORT ?? 3000);
if (Number.isNaN(PORT)) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security
app.use(helmet());

// CORS
const corsOrigin =
  process.env.CORS_ORIGIN?.split(',')
    .map(s => s.trim())
    .filter(Boolean) ?? ['http://localhost:3001'];
  })
);

app.options('*', cors({
  origin: corsOrigin,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Fitness Gamification Platform API',
    version: API_VERSION,
    status: 'running',
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/health`, healthRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🏋️  Fitness Gamification Platform API                    ║
║                                                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}     ║
║  Port: ${PORT}                                             ║
║  Host: 0.0.0.0                                             ║
║  API Version: ${API_VERSION}                               ║
╚═══════════════════════════════════════════════════════════╝
  `);

  if (process.env.NODE_ENV !== 'test') {
    setupCronJobs();
  }
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP server closed');

    try {
      await closePool();
      console.log('Database connections closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

export default app;
