import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import CriteriaManagement from './CriteriaManagement';
import AlternativeManagement from './AlternativeManagement';
import EvaluatorAssignment from './EvaluatorAssignment';
import ModelFinalization from './ModelFinalization';
import SubscriptionDashboard from '../subscription/SubscriptionDashboard';
import AdvancedResultsAnalysis from '../analysis/AdvancedResultsAnalysis';
import InteractiveCharts from '../visualization/InteractiveCharts';
import { ExtendedUser } from '../../types/subscription';

interface PersonalServiceProps {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'admin' | 'evaluator';
  };
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface UserProject {
  id: string;
  title: string;
  description: string;
  objective: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  evaluator_count: number;
  completion_rate: number;
  criteria_count: number;
  alternatives_count: number;
  last_modified: string;
  evaluation_method: 'pairwise' | 'direct' | 'mixed';
}

const PersonalServiceDashboard: React.FC<PersonalServiceProps> = ({ 
  user, 
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange
}) => {
  const [projects, setProjects] = useState<UserProject[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'overview' | 'projects' | 'criteria' | 'alternatives' | 'evaluators' | 'finalize'>('overview');
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<UserProject | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    objective: '',
    evaluation_method: 'pairwise' as 'pairwise' | 'direct' | 'mixed'
  });
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'projects' | 'creation' | 'model-builder' | 'evaluators' | 'monitoring' | 'analysis' | 'export' | 'settings'>(
    externalActiveTab === 'personal-service' ? 'dashboard' :
    externalActiveTab === 'my-projects' ? 'projects' :
    externalActiveTab === 'project-creation' ? 'creation' :
    externalActiveTab === 'model-builder' ? 'model-builder' :
    externalActiveTab === 'evaluator-management' ? 'evaluators' :
    externalActiveTab === 'progress-monitoring' ? 'monitoring' :
    externalActiveTab === 'results-analysis' ? 'analysis' :
    externalActiveTab === 'export-reports' ? 'export' :
    externalActiveTab === 'personal-settings' ? 'settings' :
    'dashboard'
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectTemplate, setProjectTemplate] = useState<'blank' | 'business' | 'technical' | 'academic'>('blank');

  const projectTemplates = {
    blank: { name: '빈 프로젝트', desc: '처음부터 설정' },
    business: { name: '비즈니스 결정', desc: '경영 의사결정 템플릿' },
    technical: { name: '기술 선택', desc: '기술 대안 비교 템플맿' },
    academic: { name: '연구 분석', desc: '학술 연구용 템플맿' }
  };

  // 외부에서 activeTab이 변경되면 내부 activeMenu도 업데이트
  useEffect(() => {
    if (externalActiveTab) {
      const menuMap: Record<string, string> = {
        'personal-service': 'dashboard',
        'my-projects': 'projects',
        'project-creation': 'creation',
        'model-builder': 'model-builder',
        'evaluator-management': 'evaluators',
        'progress-monitoring': 'monitoring',
        'results-analysis': 'analysis',
        'export-reports': 'export',
        'personal-settings': 'settings'
      };
      const mappedMenu = menuMap[externalActiveTab] || 'dashboard';
      setActiveMenu(mappedMenu as any);
    }
  }, [externalActiveTab]);

  useEffect(() => {
    // 사용자의 프로젝트 목록 로드
    setProjects([
      {
        id: '1',
        title: 'AI 개발 활용 방안 중요도 분석',
        description: '소프트웨어 개발자의 AI 활용 방안에 대한 중요도 분석',
        objective: '개발 생산성 향상을 위한 AI 도구들의 우선순위 결정',
        status: 'active',
        created_at: '2024-02-01',
        evaluator_count: 26,
        completion_rate: 85,
        criteria_count: 3,
        alternatives_count: 9,
        last_modified: '2024-02-15',
        evaluation_method: 'pairwise'
      },
      {
        id: '2',
        title: '프로젝트 관리 도구 선택',
        description: '팀 협업을 위한 최적의 프로젝트 관리 도구 선정',
        objective: '팀 규모와 업무 특성에 맞는 프로젝트 관리 도구 결정',
        status: 'draft',
        created_at: '2024-02-10',
        evaluator_count: 0,
        completion_rate: 0,
        criteria_count: 0,
        alternatives_count: 0,
        last_modified: '2024-02-10',
        evaluation_method: 'mixed'
      }
    ]);
  }, []);

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      objective: '',
      evaluation_method: 'pairwise'
    });
    setProjectTemplate('blank');
    setEditingProject(null);
    setIsProjectFormOpen(false);
    setError(null);
  };

  const handleCreateProject = () => {
    setIsProjectFormOpen(true);
    setEditingProject(null);
    resetProjectForm();
  };

  const handleEditProject = (project: UserProject) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      objective: project.objective,
      evaluation_method: project.evaluation_method
    });
    setIsProjectFormOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  const handleSaveProject = async () => {
    if (!projectForm.title.trim()) {
      setError('프로젝트명을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingProject) {
      // 편집 모드
      const updatedProject: UserProject = {
        ...editingProject,
        title: projectForm.title,
        description: projectForm.description,
        objective: projectForm.objective,
        evaluation_method: projectForm.evaluation_method,
        last_modified: new Date().toISOString().split('T')[0]
      };
      setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
    } else {
      // 생성 모드
      const newProject: UserProject = {
        id: Date.now().toString(),
        title: projectForm.title,
        description: projectForm.description,
        objective: projectForm.objective,
        status: 'draft',
        created_at: new Date().toISOString().split('T')[0],
        last_modified: new Date().toISOString().split('T')[0],
        evaluator_count: 0,
        completion_rate: 0,
        criteria_count: 0,
        alternatives_count: 0,
        evaluation_method: projectForm.evaluation_method
      };
        setProjects([...projects, newProject]);
        setSelectedProjectId(newProject.id);
      }
      resetProjectForm();
    } catch (error) {
      setError('프로젝트 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = (format: string, data?: any) => {
    // 결과 내보내기 로직
    console.log(`Exporting results to ${format}`, data);
    alert(`${format.toUpperCase()} 형식으로 결과를 내보내는 기능을 개발 중입니다.`);
  };

  const handleCreateNewProject = async () => {
    if (!projectForm.title.trim()) {
      setError('프로젝트명을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newProject: UserProject = {
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: projectForm.title,
        description: projectForm.description,
        objective: projectForm.objective,
        status: 'draft',
        created_at: new Date().toISOString().split('T')[0],
        last_modified: new Date().toISOString().split('T')[0],
        evaluator_count: 0,
        completion_rate: 0,
        criteria_count: 0,
        alternatives_count: 0,
        evaluation_method: projectForm.evaluation_method
      };

      setProjects([...projects, newProject]);
      setSelectedProjectId(newProject.id);
      
      // 템플맿에 따라 기본 데이터 설정
      if (projectTemplate !== 'blank') {
        // 모델 구축 페이지로 이동
        setCurrentStep('criteria');
        handleTabChange('model-builder');
      } else {
        handleTabChange('projects');
      }

      resetProjectForm();
      // 성공 메시지는 사용자 인터페이스에서 표시
    } catch (error) {
      setError('프로젝트 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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

  const handleTabChange = (tab: string) => {
    if (externalOnTabChange) {
      // 내부 메뉴를 외부 activeTab ID로 변환
      const tabMap: Record<string, string> = {
        'dashboard': 'personal-service',
        'projects': 'my-projects',
        'creation': 'project-creation',
        'model-builder': 'model-builder',
        'evaluators': 'evaluator-management',
        'monitoring': 'progress-monitoring',
        'analysis': 'results-analysis',
        'export': 'export-reports',
        'settings': 'personal-settings'
      };
      const mappedTab = tabMap[tab] || 'personal-service';
      externalOnTabChange(mappedTab);
    } else {
      setActiveMenu(tab as any);
    }
  };

  const renderMyProjectsFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">📂</span>
                    내 프로젝트
                  </h1>
                  <p className="text-gray-600 mt-2">나의 AHP 분석 프로젝트들을 관리합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="primary" onClick={() => handleTabChange('creation')}>
                  ➕ 새 프로젝트 생성
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMyProjects()}
      </div>
    </div>
  );

  const renderMyProjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">내 프로젝트 ({projects.length}개)</h3>
        <Button variant="primary" onClick={handleCreateProject}>
          ➕ 새 프로젝트 생성
        </Button>
      </div>

      {/* 프로젝트 생성/편집 모달 */}
      {isProjectFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingProject ? '프로젝트 편집' : '새 프로젝트 생성'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트명</label>
                <input 
                  type="text" 
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2" 
                  placeholder="예: AI 도구 선택을 위한 중요도 분석" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea 
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-20" 
                  placeholder="프로젝트의 목적과 배경을 설명해주세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">분석 목표</label>
                <textarea 
                  value={projectForm.objective}
                  onChange={(e) => setProjectForm({...projectForm, objective: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-16" 
                  placeholder="이 분석을 통해 달성하고자 하는 목표"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">평가 방법</label>
                <select 
                  value={projectForm.evaluation_method}
                  onChange={(e) => setProjectForm({...projectForm, evaluation_method: e.target.value as any})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="pairwise">쌍대비교 (근상)</option>
                  <option value="direct">직접입력</option>
                  <option value="mixed">혼합 방식</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={resetProjectForm}>
                  취소
                </Button>
                <Button variant="primary" onClick={handleSaveProject}>
                  {editingProject ? '수정' : '생성'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id} title={project.title}>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-600">{project.description}</p>
                <p className="text-sm text-gray-500">목표: {project.objective}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>생성: {project.created_at}</span>
                  <span>수정: {project.last_modified}</span>
                  <span>평가방식: {project.evaluation_method === 'pairwise' ? '쌍대비교' : project.evaluation_method === 'direct' ? '직접입력' : '혼합'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-blue-600">{project.evaluator_count}명</div>
                  <div className="text-gray-500">평가자</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-600">{project.completion_rate}%</div>
                  <div className="text-gray-500">완료율</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-purple-600">{project.criteria_count}개</div>
                  <div className="text-gray-500">기준</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-orange-600">{project.alternatives_count}개</div>
                  <div className="text-gray-500">대안</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-xs ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status === 'active' ? '진행중' : 
                   project.status === 'completed' ? '완료' : '준비중'}
                </span>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEditProject(project)}>
                    ✏️ 편집
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => {
                    setSelectedProjectId(project.id);
                    setActiveMenu('model-builder');
                  }}>
                    🏠️ 모델 구성
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => {
                    setSelectedProjectId(project.id);
                    setActiveMenu('analysis');
                  }}>
                    📊 결과 분석
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️ 삭제
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">프로젝트가 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 AHP 분석 프로젝트를 생성해보세요.</p>
            <Button variant="primary" onClick={handleCreateProject}>
              새 프로젝트 생성
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderProjectCreationFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">➕</span>
                    새 프로젝트 생성
                  </h1>
                  <p className="text-gray-600 mt-2">새로운 AHP 의사결정 분석 프로젝트를 만들어보세요</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('projects')}>
                  📂 내 프로젝트
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderProjectCreation()}
      </div>
    </div>
  );

  const renderProjectCreation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">새 프로젝트 생성</h3>
      
      {/* 템플맿 선택 */}
      <Card title="프로젝트 템플맿 선택">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(projectTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setProjectTemplate(key as any)}
              aria-label={`${template.name} 템플맿 선택 - ${template.desc}`}
              aria-pressed={projectTemplate === key}
              className={`p-4 text-center border-2 rounded-lg transition-all ${
                projectTemplate === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="text-2xl mb-2">
                {key === 'blank' ? '📄' : 
                 key === 'business' ? '📋' :
                 key === 'technical' ? '💻' : '📚'}
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
              <p className="text-xs text-gray-600">{template.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card title="프로젝트 상세 정보">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-medium text-gray-900 mb-1">기본 정보</h4>
              <p className="text-xs text-gray-600">프로젝트명, 설명, 목적</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-medium text-gray-900 mb-1">목표 설정</h4>
              <p className="text-xs text-gray-600">의사결정 목표 및 범위</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">⚖️</div>
              <h4 className="font-medium text-gray-900 mb-1">평가 방법</h4>
              <p className="text-xs text-gray-600">AHP 평가 방식 선택</p>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트명</label>
              <input 
                type="text" 
                value={projectForm.title}
                onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2" 
                placeholder="예: AI 도구 선택을 위한 중요도 분석" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea 
                value={projectForm.description}
                onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 h-20" 
                placeholder="프로젝트의 목적과 배경을 설명해주세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">분석 목표</label>
              <textarea 
                value={projectForm.objective}
                onChange={(e) => setProjectForm({...projectForm, objective: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 h-16" 
                placeholder="이 분석을 통해 달성하고자 하는 구체적인 목표"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">평가 방법</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2">
                <option>쌍대비교 (권장)</option>
                <option>직접입력</option>
                <option>혼합 방식</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setActiveMenu('projects')}>
                취소
              </Button>
              <Button variant="primary" onClick={handleCreateNewProject}>
                프로젝트 생성
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );

  const renderEvaluatorManagementFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">👥</span>
                    평가자 관리
                  </h1>
                  <p className="text-gray-600 mt-2">프로젝트 참여자를 초대하고 관리합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('monitoring')}>
                  📈 진행률 확인
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderEvaluatorManagement()}
      </div>
    </div>
  );

  const renderEvaluatorManagement = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">평가자 관리</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="평가자 초대">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일 주소</label>
              <input type="email" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="evaluator@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2">
                <option>평가자</option>
                <option>관찰자</option>
              </select>
            </div>
            <Button variant="primary" className="w-full">
              초대 발송
            </Button>
          </div>
        </Card>

        <Card title="접근 코드 생성">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              평가자들이 사용할 수 있는 접근 코드를 생성합니다.
            </p>
            <div className="bg-gray-50 p-3 rounded font-mono text-center">
              AHP-2024-AI-001
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" className="flex-1">
                복사
              </Button>
              <Button variant="secondary" className="flex-1">
                새 코드 생성
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card title="현재 평가자 목록">
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex justify-between items-center p-3 border rounded">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                  P{i + 1}
                </div>
                <div>
                  <div className="font-medium">평가자{i + 1}@company.com</div>
                  <div className="text-xs text-gray-500">초대 발송됨 · 대기중</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                  대기중
                </span>
                <Button variant="secondary" size="sm">
                  재발송
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderProgressMonitoringFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">📈</span>
                    진행률 모니터링
                  </h1>
                  <p className="text-gray-600 mt-2">평가자별 진행 상황을 실시간으로 추적합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('evaluators')}>
                  👥 평가자 관리
                </Button>
                <Button variant="secondary" onClick={() => handleTabChange('analysis')}>
                  📊 결과 분석
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderProgressMonitoring()}
      </div>
    </div>
  );

  const renderProgressMonitoring = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">진행률 모니터링</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="전체 진행률">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">85%</div>
            <div className="text-sm text-gray-500 mt-1">26명 중 22명 완료</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </Card>

        <Card title="평균 소요 시간">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">12분</div>
            <div className="text-sm text-gray-500 mt-1">평가 완료까지</div>
            <div className="text-xs text-green-600 mt-2">🟢 목표 시간 내</div>
          </div>
        </Card>

        <Card title="일관성 품질">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">0.08</div>
            <div className="text-sm text-gray-500 mt-1">평균 CR 값</div>
            <div className="text-xs text-green-600 mt-2">🟢 우수</div>
          </div>
        </Card>
      </div>

      <Card title="평가자별 진행 현황">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {Array.from({ length: 26 }, (_, i) => {
            const progress = Math.floor(Math.random() * 101);
            const status = progress === 100 ? 'completed' : progress > 50 ? 'in_progress' : 'not_started';
            
            return (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                    P{String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div className="font-medium">평가자{i + 1}@company.com</div>
                    <div className="text-xs text-gray-500">
                      {status === 'completed' ? '평가 완료' :
                       status === 'in_progress' ? '평가 진행중' : '시작 전'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{progress}%</div>
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          status === 'completed' ? 'bg-green-500' :
                          status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    status === 'completed' ? 'bg-green-100 text-green-800' :
                    status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status === 'completed' ? '완료' :
                     status === 'in_progress' ? '진행중' : '대기'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderResultsAnalysisFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">📊</span>
                    고급 결과 분석
                  </h1>
                  <p className="text-gray-600 mt-2">AHP 분석 결과를 확인하고 심화 인사이트를 도출합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleExportResults('excel')}>
                  📤 Excel 내보내기
                </Button>
                <Button variant="secondary" onClick={() => handleExportResults('pdf')}>
                  📄 PDF 보고서
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedProjectId ? (
          <div className="space-y-8">
            {/* 고급 결과 분석 */}
            <AdvancedResultsAnalysis 
              projectId={selectedProjectId}
              onExport={handleExportResults}
            />
            
            {/* 인터랙티브 차트 */}
            <InteractiveCharts 
              data={{
                labels: ['Claude Code', 'GitHub Copilot', 'Cursor AI', 'Tabnine'],
                datasets: [{
                  label: 'AHP 점수',
                  data: [0.387, 0.285, 0.198, 0.130],
                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
                }]
              }}
              title="대안별 종합 점수 비교"
            />
          </div>
        ) : (
          <Card title="프로젝트를 선택하세요">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 mb-4">분석할 프로젝트를 선택해주세요.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {projects.filter(p => p.status === 'active' || p.status === 'completed').map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <h4 className="font-medium">{project.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status === 'active' ? '진행중' : '완료'}
                      </span>
                      <span className="text-xs text-gray-500">
                        완료율: {project.completion_rate}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );

  const renderResultsAnalysis = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">결과 분석</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="최종 순위">
          <div className="space-y-3">
            {[
              { rank: 1, name: '코딩 작성 속도 향상', weight: 16.959, color: 'text-yellow-600' },
              { rank: 2, name: '코드 품질 개선 및 최적화', weight: 15.672, color: 'text-gray-500' },
              { rank: 3, name: '반복 작업 최소화', weight: 13.382, color: 'text-orange-600' },
              { rank: 4, name: '형상관리 및 배포 지원', weight: 11.591, color: 'text-blue-600' },
              { rank: 5, name: '디버깅 시간 단축', weight: 10.044, color: 'text-green-600' }
            ].map((item) => (
              <div key={item.rank} className="flex justify-between items-center p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                    item.rank === 1 ? 'bg-yellow-500' :
                    item.rank === 2 ? 'bg-gray-500' :
                    item.rank === 3 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {item.rank}
                  </div>
                  <div className="font-medium">{item.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.weight}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="일관성 분석">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0.00192</div>
              <div className="text-sm text-gray-500">통합 일관성 비율</div>
              <div className="text-xs text-green-600 mt-1">🟢 매우 우수 (&lt; 0.1)</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">기준 일관성</span>
                <span className="text-sm font-medium text-green-600">0.001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">대안 일관성 (평균)</span>
                <span className="text-sm font-medium text-green-600">0.003</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">전체 평가자</span>
                <span className="text-sm font-medium">26명</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="민감도 분석">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">기준 가중치 변화 시뮬레이션</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">개발 생산성 효율화</span>
                <input type="range" min="0" max="100" defaultValue="40" className="w-24" />
                <span className="text-sm font-medium w-12 text-right">40%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">코딩 실무 품질 적합화</span>
                <input type="range" min="0" max="100" defaultValue="30" className="w-24" />
                <span className="text-sm font-medium w-12 text-right">30%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">개발 프로세스 자동화</span>
                <input type="range" min="0" max="100" defaultValue="30" className="w-24" />
                <span className="text-sm font-medium w-12 text-right">30%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">예상 순위 변화</h4>
            <div className="text-sm text-gray-600">
              <p>• 현재 설정에서는 순위 변화 없음</p>
              <p>• 생산성 가중치 20% 감소 시: 2위↔3위 변동 가능</p>
              <p>• 품질 가중치 50% 증가 시: 1위↔2위 변동 가능</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderExportReportsFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">📤</span>
                    보고서 내보내기
                  </h1>
                  <p className="text-gray-600 mt-2">분석 결과를 다양한 형태로 내보냅니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('analysis')}>
                  📊 결과 분석
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderExportReports()}
      </div>
    </div>
  );

  const renderExportReports = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">보고서 내보내기</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Excel 보고서">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              상세한 데이터와 계산 과정이 포함된 스프레드시트
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">원시 데이터</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">계산 과정</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">차트</span>
              </label>
            </div>
            <Button variant="primary" className="w-full">
              📊 Excel 다운로드
            </Button>
          </div>
        </Card>

        <Card title="PDF 보고서">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              프레젠테이션용 요약 보고서
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">요약 정보</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">시각화 차트</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">상세 분석</span>
              </label>
            </div>
            <Button variant="primary" className="w-full">
              📄 PDF 다운로드
            </Button>
          </div>
        </Card>

        <Card title="PowerPoint">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              발표용 슬라이드 자료
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">개요 슬라이드</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">결과 차트</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">결론 및 제안</span>
              </label>
            </div>
            <Button variant="primary" className="w-full">
              📺 PPT 다운로드
            </Button>
          </div>
        </Card>
      </div>

      <Card title="맞춤형 보고서">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">보고서 형식</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2">
                <option>상세 분석 보고서</option>
                <option>요약 보고서</option>
                <option>평가자별 개별 보고서</option>
                <option>비교 분석 보고서</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">언어</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2">
                <option>한국어</option>
                <option>English</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">포함할 섹션</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">프로젝트 개요</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">방법론 설명</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">결과 분석</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">민감도 분석</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">일관성 검증</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">평가자 의견</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">결론 및 제안</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">부록</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="primary">
              맞춤 보고서 생성
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPersonalSettingsFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">⚙️</span>
                    개인 설정 및 구독 관리
                  </h1>
                  <p className="text-gray-600 mt-2">계정 정보, 구독 플랜, 개인 환경설정을 관리합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 구독 관리 대시보드 */}
          <SubscriptionDashboard 
            user={user as ExtendedUser}
          />
          {/* 개인 설정 */}
          {renderPersonalSettings()}
        </div>
      </div>
    </div>
  );

  const renderPersonalSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">개인 설정</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="계정 정보">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input type="text" defaultValue={`${user.first_name} ${user.last_name}`} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input type="email" defaultValue={user.email} className="w-full border border-gray-300 rounded px-3 py-2" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">조직/부서</label>
              <input type="text" placeholder="예: 개발팀" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <Button variant="primary">
              정보 업데이트
            </Button>
          </div>
        </Card>

        <Card title="비밀번호 변경">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
              <input type="password" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
              <input type="password" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
              <input type="password" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <Button variant="primary">
              비밀번호 변경
            </Button>
          </div>
        </Card>
      </div>

      <Card title="워크플로우 설정">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">기본 설정</h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">자동 저장 간격</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>30초</option>
                <option selected>1분</option>
                <option>5분</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">기본 템플릿</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>기본</option>
                <option>간단</option>
                <option>상세</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">화면 레이아웃</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>컴팩트</option>
                <option selected>표준</option>
                <option>와이드</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">알림 설정</h4>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" defaultChecked />
              <span className="ml-2 text-sm">평가 완료 알림</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" defaultChecked />
              <span className="ml-2 text-sm">프로젝트 상태 변경</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2 text-sm">주간 진행률 리포트</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2 text-sm">시스템 업데이트</span>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderModelBuilderFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => handleTabChange('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">🏗️</span>
                    모델 구축
                  </h1>
                  <p className="text-gray-600 mt-2">단계별로 AHP 분석 모델을 구성합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('projects')}>
                  📂 내 프로젝트
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep !== 'overview' ? renderStepContent() : (
          <Card title="모델 구축">
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🏗️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">모델을 구축할 프로젝트를 선택하세요</h3>
                <p className="text-gray-600 mb-4">프로젝트를 선택하고 단계별로 모델을 구성해보세요.</p>
                <Button variant="primary" onClick={() => handleTabChange('projects')}>
                  프로젝트 선택하기
                </Button>
              </div>
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">모델 구축 단계</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">1️⃣</div>
                    <h5 className="font-medium text-gray-900 mb-1">프로젝트 설정</h5>
                    <p className="text-xs text-gray-600">기본 정보 및 목표 설정</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-2">2️⃣</div>
                    <h5 className="font-medium text-gray-900 mb-1">기준 정의</h5>
                    <p className="text-xs text-gray-600">평가 기준 및 계층 구조</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl mb-2">3️⃣</div>
                    <h5 className="font-medium text-gray-900 mb-1">대안 설정</h5>
                    <p className="text-xs text-gray-600">비교할 대안들 등록</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl mb-2">4️⃣</div>
                    <h5 className="font-medium text-gray-900 mb-1">평가자 배정</h5>
                    <p className="text-xs text-gray-600">참여자 초대 및 권한 설정</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );

  const renderMenuContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderOverview();
      case 'projects':
        return renderMyProjects();
      case 'creation':
        return renderProjectCreation();
      case 'model-builder':
        return currentStep !== 'overview' ? renderStepContent() : (
          <Card title="모델 구축">
            <p>프로젝트를 선택하고 단계별로 모델을 구성해보세요.</p>
            <Button variant="secondary" onClick={() => setActiveMenu('projects')}>
              프로젝트 선택하기
            </Button>
          </Card>
        );
      case 'evaluators':
        return renderEvaluatorManagement();
      case 'monitoring':
        return renderProgressMonitoring();
      case 'analysis':
        return renderResultsAnalysis();
      case 'export':
        return renderExportReports();
      case 'settings':
        return renderPersonalSettings();
      default:
        return renderOverview();
    }
  };

  // 개별 메뉴 페이지들은 전체 화면을 사용
  if (externalActiveTab && externalActiveTab !== 'personal-service') {
    return (
      <>
        {externalActiveTab === 'my-projects' && renderMyProjectsFullPage()}
        {externalActiveTab === 'project-creation' && renderProjectCreationFullPage()}
        {externalActiveTab === 'model-builder' && renderModelBuilderFullPage()}
        {externalActiveTab === 'evaluator-management' && renderEvaluatorManagementFullPage()}
        {externalActiveTab === 'progress-monitoring' && renderProgressMonitoringFullPage()}
        {externalActiveTab === 'results-analysis' && renderResultsAnalysisFullPage()}
        {externalActiveTab === 'export-reports' && renderExportReportsFullPage()}
        {externalActiveTab === 'personal-settings' && renderPersonalSettingsFullPage()}
      </>
    );
  }

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

      {/* Navigation Menu - 2 Row Button Layout */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          {/* First Row - Main Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'dashboard', label: '대시보드', icon: '🏠', desc: '프로젝트 현황' },
              { id: 'projects', label: '내 프로젝트', icon: '📂', desc: '프로젝트 관리' },
              { id: 'creation', label: '새 프로젝트', icon: '➕', desc: '프로젝트 생성' },
              { id: 'model-builder', label: '모델 구축', icon: '🏗️', desc: '단계별 구성' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id as any)}
                aria-label={`${item.label} - ${item.desc}`}
                aria-pressed={activeMenu === item.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  activeMenu === item.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>

          {/* Second Row - Analysis & Settings */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { id: 'evaluators', label: '평가자 관리', icon: '👥', desc: '참여자 초대' },
              { id: 'monitoring', label: '진행률 모니터링', icon: '📈', desc: '실시간 추적' },
              { id: 'analysis', label: '결과 분석', icon: '📊', desc: '순위 및 일관성' },
              { id: 'export', label: '보고서 내보내기', icon: '📤', desc: 'Excel/PDF/PPT' },
              { id: 'settings', label: '개인 설정', icon: '⚙️', desc: '계정 및 환경' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id as any)}
                aria-label={`${item.label} - ${item.desc}`}
                aria-pressed={activeMenu === item.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  activeMenu === item.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar (only show when in model builder flow) */}
      {activeMenu === 'model-builder' && currentStep !== 'overview' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">모델 구축 진행상황</h3>
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
          {renderMenuContent()}
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