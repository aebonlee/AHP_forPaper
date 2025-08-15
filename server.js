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

// 프로젝트 다음 단계 안내
function getNextSteps(project) {
  const currentStep = project.current_step || 0;
  
  switch (currentStep) {
    case 0:
      return {
        step: 1,
        title: '단계 1: 프로젝트 설정',
        description: '프로젝트 기본 정보를 설정하세요',
        url: '/api/admin/step1/project-setup'
      };
    case 1:
      return {
        step: 2,
        title: '단계 2: 기준 설정',
        description: '의사결정 기준을 설정하세요',
        url: '/api/admin/step2/criteria-setup'
      };
    case 2:
      return {
        step: 3,
        title: '단계 3: 대안 설정',
        description: '평가할 대안들을 설정하세요',
        url: '/api/admin/step3/alternatives-setup'
      };
    case 3:
      return {
        step: 4,
        title: '단계 4: 평가자 설정',
        description: '프로젝트 평가자들을 설정하세요',
        url: '/api/admin/step4/evaluators-setup'
      };
    case 4:
      return {
        step: 'evaluation',
        title: '평가 진행',
        description: '평가자들이 쌍대비교를 진행할 수 있습니다',
        url: '/api/evaluator/step1/project-overview'
      };
    default:
      return {
        step: 'unknown',
        title: '알 수 없는 단계',
        description: '프로젝트 상태를 확인하세요',
        url: '/api/admin/project-status'
      };
  }
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
    parseRequestBody(req).then(body => {
      const { project_id, comparison_type, element_a_id, element_b_id, value, parent_criteria_id } = body;
      
      const newComparison = {
        id: Math.floor(Math.random() * 10000),
        project_id: project_id || 1,
        evaluator_id: 1,
        parent_criteria_id: parent_criteria_id || null,
        comparison_type: comparison_type || 'criteria',
        element_a_id,
        element_b_id,
        value: parseFloat(value),
        consistency_ratio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // 간단한 일관성 체크 (CR > 0.1 시뮬레이션)
      const cr = Math.random() * 0.2; // 0 ~ 0.2 랜덤값
      newComparison.consistency_ratio = cr;
      
      res.writeHead(201);
      res.end(JSON.stringify({
        message: 'Comparison created successfully',
        comparison: newComparison,
        consistency_check: {
          cr: cr,
          is_consistent: cr <= 0.1,
          needs_judgment_helper: cr > 0.1,
          judgment_helper_message: cr > 0.1 ? '판단 도우미: 일관성이 부족합니다. 비교값을 재검토해주세요.' : null
        }
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({
        error: 'Invalid request body',
        details: error.message
      }));
    });
  }
  
  // 관리자 편 - 단계 1: 프로젝트 설정
  else if (path === '/api/admin/step1/project-setup' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { title, description, objective, methodology } = body;
      
      const newProject = {
        id: nextId++,
        title: title || '새 프로젝트',
        description: description || '',
        objective: objective || '',
        methodology: methodology || 'ahp',
        status: 'step1_completed',
        admin_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        current_step: 1,
        step1_completed: true,
        step2_completed: false,
        step3_completed: false,
        step4_completed: false
      };
      
      projects.push(newProject);
      
      res.writeHead(201);
      res.end(JSON.stringify({
        message: '단계 1: 프로젝트 설정이 완료되었습니다',
        project: newProject,
        next_step: {
          step: 2,
          title: '단계 2: 기준 설정',
          description: '의사결정 기준을 설정해주세요'
        }
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    });
  }
  
  // 관리자 편 - 단계 2: 기준 설정
  else if (path === '/api/admin/step2/criteria-setup' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { project_id, criteria_list } = body;
      
      // 프로젝트 업데이트
      const project = projects.find(p => p.id === project_id);
      if (project) {
        project.step2_completed = true;
        project.current_step = 2;
        project.status = 'step2_completed';
        project.updated_at = new Date().toISOString();
      }
      
      // 기준 추가
      criteria_list.forEach((criterion, index) => {
        criteria.push({
          id: nextCriteriaId++,
          project_id: project_id,
          name: criterion.name,
          description: criterion.description || '',
          level: criterion.level || 1,
          parent_id: criterion.parent_id || null,
          position: index + 1,
          weight: 0.0
        });
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        message: '단계 2: 기준 설정이 완료되었습니다',
        criteria_count: criteria_list.length,
        next_step: {
          step: 3,
          title: '단계 3: 대안 설정',
          description: '평가할 대안들을 설정해주세요'
        }
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    });
  }
  
  // 관리자 편 - 단계 3: 대안 설정
  else if (path === '/api/admin/step3/alternatives-setup' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { project_id, alternatives_list } = body;
      
      // 프로젝트 업데이트
      const project = projects.find(p => p.id === project_id);
      if (project) {
        project.step3_completed = true;
        project.current_step = 3;
        project.status = 'step3_completed';
        project.updated_at = new Date().toISOString();
      }
      
      // 대안 추가
      alternatives_list.forEach((alternative, index) => {
        alternatives.push({
          id: nextAlternativeId++,
          project_id: project_id,
          name: alternative.name,
          description: alternative.description || '',
          cost: alternative.cost || 0,
          position: index + 1
        });
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        message: '단계 3: 대안 설정이 완료되었습니다',
        alternatives_count: alternatives_list.length,
        next_step: {
          step: 4,
          title: '단계 4: 평가자 설정',
          description: '프로젝트에 참여할 평가자들을 설정해주세요'
        }
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    });
  }
  
  // 관리자 편 - 단계 4: 평가자 설정
  else if (path === '/api/admin/step4/evaluators-setup' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { project_id, evaluators_list } = body;
      
      // 프로젝트 업데이트 (완료 상태)
      const project = projects.find(p => p.id === project_id);
      if (project) {
        project.step4_completed = true;
        project.current_step = 4;
        project.status = 'setup_completed';
        project.updated_at = new Date().toISOString();
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({
        message: '단계 4: 평가자 설정이 완료되었습니다',
        evaluators_count: evaluators_list.length,
        project_status: 'setup_completed',
        next_action: {
          title: '평가 시작',
          description: '이제 평가자들이 쌍대비교를 진행할 수 있습니다',
          evaluator_url: '/evaluator/step1'
        }
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    });
  }
  
  // 관리자 편 - 프로젝트 진행 상태 조회
  else if (path.startsWith('/api/admin/project-status/') && req.method === 'GET') {
    const projectId = parseInt(path.split('/')[4]);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Project not found' }));
      return;
    }
    
    const projectCriteria = criteria.filter(c => c.project_id === projectId);
    const projectAlternatives = alternatives.filter(a => a.project_id === projectId);
    
    res.writeHead(200);
    res.end(JSON.stringify({
      project: project,
      progress: {
        current_step: project.current_step || 0,
        step1_completed: project.step1_completed || false,
        step2_completed: project.step2_completed || false,
        step3_completed: project.step3_completed || false,
        step4_completed: project.step4_completed || false,
        is_ready_for_evaluation: project.status === 'setup_completed'
      },
      data_summary: {
        criteria_count: projectCriteria.length,
        alternatives_count: projectAlternatives.length
      },
      next_steps: getNextSteps(project)
    }));
  }
  
  // 평가자 편 - 단계 1: 프로젝트 개요 확인
  else if (path.startsWith('/api/evaluator/step1/project-overview/') && req.method === 'GET') {
    const projectId = parseInt(path.split('/')[5]);
    const project = projects.find(p => p.id === projectId);
    
    if (!project || project.status !== 'setup_completed') {
      res.writeHead(404);
      res.end(JSON.stringify({ 
        error: 'Project not found or not ready for evaluation',
        status: project?.status || 'unknown'
      }));
      return;
    }
    
    const projectCriteria = criteria.filter(c => c.project_id === projectId);
    const projectAlternatives = alternatives.filter(a => a.project_id === projectId);
    
    res.writeHead(200);
    res.end(JSON.stringify({
      step_title: '단계 1: 프로젝트 개요 확인',
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        objective: project.objective
      },
      evaluation_structure: {
        criteria_count: projectCriteria.length,
        alternatives_count: projectAlternatives.length,
        total_comparisons_needed: (projectCriteria.length * (projectCriteria.length - 1)) / 2 + 
                                 projectCriteria.length * (projectAlternatives.length * (projectAlternatives.length - 1)) / 2
      },
      criteria: projectCriteria,
      alternatives: projectAlternatives,
      next_action: {
        title: '단계 2로 이동',
        description: '쌍대비교/직접입력을 시작합니다',
        url: `/api/evaluator/step2/comparison-setup/${projectId}`
      }
    }));
  }
  
  // 평가자 편 - 단계 2: 쌍대비교/직접입력 설정
  else if (path.startsWith('/api/evaluator/step2/comparison-setup/') && req.method === 'GET') {
    const projectId = parseInt(path.split('/')[5]);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Project not found' }));
      return;
    }
    
    const projectCriteria = criteria.filter(c => c.project_id === projectId);
    
    res.writeHead(200);
    res.end(JSON.stringify({
      step_title: '단계 2: 쌍대비교/직접입력',
      project: {
        id: project.id,
        title: project.title
      },
      comparison_methods: [
        {
          method: 'pairwise',
          title: '쌍대비교',
          description: '두 요소씩 비교하여 상대적 중요도 결정',
          url: `/api/evaluator/step2/pairwise/${projectId}`
        },
        {
          method: 'direct',
          title: '직접입력',
          description: '가중치를 직접 입력하여 설정',
          url: `/api/evaluator/step2/direct-input/${projectId}`
        }
      ],
      criteria: projectCriteria
    }));
  }
  
  // 평가자 편 - 쌍대비교 진행
  else if (path.startsWith('/api/evaluator/step2/pairwise/') && req.method === 'GET') {
    const projectId = parseInt(path.split('/')[5]);
    const projectCriteria = criteria.filter(c => c.project_id === projectId);
    
    // 쌍대비교 매트릭스 생성
    const pairwiseMatrix = [];
    for (let i = 0; i < projectCriteria.length; i++) {
      for (let j = i + 1; j < projectCriteria.length; j++) {
        pairwiseMatrix.push({
          comparison_id: `${projectCriteria[i].id}_${projectCriteria[j].id}`,
          element_a: projectCriteria[i],
          element_b: projectCriteria[j],
          scale_values: [
            { value: 9, label: '9: 극단적으로 더 중요' },
            { value: 7, label: '7: 매우 강하게 더 중요' },
            { value: 5, label: '5: 강하게 더 중요' },
            { value: 3, label: '3: 약간 더 중요' },
            { value: 1, label: '1: 동등하게 중요' },
            { value: 1/3, label: '1/3: 약간 덜 중요' },
            { value: 1/5, label: '1/5: 강하게 덜 중요' },
            { value: 1/7, label: '1/7: 매우 강하게 덜 중요' },
            { value: 1/9, label: '1/9: 극단적으로 덜 중요' }
          ]
        });
      }
    }
    
    res.writeHead(200);
    res.end(JSON.stringify({
      step_title: '단계 2: 쌍대비교',
      project_id: projectId,
      comparison_type: 'criteria',
      pairwise_comparisons: pairwiseMatrix,
      instructions: {
        title: 'Saaty의 9점 척도 사용법',
        description: '각 쌍대비교에서 두 기준 중 어느 것이 더 중요한지 선택하고 중요도를 설정하세요',
        cr_threshold: 0.1,
        cr_warning: 'CR > 0.1 시 판단 도우미가 표시됩니다'
      }
    }));
  }
  
  // 평가자 편 - 직접입력 진행
  else if (path.startsWith('/api/evaluator/step2/direct-input/') && req.method === 'GET') {
    const projectId = parseInt(path.split('/')[5]);
    const projectCriteria = criteria.filter(c => c.project_id === projectId);
    
    res.writeHead(200);
    res.end(JSON.stringify({
      step_title: '단계 2: 직접입력',
      project_id: projectId,
      criteria: projectCriteria.map(criterion => ({
        id: criterion.id,
        name: criterion.name,
        description: criterion.description,
        current_weight: criterion.weight || 0,
        min_weight: 0,
        max_weight: 1
      })),
      instructions: {
        title: '가중치 직접 입력',
        description: '각 기준의 가중치를 0~1 사이 값으로 입력하세요. 전체 합이 1이 되어야 합니다.',
        validation_rules: [
          '각 가중치는 0 이상 1 이하여야 합니다',
          '전체 가중치의 합은 1이어야 합니다',
          '모든 가중치는 0보다 커야 합니다'
        ]
      },
      utility_functions: {
        reverse_button: {
          label: '여기를',
          description: '역수 계산 버튼 - 비교 값의 역수로 자동 설정',
          action: 'calculate_reciprocal'
        },
        auto_normalize: {
          label: '자동 정규화',
          description: '입력된 값들을 자동으로 합이 1이 되도록 조정'
        }
      }
    }));
  }
  
  // 직접입력 - 역수 처리 ('여기를' 버튼)
  else if (path === '/api/evaluator/direct-input/reciprocal' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { original_value } = body;
      
      if (!original_value || original_value === 0) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid original value' }));
        return;
      }
      
      const reciprocal = 1 / parseFloat(original_value);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        message: '여기를 버튼 처리 완료',
        original_value: parseFloat(original_value),
        reciprocal_value: reciprocal,
        formatted_reciprocal: Math.round(reciprocal * 1000000) / 1000000, // 소수점 6자리
        explanation: `${original_value}의 역수는 ${reciprocal}입니다`
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    });
  }
  
  // 직접입력 - 가중치 저장
  else if (path === '/api/evaluator/direct-input/save-weights' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { project_id, weights } = body;
      
      // 가중치 합계 검증
      const totalWeight = Object.values(weights).reduce((sum, weight) => sum + parseFloat(weight), 0);
      
      if (Math.abs(totalWeight - 1.0) > 0.001) {
        res.writeHead(400);
        res.end(JSON.stringify({
          error: '가중치 합계 오류',
          message: '가중치의 합이 1이 되어야 합니다',
          current_total: totalWeight,
          required_total: 1.0
        }));
        return;
      }
      
      // 가중치 업데이트
      Object.entries(weights).forEach(([criteriaId, weight]) => {
        const criterion = criteria.find(c => c.id === parseInt(criteriaId) && c.project_id === project_id);
        if (criterion) {
          criterion.weight = parseFloat(weight);
        }
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        message: '가중치가 성공적으로 저장되었습니다',
        saved_weights: weights,
        total_weight: totalWeight,
        validation_passed: true
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    });
  }
  
  // 민감도 분석
  else if (path.startsWith('/api/analysis/sensitivity/') && req.method === 'GET') {
    const projectId = parseInt(path.split('/')[4]);
    const projectCriteria = criteria.filter(c => c.project_id === projectId);
    const projectAlternatives = alternatives.filter(a => a.project_id === projectId);
    
    // 민감도 분석 시뮬레이션 데이터
    const sensitivityAnalysis = {
      project_id: projectId,
      analysis_type: '민감도 분석',
      base_weights: projectCriteria.map(c => ({
        criterion_id: c.id,
        criterion_name: c.name,
        base_weight: c.weight || (1 / projectCriteria.length)
      })),
      sensitivity_results: projectCriteria.map(criterion => ({
        criterion_id: criterion.id,
        criterion_name: criterion.name,
        weight_variations: [
          { weight_change: -0.2, ranking_change: '순위 변동 없음' },
          { weight_change: -0.1, ranking_change: '순위 변동 없음' },
          { weight_change: 0, ranking_change: '기준선' },
          { weight_change: 0.1, ranking_change: '2위와 3위 순위 변경' },
          { weight_change: 0.2, ranking_change: '1위와 2위 순위 변경' }
        ]
      })),
      critical_thresholds: [
        {
          criterion: projectCriteria[0]?.name || '기준1',
          threshold: 0.15,
          description: '이 가중치 이상에서 순위 변화 발생'
        }
      ]
    };
    
    res.writeHead(200);
    res.end(JSON.stringify({
      title: '민감도 분석',
      description: '기준 가중치 변화에 따른 대안 순위 변동 분석',
      analysis: sensitivityAnalysis,
      interpretation: '가중치 변화가 최종 순위에 미치는 영향을 분석하여 의사결정의 안정성을 평가합니다'
    }));
  }
  
  // 워크숍 기능
  else if (path === '/api/workshop/create' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { project_id, workshop_name, participants } = body;
      
      const workshop = {
        id: Math.floor(Math.random() * 10000),
        project_id,
        workshop_name: workshop_name || '새 워크숍',
        participants: participants || [],
        status: 'active',
        created_at: new Date().toISOString(),
        phases: [
          {
            phase: 1,
            title: '문제 정의 및 목표 설정',
            status: 'pending',
            estimated_duration: '30분'
          },
          {
            phase: 2,
            title: '기준 도출 및 구조화',
            status: 'pending',
            estimated_duration: '45분'
          },
          {
            phase: 3,
            title: '대안 식별 및 정의',
            status: 'pending',
            estimated_duration: '30분'
          },
          {
            phase: 4,
            title: '그룹 쌍대비교',
            status: 'pending',
            estimated_duration: '60분'
          },
          {
            phase: 5,
            title: '결과 검토 및 합의',
            status: 'pending',
            estimated_duration: '30분'
          }
        ]
      };
      
      res.writeHead(201);
      res.end(JSON.stringify({
        message: '워크숍이 생성되었습니다',
        workshop: workshop,
        next_action: {
          title: '워크숍 시작',
          description: '참가자들과 함께 1단계부터 진행하세요',
          url: `/api/workshop/${workshop.id}/phase/1`
        }
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    });
  }
  
  // 워크숍 상태 조회
  else if (path.startsWith('/api/workshop/') && path.endsWith('/status') && req.method === 'GET') {
    const workshopId = parseInt(path.split('/')[3]);
    
    res.writeHead(200);
    res.end(JSON.stringify({
      workshop_id: workshopId,
      title: '워크숍 진행 상황',
      current_phase: 2,
      progress_percentage: 40,
      participants_status: [
        { name: '참가자 A', status: '진행 중', completed_phases: 2 },
        { name: '참가자 B', status: '완료', completed_phases: 3 },
        { name: '참가자 C', status: '대기 중', completed_phases: 1 }
      ],
      group_consensus: {
        criteria_agreement: 85,
        alternatives_agreement: 92,
        overall_consensus: 88
      }
    }));
  }
  
  // 그룹별 가중치 도출
  else if (path === '/api/analysis/group-weights' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { project_id, evaluator_weights, method } = body;
      
      // 평가자별 가중치 조정
      const adjustedWeights = evaluator_weights.map(evaluator => ({
        evaluator_id: evaluator.evaluator_id,
        evaluator_name: evaluator.evaluator_name || `평가자 ${evaluator.evaluator_id}`,
        weights: evaluator.weights,
        influence_factor: evaluator.influence_factor || 1.0,
        adjusted_weights: Object.fromEntries(
          Object.entries(evaluator.weights).map(([key, value]) => 
            [key, value * evaluator.influence_factor]
          )
        )
      }));
      
      // 통합 결과 산출 (기하평균 방식)
      const criteriaIds = Object.keys(adjustedWeights[0]?.weights || {});
      const integratedWeights = {};
      
      criteriaIds.forEach(criteriaId => {
        const weights = adjustedWeights.map(aw => aw.adjusted_weights[criteriaId] || 0);
        const geometricMean = Math.pow(
          weights.reduce((product, weight) => product * (weight || 0.001), 1),
          1 / weights.length
        );
        integratedWeights[criteriaId] = geometricMean;
      });
      
      // 정규화
      const totalWeight = Object.values(integratedWeights).reduce((sum, weight) => sum + weight, 0);
      Object.keys(integratedWeights).forEach(key => {
        integratedWeights[key] = integratedWeights[key] / totalWeight;
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        title: '그룹별 가중치 도출',
        method: method || 'geometric_mean',
        evaluator_count: adjustedWeights.length,
        individual_results: adjustedWeights,
        integrated_weights: integratedWeights,
        consensus_metrics: {
          agreement_level: 'high',
          consistency_ratio: 0.08,
          reliability_score: 0.92
        },
        recommendations: [
          '전체적으로 높은 합의 수준을 보입니다',
          '개별 평가자 간 가중치 차이가 적어 안정적입니다',
          '최종 가중치를 의사결정에 적용할 수 있습니다'
        ]
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    });
  }
  
  // 일부 평가자의 통합 결과 산출
  else if (path === '/api/analysis/partial-integration' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { project_id, selected_evaluators, integration_method } = body;
      
      res.writeHead(200);
      res.end(JSON.stringify({
        title: '일부 평가자의 통합 결과 산출',
        selected_evaluators: selected_evaluators,
        integration_method: integration_method || 'weighted_average',
        partial_results: {
          participant_count: selected_evaluators.length,
          excluded_count: (evaluatorsTotal || 5) - selected_evaluators.length,
          integrated_weights: {
            // 시뮬레이션 데이터
            criterion_1: 0.45,
            criterion_2: 0.35,
            criterion_3: 0.20
          },
          ranking_changes: [
            { alternative: '대안 A', before_rank: 2, after_rank: 1, change: '+1' },
            { alternative: '대안 B', before_rank: 1, after_rank: 2, change: '-1' },
            { alternative: '대안 C', before_rank: 3, after_rank: 3, change: '0' }
          ]
        },
        impact_analysis: '선택된 평가자들의 의견만으로도 전체 결과와 유사한 패턴을 보입니다'
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    });
  }
  
  // Excel 저장 기능
  else if (path === '/api/export/excel' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { project_id, export_options } = body;
      
      const project = projects.find(p => p.id === project_id);
      const projectCriteria = criteria.filter(c => c.project_id === project_id);
      const projectAlternatives = alternatives.filter(a => a.project_id === project_id);
      
      // Excel 파일 내용 구조 (실제로는 바이너리 데이터 생성 필요)
      const excelStructure = {
        filename: `AHP_${project?.title || 'Project'}_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheets: [
          {
            name: '프로젝트 개요',
            data: {
              project_info: project,
              criteria_count: projectCriteria.length,
              alternatives_count: projectAlternatives.length,
              export_date: new Date().toISOString()
            }
          },
          {
            name: '기준 및 가중치',
            data: projectCriteria.map(c => ({
              순번: c.position,
              기준명: c.name,
              설명: c.description,
              가중치: c.weight || 0,
              수준: c.level
            }))
          },
          {
            name: '대안 정보',
            data: projectAlternatives.map(a => ({
              순번: a.position,
              대안명: a.name,
              설명: a.description,
              비용: a.cost,
              최종점수: '계산 필요'
            }))
          },
          {
            name: '쌍대비교 행렬',
            data: '쌍대비교 매트릭스 데이터'
          },
          {
            name: '민감도 분석',
            data: '민감도 분석 결과'
          }
        ]
      };
      
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'Excel 저장 준비 완료',
        download_info: {
          filename: excelStructure.filename,
          size_estimate: '약 2.5MB',
          format: 'Microsoft Excel (.xlsx)',
          sheets_count: excelStructure.sheets.length
        },
        excel_structure: excelStructure,
        download_url: `/api/export/download/${project_id}/${encodeURIComponent(excelStructure.filename)}`,
        note: 'Excel 파일 다운로드는 별도 구현이 필요합니다 (바이너리 파일 생성)'
      }));
    }).catch(error => {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    });
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