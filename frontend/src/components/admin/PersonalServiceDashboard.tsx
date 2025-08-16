import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import CriteriaManagement from './CriteriaManagement';
import AlternativeManagement from './AlternativeManagement';
import EvaluatorAssignment from './EvaluatorAssignment';
import ModelFinalization from './ModelFinalization';

interface PersonalServiceProps {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'admin' | 'evaluator';
  };
}

interface UserProject {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  evaluator_count: number;
  completion_rate: number;
  criteria_count: number;
  alternatives_count: number;
}

const PersonalServiceDashboard: React.FC<PersonalServiceProps> = ({ user }) => {
  const [projects, setProjects] = useState<UserProject[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'overview' | 'projects' | 'criteria' | 'alternatives' | 'evaluators' | 'finalize'>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    // 사용자의 프로젝트 목록 로드
    setProjects([
      {
        id: '1',
        title: 'AI 개발 활용 방안 중요도 분석',
        description: '소프트웨어 개발자의 AI 활용 방안에 대한 중요도 분석',
        status: 'active',
        created_at: '2024-02-01',
        evaluator_count: 26,
        completion_rate: 85,
        criteria_count: 3,
        alternatives_count: 9
      }
    ]);
  }, []);

  const handleCreateProject = () => {
    const newProject: UserProject = {
      id: Date.now().toString(),
      title: '새 프로젝트',
      description: '새로 생성된 AHP 프로젝트',
      status: 'draft',
      created_at: new Date().toISOString().split('T')[0],
      evaluator_count: 0,
      completion_rate: 0,
      criteria_count: 0,
      alternatives_count: 0
    };
    setProjects([...projects, newProject]);
    setSelectedProjectId(newProject.id);
    setCurrentStep('projects');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          안녕하세요, {user.first_name} {user.last_name}님!
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          개인 AHP 의사결정 분석 서비스입니다. 프로젝트를 생성하고 평가자를 초대하여 
          체계적인 의사결정 분석을 수행하세요.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="📊 내 프로젝트">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-blue-600">{projects.length}</div>
            <div className="text-sm text-gray-600">총 프로젝트</div>
            <div className="text-xs text-gray-500">
              활성: {projects.filter(p => p.status === 'active').length}개
            </div>
          </div>
        </Card>

        <Card title="👥 참여 평가자">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-green-600">
              {projects.reduce((sum, p) => sum + p.evaluator_count, 0)}
            </div>
            <div className="text-sm text-gray-600">총 평가자</div>
            <div className="text-xs text-gray-500">
              평균: {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.evaluator_count, 0) / projects.length) : 0}명/프로젝트
            </div>
          </div>
        </Card>

        <Card title="✅ 완료율">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-purple-600">
              {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.completion_rate, 0) / projects.length) : 0}%
            </div>
            <div className="text-sm text-gray-600">평균 진행률</div>
            <div className="text-xs text-gray-500">
              완료: {projects.filter(p => p.status === 'completed').length}개
            </div>
          </div>
        </Card>
      </div>

      {/* Project List */}
      <Card title="📋 내 프로젝트 목록">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">프로젝트가 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 AHP 분석 프로젝트를 생성해보세요.</p>
            <Button variant="primary" onClick={handleCreateProject}>
              새 프로젝트 생성
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">생성: {project.created_at}</span>
                      <span className="text-xs text-gray-500">{project.evaluator_count}명 참여</span>
                      <span className="text-xs text-gray-500">{project.criteria_count}개 기준</span>
                      <span className="text-xs text-gray-500">{project.alternatives_count}개 대안</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.completion_rate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{project.completion_rate}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'active' ? '진행중' : 
                       project.status === 'completed' ? '완료' : '대기'}
                    </span>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setCurrentStep('projects');
                      }}
                    >
                      관리
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center pt-4">
              <Button variant="secondary" onClick={handleCreateProject}>
                새 프로젝트 추가
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Getting Started Guide */}
      <Card title="🚀 시작하기 가이드">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">1️⃣</div>
            <h4 className="font-medium text-gray-900 mb-1">프로젝트 생성</h4>
            <p className="text-xs text-gray-600">분석 목적과 주제를 설정합니다</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">2️⃣</div>
            <h4 className="font-medium text-gray-900 mb-1">기준 설정</h4>
            <p className="text-xs text-gray-600">평가 기준과 계층구조를 구성합니다</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">3️⃣</div>
            <h4 className="font-medium text-gray-900 mb-1">대안 정의</h4>
            <p className="text-xs text-gray-600">비교할 대안들을 등록합니다</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl mb-2">4️⃣</div>
            <h4 className="font-medium text-gray-900 mb-1">평가 시작</h4>
            <p className="text-xs text-gray-600">평가자를 초대하고 분석을 시작합니다</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'projects':
        return (
          <Card title="프로젝트 설정">
            <div className="space-y-4">
              <p>프로젝트 기본 정보를 설정하는 단계입니다.</p>
              <Button variant="primary" onClick={() => setCurrentStep('criteria')}>
                다음 단계: 기준 설정
              </Button>
            </div>
          </Card>
        );
      case 'criteria':
        return (
          <div className="space-y-4">
            <CriteriaManagement projectId={selectedProjectId} onComplete={() => setCurrentStep('alternatives')} />
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep('projects')}>
                이전
              </Button>
              <Button variant="primary" onClick={() => setCurrentStep('alternatives')}>
                다음: 대안 설정
              </Button>
            </div>
          </div>
        );
      case 'alternatives':
        return (
          <div className="space-y-4">
            <AlternativeManagement projectId={selectedProjectId} onComplete={() => setCurrentStep('evaluators')} />
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep('criteria')}>
                이전
              </Button>
              <Button variant="primary" onClick={() => setCurrentStep('evaluators')}>
                다음: 평가자 배정
              </Button>
            </div>
          </div>
        );
      case 'evaluators':
        return (
          <div className="space-y-4">
            <EvaluatorAssignment projectId={selectedProjectId} onComplete={() => setCurrentStep('finalize')} />
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep('alternatives')}>
                이전
              </Button>
              <Button variant="primary" onClick={() => setCurrentStep('finalize')}>
                다음: 모델 확정
              </Button>
            </div>
          </div>
        );
      case 'finalize':
        return (
          <ModelFinalization 
            projectId={selectedProjectId} 
            onFinalize={() => {
              setCurrentStep('overview');
              // 프로젝트 상태를 활성화로 변경
              setProjects(prev => prev.map(p => 
                p.id === selectedProjectId ? { ...p, status: 'active' as const } : p
              ));
            }}
            isReadyToFinalize={true}
          />
        );
      default:
        return renderOverview();
    }
  };

  const getStepProgress = () => {
    const steps = ['overview', 'projects', 'criteria', 'alternatives', 'evaluators', 'finalize'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">개인 서비스</h1>
          <p className="text-gray-600">나만의 AHP 의사결정 분석 프로젝트</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            {user.email}
          </div>
          {currentStep !== 'overview' && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setCurrentStep('overview')}
            >
              홈으로
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar (only show when in project creation flow) */}
      {currentStep !== 'overview' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">프로젝트 설정 진행상황</h3>
            <span className="text-sm text-gray-600">{Math.round(getStepProgress())}% 완료</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>프로젝트</span>
            <span>기준</span>
            <span>대안</span>
            <span>평가자</span>
            <span>완료</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          {renderStepContent()}
        </div>
      </div>

      {/* Quick Access Panel */}
      {currentStep === 'overview' && projects.length > 0 && (
        <Card title="⚡ 빠른 접근">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="secondary" className="p-4 h-auto flex flex-col items-center space-y-2">
              <span className="text-2xl">📊</span>
              <span className="font-medium">결과 분석</span>
              <span className="text-xs text-gray-600">완료된 평가 결과 확인</span>
            </Button>
            <Button variant="secondary" className="p-4 h-auto flex flex-col items-center space-y-2">
              <span className="text-2xl">👥</span>
              <span className="font-medium">평가자 관리</span>
              <span className="text-xs text-gray-600">평가자 초대 및 진행률</span>
            </Button>
            <Button variant="secondary" className="p-4 h-auto flex flex-col items-center space-y-2">
              <span className="text-2xl">📤</span>
              <span className="font-medium">결과 내보내기</span>
              <span className="text-xs text-gray-600">Excel, PDF 형태로 저장</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PersonalServiceDashboard;