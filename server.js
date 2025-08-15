const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Routes
  if (path === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'AHP Decision System API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        projects: '/api/projects'
      }
    }));
  }
  else if (path === '/api/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString()
    }));
  }
  else if (path === '/api/projects' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      projects: [
        {
          id: 1,
          title: '스마트폰 선택 평가',
          description: '새로운 스마트폰 구매를 위한 다기준 의사결정',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: '직원 채용 평가',
          description: '신입 개발자 채용을 위한 평가 시스템',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ]
    }));
  }
  else if (path === '/api/auth/login' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'Login successful',
      user: {
        id: 1,
        email: 'admin@ahp-system.com',
        role: 'admin'
      },
      token: 'sample-jwt-token'
    }));
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({
      error: 'Not Found',
      path: path
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Pure Node.js AHP Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Projects: http://localhost:${PORT}/api/projects`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});