const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('=== Direct Login Test ===');

async function testLogin() {
  const email = 'admin@ahp-system.com';
  const password = 'password123';
  
  console.log(`Testing login for: ${email}`);
  
  // 1. 데이터베이스에서 사용자 찾기
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return;
    }
    
    if (!user) {
      console.log('❌ User not found');
      db.close();
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      password_length: user.password.length
    });
    
    // 2. 패스워드 비교
    try {
      const isValid = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isValid);
      
      if (isValid) {
        console.log('✅ Login would be successful');
        
        // 3. JWT 토큰 생성 테스트
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          'your-super-secret-jwt-key-for-ahp-system-2024',
          { expiresIn: '24h' }
        );
        console.log('✅ Token generated:', token.substring(0, 50) + '...');
        
      } else {
        console.log('❌ Password comparison failed');
      }
      
    } catch (error) {
      console.error('Password comparison error:', error);
    }
    
    db.close();
  });
}

testLogin();