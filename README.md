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

## 데모 계정
- 이메일: admin@ahp-system.com
- 비밀번호: password123
