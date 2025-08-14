// 환경별 데이터베이스 연결 설정
const isDevelopment = process.env.NODE_ENV === 'development';
const usePostgreSQL = process.env.DATABASE_URL && process.env.NODE_ENV === 'production';

if (usePostgreSQL) {
  // 프로덕션: PostgreSQL 사용
  const { Pool } = require('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  pool.on('error', (err: any) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
  
  export const query = (text: string, params?: any[]) => {
    // PostgreSQL 플레이스홀더로 변환 (? → $1, $2, ...)
    let pgQuery = text;
    let pgParams = params || [];
    
    if (params && params.length > 0) {
      pgQuery = text.replace(/\?/g, () => `$${pgParams.indexOf(params[pgParams.indexOf(params[0])]) + 1}`);
      // 간단한 방법: 매개변수 순서대로 교체
      let paramIndex = 1;
      pgQuery = text.replace(/\?/g, () => `$${paramIndex++}`);
    }
    
    return pool.query(pgQuery, pgParams);
  };
  
  export const initDatabase = async () => {
    console.log('Using PostgreSQL - skipping local initialization');
  };
  
} else {
  // 로컬 개발: SQLite 사용
  const sqlite3 = require('sqlite3');
  const path = require('path');
  
  const dbPath = path.join(__dirname, '../../database.sqlite');
  
  const db = new sqlite3.Database(dbPath, (err: any) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database:', dbPath);
    }
  });
  
  export const query = (sql: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
      const isSelect = sql.trim().toLowerCase().startsWith('select');
      
      if (isSelect) {
        db.all(sql, params, (err: any, rows: any) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows, rowCount: rows.length });
          }
        });
      } else {
        db.run(sql, params, function(err: any) {
          if (err) {
            reject(err);
          } else {
            resolve({ 
              rows: [{ id: (this as any).lastID }], 
              rowCount: (this as any).changes,
              lastID: (this as any).lastID,
              changes: (this as any).changes
            });
          }
        });
      }
    });
  };
  
  export const initDatabase = async () => {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          role TEXT CHECK(role IN ('admin', 'evaluator')) NOT NULL DEFAULT 'evaluator',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          objective TEXT,
          status TEXT CHECK(status IN ('draft', 'active', 'completed')) NOT NULL DEFAULT 'draft',
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await query(`
        INSERT OR IGNORE INTO users (email, password, first_name, last_name, role) 
        VALUES (?, ?, ?, ?, ?)
      `, ['admin@ahp-system.com', hashedPassword, 'Admin', 'User', 'admin']);

      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  };
}