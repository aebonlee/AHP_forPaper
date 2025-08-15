# AHP Decision Support System (AHP_forPaper)

[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)

## 📋 프로젝트 개요

**AHP Decision Support System**은 **계층분석과정(Analytic Hierarchy Process)**을 활용한 다기준 의사결정 지원 시스템입니다. 복잡한 의사결정 문제를 체계적으로 분석하고, 객관적인 결과를 도출할 수 있도록 도와줍니다.

### 🎯 주요 목적
- 다기준 의사결정 문제의 체계적 분석
- 전문가 그룹의 의견 통합 및 분석
- 객관적이고 일관성 있는 의사결정 지원
- 사용자 친화적인 AHP 평가 환경 제공

## 기술 스택
- **Frontend**: React 19+ with TypeScript, Tailwind CSS 3.4+
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt
- **Visualization**: Recharts
- **UI Components**: react-beautiful-dnd (drag & drop)
- **State Management**: Zustand

## ✨ 주요 기능

### 👨‍💼 관리자 편 (Admin Features) ✅ 완료
- **A-0**: 서비스 신청 및 시작하기
- **A-1**: 프로젝트 생성 및 관리
- **A-2**: 모델 구축 (4단계)
  - 기준 계층구조 설계 (트리 에디터)
  - 대안 정의 및 관리 (CRUD)
  - 평가자 배정 및 초대 링크
  - 모델 확정 및 평가 시작 (워크숍 선택)
- **A-3**: 평가결과 분석
  - 그룹별 가중치 도출
  - 민감도 분석 (5단계 워크플로우)
- **A-4**: 프로젝트 완료 및 관리

### 👨‍🔬 평가자 편 (Evaluator Features) ✅ 완료
- **R-1**: 배정된 프로젝트 선택
  - 프로젝트 카드 레이아웃
  - 상태별 배지 (배정됨/진행중/완료)
  - 진행률 및 마감일 표시
- **R-2**: 평가 수행
  - **쌍대비교**: 1-9 척도 매트릭스 평가
    - 상삼각 활성화 (파랑→하늘색)
    - 자동 역수 계산 (하삼각)
    - 일관성 검증 (CR ≤ 0.1)
    - 판단 도우미 사이드패널
  - **직접입력**: 수치 직접 입력 평가
    - 역수 변환 기능
    - 실시간 가중치 계산
    - 10초 수정 제한 규칙

### 🎯 핵심 UI 컴포넌트 (완료)
1. **MatrixGrid** - 1-9 척도 쌍대비교 매트릭스 (상삼각 활성화)
2. **JudgmentHelper** - 3탭 판단 도우미 (가이드/분석/팁)
3. **ProjectSelection** - 평가자 프로젝트 선택 대시보드
4. **CriteriaManagement** - 기준 트리 에디터
5. **AlternativeManagement** - 대안 CRUD 관리
6. **EvaluatorAssignment** - 평가자 배정 및 초대

### 🔧 시스템 기능
- **역할 기반 접근 제어** - 관리자/평가자 워크플로우 분리
- **완전한 AHP 워크플로우** - 프로젝트 생성부터 결과 분석까지
- **실시간 일관성 검증** - CR 계산 및 개선 제안
- **한국어 완전 지원** - 모든 UI 및 메시지 한글화
- **반응형 디자인** - 데스크톱/모바일 대응

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

## 🏗️ 시스템 아키텍처

```
ahp-decision-system/
├── frontend/                 # React + TypeScript 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/        # 관리자 기능 컴포넌트 (A-0~A-4)
│   │   │   ├── evaluator/    # 평가자 기능 컴포넌트 (R-1~R-2)
│   │   │   ├── common/       # 공통 UI 컴포넌트
│   │   │   └── layout/       # 레이아웃 컴포넌트
│   │   ├── services/         # API 서비스
│   │   └── utils/            # 유틸리티 함수
├── backend/                  # Node.js + Express 백엔드
│   ├── src/
│   │   ├── routes/           # API 라우트
│   │   ├── services/         # 비즈니스 로직
│   │   ├── database/         # 데이터베이스 설정
│   │   └── utils/            # 유틸리티
└── docs/                     # 프로젝트 문서
```

## 📊 AHP 알고리즘

### 쌍대비교 방법론
- Saaty의 1-9 척도 사용
- 일관성 비율(CR) 자동 계산
- 고유벡터 방법으로 가중치 도출

### 일관성 검증
```
CR = CI / RI
CI = (λmax - n) / (n - 1)
```
- CR ≤ 0.1: 일관성 양호
- CR > 0.1: 재평가 권장

## 🎯 샘플 데이터 (26명 평가자)

### 프로젝트: 소프트웨어 개발자의 AI 활용 방안 중요도 분석

#### 상위 기준 가중치
- **개발 생산성 효율화**: 40.386%
- **코딩 실무 품질 적합화**: 30.101%  
- **개발 프로세스 자동화**: 29.513%

#### 최종 우선순위 (9개 세부 요소)
1. 코딩 작성 속도 향상 (16.959%)
2. 코드 품질 개선 및 최적화 (15.672%)
3. 반복 작업 최소화 (13.382%)
4. 형상관리 및 배포 지원 (11.591%)
5. 디버깅 시간 단축 (10.044%)
6. 기술 문서/주석 자동화 (9.270%)
7. 테스트 케이스 자동 생성 (8.653%)
8. 신규 기술/언어 학습지원 (7.723%)
9. AI생성 코딩의 신뢰성 (6.706%)

#### 평가자 현황
- **총 평가자**: 26명 (p001~p025 + 관리자)
- **완료**: 25명 (96%)
- **진행중**: 1명 (4%)
- **전체 일관성 비율**: 0.192% (매우 일관성 있음)

## 개발 상태

✅ **Phase 1 완료** - 기초 시스템 구축
- 프로젝트 구조 초기화
- 데이터베이스 스키마 
- JWT 인증 시스템
- UI 레이아웃 시스템

✅ **Phase 2 완료** - 핵심 UI 컴포넌트 구현
- 6개 핵심 UI 컴포넌트 구현
- TypeScript 타입 안전성 보장
- Recharts 기반 시각화
- 드래그&드롭 기능

✅ **Phase 3 완료** - 관리자 편 완전 구현
- A-0~A-4 모든 기능 구현
- 프로젝트 생성부터 완료까지 전체 워크플로우
- 한국어 UI 완전 지원

✅ **Phase 4 완료** - 평가자 편 완전 구현
- R-1~R-2 모든 기능 구현
- 쌍대비교 및 직접입력 평가 시스템
- 실시간 일관성 검증 및 판단 도우미

🎯 **현재 상태**: **완전한 AHP 시스템 구축 완료**
- 관리자와 평가자 모든 워크플로우 구현
- 개발 가이드 요구사항 100% 충족
- 실제 운영 가능한 수준의 시스템 완성

## 🏆 주요 성과

- ✅ **완전한 AHP 워크플로우** 구현
- ✅ **이중 평가 방법** 지원 (쌍대비교 + 직접입력)
- ✅ **실시간 일관성 검증** 시스템
- ✅ **한국어 완전 지원** 인터페이스
- ✅ **반응형 디자인** 적용
- ✅ **역할 기반 접근 제어** 구현
- ✅ **개발 가이드 100% 준수** 달성
