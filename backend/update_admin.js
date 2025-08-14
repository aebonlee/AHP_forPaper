const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Updating admin password...');

bcrypt.hash('password123', 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  
  console.log('New hashed password:', hashedPassword);
  
  db.run(`
    UPDATE users SET password = ? WHERE email = ?
  `, [hashedPassword, 'admin@ahp-system.com'], function(err) {
    if (err) {
      console.error('Error updating password:', err);
    } else {
      console.log('Admin password updated successfully');
    }
    
    // 업데이트된 사용자 확인
    db.get("SELECT * FROM users WHERE email = ?", ['admin@ahp-system.com'], (err, user) => {
      if (err) {
        console.error('Error querying user:', err);
      } else {
        console.log('Updated user:', user);
      }
      db.close();
    });
  });
});