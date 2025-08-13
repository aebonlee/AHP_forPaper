import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { runMigrations } from './database/migrate';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import criteriaRoutes from './routes/criteria';
import alternativeRoutes from './routes/alternatives';
import comparisonRoutes from './routes/comparisons';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ 
    message: 'AHP Decision Support System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      projects: '/api/projects',
      criteria: '/api/criteria',
      alternatives: '/api/alternatives',
      comparisons: '/api/comparisons',
      users: '/api/users'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/criteria', criteriaRoutes);
app.use('/api/alternatives', alternativeRoutes);
app.use('/api/comparisons', comparisonRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  if (process.env.DATABASE_URL) {
    try {
      await runMigrations();
    } catch (error) {
      console.error('Failed to run migrations:', error);
    }
  } else {
    console.warn('⚠️  DATABASE_URL not set - skipping migrations');
  }
});