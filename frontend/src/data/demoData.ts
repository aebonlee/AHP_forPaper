// Demo data for GitHub Pages deployment
export const DEMO_USER = {
  id: 'demo-user-1',
  first_name: 'Demo',
  last_name: 'User', 
  email: 'admin@ahp-system.com',
  role: 'admin' as const
};

export const DEMO_PROJECTS = [
  {
    id: 'demo-project-1',
    title: 'AHP 연구 프로젝트 데모',
    description: '계층적 분석법을 활용한 다기준 의사결정 시스템 데모입니다.',
    objective: '최적의 대안을 선택하기 위한 AHP 분석',
    admin_id: 'demo-user-1',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    evaluator_count: 1,
    admin_name: 'Demo User'
  }
];

export const DEMO_CRITERIA = [
  {
    id: 'criteria-1',
    name: '비용 효율성',
    description: '프로젝트 수행에 필요한 비용 대비 효과',
    project_id: 'demo-project-1',
    parent_id: null,
    level: 1,
    order_index: 1
  },
  {
    id: 'criteria-2', 
    name: '기술적 우수성',
    description: '기술적 난이도 및 혁신성 평가',
    project_id: 'demo-project-1',
    parent_id: null,
    level: 1,
    order_index: 2
  },
  {
    id: 'criteria-3',
    name: '시장성',
    description: '시장에서의 수용 가능성 및 확장성',
    project_id: 'demo-project-1', 
    parent_id: null,
    level: 1,
    order_index: 3
  },
  {
    id: 'criteria-4',
    name: '위험 관리',
    description: '프로젝트 리스크 및 관리 가능성',
    project_id: 'demo-project-1',
    parent_id: null,
    level: 1,
    order_index: 4
  }
];

export const DEMO_ALTERNATIVES = [
  {
    id: 'alt-1',
    name: 'AI 기반 솔루션',
    description: '인공지능을 활용한 자동화된 의사결정 시스템',
    project_id: 'demo-project-1',
    order_index: 1
  },
  {
    id: 'alt-2',
    name: '전통적 분석 방법',
    description: '기존 통계적 분석 방법을 활용한 시스템',
    project_id: 'demo-project-1',
    order_index: 2
  },
  {
    id: 'alt-3',
    name: '하이브리드 접근법',
    description: 'AI와 전통적 방법을 결합한 하이브리드 시스템',
    project_id: 'demo-project-1',
    order_index: 3
  }
];

export const DEMO_COMPARISONS = [
  // 기준 간 비교 (criteria comparisons)
  { criterion1_id: 'criteria-1', criterion2_id: 'criteria-2', value: 3, project_id: 'demo-project-1', criterion_id: 'root' },
  { criterion1_id: 'criteria-1', criterion2_id: 'criteria-3', value: 2, project_id: 'demo-project-1', criterion_id: 'root' },
  { criterion1_id: 'criteria-1', criterion2_id: 'criteria-4', value: 4, project_id: 'demo-project-1', criterion_id: 'root' },
  { criterion1_id: 'criteria-2', criterion2_id: 'criteria-3', value: 0.5, project_id: 'demo-project-1', criterion_id: 'root' },
  { criterion1_id: 'criteria-2', criterion2_id: 'criteria-4', value: 2, project_id: 'demo-project-1', criterion_id: 'root' },
  { criterion1_id: 'criteria-3', criterion2_id: 'criteria-4', value: 3, project_id: 'demo-project-1', criterion_id: 'root' },

  // 대안 간 비교 (alternatives comparisons for each criterion)
  // 비용 효율성 기준
  { alternative1_id: 'alt-1', alternative2_id: 'alt-2', value: 0.5, project_id: 'demo-project-1', criterion_id: 'criteria-1' },
  { alternative1_id: 'alt-1', alternative2_id: 'alt-3', value: 0.33, project_id: 'demo-project-1', criterion_id: 'criteria-1' },
  { alternative1_id: 'alt-2', alternative2_id: 'alt-3', value: 0.5, project_id: 'demo-project-1', criterion_id: 'criteria-1' },

  // 기술적 우수성 기준
  { alternative1_id: 'alt-1', alternative2_id: 'alt-2', value: 5, project_id: 'demo-project-1', criterion_id: 'criteria-2' },
  { alternative1_id: 'alt-1', alternative2_id: 'alt-3', value: 2, project_id: 'demo-project-1', criterion_id: 'criteria-2' },
  { alternative1_id: 'alt-2', alternative2_id: 'alt-3', value: 0.25, project_id: 'demo-project-1', criterion_id: 'criteria-2' },

  // 시장성 기준
  { alternative1_id: 'alt-1', alternative2_id: 'alt-2', value: 3, project_id: 'demo-project-1', criterion_id: 'criteria-3' },
  { alternative1_id: 'alt-1', alternative2_id: 'alt-3', value: 0.5, project_id: 'demo-project-1', criterion_id: 'criteria-3' },
  { alternative1_id: 'alt-2', alternative2_id: 'alt-3', value: 0.33, project_id: 'demo-project-1', criterion_id: 'criteria-3' },

  // 위험 관리 기준
  { alternative1_id: 'alt-1', alternative2_id: 'alt-2', value: 0.5, project_id: 'demo-project-1', criterion_id: 'criteria-4' },
  { alternative1_id: 'alt-1', alternative2_id: 'alt-3', value: 0.33, project_id: 'demo-project-1', criterion_id: 'criteria-4' },
  { alternative1_id: 'alt-2', alternative2_id: 'alt-3', value: 2, project_id: 'demo-project-1', criterion_id: 'criteria-4' }
];

export const DEMO_LOGIN_CREDENTIALS = {
  email: 'admin@ahp-system.com',
  password: 'password123'
};

// Demo mode check
export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://ahp-forpaper.onrender.com/api/health', {
      method: 'GET',
      timeout: 5000
    } as any);
    return response.ok;
  } catch {
    return false;
  }
};