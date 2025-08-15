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
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      },
      token: 'sample-jwt-token'
    }));
  }
  else if (path === '/api/auth/profile' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      user: {
        id: 1,
        email: 'admin@ahp-system.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString()
      }
    }));
  }
  else if (path === '/api/criteria/1' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      criteria: [
        {
          id: 1,
          project_id: 1,
          name: '가격',
          description: '구매 비용 및 가성비',
          level: 1,
          position: 1,
          weight: 0.0
        },
        {
          id: 2,
          project_id: 1,
          name: '성능',
          description: '처리 속도 및 기능',
          level: 1,
          position: 2,
          weight: 0.0
        },
        {
          id: 3,
          project_id: 1,
          name: '디자인',
          description: '외관 및 사용성',
          level: 1,
          position: 3,
          weight: 0.0
        }
      ]
    }));
  }
  else if (path === '/api/alternatives/1' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      alternatives: [
        {
          id: 1,
          project_id: 1,
          name: 'iPhone 15 Pro',
          description: '애플의 최신 프리미엄 스마트폰',
          cost: 1200000,
          position: 1
        },
        {
          id: 2,
          project_id: 1,
          name: 'Samsung Galaxy S24',
          description: '삼성의 플래그십 모델',
          cost: 1100000,
          position: 2
        },
        {
          id: 3,
          project_id: 1,
          name: 'Google Pixel 8',
          description: '구글의 AI 기반 스마트폰',
          cost: 800000,
          position: 3
        }
      ]
    }));
  }
  else if (path.startsWith('/api/projects/') && req.method === 'GET') {
    const projectId = path.split('/')[3];
    res.writeHead(200);
    res.end(JSON.stringify({
      project: {
        id: parseInt(projectId),
        title: projectId === '1' ? '스마트폰 선택 평가' : '직원 채용 평가',
        description: projectId === '1' ? '새로운 스마트폰 구매를 위한 다기준 의사결정' : '신입 개발자 채용을 위한 평가 시스템',
        objective: projectId === '1' ? '가격, 성능, 디자인을 고려한 최적의 스마트폰 선택' : '기술력, 커뮤니케이션, 성장 가능성을 종합 평가',
        status: 'active',
        admin_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }));
  }
  else if (path.startsWith('/api/criteria/') && req.method === 'GET') {
    const projectId = path.split('/')[3];
    const criteria = projectId === '1' ? [
      { id: 1, project_id: 1, name: '가격', description: '구매 비용 및 가성비', level: 1, position: 1, weight: 0.0 },
      { id: 2, project_id: 1, name: '성능', description: '처리 속도 및 기능', level: 1, position: 2, weight: 0.0 },
      { id: 3, project_id: 1, name: '디자인', description: '외관 및 사용성', level: 1, position: 3, weight: 0.0 }
    ] : [
      { id: 4, project_id: 2, name: '기술력', description: '프로그래밍 및 개발 능력', level: 1, position: 1, weight: 0.0 },
      { id: 5, project_id: 2, name: '커뮤니케이션', description: '의사소통 및 협업 능력', level: 1, position: 2, weight: 0.0 },
      { id: 6, project_id: 2, name: '성장 가능성', description: '학습 의지 및 발전 잠재력', level: 1, position: 3, weight: 0.0 }
    ];
    
    res.writeHead(200);
    res.end(JSON.stringify({ criteria, total: criteria.length }));
  }
  else if (path.startsWith('/api/alternatives/') && req.method === 'GET') {
    const projectId = path.split('/')[3];
    const alternatives = projectId === '1' ? [
      { id: 1, project_id: 1, name: 'iPhone 15 Pro', description: '애플의 최신 프리미엄 스마트폰', cost: 1200000, position: 1 },
      { id: 2, project_id: 1, name: 'Samsung Galaxy S24', description: '삼성의 플래그십 모델', cost: 1100000, position: 2 },
      { id: 3, project_id: 1, name: 'Google Pixel 8', description: '구글의 AI 기반 스마트폰', cost: 800000, position: 3 }
    ] : [
      { id: 4, project_id: 2, name: '후보자 A', description: '5년 경력의 풀스택 개발자', cost: 0, position: 1 },
      { id: 5, project_id: 2, name: '후보자 B', description: '신입 개발자, 컴퓨터공학 전공', cost: 0, position: 2 },
      { id: 6, project_id: 2, name: '후보자 C', description: '3년 경력의 프론트엔드 개발자', cost: 0, position: 3 }
    ];
    
    res.writeHead(200);
    res.end(JSON.stringify({ alternatives, total: alternatives.length }));
  }
  else if (path.startsWith('/api/comparisons/') && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      comparisons: [],
      total: 0,
      message: 'No comparisons found'
    }));
  }
  else if (path === '/api/comparisons' && req.method === 'POST') {
    res.writeHead(201);
    res.end(JSON.stringify({
      message: 'Comparison created successfully',
      comparison: {
        id: Math.floor(Math.random() * 1000),
        project_id: 1,
        evaluator_id: 1,
        value: 3.0,
        created_at: new Date().toISOString()
      }
    }));
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({
      error: 'Not Found',
      path: path,
      method: req.method
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