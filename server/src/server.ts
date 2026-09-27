import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { config, getSafeConfigDiagnostic } from './config/env';
import paymentRoutes from './routes/paymentRoutes';
import adminRoutes from './routes/adminRoutes';
import storeRoutes from './routes/storeRoutes';

const app = express();

// Enable CORS for local Vite dev server and common frontend hosts
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging without sensitive data
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'FURNITURA Luxury Commerce & Admin Server',
    timestamp: new Date().toISOString(),
    sandbox: getSafeConfigDiagnostic(),
  });
});

// Mount Routes
app.use('/api/admin', adminRoutes);
app.use('/api/store', storeRoutes);
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
  console.error('[Server Error Uncaught]', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred. Please try again later.',
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`✨ FURNITURA Luxury Payment Backend Live`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`💳 MTN MoMo Environment: ${config.mtnTargetEnvironment.toUpperCase()}`);
  console.log(`⚙️ Mode: ${getSafeConfigDiagnostic().mode}`);
  console.log(`=========================================`);
});

export default app;
