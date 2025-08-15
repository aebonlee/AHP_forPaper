const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'AHP Decision System API', 
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic auth endpoint
app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Login endpoint working',
    user: { email: 'test@example.com', role: 'admin' },
    token: 'test-token'
  });
});

// Basic projects endpoint
app.get('/api/projects', (req, res) => {
  res.json({
    projects: [
      {
        id: 1,
        title: '스마트폰 선택 평가',
        description: '새로운 스마트폰 구매를 위한 다기준 의사결정',
        status: 'active'
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple AHP Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: /api/health`);
});