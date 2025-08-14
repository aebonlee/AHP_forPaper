const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Testing SQLite database...');

// 테이블 조회
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error checking tables:', err);
    return;
  }
  
  console.log('Tables found:', tables);
  
  // users 테이블이 있는지 확인하고 데이터 조회
  if (tables.some(t => t.name === 'users')) {
    db.all("SELECT * FROM users", (err, users) => {
      if (err) {
        console.error('Error querying users:', err);
      } else {
        console.log('Users in database:', users);
      }
      db.close();
    });
  } else {
    console.log('Users table not found');
    db.close();
  }
});