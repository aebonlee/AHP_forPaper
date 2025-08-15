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
    evaluator_count: 26,
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

// 평가자별 데이터 (26명)
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
  },
  {
    id: 'p005',
    name: '평가자 5',
    email: 'evaluator5@company.com',
    status: 'in_progress',
    progress: 100,
    weights: {
      'criteria-1': 0.67381,
      'criteria-2': 0.22554,
      'criteria-3': 0.10065,
      'sub-criteria-1-1': 0.71724,
      'sub-criteria-1-2': 0.19469,
      'sub-criteria-1-3': 0.08808,
      'sub-criteria-2-1': 0.20984,
      'sub-criteria-2-2': 0.54995,
      'sub-criteria-2-3': 0.24021,
      'sub-criteria-3-1': 0.24931,
      'sub-criteria-3-2': 0.59363,
      'sub-criteria-3-3': 0.15706
    },
    cr_values: {
      'criteria': 0.08247,
      'criteria-1': 0.0904,
      'criteria-2': 0.01759,
      'criteria-3': 0.05156
    }
  },
  {
    id: 'p006',
    name: '평가자 6',
    email: 'evaluator6@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.47368,
      'criteria-2': 0.05263,
      'criteria-3': 0.47368,
      'sub-criteria-1-1': 0.59469,
      'sub-criteria-1-2': 0.06494,
      'sub-criteria-1-3': 0.34037,
      'sub-criteria-2-1': 0.35748,
      'sub-criteria-2-2': 0.07507,
      'sub-criteria-2-3': 0.56746,
      'sub-criteria-3-1': 0.55907,
      'sub-criteria-3-2': 0.08875,
      'sub-criteria-3-3': 0.35219
    },
    cr_values: {
      'criteria': 0,
      'criteria-1': 0.01759,
      'criteria-2': 0.05156,
      'criteria-3': 0.05156
    }
  },
  {
    id: 'p007',
    name: '평가자 7',
    email: 'evaluator7@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.11398,
      'criteria-2': 0.81421,
      'criteria-3': 0.0718,
      'sub-criteria-1-1': 0.22554,
      'sub-criteria-1-2': 0.67381,
      'sub-criteria-1-3': 0.10065,
      'sub-criteria-2-1': 0.66076,
      'sub-criteria-2-2': 0.13111,
      'sub-criteria-2-3': 0.20813,
      'sub-criteria-3-1': 0.09362,
      'sub-criteria-3-2': 0.6267,
      'sub-criteria-3-3': 0.27969
    },
    cr_values: {
      'criteria': 0.05156,
      'criteria-1': 0.08247,
      'criteria-2': 0.05156,
      'criteria-3': 0.08247
    }
  },
  {
    id: 'p008',
    name: '평가자 8',
    email: 'evaluator8@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.67381,
      'criteria-2': 0.22554,
      'criteria-3': 0.10065,
      'sub-criteria-1-1': 0.45455,
      'sub-criteria-1-2': 0.45455,
      'sub-criteria-1-3': 0.09091,
      'sub-criteria-2-1': 0.31962,
      'sub-criteria-2-2': 0.12196,
      'sub-criteria-2-3': 0.55842,
      'sub-criteria-3-1': 0.19981,
      'sub-criteria-3-2': 0.68334,
      'sub-criteria-3-3': 0.11685
    },
    cr_values: {
      'criteria': 0.08247,
      'criteria-1': 0,
      'criteria-2': 0.01759,
      'criteria-3': 0.02365
    }
  },
  {
    id: 'p009',
    name: '평가자 9',
    email: 'evaluator9@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.36431,
      'criteria-2': 0.05738,
      'criteria-3': 0.57831,
      'sub-criteria-1-1': 0.1365,
      'sub-criteria-1-2': 0.23849,
      'sub-criteria-1-3': 0.62501,
      'sub-criteria-2-1': 0.71707,
      'sub-criteria-2-2': 0.06577,
      'sub-criteria-2-3': 0.21717,
      'sub-criteria-3-1': 0.25,
      'sub-criteria-3-2': 0.25,
      'sub-criteria-3-3': 0.5
    },
    cr_values: {
      'criteria': 0.05156,
      'criteria-1': 0.01759,
      'criteria-2': 0.03548,
      'criteria-3': 0
    }
  },
  {
    id: 'p010',
    name: '평가자 10',
    email: 'evaluator10@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.78548,
      'criteria-2': 0.12934,
      'criteria-3': 0.08518,
      'sub-criteria-1-1': 0.78548,
      'sub-criteria-1-2': 0.12934,
      'sub-criteria-1-3': 0.08518,
      'sub-criteria-2-1': 0.65266,
      'sub-criteria-2-2': 0.06226,
      'sub-criteria-2-3': 0.28508,
      'sub-criteria-3-1': 0.08767,
      'sub-criteria-3-2': 0.77317,
      'sub-criteria-3-3': 0.13916
    },
    cr_values: {
      'criteria': 0.07348,
      'criteria-1': 0.07348,
      'criteria-2': 0.07069,
      'criteria-3': 0.05156
    }
  },
  {
    id: 'p011',
    name: '평가자 11',
    email: 'evaluator11@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.47059,
      'criteria-2': 0.05882,
      'criteria-3': 0.47059,
      'sub-criteria-1-1': 0.58608,
      'sub-criteria-1-2': 0.06079,
      'sub-criteria-1-3': 0.35313,
      'sub-criteria-2-1': 0.05828,
      'sub-criteria-2-2': 0.38284,
      'sub-criteria-2-3': 0.55888,
      'sub-criteria-3-1': 0.19981,
      'sub-criteria-3-2': 0.70494,
      'sub-criteria-3-3': 0.21092
    },
    cr_values: {
      'criteria': 0,
      'criteria-1': 0.03356,
      'criteria-2': 0.09609,
      'criteria-3': 0.03112
    }
  },
  {
    id: 'p012',
    name: '평가자 12',
    email: 'evaluator12@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.74287,
      'criteria-2': 0.19388,
      'criteria-3': 0.06325,
      'sub-criteria-1-1': 0.79276,
      'sub-criteria-1-2': 0.13122,
      'sub-criteria-1-3': 0.07602,
      'sub-criteria-2-1': 0.75041,
      'sub-criteria-2-2': 0.17134,
      'sub-criteria-2-3': 0.07825,
      'sub-criteria-3-1': 0.67381,
      'sub-criteria-3-2': 0.11685,
      'sub-criteria-3-3': 0.68334
    },
    cr_values: {
      'criteria': 0.06852,
      'criteria-1': 0.02089,
      'criteria-2': 0.09609,
      'criteria-3': 0.02365
    }
  },
  {
    id: 'p013',
    name: '평가자 13',
    email: 'evaluator13@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.26837,
      'criteria-2': 0.61441,
      'criteria-3': 0.11722,
      'sub-criteria-1-1': 0.16342,
      'sub-criteria-1-2': 0.53961,
      'sub-criteria-1-3': 0.29696,
      'sub-criteria-2-1': 0.29696,
      'sub-criteria-2-2': 0.53961,
      'sub-criteria-2-3': 0.16342,
      'sub-criteria-3-1': 0.67381,
      'sub-criteria-3-2': 0.10065,
      'sub-criteria-3-3': 0.22554
    },
    cr_values: {
      'criteria': 0.07069,
      'criteria-1': 0.00885,
      'criteria-2': 0.00885,
      'criteria-3': 0.08247
    }
  },
  {
    id: 'p014',
    name: '평가자 14',
    email: 'evaluator14@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.14882,
      'criteria-2': 0.06579,
      'criteria-3': 0.78539,
      'sub-criteria-1-1': 0.37427,
      'sub-criteria-1-2': 0.05449,
      'sub-criteria-1-3': 0.57124,
      'sub-criteria-2-1': 0.66306,
      'sub-criteria-2-2': 0.05847,
      'sub-criteria-2-3': 0.27847,
      'sub-criteria-3-1': 0.11732,
      'sub-criteria-3-2': 0.80581,
      'sub-criteria-3-3': 0.07687
    },
    cr_values: {
      'criteria': 0.07721,
      'criteria-1': 0.07069,
      'criteria-2': 0.05156,
      'criteria-3': 0.07069
    }
  },
  {
    id: 'p015',
    name: '평가자 15',
    email: 'evaluator15@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.55842,
      'criteria-2': 0.12196,
      'criteria-3': 0.31962,
      'sub-criteria-1-1': 0.65864,
      'sub-criteria-1-2': 0.15618,
      'sub-criteria-1-3': 0.18517,
      'sub-criteria-2-1': 0.62501,
      'sub-criteria-2-2': 0.23849,
      'sub-criteria-2-3': 0.1365,
      'sub-criteria-3-1': 0.2,
      'sub-criteria-3-2': 0.6,
      'sub-criteria-3-3': 0.2
    },
    cr_values: {
      'criteria': 0.01759,
      'criteria-1': 0.02795,
      'criteria-2': 0.01759,
      'criteria-3': 0
    }
  },
  {
    id: 'p016',
    name: '평가자 16',
    email: 'evaluator16@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.07796,
      'criteria-2': 0.2872,
      'criteria-3': 0.63484,
      'sub-criteria-1-1': 0.07825,
      'sub-criteria-1-2': 0.17134,
      'sub-criteria-1-3': 0.75041,
      'sub-criteria-2-1': 0.35219,
      'sub-criteria-2-2': 0.08875,
      'sub-criteria-2-3': 0.55907,
      'sub-criteria-3-1': 0.10065,
      'sub-criteria-3-2': 0.22554,
      'sub-criteria-3-3': 0.67381
    },
    cr_values: {
      'criteria': 0.0904,
      'criteria-1': 0.09609,
      'criteria-2': 0.05156,
      'criteria-3': 0.08247
    }
  },
  {
    id: 'p017',
    name: '평가자 17',
    email: 'evaluator17@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.75,
      'criteria-2': 0.125,
      'criteria-3': 0.125,
      'sub-criteria-1-1': 0.14286,
      'sub-criteria-1-2': 0.14286,
      'sub-criteria-1-3': 0.71429,
      'sub-criteria-2-1': 0.70886,
      'sub-criteria-2-2': 0.17862,
      'sub-criteria-2-3': 0.11252,
      'sub-criteria-3-1': 0.14286,
      'sub-criteria-3-2': 0.71429,
      'sub-criteria-3-3': 0.14286
    },
    cr_values: {
      'criteria': 0,
      'criteria-1': 0,
      'criteria-2': 0.05156,
      'criteria-3': 0
    }
  },
  {
    id: 'p018',
    name: '평가자 18',
    email: 'evaluator18@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.75041,
      'criteria-2': 0.17134,
      'criteria-3': 0.07825,
      'sub-criteria-1-1': 0.80441,
      'sub-criteria-1-2': 0.07378,
      'sub-criteria-1-3': 0.12181,
      'sub-criteria-2-1': 0.54981,
      'sub-criteria-2-2': 0.08213,
      'sub-criteria-2-3': 0.36806,
      'sub-criteria-3-1': 0.10203,
      'sub-criteria-3-2': 0.72585,
      'sub-criteria-3-3': 0.17212
    },
    cr_values: {
      'criteria': 0.09609,
      'criteria-1': 0.03548,
      'criteria-2': 0.08247,
      'criteria-3': 0.02795
    }
  },
  {
    id: 'p019',
    name: '평가자 19',
    email: 'evaluator19@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.11732,
      'criteria-2': 0.80581,
      'criteria-3': 0.07687,
      'sub-criteria-1-1': 0.08518,
      'sub-criteria-1-2': 0.78548,
      'sub-criteria-1-3': 0.12934,
      'sub-criteria-2-1': 0.78548,
      'sub-criteria-2-2': 0.08518,
      'sub-criteria-2-3': 0.12934,
      'sub-criteria-3-1': 0.28974,
      'sub-criteria-3-2': 0.0549,
      'sub-criteria-3-3': 0.65536
    },
    cr_values: {
      'criteria': 0.07069,
      'criteria-1': 0.07348,
      'criteria-2': 0.07348,
      'criteria-3': 0.07721
    }
  },
  {
    id: 'p020',
    name: '평가자 20',
    email: 'evaluator20@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.14937,
      'criteria-2': 0.47423,
      'criteria-3': 0.3764,
      'sub-criteria-1-1': 0.29696,
      'sub-criteria-1-2': 0.16342,
      'sub-criteria-1-3': 0.53961,
      'sub-criteria-2-1': 0.54693,
      'sub-criteria-2-2': 0.34454,
      'sub-criteria-2-3': 0.10852,
      'sub-criteria-3-1': 0.57143,
      'sub-criteria-3-2': 0.14286,
      'sub-criteria-3-3': 0.28571
    },
    cr_values: {
      'criteria': 0.05156,
      'criteria-1': 0.00885,
      'criteria-2': 0.05156,
      'criteria-3': 0
    }
  },
  {
    id: 'p021',
    name: '평가자 21',
    email: 'evaluator21@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.24931,
      'criteria-2': 0.59363,
      'criteria-3': 0.15706,
      'sub-criteria-1-1': 0.68698,
      'sub-criteria-1-2': 0.18648,
      'sub-criteria-1-3': 0.12654,
      'sub-criteria-2-1': 0.61441,
      'sub-criteria-2-2': 0.26837,
      'sub-criteria-2-3': 0.11722,
      'sub-criteria-3-1': 0.54693,
      'sub-criteria-3-2': 0.10852,
      'sub-criteria-3-3': 0.34454
    },
    cr_values: {
      'criteria': 0.05156,
      'criteria-1': 0.0904,
      'criteria-2': 0.07069,
      'criteria-3': 0.05156
    }
  },
  {
    id: 'p022',
    name: '평가자 22',
    email: 'evaluator22@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.07825,
      'criteria-2': 0.75041,
      'criteria-3': 0.17134,
      'sub-criteria-1-1': 0.49339,
      'sub-criteria-1-2': 0.1958,
      'sub-criteria-1-3': 0.31081,
      'sub-criteria-2-1': 0.34454,
      'sub-criteria-2-2': 0.54693,
      'sub-criteria-2-3': 0.10852,
      'sub-criteria-3-1': 0.56746,
      'sub-criteria-3-2': 0.07507,
      'sub-criteria-3-3': 0.35748
    },
    cr_values: {
      'criteria': 0.09609,
      'criteria-1': 0.05156,
      'criteria-2': 0.05156,
      'criteria-3': 0.05156
    }
  },
  {
    id: 'p023',
    name: '평가자 23',
    email: 'evaluator23@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.27056,
      'criteria-2': 0.08522,
      'criteria-3': 0.64422,
      'sub-criteria-1-1': 0.09362,
      'sub-criteria-1-2': 0.27969,
      'sub-criteria-1-3': 0.6267,
      'sub-criteria-2-1': 0.53961,
      'sub-criteria-2-2': 0.16342,
      'sub-criteria-2-3': 0.29696,
      'sub-criteria-3-1': 0.07796,
      'sub-criteria-3-2': 0.63484,
      'sub-criteria-3-3': 0.2872
    },
    cr_values: {
      'criteria': 0.05156,
      'criteria-1': 0.08247,
      'criteria-2': 0.00885,
      'criteria-3': 0.0904
    }
  },
  {
    id: 'p024',
    name: '평가자 24',
    email: 'evaluator24@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.49339,
      'criteria-2': 0.1958,
      'criteria-3': 0.31081,
      'sub-criteria-1-1': 0.6267,
      'sub-criteria-1-2': 0.27969,
      'sub-criteria-1-3': 0.09362,
      'sub-criteria-2-1': 0.59363,
      'sub-criteria-2-2': 0.24931,
      'sub-criteria-2-3': 0.15706,
      'sub-criteria-3-1': 0.45793,
      'sub-criteria-3-2': 0.12601,
      'sub-criteria-3-3': 0.41606
    },
    cr_values: {
      'criteria': 0.05156,
      'criteria-1': 0.08247,
      'criteria-2': 0.05156,
      'criteria-3': 0.00885
    }
  },
  {
    id: 'p025',
    name: '평가자 25',
    email: 'evaluator25@company.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.0914,
      'criteria-2': 0.69096,
      'criteria-3': 0.21764,
      'sub-criteria-1-1': 0.54995,
      'sub-criteria-1-2': 0.20984,
      'sub-criteria-1-3': 0.24021,
      'sub-criteria-2-1': 0.58417,
      'sub-criteria-2-2': 0.184,
      'sub-criteria-2-3': 0.23183,
      'sub-criteria-3-1': 0.1958,
      'sub-criteria-3-2': 0.31081,
      'sub-criteria-3-3': 0.49339
    },
    cr_values: {
      'criteria': 0.05156,
      'criteria-1': 0.01759,
      'criteria-2': 0.05156,
      'criteria-3': 0.05156
    }
  },
  {
    id: 'admin',
    name: '관리자',
    email: 'admin@ahp-system.com',
    status: 'completed',
    progress: 100,
    weights: {
      'criteria-1': 0.27056,
      'criteria-2': 0.08522,
      'criteria-3': 0.64422,
      'sub-criteria-1-1': 0.13111,
      'sub-criteria-1-2': 0.20813,
      'sub-criteria-1-3': 0.66076,
      'sub-criteria-2-1': 0.14882,
      'sub-criteria-2-2': 0.78539,
      'sub-criteria-2-3': 0.06579,
      'sub-criteria-3-1': 0.25596,
      'sub-criteria-3-2': 0.07325,
      'sub-criteria-3-3': 0.67079
    },
    cr_values: {
      'criteria': 0.05156,
      'criteria-1': 0.05156,
      'criteria-2': 0.07721,
      'criteria-3': 0.01759
    }
  }
];

// 통합 결과 데이터 (26명 평가자 기준)
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
  },
  evaluator_progress: {
    total_evaluators: 26,
    completed: 25,
    in_progress: 1,
    progress_percentage: 100.0
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