import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface LandingPageProps {
  user: {
    first_name: string;
    last_name: string;
    role: 'admin' | 'evaluator';
  };
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ user, onGetStarted }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          서비스 신청하기
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AHP 의사결정 지원 시스템에 오신 것을 환영합니다. 
          다기준 의사결정 분석을 위한 전문 도구를 시작해보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="📋 프로젝트 관리">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              새로운 AHP 분석 프로젝트를 생성하고 관리합니다.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 프로젝트 생성 및 설정</li>
              <li>• 목표 및 설명 정의</li>
              <li>• 프로젝트 상태 관리</li>
            </ul>
          </div>
        </Card>

        <Card title="🏗️ 모델 구축">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              계층구조와 평가 기준을 설정합니다.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 기준 계층 구조 설계</li>
              <li>• 대안 정의 및 관리</li>
              <li>• 평가자 배정</li>
            </ul>
          </div>
        </Card>

        <Card title="⚖️ 평가 수행">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              쌍대비교를 통한 가중치 도출을 진행합니다.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 쌍대비교 평가</li>
              <li>• 일관성 검증</li>
              <li>• 진행률 모니터링</li>
            </ul>
          </div>
        </Card>

        <Card title="📊 결과 분석">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              종합 분석 결과를 확인하고 활용합니다.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 가중치 도출 결과</li>
              <li>• 민감도 분석</li>
              <li>• 결과 내보내기</li>
            </ul>
          </div>
        </Card>

        <Card title="👥 사용자 관리">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              평가자와 관리자 계정을 관리합니다.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 사용자 등록 및 권한</li>
              <li>• 접근키 관리</li>
              <li>• 평가자 배정</li>
            </ul>
          </div>
        </Card>

        <Card title="📈 진행 모니터링">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              프로젝트 진행 상황을 실시간으로 추적합니다.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 단계별 완료율</li>
              <li>• 평가자별 진행률</li>
              <li>• 프로젝트 상태</li>
            </ul>
          </div>
        </Card>
      </div>

      <div className="text-center space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🚀 {user.first_name} {user.last_name}님, 준비가 완료되었습니다!
          </h3>
          <p className="text-blue-700 mb-4">
            관리자 권한으로 AHP 의사결정 프로젝트를 시작하세요.
          </p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={onGetStarted}
            className="px-8 py-3"
          >
            시작하기
          </Button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>로그인 세션:</strong> 관리자 권한 확인됨 ✓
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;