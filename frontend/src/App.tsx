import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import Card from './components/common/Card';
import ModelBuilder from './components/model/ModelBuilder';
import PairwiseComparison from './components/comparison/PairwiseComparison';
import ResultsDashboard from './components/results/ResultsDashboard';
import LandingPage from './components/admin/LandingPage';
import ProjectCreation from './components/admin/ProjectCreation';
import ModelBuilding from './components/admin/ModelBuilding';
import EvaluationResults from './components/admin/EvaluationResults';
import ProjectCompletion from './components/admin/ProjectCompletion';
import ProjectSelection from './components/evaluator/ProjectSelection';
import PairwiseEvaluation from './components/evaluator/PairwiseEvaluation';
import DirectInputEvaluation from './components/evaluator/DirectInputEvaluation';
import { API_BASE_URL } from './config/api';
import { 
  DEMO_USER, 
  DEMO_PROJECTS, 
  DEMO_CRITERIA,
  DEMO_ALTERNATIVES,
  DEMO_LOGIN_CREDENTIALS, 
  isBackendAvailable 
} from './data/demoData';

function App() {
  const [user, setUser] = useState<{
    first_name: string;
    last_name: string;
    role: 'admin' | 'evaluator';
  } | null>(null);
  const [activeTab, setActiveTab] = useState('landing');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>('');
  const [selectedEvaluationMethod, setSelectedEvaluationMethod] = useState<'pairwise' | 'direct'>('pairwise');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [projectCreationLoading, setProjectCreationLoading] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 백엔드 상태 확인 후 토큰 확인
    checkBackendAndInitialize();
  }, []);

  const checkBackendAndInitialize = async () => {
    try {
      setBackendStatus('checking');
      const available = await isBackendAvailable();
      
      if (available) {
        setBackendStatus('available');
        setIsDemoMode(false);
        // 백엔드가 사용 가능하면 토큰 확인
        const token = localStorage.getItem('token');
        if (token) {
          validateToken(token);
        }
      } else {
        setBackendStatus('unavailable');
        setIsDemoMode(true);
        // 데모 모드 자동 활성화
        setUser(DEMO_USER);
        setProjects(DEMO_PROJECTS);
        setSelectedProjectId(DEMO_PROJECTS[0].id);
      }
    } catch (error) {
      console.log('Backend check failed, activating demo mode');
      setBackendStatus('unavailable');
      setIsDemoMode(true);
      setUser(DEMO_USER);
      setProjects(DEMO_PROJECTS);
      setSelectedProjectId(DEMO_PROJECTS[0].id);
    }
  };

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      // 데모 모드에서는 데모 크리덴셜로 바로 로그인
      if (isDemoMode) {
        if (email === DEMO_LOGIN_CREDENTIALS.email && password === DEMO_LOGIN_CREDENTIALS.password) {
          setUser(DEMO_USER);
          setProjects(DEMO_PROJECTS);
          setSelectedProjectId(DEMO_PROJECTS[0].id);
        } else {
          throw new Error('데모 모드: admin@ahp-system.com / password123을 사용하세요');
        }
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setActiveTab('landing');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
  };

  // Set initial tab based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setActiveTab('landing');
      } else if (user.role === 'evaluator') {
        setActiveTab('evaluator-dashboard');
      }
    }
  }, [user]);

  const fetchProjects = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleProject = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '샘플 AHP 프로젝트',
          description: 'AHP 의사결정 분석을 위한 샘플 프로젝트입니다.',
          objective: '최적의 대안을 선택하기 위한 다기준 의사결정'
        }),
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to create sample project:', error);
    }
  };

  // New admin workflow handlers
  const handleGetStarted = () => {
    setActiveTab('projects');
  };

  const createProject = async (projectData: { title: string; description: string; objective: string }) => {
    setProjectCreationLoading(true);
    
    try {
      if (isDemoMode) {
        // 데모 모드에서는 로컬 상태에 새 프로젝트 추가
        const newProject = {
          id: Date.now().toString(),
          title: projectData.title,
          description: projectData.description,
          objective: projectData.objective,
          status: 'draft',
          created_at: new Date().toISOString(),
          evaluator_count: 0
        };
        
        setProjects(prev => [...prev, newProject]);
        setSelectedProjectId(newProject.id);
        setSelectedProjectTitle(newProject.title);
        
        // 시뮬레이션 딜레이
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return newProject;
      } else {
        // 실제 API 호출
        const token = localStorage.getItem('token');
        if (!token) throw new Error('로그인이 필요합니다.');

        const response = await fetch(`${API_BASE_URL}/api/projects`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || '프로젝트 생성에 실패했습니다.');
        }

        const result = await response.json();
        const newProject = result.project;
        
        setSelectedProjectId(newProject.id);
        setSelectedProjectTitle(newProject.title);
        
        // 프로젝트 목록 새로고침
        await fetchProjects();
        
        return newProject;
      }
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      throw error;
    } finally {
      setProjectCreationLoading(false);
    }
  };

  const handleProjectCreated = () => {
    setActiveTab('model-building');
  };

  const handleModelFinalized = () => {
    setActiveTab('evaluation-results');
  };

  const handleAdminEvaluationComplete = () => {
    setActiveTab('project-completion');
  };

  const handleProjectStatusChange = (status: 'terminated' | 'completed') => {
    console.log(`Project ${selectedProjectId} status changed to: ${status}`);
    setActiveTab('projects');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
  };

  const handleProjectSelect = (projectId: string, projectTitle: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
  };

  // Evaluator workflow handlers
  const handleEvaluatorProjectSelect = (projectId: string, projectTitle: string, evaluationMethod: 'pairwise' | 'direct') => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
    setSelectedEvaluationMethod(evaluationMethod);
    
    if (evaluationMethod === 'pairwise') {
      setActiveTab('pairwise-evaluation');
    } else {
      setActiveTab('direct-evaluation');
    }
  };

  const handleEvaluatorEvaluationComplete = () => {
    setActiveTab('evaluator-dashboard');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
  };

  useEffect(() => {
    if (user && activeTab === 'projects') {
      fetchProjects();
    } else if (user && activeTab === 'users' && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, activeTab]);

  const renderDemoNotice = () => (
    <div className={`mb-6 border rounded-lg p-4 ${
      backendStatus === 'checking' ? 'bg-yellow-50 border-yellow-200' :
      backendStatus === 'available' ? 'bg-blue-50 border-blue-200' :
      'bg-orange-50 border-orange-200'
    }`}>
      <h3 className={`font-medium mb-2 ${
        backendStatus === 'checking' ? 'text-yellow-800' :
        backendStatus === 'available' ? 'text-blue-800' :
        'text-orange-800'
      }`}>
        {backendStatus === 'checking' ? '⏳ 백엔드 연결 확인 중...' :
         backendStatus === 'available' ? '🚀 AHP Decision Support System - 실제 API 연결됨' :
         '📋 AHP Decision Support System - 데모 모드 활성화'}
      </h3>
      <div className={`text-xs space-y-1 ${
        backendStatus === 'checking' ? 'text-yellow-600' :
        backendStatus === 'available' ? 'text-blue-600' :
        'text-orange-600'
      }`}>
        {backendStatus === 'checking' ? (
          <div>백엔드 서버 상태를 확인하고 있습니다...</div>
        ) : backendStatus === 'available' ? (
          <>
            <div>
              <strong>백엔드 API:</strong> 
              <a href="https://ahp-forpaper.onrender.com/api/health" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                https://ahp-forpaper.onrender.com
              </a>
            </div>
            <div><strong>데모 계정:</strong> admin@ahp-system.com / password123</div>
            <div><strong>기능:</strong> 실제 데이터베이스 연동, JWT 인증, CRUD 작업</div>
          </>
        ) : (
          <>
            <div><strong>상태:</strong> 백엔드 서버 배포 대기 중 (Render.com)</div>
            <div><strong>데모 계정:</strong> admin@ahp-system.com / password123</div>
            <div><strong>기능:</strong> 샘플 데이터로 UI 미리보기, 모든 AHP 기능 체험 가능</div>
            <div><strong>참고:</strong> 데이터는 저장되지 않으며, 새로고침 시 초기화됩니다</div>
          </>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (!user) {
      return null;
    }

    switch (activeTab) {
      case 'landing':
        return (
          <LandingPage 
            user={user}
            onGetStarted={handleGetStarted}
          />
        );

      case 'project-creation':
        return (
          <ProjectCreation
            onProjectCreated={handleProjectCreated}
            onCancel={() => setActiveTab('projects')}
            loading={projectCreationLoading}
            createProject={createProject}
          />
        );

      case 'model-building':
        if (!selectedProjectId) {
          return (
            <Card title="모델 구축">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  프로젝트 목록으로 이동
                </button>
              </div>
            </Card>
          );
        }
        return (
          <ModelBuilding
            projectId={selectedProjectId}
            projectTitle={selectedProjectTitle}
            onModelFinalized={handleModelFinalized}
            onBack={() => setActiveTab('projects')}
          />
        );

      case 'evaluation-results':
        if (!selectedProjectId) {
          return (
            <Card title="평가 결과">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  프로젝트 목록으로 이동
                </button>
              </div>
            </Card>
          );
        }
        return (
          <EvaluationResults
            projectId={selectedProjectId}
            projectTitle={selectedProjectTitle}
            onBack={() => setActiveTab('model-building')}
            onComplete={handleAdminEvaluationComplete}
          />
        );

      case 'project-completion':
        if (!selectedProjectId) {
          return (
            <Card title="프로젝트 완료">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  프로젝트 목록으로 이동
                </button>
              </div>
            </Card>
          );
        }
        return (
          <ProjectCompletion
            projectId={selectedProjectId}
            projectTitle={selectedProjectTitle}
            onBack={() => setActiveTab('evaluation-results')}
            onProjectStatusChange={handleProjectStatusChange}
          />
        );

      case 'projects':
        return (
          <Card title="프로젝트 관리">
            {loading ? (
              <div className="text-center py-4">데이터 로딩 중...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">내 프로젝트 ({projects.length}개)</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('project-creation')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      새 프로젝트 생성
                    </button>
                    <button
                      onClick={createSampleProject}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      샘플 프로젝트 생성
                    </button>
                  </div>
                </div>
                
                {projects.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    프로젝트가 없습니다. 새 프로젝트를 생성해보세요.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {projects.map((project: any) => (
                      <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <h5 className="font-medium text-lg">{project.title}</h5>
                        <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-gray-500">
                            평가자: {project.evaluator_count}명 | 상태: {project.status}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                handleProjectSelect(project.id, project.title);
                                setActiveTab('model-building');
                              }}
                              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              모델 구성
                            </button>
                            <span className="text-xs text-gray-500">
                              {new Date(project.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
        
      case 'users':
        return (
          <Card title="사용자 관리">
            {user.role !== 'admin' ? (
              <div className="text-red-500">관리자만 접근 가능합니다.</div>
            ) : loading ? (
              <div className="text-center py-4">데이터 로딩 중...</div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-medium">전체 사용자 ({users.length}명)</h4>
                {users.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    등록된 사용자가 없습니다.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">생성일</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user: any) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role === 'admin' ? '관리자' : '평가자'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
        
      case 'model-builder':
        if (!selectedProjectId) {
          return (
            <Card title="모델 빌더">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 선택해주세요.</p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  프로젝트 목록으로 이동
                </button>
              </div>
            </Card>
          );
        }
        return <ModelBuilder projectId={selectedProjectId} demoMode={isDemoMode} />;
        
      case 'results':
        if (!selectedProjectId) {
          return (
            <Card title="결과 대시보드">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 선택해주세요.</p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  프로젝트 목록으로 이동
                </button>
              </div>
            </Card>
          );
        }
        return (
          <ResultsDashboard 
            projectId={selectedProjectId} 
            projectTitle={isDemoMode ? DEMO_PROJECTS[0].title : 'AHP 프로젝트'}
            demoMode={isDemoMode}
          />
        );
        
      case 'evaluator-dashboard':
        return (
          <ProjectSelection
            evaluatorId={user.first_name + user.last_name}
            onProjectSelect={handleEvaluatorProjectSelect}
          />
        );

      case 'pairwise-evaluation':
        if (!selectedProjectId) {
          return (
            <Card title="쌍대비교 평가">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
                <button
                  onClick={() => setActiveTab('evaluator-dashboard')}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  프로젝트 선택으로 이동
                </button>
              </div>
            </Card>
          );
        }
        return (
          <PairwiseEvaluation
            projectId={selectedProjectId}
            projectTitle={selectedProjectTitle}
            onComplete={handleEvaluatorEvaluationComplete}
            onBack={() => setActiveTab('evaluator-dashboard')}
          />
        );

      case 'direct-evaluation':
        if (!selectedProjectId) {
          return (
            <Card title="직접입력 평가">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
                <button
                  onClick={() => setActiveTab('evaluator-dashboard')}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  프로젝트 선택으로 이동
                </button>
              </div>
            </Card>
          );
        }
        return (
          <DirectInputEvaluation
            projectId={selectedProjectId}
            projectTitle={selectedProjectTitle}
            onComplete={handleEvaluatorEvaluationComplete}
            onBack={() => setActiveTab('evaluator-dashboard')}
          />
        );

      case 'dashboard':
        return (
          <Card title="평가자 대시보드">
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded p-4">
                <h5 className="font-medium text-purple-800">👤 내 평가 현황</h5>
                <p className="text-purple-700 text-sm mt-1">
                  할당된 프로젝트의 평가 진행 상황을 확인합니다.
                </p>
              </div>
              <div className="text-gray-600">
                <p>평가자 기능:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>할당된 프로젝트 목록</li>
                  <li>평가 완료율 확인</li>
                  <li>미완료 쌍대비교 알림</li>
                  <li>개인 평가 결과 미리보기</li>
                </ul>
              </div>
            </div>
          </Card>
        );
        
      case 'evaluations':
        if (!selectedProjectId) {
          return (
            <Card title="쌍대비교 평가">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 선택해주세요.</p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  프로젝트 목록으로 이동
                </button>
              </div>
            </Card>
          );
        }
        return (
          <PairwiseComparison 
            projectId={selectedProjectId} 
            criteria={isDemoMode ? DEMO_CRITERIA : []}
            alternatives={isDemoMode ? DEMO_ALTERNATIVES : []}
            demoMode={isDemoMode}
          />
        );
        
      case 'progress':
        return (
          <Card title="진행 상황">
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
                <h5 className="font-medium text-indigo-800">📈 프로젝트 진행률</h5>
                <p className="text-indigo-700 text-sm mt-1">
                  각 단계별 완료 상황을 추적합니다.
                </p>
              </div>
              <div className="text-gray-600">
                <p>추적 항목:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>모델 구축 완료율</li>
                  <li>평가자별 응답률</li>
                  <li>쌍대비교 완료 현황</li>
                  <li>일관성 검증 상태</li>
                  <li>최종 결과 생성 여부</li>
                </ul>
              </div>
            </div>
          </Card>
        );
        
      default:
        return (
          <Card title="환영합니다">
            <div className="text-center py-8">
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                AHP 의사결정 지원 시스템에 오신 것을 환영합니다!
              </h3>
              <p className="text-gray-600">
                다기준 의사결정 분석을 위한 전문 도구입니다.
              </p>
            </div>
          </Card>
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderDemoNotice()}
        <LoginForm
          onLogin={handleLogin}
          loading={loginLoading}
          error={loginError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDemoNotice()}
      <Layout
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
    </div>
  );
}

export default App;