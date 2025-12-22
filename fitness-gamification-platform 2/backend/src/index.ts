import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { setupCronJobs } from './jobs/cron';
import { closePool } from './database/connection';

// Load environment variables
dotenv.config();

// Load environment variables
dotenv.config();

// DEBUG - Voir DATABASE_URL
console.log('🔍 DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('🔍 DATABASE_URL value:', process.env.DATABASE_URL?.substring(0, 50) + '...');
console.log('🔍 All env vars:', Object.keys(process.env).filter(k => k.includes('DATA')));

// Import routes
import authRoutes from './routes/auth.routes';
```

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

const corsMiddleware = cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

app.use(corsMiddleware);
app.options('*', corsMiddleware);


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

// ... (gardez vos imports et middlewares au début)

// LOG DE DÉBOGAGE DES ROUTES (À ajouter avant vos routes)
app.use((req, res, next) => {
  console.log(`Requête entrante: ${req.method} ${req.url}`);
  next();
});

// API routes
const API_PREFIX = `/api/${API_VERSION}`;
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/health`, healthRoutes);

// ROUTES DE BASE
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'running', api_prefix: API_PREFIX });
});

// ============================================================================
// ERROR HANDLING
// ===============================================================================================================================

app.use((req: Request, res: Response) => {
  console.error(`Route non trouvée : ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    attemptedPath: req.originalUrl,
    expectedPrefix: API_PREFIX
  });
});

// ... (gardez le reste du code server startup)
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
