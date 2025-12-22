import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { setupCronJobs } from './jobs/cron';
import { closePool } from './database/db';

// Import routes
import loginRoutes from './routes/login.routes';
import healthRoutes from './routes/health.routes';
import brandRoutes from './routes/brand.routes';
import clubRoutes from './routes/club.routes';
import seasonRoutes from './routes/season.routes';

// Load environment variables
dotenv.config();

const app: Application = express();

// ============================================================================
// CONFIGURATION & LOGGING INITIAL
// ============================================================================

app.set('trust proxy', 1);

const API_VERSION = process.env.API_VERSION || 'v1';
const PORT = Number(process.env.PORT ?? 3000);

// Request logging (Placé ici pour tout voir, même les 404)
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(helmet());

const corsOrigin = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean) ?? ['http://localhost:3001'];
app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting uniquement sur l'API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================================================
// ROUTES
// ============================================================================

// Routes de base (Utile pour vérifier si le serveur répond sur Railway)
app.get('/', (req, res) => res.json({ status: 'running', version: API_VERSION }));
app.get('/health', (req, res) => res.json({ status: 'healthy', time: new Date() }));

// Montage des routes API
const apiRouter = express.Router();

// Correction ici : on enregistre chaque module de route
apiRouter.use('/auth', loginRoutes); // Sera accessible sur /api/v1/auth/login
apiRouter.use('/brands', brandRoutes);
apiRouter.use('/clubs', clubRoutes);
apiRouter.use('/seasons', seasonRoutes);
apiRouter.use('/health-check', healthRoutes);

// Application du préfixe global
app.use(`/api/${API_VERSION}`, apiRouter);

// ============================================================================
// GESTION DES ERREURS
// ============================================================================

// Handler 404 - Si aucune route ne correspond
app.use((req: Request, res: Response) => {
    console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'Route not found', 
        path: req.originalUrl,
        message: `Vérifiez que l'URL est bien /api/${API_VERSION}/votre-route`
    });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ Server Error:', err);
    res.status(err.status || 500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================================================
// DÉMARRAGE
// ============================================================================

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ready on port ${PORT} (API: /api/${API_VERSION})`);
    if (process.env.NODE_ENV !== 'test') setupCronJobs();
});

export default app;
