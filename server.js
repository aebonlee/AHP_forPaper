const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 5000;

// 메모리 내 데이터 저장소
let nextId = 3; // 다음 프로젝트 ID
let projects = [
  {
    id: 1,
    title: '스마트폰 선택 평가',
    description: '새로운 스마트폰 구매를 위한 다기준 의사결정',
    objective: '가격, 성능, 디자인을 고려한 최적의 스마트폰 선택',
    status: 'active',
    admin_id: 1,
    created_at: '2025-08-15T03:37:01.829Z',
    updated_at: '2025-08-15T03:37:01.829Z'
  },
  {
    id: 2,
    title: '직원 채용 평가',
    description: '신입 개발자 채용을 위한 평가 시스템',
    objective: '기술력, 커뮤니케이션, 성장 가능성을 종합 평가',
    status: 'active',
    admin_id: 1,
    created_at: '2025-08-15T03:37:01.829Z',
    updated_at: '2025-08-15T03:37:01.829Z'
  }
];

let nextCriteriaId = 7;
let criteria = [
  { id: 1, project_id: 1, name: '가격', description: '구매 비용 및 가성비', level: 1, position: 1, weight: 0.0 },
  { id: 2, project_id: 1, name: '성능', description: '처리 속도 및 기능', level: 1, position: 2, weight: 0.0 },
  { id: 3, project_id: 1, name: '디자인', description: '외관 및 사용성', level: 1, position: 3, weight: 0.0 },
  { id: 4, project_id: 2, name: '기술력', description: '프로그래밍 및 개발 능력', level: 1, position: 1, weight: 0.0 },
  { id: 5, project_id: 2, name: '커뮤니케이션', description: '의사소통 및 협업 능력', level: 1, position: 2, weight: 0.0 },
  { id: 6, project_id: 2, name: '성장 가능성', description: '학습 의지 및 발전 잠재력', level: 1, position: 3, weight: 0.0 }
];

let nextAlternativeId = 7;
let alternatives = [
  { id: 1, project_id: 1, name: 'iPhone 15 Pro', description: '애플의 최신 프리미엄 스마트폰', cost: 1200000, position: 1 },
  { id: 2, project_id: 1, name: 'Samsung Galaxy S24', description: '삼성의 플래그십 모델', cost: 1100000, position: 2 },
  { id: 3, project_id: 1, name: 'Google Pixel 8', description: '구글의 AI 기반 스마트폰', cost: 800000, position: 3 },
  { id: 4, project_id: 2, name: '후보자 A', description: '5년 경력의 풀스택 개발자', cost: 0, position: 1 },
  { id: 5, project_id: 2, name: '후보자 B', description: '신입 개발자, 컴퓨터공학 전공', cost: 0, position: 2 },
  { id: 6, project_id: 2, name: '후보자 C', description: '3년 경력의 프론트엔드 개발자', cost: 0, position: 3 }
];

// 샘플 프로젝트 템플릿
const sampleTemplates = {
  smartphone: {
    title: '스마트폰 선택 평가',
    description: '새로운 스마트폰 구매를 위한 다기준 의사결정',
    objective: '가격, 성능, 디자인을 고려한 최적의 스마트폰 선택',
    criteria: [
      { name: '가격', description: '구매 비용 및 가성비' },
      { name: '성능', description: '처리 속도 및 기능' },
      { name: '디자인', description: '외관 및 사용성' }
    ],
    alternatives: [
      { name: 'iPhone 15 Pro', description: '애플의 최신 프리미엄 스마트폰', cost: 1200000 },
      { name: 'Samsung Galaxy S24', description: '삼성의 플래그십 모델', cost: 1100000 },
      { name: 'Google Pixel 8', description: '구글의 AI 기반 스마트폰', cost: 800000 }
    ]
  },
  hiring: {
    title: '직원 채용 평가',
    description: '신입 개발자 채용을 위한 평가 시스템',
    objective: '기술력, 커뮤니케이션, 성장 가능성을 종합 평가',
    criteria: [
      { name: '기술력', description: '프로그래밍 및 개발 능력' },
      { name: '커뮤니케이션', description: '의사소통 및 협업 능력' },
      { name: '성장 가능성', description: '학습 의지 및 발전 잠재력' }
    ],
    alternatives: [
      { name: '후보자 A', description: '5년 경력의 풀스택 개발자', cost: 0 },
      { name: '후보자 B', description: '신입 개발자, 컴퓨터공학 전공', cost: 0 },
      { name: '후보자 C', description: '3년 경력의 프론트엔드 개발자', cost: 0 }
    ]
  },
  software: {
    title: '소프트웨어 선택 평가',
    description: '기업용 소프트웨어 도입을 위한 의사결정',
    objective: '기능성, 비용, 사용성을 고려한 최적의 소프트웨어 선택',
    criteria: [
      { name: '기능성', description: '필요한 기능의 완성도' },
      { name: '비용', description: '도입 및 운영 비용' },
      { name: '사용성', description: '사용자 친화성 및 학습 용이성' }
    ],
    alternatives: [
      { name: '솔루션 A', description: '대기업용 통합 솔루션', cost: 5000000 },
      { name: '솔루션 B', description: '중소기업용 클라우드 솔루션', cost: 2000000 },
      { name: '솔루션 C', description: '오픈소스 기반 커스텀 솔루션', cost: 1000000 }
    ]
  },
  investment: {
    title: '투자 포트폴리오 선택',
    description: '개인 투자자를 위한 포트폴리오 구성',
    objective: '수익성, 안정성, 유동성을 고려한 최적의 투자 전략',
    criteria: [
      { name: '수익성', description: '기대 수익률' },
      { name: '안정성', description: '투자 위험도' },
      { name: '유동성', description: '현금화 용이성' }
    ],
    alternatives: [
      { name: '주식 포트폴리오', description: '성장주 중심의 주식 투자', cost: 0 },
      { name: '채권 포트폴리오', description: '안정적인 채권 투자', cost: 0 },
      { name: '부동산 투자', description: '부동산 직접 투자 또는 리츠', cost: 0 }
    ]
  }
};

// 유틸리티 함수
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

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
      projects: projects
    }));
  }
  else if (path === '/api/projects' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { title, description, objective, template } = body;
      
      // 새 프로젝트 생성
      const newProject = {
        id: nextId++,
        title: title || '새 프로젝트',
        description: description || '프로젝트 설명',
        objective: objective || '프로젝트 목표',
        status: 'draft',
        admin_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // 템플릿 사용 시 템플릿 데이터로 덮어쓰기
      if (template && sampleTemplates[template]) {
        const templateData = sampleTemplates[template];
        newProject.title = templateData.title;
        newProject.description = templateData.description;
        newProject.objective = templateData.objective;
        newProject.status = 'active';
      }
      
      projects.push(newProject);
      
      // 템플릿 사용 시 기준과 대안도 생성
      if (template && sampleTemplates[template]) {
        const templateData = sampleTemplates[template];
        
        // 기준 생성
        templateData.criteria.forEach((criterion, index) => {
          criteria.push({
            id: nextCriteriaId++,
            project_id: newProject.id,
            name: criterion.name,
            description: criterion.description,
            level: 1,
            position: index + 1,
            weight: 0.0
          });
        });
        
        // 대안 생성
        templateData.alternatives.forEach((alternative, index) => {
          alternatives.push({
            id: nextAlternativeId++,
            project_id: newProject.id,
            name: alternative.name,
            description: alternative.description,
            cost: alternative.cost,
            position: index + 1
          });
        });
      }
      
      res.writeHead(201);
      res.end(JSON.stringify({
        message: 'Project created successfully',
        project: newProject
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({
        error: 'Invalid request body',
        details: error.message
      }));
    });
  }
  else if (path === '/api/projects/templates' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      templates: [
        {
          id: 'smartphone',
          name: '스마트폰 선택 평가',
          description: '새로운 스마트폰 구매를 위한 다기준 의사결정',
          category: '제품 선택',
          criteria_count: 3,
          alternatives_count: 3
        },
        {
          id: 'hiring',
          name: '직원 채용 평가',
          description: '신입 개발자 채용을 위한 평가 시스템',
          category: '인사 관리',
          criteria_count: 3,
          alternatives_count: 3
        },
        {
          id: 'software',
          name: '소프트웨어 선택 평가',
          description: '기업용 소프트웨어 도입을 위한 의사결정',
          category: '기술 선택',
          criteria_count: 3,
          alternatives_count: 3
        },
        {
          id: 'investment',
          name: '투자 포트폴리오 선택',
          description: '개인 투자자를 위한 포트폴리오 구성',
          category: '투자 결정',
          criteria_count: 3,
          alternatives_count: 3
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
    const projectId = parseInt(path.split('/')[3]);
    const projectCriteria = criteria.filter(c => c.project_id === projectId);
    
    res.writeHead(200);
    res.end(JSON.stringify({ 
      criteria: projectCriteria, 
      total: projectCriteria.length 
    }));
  }
  else if (path.startsWith('/api/alternatives/') && req.method === 'GET') {
    const projectId = parseInt(path.split('/')[3]);
    const projectAlternatives = alternatives.filter(a => a.project_id === projectId);
    
    res.writeHead(200);
    res.end(JSON.stringify({ 
      alternatives: projectAlternatives, 
      total: projectAlternatives.length 
    }));
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