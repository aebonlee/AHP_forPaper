const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('Initializing SQLite database...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to SQLite database:', dbPath);
});

// Users 테이블 생성
db.run(`
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
`, (err) => {
  if (err) {
    console.error('Error creating users table:', err);
    return;
  }
  
  console.log('Users table created successfully');
  
  // 기본 관리자 사용자 생성
  const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // bcrypt hash of 'password123'
  
  db.run(`
    INSERT OR IGNORE INTO users (email, password, first_name, last_name, role) 
    VALUES (?, ?, ?, ?, ?)
  `, ['admin@ahp-system.com', hashedPassword, 'Admin', 'User', 'admin'], (err) => {
    if (err) {
      console.error('Error inserting admin user:', err);
    } else {
      console.log('Admin user created successfully');
      
      // 사용자 조회
      db.all("SELECT * FROM users", (err, users) => {
        if (err) {
          console.error('Error querying users:', err);
        } else {
          console.log('Users in database:', users);
        }
        db.close();
      });
    }
  });
});