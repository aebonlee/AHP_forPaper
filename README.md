# AHP Decision Support System (AHP_forPaper)

## 개요
웹 기반 AHP(Analytic Hierarchy Process) 의사결정 지원 시스템입니다. 다기준 의사결정을 위한 계층적 모델링, 쌍대비교, 종합적인 결과 분석을 제공합니다.

## 기술 스택
- **Frontend**: React 18+ with TypeScript, Tailwind CSS 3.4+
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt
- **Visualization**: Recharts
- **State Management**: Zustand

## 주요 기능
1. **사용자 인증 시스템** - JWT 기반 인증, 역할별 접근 제어 (관리자/평가자)
2. **프로젝트 관리** - AHP 프로젝트 생성, 편집, 삭제
3. **계층적 모델 빌더** - 최대 4레벨 기준 계층 구조 생성
4. **쌍대비교 인터페이스** - Saaty 1-9 척도를 사용한 비교 평가
5. **AHP 계산 엔진** - 고유값 방법을 사용한 우선순위 계산
6. **결과 대시보드** - 차트와 그래프를 통한 결과 시각화

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
   - 백엔드 API: `https://ahp-backend.onrender.com`
   - 프론트엔드: `https://ahp-frontend-render.onrender.com`
   - 데이터베이스: 자동 생성된 PostgreSQL 인스턴스

### 배포 상태 확인
- **Health Check**: `https://ahp-backend.onrender.com/api/health`
- **API 테스트**: `https://ahp-backend.onrender.com/api/auth/profile`

## 서비스 접근 URL

### 🌐 라이브 서비스
- **GitHub Pages 데모**: https://aebonlee.github.io/AHP_forPaper/
- **Render 백엔드**: https://ahp-backend.onrender.com (배포 후)
- **Render 프론트엔드**: https://ahp-frontend-render.onrender.com (배포 후)

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

🔄 **Phase 2 진행 예정** - 핵심 기능 구현
- 프로젝트 CRUD 작업
- 계층적 모델 빌더
- 쌍대비교 인터페이스
- AHP 계산 엔진
- 결과 대시보드
