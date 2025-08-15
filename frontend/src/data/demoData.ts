// Demo data for GitHub Pages deployment - AI 개발 활용 방안 AHP 분석
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
    title: '소프트웨어 개발자의 AI 활용 방안 중요도 분석',
    description: '개발 과정에서 AI 도구 활용의 우선순위를 결정하기 위한 AHP 분석',
    objective: 'AI 기반 개발 도구의 효과적인 활용 전략 수립',
    admin_id: 'demo-user-1',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    evaluator_count: 4,
    admin_name: 'Demo User'
  }
];

// 상위 기준 (Level 1)
export const DEMO_CRITERIA = [
  {
    id: 'criteria-1',
    name: '개발 생산성 효율화',
    description: '개발 속도 및 생산성 향상에 기여하는 요소들',
    project_id: 'demo-project-1',
    parent_id: null,
    level: 1,
    order_index: 1,
    weight: 0.40386
  },
  {
    id: 'criteria-2',
    name: '코딩 실무 품질 적합화',
    description: '코드 품질 및 실무 적합성 관련 요소들',
    project_id: 'demo-project-1',
    parent_id: null,
    level: 1,
    order_index: 2,
    weight: 0.30101
  },
  {
    id: 'criteria-3',
    name: '개발 프로세스 자동화',
    description: '개발 프로세스의 자동화 및 효율성 관련 요소들',
    project_id: 'demo-project-1',
    parent_id: null,
    level: 1,
    order_index: 3,
    weight: 0.29513
  }
];

// 세부 기준 (Level 2 - Sub-criteria)
export const DEMO_SUB_CRITERIA = [
  // 개발 생산성 효율화 하위 기준
  {
    id: 'sub-criteria-1-1',
    name: '코딩 작성 속도 향상',
    description: '코드 작성 속도 개선',
    project_id: 'demo-project-1',
    parent_id: 'criteria-1',
    level: 2,
    order_index: 1,
    weight: 0.16959,
    local_weight: 0.4199
  },
  {
    id: 'sub-criteria-1-2',
    name: '디버깅 시간 단축',
    description: '버그 발견 및 수정 시간 단축',
    project_id: 'demo-project-1',
    parent_id: 'criteria-1',
    level: 2,
    order_index: 2,
    weight: 0.10044,
    local_weight: 0.2487
  },
  {
    id: 'sub-criteria-1-3',
    name: '반복 작업 최소화',
    description: '반복적인 코딩 작업 자동화',
    project_id: 'demo-project-1',
    parent_id: 'criteria-1',
    level: 2,
    order_index: 3,
    weight: 0.13382,
    local_weight: 0.3314
  },

  // 코딩 실무 품질 적합화 하위 기준
  {
    id: 'sub-criteria-2-1',
    name: '코드 품질 개선 및 최적화',
    description: '코드의 품질 향상 및 성능 최적화',
    project_id: 'demo-project-1',
    parent_id: 'criteria-2',
    level: 2,
    order_index: 1,
    weight: 0.15672,
    local_weight: 0.5206
  },
  {
    id: 'sub-criteria-2-2',
    name: 'AI생성 코딩의 신뢰성',
    description: 'AI가 생성한 코드의 신뢰성 및 안전성',
    project_id: 'demo-project-1',
    parent_id: 'criteria-2',
    level: 2,
    order_index: 2,
    weight: 0.06706,
    local_weight: 0.2228
  },
  {
    id: 'sub-criteria-2-3',
    name: '신규 기술/언어 학습지원',
    description: '새로운 기술 및 프로그래밍 언어 학습 지원',
    project_id: 'demo-project-1',
    parent_id: 'criteria-2',
    level: 2,
    order_index: 3,
    weight: 0.07723,
    local_weight: 0.2566
  },

  // 개발 프로세스 자동화 하위 기준
  {
    id: 'sub-criteria-3-1',
    name: '테스트 케이스 자동 생성',
    description: '자동화된 테스트 케이스 생성',
    project_id: 'demo-project-1',
    parent_id: 'criteria-3',
    level: 2,
    order_index: 1,
    weight: 0.08653,
    local_weight: 0.2932
  },
  {
    id: 'sub-criteria-3-2',
    name: '기술 문서/주석 자동화',
    description: '기술 문서 및 코드 주석 자동 생성',
    project_id: 'demo-project-1',
    parent_id: 'criteria-3',
    level: 2,
    order_index: 2,
    weight: 0.09270,
    local_weight: 0.3141
  },
  {
    id: 'sub-criteria-3-3',
    name: '형상관리 및 배포 지원',
    description: '형상관리 및 자동 배포 프로세스 지원',
    project_id: 'demo-project-1',
    parent_id: 'criteria-3',
    level: 2,
    order_index: 3,
    weight: 0.11591,
    local_weight: 0.3927
  }
];

// 대안은 실제로는 세부 기준들이 됨 (9개 세부 요소)
export const DEMO_ALTERNATIVES = [
  {
    id: 'alt-1',
    name: '코딩 작성 속도 향상',
    description: '코드 작성 속도 개선을 위한 AI 도구 활용',
    project_id: 'demo-project-1',
    order_index: 1,
    weight: 0.16959,
    rank: 1
  },
  {
    id: 'alt-2',
    name: '코드 품질 개선 및 최적화',
    description: '코드의 품질 향상 및 성능 최적화',
    project_id: 'demo-project-1',
    order_index: 2,
    weight: 0.15672,
    rank: 2
  },
  {
    id: 'alt-3',
    name: '반복 작업 최소화',
    description: '반복적인 코딩 작업 자동화',
    project_id: 'demo-project-1',
    order_index: 3,
    weight: 0.13382,
    rank: 3
  },
  {
    id: 'alt-4',
    name: '형상관리 및 배포 지원',
    description: '형상관리 및 자동 배포 프로세스 지원',
    project_id: 'demo-project-1',
    order_index: 4,
    weight: 0.11591,
    rank: 4
  },
  {
    id: 'alt-5',
    name: '디버깅 시간 단축',
    description: '버그 발견 및 수정 시간 단축',
    project_id: 'demo-project-1',
    order_index: 5,
    weight: 0.10044,
    rank: 5
  },
  {
    id: 'alt-6',
    name: '기술 문서/주석 자동화',
    description: '기술 문서 및 코드 주석 자동 생성',
    project_id: 'demo-project-1',
    order_index: 6,
    weight: 0.09270,
    rank: 6
  },
  {
    id: 'alt-7',
    name: '테스트 케이스 자동 생성',
    description: '자동화된 테스트 케이스 생성',
    project_id: 'demo-project-1',
    order_index: 7,
    weight: 0.08653,
    rank: 7
  },
  {
    id: 'alt-8',
    name: '신규 기술/언어 학습지원',
    description: '새로운 기술 및 프로그래밍 언어 학습 지원',
    project_id: 'demo-project-1',
    order_index: 8,
    weight: 0.07723,
    rank: 8
  },
  {
    id: 'alt-9',
    name: 'AI생성 코딩의 신뢰성',
    description: 'AI가 생성한 코드의 신뢰성 및 안전성',
    project_id: 'demo-project-1',
    order_index: 9,
    weight: 0.06706,
    rank: 9
  }
];

// 상위 기준 간 쌍대비교 데이터
export const DEMO_COMPARISONS = [
  // 상위 기준 간 비교 (Level 1)
  { criterion1_id: 'criteria-1', criterion2_id: 'criteria-2', value: 1.403, project_id: 'demo-project-1', criterion_id: 'root' },
  { criterion1_id: 'criteria-2', criterion2_id: 'criteria-3', value: 1.0665, project_id: 'demo-project-1', criterion_id: 'root' },
  { criterion1_id: 'criteria-1', criterion2_id: 'criteria-3', value: 1.3086, project_id: 'demo-project-1', criterion_id: 'root' },

  // 개발 생산성 효율화 하위 기준 간 비교
  { criterion1_id: 'sub-criteria-1-1', criterion2_id: 'sub-criteria-1-2', value: 1.6944, project_id: 'demo-project-1', criterion_id: 'criteria-1' },
  { criterion1_id: 'sub-criteria-1-2', criterion2_id: 'sub-criteria-1-3', value: 0.753182195, project_id: 'demo-project-1', criterion_id: 'criteria-1' },
  { criterion1_id: 'sub-criteria-1-1', criterion2_id: 'sub-criteria-1-3', value: 1.2629, project_id: 'demo-project-1', criterion_id: 'criteria-1' },

  // 코딩 실무 품질 적합화 하위 기준 간 비교
  { criterion1_id: 'sub-criteria-2-1', criterion2_id: 'sub-criteria-2-2', value: 2.3097, project_id: 'demo-project-1', criterion_id: 'criteria-2' },
  { criterion1_id: 'sub-criteria-2-2', criterion2_id: 'sub-criteria-2-3', value: 0.858148116, project_id: 'demo-project-1', criterion_id: 'criteria-2' },
  { criterion1_id: 'sub-criteria-2-1', criterion2_id: 'sub-criteria-2-3', value: 2.0531, project_id: 'demo-project-1', criterion_id: 'criteria-2' },

  // 개발 프로세스 자동화 하위 기준 간 비교
  { criterion1_id: 'sub-criteria-3-1', criterion2_id: 'sub-criteria-3-2', value: 0.91954023, project_id: 'demo-project-1', criterion_id: 'criteria-3' },
  { criterion1_id: 'sub-criteria-3-2', criterion2_id: 'sub-criteria-3-3', value: 0.787773751, project_id: 'demo-project-1', criterion_id: 'criteria-3' },
  { criterion1_id: 'sub-criteria-3-1', criterion2_id: 'sub-criteria-3-3', value: 0.757862827, project_id: 'demo-project-1', criterion_id: 'criteria-3' }
];

// 평가자별 데이터
export const DEMO_EVALUATORS = [
  {
    id: 'p001',
    name: '평가자 1',
    email: 'evaluator1@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.54693,
      'criteria-2': 0.10852,
      'criteria-3': 0.34454,
      'sub-criteria-1-1': 0.67381,
      'sub-criteria-1-2': 0.10065,
      'sub-criteria-1-3': 0.22554,
      'sub-criteria-2-1': 0.41606,
      'sub-criteria-2-2': 0.12601,
      'sub-criteria-2-3': 0.45793,
      'sub-criteria-3-1': 0.22554,
      'sub-criteria-3-2': 0.10065,
      'sub-criteria-3-3': 0.67381
    },
    cr_values: {
      'criteria': 0.05156,
      'criteria-1': 0.08247,
      'criteria-2': 0.00885,
      'criteria-3': 0.08247
    }
  },
  {
    id: 'p002',
    name: '평가자 2',
    email: 'evaluator2@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.69552,
      'criteria-2': 0.22905,
      'criteria-3': 0.07543,
      'sub-criteria-1-1': 0.27895,
      'sub-criteria-1-2': 0.07193,
      'sub-criteria-1-3': 0.64912,
      'sub-criteria-2-1': 0.65481,
      'sub-criteria-2-2': 0.24986,
      'sub-criteria-2-3': 0.09534,
      'sub-criteria-3-1': 0.52784,
      'sub-criteria-3-2': 0.13965,
      'sub-criteria-3-3': 0.33252
    },
    cr_values: {
      'criteria': 0.07348,
      'criteria-1': 0.06239,
      'criteria-2': 0.01759,
      'criteria-3': 0.05156
    }
  },
  {
    id: 'p003',
    name: '평가자 3',
    email: 'evaluator3@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.11685,
      'criteria-2': 0.68334,
      'criteria-3': 0.19981,
      'sub-criteria-1-1': 0.2,
      'sub-criteria-1-2': 0.6,
      'sub-criteria-1-3': 0.2,
      'sub-criteria-2-1': 0.64833,
      'sub-criteria-2-2': 0.22965,
      'sub-criteria-2-3': 0.12202,
      'sub-criteria-3-1': 0.55842,
      'sub-criteria-3-2': 0.12196,
      'sub-criteria-3-3': 0.31962
    },
    cr_values: {
      'criteria': 0.02365,
      'criteria-1': 0,
      'criteria-2': 0.00355,
      'criteria-3': 0.01759
    }
  },
  {
    id: 'p004',
    name: '평가자 4',
    email: 'evaluator4@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.12601,
      'criteria-2': 0.45793,
      'criteria-3': 0.41606,
      'sub-criteria-1-1': 0.13965,
      'sub-criteria-1-2': 0.33252,
      'sub-criteria-1-3': 0.52784,
      'sub-criteria-2-1': 0.11111,
      'sub-criteria-2-2': 0.22222,
      'sub-criteria-2-3': 0.66667,
      'sub-criteria-3-1': 0.14286,
      'sub-criteria-3-2': 0.28571,
      'sub-criteria-3-3': 0.57143
    },
    cr_values: {
      'criteria': 0.00885,
      'criteria-1': 0.05156,
      'criteria-2': 0,
      'criteria-3': 0
    }
  }
];

// 통합 결과 데이터
export const DEMO_INTEGRATED_RESULTS = {
  criteria_weights: {
    'criteria-1': 0.40386, // 개발 생산성 효율화
    'criteria-2': 0.30101, // 코딩 실무 품질 적합화
    'criteria-3': 0.29513  // 개발 프로세스 자동화
  },
  final_weights: [
    { name: '코딩 작성 속도 향상', weight: 0.16959, rank: 1 },
    { name: '코드 품질 개선 및 최적화', weight: 0.15672, rank: 2 },
    { name: '반복 작업 최소화', weight: 0.13382, rank: 3 },
    { name: '형상관리 및 배포 지원', weight: 0.11591, rank: 4 },
    { name: '디버깅 시간 단축', weight: 0.10044, rank: 5 },
    { name: '기술 문서/주석 자동화', weight: 0.09270, rank: 6 },
    { name: '테스트 케이스 자동 생성', weight: 0.08653, rank: 7 },
    { name: '신규 기술/언어 학습지원', weight: 0.07723, rank: 8 },
    { name: 'AI생성 코딩의 신뢰성', weight: 0.06706, rank: 9 }
  ],
  consistency_ratios: {
    overall: 0.00192,
    'criteria-1': 0.00001,
    'criteria-2': 0.00013,
    'criteria-3': 0.00022
  }
};

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