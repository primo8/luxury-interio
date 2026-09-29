import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { config, getSafeConfigDiagnostic } from './config/env';
import { connectDatabase, disconnectDatabase, getDatabaseStatus, isDatabaseConnected } from './config/database';
import { initFirebaseAdmin } from './config/firebase';
import { syncDatabaseWithMongo } from './db/sync';
import paymentRoutes from './routes/paymentRoutes';
import adminRoutes from './routes/adminRoutes';
import storeRoutes from './routes/storeRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// Initialize Cloud Connections on startup
connectDatabase()
  .then(async (connected) => {
    if (connected) {
      await syncDatabaseWithMongo();
    }
  })
  .catch((err) => console.error('Initial DB connection error:', err));

initFirebaseAdmin();

// Configurable CORS for Cloudflare Pages Storefront & Admin
const rawCorsOrigins = process.env.CORS_ORIGINS || '';
const configuredOrigins = rawCorsOrigins
  ? rawCorsOrigins.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // In local development, allow localhost origins
      if (process.env.NODE_ENV !== 'production') {
        if (
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          configuredOrigins.includes(origin)
        ) {
          return callback(null, true); 
        }
      }

      // In production, allow configured origins and all Cloudflare Workers & Pages domains
      if (
        (configuredOrigins.length > 0 && configuredOrigins.includes(origin)) ||
        origin.endsWith('.workers.dev') ||
        origin.endsWith('.pages.dev') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS] Request blocked from unauthorized origin: ${origin}`);
      return callback(new Error(`Origin '${origin}' is not allowed by CORS policy.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Production request logger (sanitizes secrets and query tokens)
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// 1. Root & Render Web Service Health Check Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'FURNITURA Luxury Commerce Cloud API',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

app.get('/health', (_req: Request, res: Response) => {
  const dbConnected = isDatabaseConnected();
  const isProd = process.env.NODE_ENV === 'production';

  res.status(isProd && !dbConnected ? 503 : 200).json({
    status: dbConnected || !isProd ? 'ok' : 'degraded',
    environment: process.env.NODE_ENV || 'production',
    service: 'FURNITURA Commerce Engine',
    database: dbConnected ? 'connected' : (isProd ? 'disconnected' : 'in-memory-fallback'),
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/database', (_req: Request, res: Response) => {
  const status = getDatabaseStatus();
  const isProd = process.env.NODE_ENV === 'production';

  res.status(isProd && !status.connected ? 503 : 200).json({
    status: status.connected ? 'ok' : (isProd ? 'error' : 'development-fallback'),
    database: status,
    timestamp: new Date().toISOString(),
  });
});

// 2. API Health Diagnostic
app.get('/api/health', (_req: Request, res: Response) => {
  const dbConnected = isDatabaseConnected();
  const isProd = process.env.NODE_ENV === 'production';

  res.status(isProd && !dbConnected ? 503 : 200).json({
    status: dbConnected || !isProd ? 'ok' : 'degraded',
    service: 'FURNITURA Luxury Commerce & Admin Server',
    environment: process.env.NODE_ENV || 'production',
    database: dbConnected ? 'connected' : (isProd ? 'disconnected' : 'in-memory-fallback'),
    timestamp: new Date().toISOString(),
    sandbox: getSafeConfigDiagnostic(),
  });
});

// 3. Mount Business API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payments/mtn', paymentRoutes);

// Safe 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.path}`,
  });
});

// Safe global error handler (no secret leaks or raw stack traces)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error Uncaught]', err.message || err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred. Please try again later.',
  });
});

const PORT = parseInt(process.env.PORT || config.port.toString(), 10);
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`=========================================`);
  console.log(`✨ FURNITURA Luxury Cloud API Live`);
  console.log(`📡 URL: http://${HOST}:${PORT}`);
  console.log(`💳 MTN MoMo Environment: ${config.mtnEnv.toUpperCase()}`);
  console.log(`🗄️ Database: ${isDatabaseConnected() ? 'MongoDB Atlas' : 'In-Memory State'}`);
  console.log(`🔐 Firebase Admin: ${initFirebaseAdmin() ? 'Active' : 'Local Fallback'}`);
  console.log(`=========================================`);
});

// Graceful termination handling for Render container lifecycle
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 [Shutdown] Received ${signal}. Closing HTTP server and database connections...`);
  server.close(async () => {
    await disconnectDatabase();
    console.log('✅ [Shutdown] Clean shutdown completed. Process exiting.');
    process.exit(0);
  });

  // Force exit if hanging after 10s
  setTimeout(() => {
    console.error('❌ [Shutdown] Forcefully terminating process after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
