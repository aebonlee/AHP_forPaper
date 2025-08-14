# AHP Decision Support System (AHP_forPaper)

## 개요
웹 기반 AHP(Analytic Hierarchy Process) 의사결정 지원 시스템입니다. 다기준 의사결정을 위한 계층적 모델링, 쌍대비교, 종합적인 결과 분석을 제공합니다.

## 기술 스택
- **Frontend**: React 19+ with TypeScript, Tailwind CSS 3.4+
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt
- **Visualization**: Recharts
- **UI Components**: react-beautiful-dnd (drag & drop)
- **State Management**: Zustand

## 주요 기능

### 🎯 핵심 UI 컴포넌트 (완료)
1. **PairwiseGrid** - n×n 쌍대비교 매트릭스 (상삼각 활성화, Saaty 9점 척도)
2. **CRBadge** - 일관성 비율(CR) 시각화 (색상 코딩, 상세 툴팁)
3. **JudgmentHelperPanel** - AI 기반 일관성 개선 제안 시스템
4. **HierarchyBuilder** - 드래그&드롭 계층구조 편집기 (최대 4레벨)
5. **SensitivityView** - 실시간 민감도 분석 (슬라이더, 다중 차트)
6. **BudgetingView** - 예산배분 최적화 및 시나리오 분석

### 🔧 시스템 기능
- **사용자 인증 시스템** - JWT 기반 인증, 역할별 접근 제어
- **프로젝트 관리** - AHP 프로젝트 생성, 편집, 삭제
- **AHP 계산 엔진** - 기하평균법을 사용한 우선순위 계산
- **결과 대시보드** - Recharts 기반 시각화
- **Excel 내보내기** - 분석 결과 다운로드

## API 시퀀스 (쌍대비교 → 통합 → 결과)

### 📋 샘플 워크플로우
```javascript
// 1. 비교 항목 조회
GET /api/matrix/:projectId?type=criteria&level=1
// Response: { elements: [{ id, name, description }] }

// 2. 쌍대비교 평가 (여러 번 반복)
POST /api/evaluate/pairwise
// Body: { projectId, elementIds: [id1, id2], value: 3, evaluatorId }

// 3. 가중치 계산 (로컬)
POST /api/compute/weights
// Body: { matrix: [[1,3,2],[1/3,1,1/2],[1/2,2,1]] }
// Response: { localWeights: [0.5, 0.2, 0.3], CR: 0.08 }

// 4. 글로벌 가중치 계산
POST /api/compute/global
// Body: { projectId, criteriaWeights, alternativeWeights }
// Response: { criterionGlobal, alternativeByCriterion }

// 5. 그룹 가중치 적용 및 최종 순위
POST /api/aggregate
// Body: { projectId, groupWeights: { evaluator1: 0.6, evaluator2: 0.4 } }
// Response: { finalRanking: [{ alternativeId, score, rank }] }

// 6. Excel 내보내기
GET /api/export/excel/:projectId
// Response: Excel file download
```

### 🔄 컴포넌트 통합 테스트
모든 핵심 컴포넌트는 `/src/components/demo/ComponentShowcase.tsx`에서 테스트할 수 있습니다.

## 설치 및 실행

### 백엔드 실행
```bash
cd backend
npm install
npm run dev
```

### 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```

## 환경 변수 설정
백엔드 디렉토리에 `.env` 파일을 생성하고 다음 내용을 설정하세요:

```
DATABASE_URL=postgresql://username:password@localhost:5432/ahp_db
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

## 데이터베이스 설정
PostgreSQL이 설치되어 있어야 하며, 서버 실행 시 자동으로 마이그레이션이 실행됩니다.

## 배포 방법

### Docker 컨테이너로 배포 (권장)
```bash
# 전체 시스템 배포
chmod +x deploy.sh
./deploy.sh
```

### 수동 Docker 실행
```bash
# Docker Compose 빌드 및 실행
docker-compose build
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

### Render.com 자동 배포 🚀
1. **GitHub 저장소를 Render에 연결**:
   - Render 대시보드에서 "New +" 클릭
   - "Blueprint" 선택
   - GitHub 저장소 `aebonlee/AHP_forPaper` 연결

2. **자동 배포 설정**:
   - `render.yaml` 파일이 다음을 자동 구성:
     - PostgreSQL 데이터베이스 생성
     - 백엔드 서비스 (Node.js/Express)
     - 프론트엔드 서비스 (React 정적 사이트)
   - 환경 변수가 자동으로 설정됨

3. **배포 완료 후 접근**:
   - 백엔드 API: `https://ahp-forpaper.onrender.com`
   - 프론트엔드: GitHub Pages (정적 데모)
   - 데이터베이스: 자동 생성된 PostgreSQL 인스턴스

### 배포 상태 확인
- **Health Check**: `https://ahp-forpaper.onrender.com/api/health`
- **API 테스트**: `https://ahp-forpaper.onrender.com/api/auth/profile`

## 서비스 접근 URL

### 🌐 라이브 서비스
- **GitHub Pages 데모**: https://aebonlee.github.io/AHP_forPaper/
- **Render 백엔드 API**: https://ahp-forpaper.onrender.com (배포 후)
- **완전한 시스템**: 백엔드 + GitHub Pages 데모 조합

### 🏠 로컬 개발
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5000
- **데이터베이스**: postgresql://ahp_user:ahp_password@localhost:5432/ahp_db

## 데모 계정
- 이메일: admin@ahp-system.com
- 비밀번호: password123

## 개발 상태

✅ **Phase 1 완료** - 기초 시스템 구축
- 프로젝트 구조 초기화
- 데이터베이스 스키마 
- JWT 인증 시스템
- UI 레이아웃 시스템

✅ **Phase 2 완료** - 핵심 UI 컴포넌트 구현
- 6개 핵심 UI 컴포넌트 (PairwiseGrid, CRBadge, JudgmentHelperPanel, HierarchyBuilder, SensitivityView, BudgetingView)
- TypeScript 타입 안전성 보장
- Recharts 기반 시각화
- 드래그&드롭 기능 (react-beautiful-dnd)
- 통합 테스트 페이지 (ComponentShowcase)

🔄 **Phase 3 진행 중** - API 통합 및 완성
- 쌍대비교 → 통합 → 결과 API 시퀀스
- Excel 내보내기 기능
- 그룹 평가 및 가중치 집계
- 최종 시스템 통합 테스트

## 🎯 핵심 컴포넌트 데모
구현된 모든 컴포넌트는 다음 경로에서 확인할 수 있습니다:
- **데모 페이지**: `/src/components/demo/ComponentShowcase.tsx`
- **테스트 데이터**: 의도적 비일관성 포함 (CR>0.1 테스트)
- **실시간 기능**: 슬라이더, 드래그&드롭, 차트 업데이트
