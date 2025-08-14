import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { runMigrations } from './database/migrate';
import WorkshopSyncService from './services/workshopSync';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import criteriaRoutes from './routes/criteria';
import alternativesRoutes from './routes/alternatives';
import comparisonsRoutes from './routes/comparisons';
import evaluateRoutes from './routes/evaluate';
import evaluatorsRoutes from './routes/evaluators';
import resultsRoutes from './routes/results';
import analysisRoutes from './routes/analysis';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize WebSocket service
const workshopSync = new WorkshopSyncService(httpServer);

// Trust proxy for Render.com
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// Enhanced CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'https://aebonlee.github.io',
  'https://ahp-frontend-render.onrender.com',
  'https://ahp-forpaper.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === origin) {
      return callback(null, true);
    }
    
    // In development, allow any origin
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', criteriaRoutes);
app.use('/api', alternativesRoutes);
app.use('/api/comparisons', comparisonsRoutes);
app.use('/api/evaluate', evaluateRoutes);
app.use('/api/evaluators', evaluatorsRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/analysis', analysisRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Workshop status API endpoint
app.get('/api/workshop/:projectId', (req, res) => {
  const workshopInfo = workshopSync.getWorkshopInfo(req.params.projectId);
  if (workshopInfo) {
    res.json(workshopInfo);
  } else {
    res.status(404).json({ error: 'Workshop not found' });
  }
});

app.get('/api/workshops', (req, res) => {
  const workshops = workshopSync.getAllWorkshops();
  res.json({ workshops });
});

// Start server
const server = httpServer.listen(PORT, async () => {
  console.log(`🚀 AHP Backend Server started`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 Health check: /api/health`);
  
  if (process.env.DATABASE_URL) {
    try {
      console.log('🔧 Running database migrations...');
      await runMigrations();
      console.log('✅ Database migrations completed successfully');
    } catch (error) {
      console.error('❌ Failed to run migrations:', error);
      // Don't exit in production, log the error and continue
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
    }
  } else {
    console.warn('⚠️  DATABASE_URL not set - skipping migrations');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});