# API 설계 비교 분석 (요구사항 vs 현재 구현)

## 📊 전체 API 구현 현황

### 현재 백엔드: **Node.js + Express + TypeScript**
**요구사항**: FastAPI (Python) 기반 설계  
**현재 구현**: Express.js (Node.js) 기반

## 🔍 API 엔드포인트 상세 비교

### ✅ 잘 구현된 API (85% 일치)

#### 1. **프로젝트 관리**
| 요구사항 | 현재 구현 | 상태 | 비고 |
|----------|-----------|------|------|
| `POST /projects` | ✅ `POST /api/projects` | 완료 | 생성/수정 가능 |
| `PUT /projects/:id` | ✅ `PUT /api/projects/:id` | 완료 | - |
| `DELETE /projects/:id` | ✅ `DELETE /api/projects/:id` | 완료 | - |
| `GET /projects` | ✅ `GET /api/projects` | 완료 | 권한별 필터링 |

**현재 구현 코드:**
```typescript
// ✅ 완전 구현됨
router.post('/', authenticateToken, [...validation], async (req, res) => {
  const { title, description, objective } = req.body;
  // 프로젝트 생성 로직
});
```

#### 2. **기준(Criteria) 관리**
| 요구사항 | 현재 구현 | 상태 | 비고 |
|----------|-----------|------|------|
| `POST /criteria` | ✅ `POST /api/criteria` | 완료 | 트리 구조 지원 |
| `GET /criteria/:projectId` | ✅ `GET /api/criteria/:projectId` | 완료 | 계층 조회 |
| `PUT /criteria/:id` | ✅ `PUT /api/criteria/:id` | 완료 | - |
| `DELETE /criteria/:id` | ✅ `DELETE /api/criteria/:id` | 완료 | 자식 검증 |

**현재 구현 특징:**
```typescript
// ✅ 계층구조 쿼리 완벽 구현
const criteriaResult = await query(`
  WITH RECURSIVE criteria_hierarchy AS (
    SELECT c.*, 0 as depth, ARRAY[c.id] as path
    FROM criteria c
    WHERE c.project_id = $1 AND c.parent_id IS NULL
    UNION ALL
    SELECT c.*, ch.depth + 1, ch.path || c.id
    FROM criteria c
    JOIN criteria_hierarchy ch ON c.parent_id = ch.id
    WHERE NOT c.id = ANY(ch.path)
  )
  SELECT * FROM criteria_hierarchy ORDER BY path, name
`);
```

#### 3. **대안(Alternatives) 관리**
| 요구사항 | 현재 구현 | 상태 | 비고 |
|----------|-----------|------|------|
| `POST /alternatives` | ✅ `POST /api/alternatives` | 완료 | - |
| `GET /alternatives/:projectId` | ✅ `GET /api/alternatives/:projectId` | 완료 | - |
| `PUT /alternatives/:id` | ✅ `PUT /api/alternatives/:id` | 완료 | - |
| `DELETE /alternatives/:id` | ✅ `DELETE /api/alternatives/:id` | 완료 | - |

### 🔄 부분 구현된 API (60%)

#### 4. **평가자 할당**
| 요구사항 | 현재 구현 | 상태 | 비고 |
|----------|-----------|------|------|
| `POST /raters/assign` | ⚠️ 부분 구현 | 미완성 | project_evaluators 테이블만 |

**현재 상황:**
- 데이터베이스 스키마는 존재 (project_evaluators)
- API 엔드포인트 미구현
- 평가자 코드(p001) 기능 없음

#### 5. **쌍대비교 평가**
| 요구사항 | 현재 구현 | 상태 | 비고 |
|----------|-----------|------|------|
| `POST /evaluate/pairwise` | 🔄 `POST /api/comparisons` | 부분 구현 | matrix_key 없음 |

**현재 구현 vs 요구사항:**
```typescript
// 요구사항: matrix_key, i, j, value
POST /evaluate/pairwise {
  matrix_key: "C:criterionId" | "A:criterionId",
  i: number,
  j: number, 
  value: number
}

// 현재 구현: element1_id, element2_id 방식
POST /api/comparisons {
  criterion1_id?: string,
  criterion2_id?: string,
  alternative1_id?: string,
  alternative2_id?: string,
  value: number
}
```

**차이점:**
- ❌ **matrix_key 개념 없음** - 매트릭스 식별 불가
- ❌ **i, j 인덱스 없음** - 매트릭스 위치 불명확
- ✅ **역수 처리 로직** - 프론트엔드에서 처리

### ❌ 완전 미구현 API (0%)

#### 6. **직접입력 평가**
```typescript
// 요구사항 - 완전 미구현
POST /evaluate/direct {
  target_key: string,  // "criterion:ID" or "alternative:ID@criterion:ID"
  value: number,
  is_benefit: boolean
}
```

#### 7. **결과 조회 및 분석**
```typescript
// 요구사항 - 완전 미구현
GET /results/:projectId     // 개인/통합 결과
POST /results/group         // 평가자 가중 통합
POST /analysis/sensitivity  // 민감도 분석
POST /analysis/budgeting    // 자원배분 시뮬레이션
```

#### 8. **실시간 워크숍**
```typescript
// 요구사항 - 완전 미구현
WS /workshop  // WebSocket 실시간 동기화
```

## 🔧 핵심 AHP 알고리즘 API 누락

### 현재 구현에 없는 핵심 기능:

#### 1. **AHP 계산 서비스**
```typescript
// 미구현 - 즉시 필요
class AHPService {
  // 기하평균법 가중치 계산
  static weightsGeomean(matrix: number[][]): number[];
  
  // 일관성 비율 계산  
  static consistencyRatio(matrix: number[][], weights: number[]): {
    CR: number, CI: number, lambdaMax: number
  };
  
  // 비일관성 개선 제안
  static suggestFixes(matrix: number[][], weights: number[], topk: number): Array<{
    i: number, j: number, recommended: number
  }>;
}
```

#### 2. **결과 계산 API**
```typescript
// 미구현 - 필수 API
POST /api/calculate/weights    // 가중치 계산
POST /api/calculate/ranking    // 최종 랭킹
GET /api/results/:projectId    // 결과 조회
POST /api/results/export       // Excel/CSV 내보내기
```

#### 3. **그룹 의사결정 API**
```typescript
// 미구현 - 그룹 기능
POST /api/group/aggregate      // 평가자 결과 통합
PUT /api/evaluators/:id/weight // 평가자 가중치 설정
GET /api/progress/:projectId   // 진행 상황 조회
```

## 📊 API 아키텍처 비교

### 요구사항 아키텍처 (Python/FastAPI)
```python
# core/ahp.py - 수학적 계산
import numpy as np

def weights_geomean(A: np.ndarray):
    geo = np.prod(A, axis=1)**(1.0/A.shape[0])
    w = geo / np.sum(geo)
    return w

def consistency_ratio(A: np.ndarray, w: np.ndarray):
    lam_max = np.sum(np.dot(A, w)/w) / A.shape[0]
    CI = (lam_max - A.shape[0])/(A.shape[0]-1) if A.shape[0] > 2 else 0.0
    return CR, CI, lam_max
```

### 현재 구현 (Node.js/TypeScript)
```typescript
// utils/ahpCalculator.ts - 프론트엔드에 구현
export function calculateEigenVector(matrix: number[][]): number[] {
  // 기하평균법 구현
}

export function calculateConsistencyRatio(lambdaMax: number, n: number): number {
  // CR 계산 구현
}
```

**문제점:**
- 🚨 **백엔드에 AHP 계산 로직 없음**
- 🚨 **모든 계산이 프론트엔드에서 처리**
- 🚨 **서버사이드 결과 저장/캐싱 불가**

## 🚀 즉시 구현 필요한 API

### Phase 1: 핵심 계산 API (1주)
```typescript
// 1. AHP 계산 서비스 구현
POST /api/calculate/matrix     // 매트릭스 → 가중치
POST /api/calculate/hierarchy  // 계층 통합 계산
POST /api/calculate/consistency // 일관성 검증

// 2. 결과 저장/조회
POST /api/results/save         // 결과 저장
GET /api/results/:projectId    // 결과 조회
```

### Phase 2: 직접입력 및 그룹 기능 (1주)
```typescript
// 3. 직접입력 API
POST /api/evaluate/direct      // 정량 데이터 입력
POST /api/normalize/values     // Benefit/Cost 정규화

// 4. 평가자 관리
POST /api/evaluators/assign    // 평가자 할당
PUT /api/evaluators/:id/weight // 가중치 설정
GET /api/progress/:projectId   // 진행 상황
```

### Phase 3: 고급 분석 API (2주)
```typescript
// 5. 분석 도구
POST /api/analysis/sensitivity    // 민감도 분석
POST /api/analysis/improvements   // 개선 제안
POST /api/analysis/budgeting      // 자원배분

// 6. 내보내기
POST /api/export/excel        // Excel 내보내기
POST /api/export/pdf          // PDF 리포트
```

## 🔄 기존 API 개선 필요사항

### 1. **쌍대비교 API 개선**
```typescript
// 현재 방식 개선 필요
interface ComparisonRequest {
  matrix_key: string;    // "C:criterionId" or "A:criterionId"  
  i: number;             // 행 인덱스
  j: number;             // 열 인덱스
  value: number;         // 사티 척도값
}
```

### 2. **권한 체계 강화**
```typescript
// 역할별 세분화 필요
enum Permission {
  PROJECT_CREATE = 'project:create',
  PROJECT_EDIT = 'project:edit',
  EVALUATE = 'evaluate',
  VIEW_RESULTS = 'results:view',
  EXPORT_DATA = 'export:data'
}
```

### 3. **에러 처리 표준화**
```typescript
// 표준 에러 응답 형식
interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
```

## 📈 API 구현 완성도 평가

### 전체 API 완성도: **40%**

| API 카테고리 | 완성도 | 상태 | 우선순위 |
|-------------|--------|------|----------|
| **프로젝트 관리** | 95% | ✅ 완료 | - |
| **기준/대안 관리** | 90% | ✅ 완료 | - |
| **사용자/인증** | 85% | ✅ 완료 | - |
| **쌍대비교** | 60% | 🔄 개선 필요 | 🔥 높음 |
| **직접입력** | 0% | ❌ 미구현 | 🔥 높음 |
| **AHP 계산** | 0% | ❌ 미구현 | 🔥 최우선 |
| **결과 분석** | 0% | ❌ 미구현 | 🔥 높음 |
| **그룹 의사결정** | 10% | ❌ 미구현 | 🔶 중간 |
| **실시간 협업** | 0% | ❌ 미구현 | 🔹 낮음 |

## 🎯 결론 및 권장사항

### ✅ 현재 강점
1. **탄탄한 기초 API**: 프로젝트, 기준, 대안 관리 완벽
2. **보안 구현**: JWT 인증, 권한 체계 우수
3. **데이터 검증**: express-validator 활용
4. **트랜잭션 처리**: 데이터베이스 일관성 유지

### 🚨 긴급 개선 필요
1. **AHP 계산 API 백엔드 구현** - 최우선
2. **직접입력 평가 API** - 정량 데이터 처리
3. **결과 저장/조회 시스템** - 캐싱 및 성능
4. **매트릭스 키 시스템** - 쌍대비교 개선

현재 API는 **기초 CRUD는 우수**하나, **핵심 AHP 계산 로직이 백엔드에 없어** 완전한 시스템이 되려면 **수학적 계산 API의 즉시 구현**이 필요합니다.