import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Import routes
import authLocalRoutes from './routes/authLocal';
import appointmentRoutes from './routes/appointments';
import professionalRoutes from './routes/professionals';
import clientRoutes from './routes/clients';
import financialRoutes from './routes/financial';
import settingsRoutes from './routes/settings';

// Load environment variables
dotenv.config();

// Validate required env vars (JWT_SECRET is critical)
const requiredEnvVars = ['JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Initialize Express
const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase client (optional - using local auth for now)
export const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  : null;

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authLocalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║  🏥 Essence Clinic - Backend       ║
║  🚀 Server running on port ${PORT}   ║
║  📍 http://localhost:${PORT}         ║
║  🌍 API: http://localhost:${PORT}/api ║
╚════════════════════════════════════╝
  `);
});

export default app;
