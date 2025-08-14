const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = 5003;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('=== Login Request ===');
  console.log('Body:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  // Find user
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('User found:', { id: user.id, email: user.email });
    
    try {
      // Compare password
      const isValid = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isValid);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        'your-super-secret-jwt-key-for-ahp-system-2024',
        { expiresIn: '24h' }
      );
      
      // Return success
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        },
        token
      });
      
    } catch (error) {
      console.error('Password comparison error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple AHP Server running on http://localhost:${port}`);
  console.log(`📋 Health check: http://localhost:${port}/api/health`);
  console.log(`🔑 Login: POST http://localhost:${port}/api/auth/login`);
});