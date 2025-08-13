# 🚀 AHP 시스템 Render.com 배포 가이드

## 📋 배포 체크리스트 (모두 완료됨 ✅)

### ✅ 1. 소스 코드 준비 완료
- [x] 백엔드 TypeScript 코드 완성
- [x] 모든 CRUD API 엔드포인트 구현
- [x] 데이터베이스 마이그레이션 스크립트
- [x] GitHub 저장소 푸시 완료

### ✅ 2. render.yaml 설정 완료
- [x] 웹 서비스: `ahp-forpaper`
- [x] PostgreSQL 데이터베이스: `ahp-postgres` 
- [x] 환경 변수 자동 설정
- [x] 빌드/시작 명령어 구성

### ✅ 3. 환경 설정 완료
- [x] CORS 설정 (GitHub Pages 연결)
- [x] JWT 보안 설정
- [x] TypeScript 빌드 구성
- [x] 프로덕션 최적화

## 🎯 **지금 하셔야 할 단계 (5분 소요)**

### Step 1: Render.com 접속
1. **웹사이트**: https://dashboard.render.com
2. **GitHub 계정으로 로그인**

### Step 2: Blueprint 배포 시작
1. **"New +" 버튼** 클릭
2. **"Blueprint"** 선택
3. **"Connect a repository"** 클릭
4. **저장소 선택**: `aebonlee/AHP_forPaper`
5. **브랜치**: `main` 확인
6. **"Apply"** 버튼 클릭

### Step 3: 자동 배포 시작 ⏳
render.yaml 설정에 따라 자동으로:
- PostgreSQL 데이터베이스 생성
- 환경 변수 설정  
- npm 패키지 설치
- TypeScript 빌드
- 서버 시작

### Step 4: 배포 완료 확인 (5-10분 후)
**Health Check**: https://ahp-forpaper.onrender.com/api/health
```json
{
  "status": "ok",
  "timestamp": "2025-01-13T..."
}
```

## 📊 배포 후 사용 가능한 API 엔드포인트

### 🔐 인증 시스템
- `POST /api/auth/register` - 사용자 등록
- `POST /api/auth/login` - 로그인
- `GET /api/auth/profile` - 프로필 조회

### 📊 프로젝트 관리
- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 새 프로젝트 생성
- `GET /api/projects/:id` - 프로젝트 상세
- `PUT /api/projects/:id` - 프로젝트 수정

### 🏗️ 계층적 기준 관리
- `GET /api/projects/:id/criteria` - 기준 계층 구조
- `POST /api/criteria` - 새 기준 생성
- `PUT /api/criteria/:id` - 기준 수정

### 📝 대안 관리  
- `GET /api/projects/:id/alternatives` - 대안 목록
- `POST /api/alternatives` - 새 대안 생성

### 🔄 쌍대비교 (AHP 핵심)
- `POST /api/comparisons` - 쌍대비교 입력
- `GET /api/projects/:id/comparison-matrix` - 비교 매트릭스

## 🌐 완성된 시스템 구조

```
GitHub Pages (프론트엔드 데모)
https://aebonlee.github.io/AHP_forPaper/
                    ↕️ CORS 연결
Render.com 백엔드 API  
https://ahp-forpaper.onrender.com
                    ↕️ 
PostgreSQL 데이터베이스 (자동 생성)
```

## 🎉 배포 완료 후 테스트 방법

### 1. Health Check 확인
```bash
curl https://ahp-forpaper.onrender.com/api/health
```

### 2. 사용자 등록 테스트
```bash
curl -X POST https://ahp-forpaper.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"관리자","last_name":"테스트","email":"admin@test.com","password":"password123","role":"admin"}'
```

### 3. GitHub Pages 데모에서 실제 API 연결 확인
https://aebonlee.github.io/AHP_forPaper/ 에서 로그인 시도

## 🔧 문제 해결

### 502 Bad Gateway 에러 시
- **원인**: 배포 진행 중 (정상)
- **해결**: 5-10분 대기 후 다시 확인

### 빌드 실패 시  
1. Render 대시보드 → **Logs** 탭 확인
2. 오류 메시지에 따른 대응:
   - `npm ci` 오류: package.json 문제
   - `npm run build` 오류: TypeScript 컴파일 문제
   - 시작 오류: 환경 변수 문제

## ✨ 배포 완료 시 달성되는 것

- ✅ 완전한 AHP 의사결정 지원 시스템
- ✅ RESTful API 백엔드 서비스  
- ✅ PostgreSQL 데이터베이스
- ✅ JWT 기반 보안 인증
- ✅ GitHub Pages 데모와 연동
- ✅ 프로덕션 준비 완료

**🎯 목표**: https://ahp-forpaper.onrender.com/api/health 응답 확인!