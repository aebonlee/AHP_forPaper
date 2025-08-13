import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { runMigrations } from './database/migrate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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