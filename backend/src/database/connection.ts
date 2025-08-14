import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

let query: (sql: string, params?: any[]) => Promise<any>;
let initDatabase: () => Promise<void>;

// Use SQLite for local development, PostgreSQL for production
if (process.env.DATABASE_URL) {
  // Production: PostgreSQL
  const { Pool } = require('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  pool.on('error', (err: any) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  query = (text: string, params?: any[]) => pool.query(text, params);
  
  initDatabase = async () => {
    console.log('Using PostgreSQL - initialization handled by migrations');
  };
} else {
  // Development: SQLite
  const dbPath = path.join(__dirname, '../../database.sqlite');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database:', dbPath);
    }
  });

  query = (sql: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
      const isSelect = sql.trim().toLowerCase().startsWith('select');
      
      if (isSelect) {
        db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows, rowCount: rows.length });
          }
        });
      } else {
        db.run(sql, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ 
              rows: [{ id: this.lastID }], 
              rowCount: this.changes,
              lastID: this.lastID,
              changes: this.changes
            });
          }
        });
      }
    });
  };

  initDatabase = async () => {
    try {
      // Drop existing tables to ensure clean schema
      await query(`DROP TABLE IF EXISTS users`);
      await query(`DROP TABLE IF EXISTS projects`);
      
      await query(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          role TEXT CHECK(role IN ('admin', 'evaluator')) NOT NULL DEFAULT 'evaluator',
          is_active BOOLEAN NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await query(`
        CREATE TABLE projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          objective TEXT,
          admin_id INTEGER NOT NULL,
          status TEXT DEFAULT 'draft',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES users(id)
        )
      `);

      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['admin@ahp-system.com', hashedPassword, 'Admin', 'User', 'admin', 1]);

      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  };
}

export { query, initDatabase };