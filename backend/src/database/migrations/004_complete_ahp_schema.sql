-- 완전한 AHP 시스템을 위한 데이터베이스 스키마
-- 004_complete_ahp_schema.sql

-- 기준(Criteria) 테이블
CREATE TABLE IF NOT EXISTS criteria (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    weight DECIMAL(10,6) DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 대안(Alternatives) 테이블
CREATE TABLE IF NOT EXISTS alternatives (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost DECIMAL(15,2) DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 쌍대비교 매트릭스 테이블
CREATE TABLE IF NOT EXISTS pairwise_comparisons (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_criteria_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    comparison_type VARCHAR(50) NOT NULL CHECK (comparison_type IN ('criteria', 'alternatives')),
    element_a_id INTEGER NOT NULL,
    element_b_id INTEGER NOT NULL,
    value DECIMAL(10,6) NOT NULL,
    consistency_ratio DECIMAL(10,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, evaluator_id, parent_criteria_id, comparison_type, element_a_id, element_b_id)
);

-- 평가 세션 테이블
CREATE TABLE IF NOT EXISTS evaluation_sessions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AHP 계산 결과 테이블
CREATE TABLE IF NOT EXISTS ahp_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    result_type VARCHAR(50) NOT NULL CHECK (result_type IN ('individual', 'group', 'final')),
    criteria_weights JSONB,
    alternative_scores JSONB,
    final_ranking JSONB,
    consistency_ratio DECIMAL(10,6),
    calculation_method VARCHAR(100),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 프로젝트 설정 테이블
CREATE TABLE IF NOT EXISTS project_settings (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    data_type VARCHAR(50) DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, setting_key)
);

-- 샘플 프로젝트 데이터 삽입
INSERT INTO projects (title, description, objective, admin_id, status) VALUES
('스마트폰 선택 평가', '새로운 스마트폰 구매를 위한 다기준 의사결정', '가격, 성능, 디자인을 고려한 최적의 스마트폰 선택', 1, 'active'),
('직원 채용 평가', '신입 개발자 채용을 위한 평가 시스템', '기술력, 커뮤니케이션, 성장 가능성을 종합 평가', 1, 'active'),
('투자 포트폴리오 선택', '투자 상품 비교 및 선택', '수익성, 안정성, 유동성을 고려한 투자 결정', 1, 'draft');

-- 스마트폰 선택 프로젝트의 기준 데이터
INSERT INTO criteria (project_id, name, description, level, position) VALUES
(1, '가격', '구매 비용 및 가성비', 1, 1),
(1, '성능', '처리 속도 및 기능', 1, 2),
(1, '디자인', '외관 및 사용성', 1, 3);

-- 스마트폰 선택 프로젝트의 대안 데이터
INSERT INTO alternatives (project_id, name, description, cost, position) VALUES
(1, 'iPhone 15 Pro', '애플의 최신 프리미엄 스마트폰', 1200000, 1),
(1, 'Samsung Galaxy S24', '삼성의 플래그십 모델', 1100000, 2),
(1, 'Google Pixel 8', '구글의 AI 기반 스마트폰', 800000, 3);

-- 직원 채용 프로젝트의 기준 데이터
INSERT INTO criteria (project_id, name, description, level, position) VALUES
(2, '기술력', '프로그래밍 및 개발 능력', 1, 1),
(2, '커뮤니케이션', '의사소통 및 협업 능력', 1, 2),
(2, '성장 가능성', '학습 의지 및 발전 잠재력', 1, 3);

-- 직원 채용 프로젝트의 대안 데이터
INSERT INTO alternatives (project_id, name, description, position) VALUES
(2, '후보자 A', '5년 경력의 풀스택 개발자', 1),
(2, '후보자 B', '신입 개발자, 컴퓨터공학 전공', 2),
(2, '후보자 C', '3년 경력의 프론트엔드 개발자', 3);

-- 프로젝트 설정 초기값
INSERT INTO project_settings (project_id, setting_key, setting_value, data_type) VALUES
(1, 'max_criteria', '10', 'number'),
(1, 'max_alternatives', '20', 'number'),
(1, 'consistency_threshold', '0.1', 'number'),
(1, 'evaluation_method', 'pairwise', 'string'),
(2, 'max_criteria', '10', 'number'),
(2, 'max_alternatives', '20', 'number'),
(2, 'consistency_threshold', '0.1', 'number'),
(2, 'evaluation_method', 'pairwise', 'string');

-- 인덱스 생성
CREATE INDEX idx_criteria_project_id ON criteria(project_id);
CREATE INDEX idx_alternatives_project_id ON alternatives(project_id);
CREATE INDEX idx_pairwise_comparisons_project_evaluator ON pairwise_comparisons(project_id, evaluator_id);
CREATE INDEX idx_evaluation_sessions_project_evaluator ON evaluation_sessions(project_id, evaluator_id);
CREATE INDEX idx_ahp_results_project_id ON ahp_results(project_id);