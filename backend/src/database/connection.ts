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

      // 기준(Criteria) 테이블
      await query(`
        CREATE TABLE IF NOT EXISTS criteria (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          parent_id INTEGER,
          level INTEGER NOT NULL DEFAULT 1,
          weight REAL DEFAULT 0,
          position INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_id) REFERENCES criteria(id) ON DELETE CASCADE
        )
      `);

      // 대안(Alternatives) 테이블
      await query(`
        CREATE TABLE IF NOT EXISTS alternatives (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          cost REAL DEFAULT 0,
          position INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
      `);

      // 쌍대비교 매트릭스 테이블
      await query(`
        CREATE TABLE IF NOT EXISTS pairwise_comparisons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          evaluator_id INTEGER,
          parent_criteria_id INTEGER,
          comparison_type TEXT NOT NULL CHECK (comparison_type IN ('criteria', 'alternatives')),
          element_a_id INTEGER NOT NULL,
          element_b_id INTEGER NOT NULL,
          value REAL NOT NULL,
          consistency_ratio REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_criteria_id) REFERENCES criteria(id) ON DELETE CASCADE,
          UNIQUE(project_id, evaluator_id, parent_criteria_id, comparison_type, element_a_id, element_b_id)
        )
      `);

      // 평가 세션 테이블
      await query(`
        CREATE TABLE IF NOT EXISTS evaluation_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          evaluator_id INTEGER NOT NULL,
          session_name TEXT,
          status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
          current_step INTEGER DEFAULT 1,
          total_steps INTEGER DEFAULT 0,
          completion_percentage REAL DEFAULT 0,
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // AHP 계산 결과 테이블
      await query(`
        CREATE TABLE IF NOT EXISTS ahp_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          evaluator_id INTEGER,
          result_type TEXT NOT NULL CHECK (result_type IN ('individual', 'group', 'final')),
          criteria_weights TEXT,
          alternative_scores TEXT,
          final_ranking TEXT,
          consistency_ratio REAL,
          calculation_method TEXT,
          calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // 프로젝트 설정 테이블
      await query(`
        CREATE TABLE IF NOT EXISTS project_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          setting_key TEXT NOT NULL,
          setting_value TEXT,
          data_type TEXT DEFAULT 'string',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          UNIQUE(project_id, setting_key)
        )
      `);

      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['admin@ahp-system.com', hashedPassword, 'Admin', 'User', 'admin', 1]);

      // 샘플 프로젝트 데이터 삽입
      await query(`
        INSERT OR IGNORE INTO projects (id, title, description, objective, admin_id, status) VALUES
        (1, '스마트폰 선택 평가', '새로운 스마트폰 구매를 위한 다기준 의사결정', '가격, 성능, 디자인을 고려한 최적의 스마트폰 선택', 1, 'active'),
        (2, '직원 채용 평가', '신입 개발자 채용을 위한 평가 시스템', '기술력, 커뮤니케이션, 성장 가능성을 종합 평가', 1, 'active'),
        (3, '투자 포트폴리오 선택', '투자 상품 비교 및 선택', '수익성, 안정성, 유동성을 고려한 투자 결정', 1, 'draft')
      `);

      // 스마트폰 선택 프로젝트의 기준 데이터
      await query(`
        INSERT OR IGNORE INTO criteria (project_id, name, description, level, position) VALUES
        (1, '가격', '구매 비용 및 가성비', 1, 1),
        (1, '성능', '처리 속도 및 기능', 1, 2),
        (1, '디자인', '외관 및 사용성', 1, 3)
      `);

      // 스마트폰 선택 프로젝트의 대안 데이터
      await query(`
        INSERT OR IGNORE INTO alternatives (project_id, name, description, cost, position) VALUES
        (1, 'iPhone 15 Pro', '애플의 최신 프리미엄 스마트폰', 1200000, 1),
        (1, 'Samsung Galaxy S24', '삼성의 플래그십 모델', 1100000, 2),
        (1, 'Google Pixel 8', '구글의 AI 기반 스마트폰', 800000, 3)
      `);

      // 직원 채용 프로젝트의 기준 데이터
      await query(`
        INSERT OR IGNORE INTO criteria (project_id, name, description, level, position) VALUES
        (2, '기술력', '프로그래밍 및 개발 능력', 1, 1),
        (2, '커뮤니케이션', '의사소통 및 협업 능력', 1, 2),
        (2, '성장 가능성', '학습 의지 및 발전 잠재력', 1, 3)
      `);

      // 직원 채용 프로젝트의 대안 데이터
      await query(`
        INSERT OR IGNORE INTO alternatives (project_id, name, description, position) VALUES
        (2, '후보자 A', '5년 경력의 풀스택 개발자', 1),
        (2, '후보자 B', '신입 개발자, 컴퓨터공학 전공', 2),
        (2, '후보자 C', '3년 경력의 프론트엔드 개발자', 3)
      `);

      // 프로젝트 설정 초기값
      await query(`
        INSERT OR IGNORE INTO project_settings (project_id, setting_key, setting_value, data_type) VALUES
        (1, 'max_criteria', '10', 'number'),
        (1, 'max_alternatives', '20', 'number'),
        (1, 'consistency_threshold', '0.1', 'number'),
        (1, 'evaluation_method', 'pairwise', 'string'),
        (2, 'max_criteria', '10', 'number'),
        (2, 'max_alternatives', '20', 'number'),
        (2, 'consistency_threshold', '0.1', 'number'),
        (2, 'evaluation_method', 'pairwise', 'string')
      `);

      console.log('SQLite database initialized successfully with sample data');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  };
}

export { query, initDatabase };