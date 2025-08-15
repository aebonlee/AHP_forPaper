# PostgreSQL Database Setup Guide

## 🗄️ Database Configuration

### 1. Render.com PostgreSQL 설정

1. **PostgreSQL 인스턴스 정보**
   - Service ID: `dpg-d2dhjqjuibrs739mnfvg-a`
   - Database 만료일: 2025년 9월 11일
   - 결제 후 지속 사용 가능

2. **연결 정보**
   ```
   Internal Database URL: [Render 대시보드에서 확인]
   External Database URL: [Render 대시보드에서 확인] 
   ```

### 2. 환경변수 설정

**Render.com 환경변수 설정:**

```bash
DATABASE_URL=postgresql://username:password@hostname:port/database_name
JWT_SECRET=your-secure-jwt-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
NODE_ENV=production
CORS_ORIGIN=https://aebonlee.github.io
PORT=5000
```

### 3. 로컬 개발 설정

**로컬 .env 파일 생성:**

```bash
# 프로젝트 루트에서
cp backend/.env.example backend/.env

# 환경변수 값 설정
DATABASE_URL=postgresql://username:password@localhost:5432/ahp_local_db
JWT_SECRET=local-development-secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. 데이터베이스 마이그레이션

백엔드 서버 시작 시 자동으로 마이그레이션이 실행됩니다:

1. **001_initial_schema.sql** - 기본 테이블 구조
2. **002_sample_data.sql** - 초기 관리자 계정
3. **003_api_sequence_tables.sql** - API 관련 테이블
4. **004_complete_ahp_schema.sql** - AHP 시스템 테이블
5. **005_ai_development_sample_data.sql** - AI 개발 활용 방안 샘플 데이터

### 5. 샘플 데이터

**자동 생성 데이터:**
- 관리자 계정: `admin@ahp-system.com` / `password123`
- AI 개발 활용 방안 프로젝트 (26명 평가자 포함)
- 완료된 평가 데이터 및 AHP 계산 결과

### 6. 로그인 정보

**관리자 계정:**
- 이메일: `admin@ahp-system.com`
- 비밀번호: `password123`

**평가자 계정 (자동 생성):**
- `evaluator1@ai-project.com` ~ `evaluator26@ai-project.com`
- 비밀번호: `password`

## 🚀 배포 프로세스

### 1. 백엔드 배포 (Render.com)

```bash
# 코드 푸시
git add .
git commit -m "Add PostgreSQL database integration"
git push origin main

# Render.com에서 자동 배포
# https://dashboard.render.com에서 배포 상태 확인
```

### 2. 프론트엔드 배포 (GitHub Pages)

```bash
# 프론트엔드 빌드 및 배포
cd frontend
npm run build
git add .
git commit -m "Update frontend for PostgreSQL backend"
git push origin main
```

### 3. 배포 확인

1. **백엔드 Health Check:**
   ```
   GET https://ahp-forpaper.onrender.com/api/health
   ```

2. **프론트엔드 접속:**
   ```
   https://aebonlee.github.io/AHP_forPaper/
   ```

## 🔧 트러블슈팅

### Database Connection Issues

1. **CONNECTION_STRING 확인**
   - Render 대시보드에서 Internal Database URL 복사
   - 환경변수에 정확히 설정되었는지 확인

2. **마이그레이션 실패**
   - Render 로그에서 오류 메시지 확인
   - SQL 문법 오류 또는 권한 문제 해결

3. **백엔드 시작 실패**
   - DATABASE_URL 환경변수 설정 확인
   - PostgreSQL 인스턴스 상태 확인

### Frontend Connection Issues

1. **CORS 오류**
   - CORS_ORIGIN 환경변수가 프론트엔드 URL과 일치하는지 확인

2. **API 호출 실패**
   - 백엔드 서버가 정상 동작하는지 확인
   - 네트워크 요청 URL 확인

## 📊 모니터링

### 데이터베이스 사용량

- **Free Plan 제한:** 
  - 1GB 스토리지
  - 100 동시 연결
  - 90일 후 자동 삭제

- **Starter Plan:** 
  - 10GB 스토리지
  - 무제한 연결
  - 지속적 사용 가능

### 백엔드 성능

- **응답 시간 모니터링**
- **오류율 추적**
- **메모리 사용량 확인**

## 🔒 보안 고려사항

1. **환경변수 보안**
   - JWT Secret을 안전하게 생성
   - 데이터베이스 자격증명 보호

2. **API 보안**
   - Rate limiting 구현
   - Input validation 강화

3. **데이터베이스 보안**
   - SSL 연결 사용
   - 최소 권한 원칙 적용