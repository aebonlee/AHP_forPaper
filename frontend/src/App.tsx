import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import Card from './components/common/Card';
import ModelBuilder from './components/model/ModelBuilder';
import PairwiseComparison from './components/comparison/PairwiseComparison';
import ResultsDashboard from './components/results/ResultsDashboard';
import LandingPage from './components/admin/LandingPage';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import PersonalServiceDashboard from './components/admin/PersonalServiceDashboard';
import ProjectCreation from './components/admin/ProjectCreation';
import ModelBuilding from './components/admin/ModelBuilding';
import EvaluationResults from './components/admin/EvaluationResults';
import ProjectCompletion from './components/admin/ProjectCompletion';
import UserManagement from './components/admin/UserManagement';
import ProjectSelection from './components/evaluator/ProjectSelection';
import PairwiseEvaluation from './components/evaluator/PairwiseEvaluation';
import DirectInputEvaluation from './components/evaluator/DirectInputEvaluation';
import { API_BASE_URL } from './config/api';
import { 
  DEMO_USER, 
  DEMO_PROJECTS, 
  DEMO_CRITERIA,
  DEMO_ALTERNATIVES,
  DEMO_LOGIN_CREDENTIALS
  // isBackendAvailable - 현재 미사용 (데모 모드 강제 활성화)
} from './data/demoData';

function App() {
  const [user, setUser] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'admin' | 'evaluator';
    admin_type?: 'super' | 'personal'; // 관리자 유형 구분
  } | null>(null);
  const [activeTab, setActiveTab] = useState('landing');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedEvaluationMethod, setSelectedEvaluationMethod] = useState<'pairwise' | 'direct'>('pairwise');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [projectCreationLoading, setProjectCreationLoading] = useState(false);

  useEffect(() => {
    // PostgreSQL 데이터베이스 연동 모드 활성화
    checkBackendAndInitialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activateDemoMode = () => {
    console.log('🎯 데모 모드 강제 활성화 - AI 개발 활용 방안 AHP 분석');
    console.log('📋 로딩될 샘플 프로젝트:', DEMO_PROJECTS);
    setBackendStatus('unavailable');
    setIsDemoMode(true);
    // 데모 사용자에 admin_type 추가
    setUser({
      ...DEMO_USER,
      id: '1',
      email: 'admin@ahp-system.com',
      admin_type: 'personal' // 기본적으로 개인 서비스로 설정
    });
    setProjects(DEMO_PROJECTS);
    setSelectedProjectId(DEMO_PROJECTS[0].id);
    setActiveTab('admin-type-selection');
    console.log('✅ 데모 데이터 설정 완료 - 프로젝트 수:', DEMO_PROJECTS.length);
  };

  const checkBackendAndInitialize = async () => {
    try {
      setBackendStatus('checking');
      console.log('🔍 백엔드 연결 확인 중...');
      
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const available = response.ok;
      
      if (available) {
        console.log('✅ 백엔드 연결 성공 - PostgreSQL 데이터베이스 모드');
        setBackendStatus('available');
        setIsDemoMode(false);
        // 백엔드가 사용 가능하면 토큰 확인
        const token = localStorage.getItem('token');
        if (token) {
          validateToken(token);
        }
      } else {
        console.log('⚠️ 백엔드 연결 실패 - 데모 모드로 전환');
        setBackendStatus('unavailable');
        setIsDemoMode(true);
        activateDemoMode();
      }
    } catch (error) {
      console.log('❌ 백엔드 연결 오류 - 데모 모드 활성화:', error);
      setBackendStatus('unavailable');
      setIsDemoMode(true);
      activateDemoMode();
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
        // 프로젝트 목록 로드
        fetchProjects();
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
      if (isDemoMode) {
        // 데모 모드일 때만 데모 크리덴셜 사용
        if (email === DEMO_LOGIN_CREDENTIALS.email && password === DEMO_LOGIN_CREDENTIALS.password) {
          setUser(DEMO_USER);
          setProjects(DEMO_PROJECTS);
          setSelectedProjectId(DEMO_PROJECTS[0].id);
          console.log('✅ 데모 모드 - AI 개발 활용 AHP 데이터 로드 완료');
          return;
        } else {
          throw new Error('데모 계정: admin@ahp-system.com / password123');
        }
      } else {
        // PostgreSQL 백엔드 로그인
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          setUser(data.user);
          console.log('✅ PostgreSQL 백엔드 로그인 성공');
          // 프로젝트 목록 로드
          await fetchProjects();
        } else {
          throw new Error(data.message || '로그인에 실패했습니다.');
        }
      }
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
        setActiveTab('admin-type-selection');
      } else if (user.role === 'evaluator') {
        setActiveTab('evaluator-dashboard');
      }
    }
  }, [user]);

  // 관리자 유형 선택 핸들러
  const handleAdminTypeSelect = (adminType: 'super' | 'personal') => {
    if (user) {
      setUser({
        ...user,
        admin_type: adminType
      });
      
      if (adminType === 'super') {
        setActiveTab('super-admin');
      } else {
        setActiveTab('personal-service');
      }
    }
  };

  const fetchProjects = useCallback(async () => {
    if (isDemoMode) {
      // 데모 모드에서는 이미 로드된 DEMO_PROJECTS 유지
      console.log('데모 모드: 샘플 프로젝트 데이터 사용 중');
      return;
    }

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
        // Filter out old sample projects on frontend as well
        const filteredProjects = (data.projects || []).filter((project: any) => 
          !['스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택'].includes(project.title)
        );
        setProjects(filteredProjects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  const fetchUsers = useCallback(async () => {
    if (isDemoMode) {
      // 데모 모드에서는 샘플 사용자 데이터 사용
      const demoUsers = [
        {
          id: '1',
          email: 'admin@ahp-system.com',
          first_name: '관리자',
          last_name: '시스템',
          role: 'admin',
          created_at: '2024-01-01T00:00:00Z',
          last_login: '2024-01-15T10:30:00Z',
          status: 'active'
        },
        {
          id: '2',
          email: 'evaluator1@example.com',
          first_name: '평가자',
          last_name: '김',
          role: 'evaluator',
          created_at: '2024-01-02T00:00:00Z',
          last_login: '2024-01-14T15:20:00Z',
          status: 'active'
        },
        {
          id: '3',
          email: 'evaluator2@example.com',
          first_name: '평가자',
          last_name: '이',
          role: 'evaluator',
          created_at: '2024-01-03T00:00:00Z',
          status: 'inactive'
        }
      ];
      setUsers(demoUsers);
      return;
    }

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
  }, [isDemoMode]);

  // 사용자 관리 함수들
  const createUser = async (userData: any) => {
    if (isDemoMode) {
      // 데모 모드에서는 로컬 상태에 추가
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        last_login: undefined
      };
      setUsers(prev => [...prev, newUser]);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) throw new Error('로그인이 필요합니다.');

    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '사용자 생성에 실패했습니다.');
    }

    await fetchUsers(); // 목록 새로고침
  };

  const updateUser = async (userId: string, userData: any) => {
    if (isDemoMode) {
      // 데모 모드에서는 로컬 상태 업데이트
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ));
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) throw new Error('로그인이 필요합니다.');

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '사용자 수정에 실패했습니다.');
    }

    await fetchUsers(); // 목록 새로고침
  };

  const deleteUser = async (userId: string) => {
    if (isDemoMode) {
      // 데모 모드에서는 로컬 상태에서 제거
      setUsers(prev => prev.filter(user => user.id !== userId));
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) throw new Error('로그인이 필요합니다.');

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '사용자 삭제에 실패했습니다.');
    }

    await fetchUsers(); // 목록 새로고침
  };

  const createSampleProject = async () => {
    if (isDemoMode) {
      // 데모 모드에서는 이미 DEMO_PROJECTS가 로드되어 있음
      console.log('데모 모드에서 샘플 프로젝트가 이미 로드되어 있습니다.');
      return;
    }

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
    setActiveTab('personal-projects');
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
    setActiveTab('personal-projects');
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
    if (user && activeTab === 'personal-projects') {
      if (isDemoMode) {
        // 데모 모드에서는 DEMO_PROJECTS 강제 설정
        console.log('🔧 프로젝트 탭 활성화 - 데모 데이터 강제 설정');
        setProjects(DEMO_PROJECTS);
      } else {
        fetchProjects();
      }
    } else if (user && activeTab === 'personal-users' && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, activeTab, isDemoMode, fetchProjects, fetchUsers]);

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
            <div><strong>상태:</strong> Render 프리 요금제 - 고정 샘플 데이터 모드</div>
            <div><strong>데모 계정:</strong> admin@ahp-system.com / password123</div>
            <div><strong>샘플 데이터:</strong> "소프트웨어 개발자의 AI 활용 방안 중요도 분석"</div>
            <div><strong>기능:</strong> 완전한 AHP 기능 체험, 캡처 검증 시스템 포함</div>
            <div><strong>참고:</strong> 프로덕션 요금제 변경 시 DB 연동 자동 활성화</div>
          </>
        )}
      </div>
    </div>
  );

  const renderAdminTypeSelection = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          관리자 모드 선택
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          사용하실 관리자 모드를 선택해주세요. 언제든지 모드를 변경할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 총괄 관리자 모드 */}
        <div 
          onClick={() => handleAdminTypeSelect('super')}
          className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="text-center space-y-4">
            <div className="text-6xl group-hover:scale-110 transition-transform">🏢</div>
            <h3 className="text-2xl font-bold text-gray-900">총괄 관리자</h3>
            <p className="text-gray-600">
              시스템 전체를 관리하고 모든 사용자와 프로젝트를 통합 관리합니다.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <span>✓</span>
                <span>전체 사용자 관리</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>✓</span>
                <span>모든 프로젝트 모니터링</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>✓</span>
                <span>시스템 설정 및 성능 관리</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>✓</span>
                <span>통계 및 보고서</span>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              총괄 관리자로 시작
            </button>
          </div>
        </div>

        {/* 개인 서비스 모드 */}
        <div 
          onClick={() => handleAdminTypeSelect('personal')}
          className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="text-center space-y-4">
            <div className="text-6xl group-hover:scale-110 transition-transform">👤</div>
            <h3 className="text-2xl font-bold text-gray-900">개인 서비스</h3>
            <p className="text-gray-600">
              개인 프로젝트를 생성하고 관리하여 맞춤형 AHP 분석을 수행합니다.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <span>✓</span>
                <span>개인 프로젝트 생성</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>✓</span>
                <span>평가자 초대 및 관리</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>✓</span>
                <span>AHP 모델 구축</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>✓</span>
                <span>결과 분석 및 내보내기</span>
              </div>
            </div>
            <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors">
              개인 서비스로 시작
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          모드는 언제든지 변경할 수 있습니다. 상단 메뉴에서 '모드 전환'을 선택하세요.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!user) {
      return null;
    }

    switch (activeTab) {
      case 'admin-type-selection':
        return renderAdminTypeSelection();

      case 'super-admin':
      case 'dashboard':
      case 'users':
      case 'projects':
      case 'monitoring':
      case 'database':
      case 'audit':
      case 'settings':
      case 'backup':
      case 'system':
        return (
          <SuperAdminDashboard 
            activeTab={activeTab === 'super-admin' ? 'dashboard' : activeTab}
            onTabChange={setActiveTab}
          />
        );

      case 'personal-service':
      case 'my-projects':
      case 'project-creation':
      case 'model-builder':
      case 'evaluator-management':
      case 'progress-monitoring':
      case 'results-analysis':
      case 'export-reports':
      case 'personal-settings':
        return (
          <PersonalServiceDashboard 
            user={user}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );

      case 'landing':
        return (
          <LandingPage 
            user={user}
            onGetStarted={handleGetStarted}
          />
        );

      case 'model-building':
        if (!selectedProjectId) {
          return (
            <Card title="모델 구축">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
                <button
                  onClick={() => setActiveTab('personal-projects')}
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
            onBack={() => setActiveTab('personal-projects')}
          />
        );

      case 'evaluation-results':
        if (!selectedProjectId) {
          return (
            <Card title="평가 결과">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
                <button
                  onClick={() => setActiveTab('personal-projects')}
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
                  onClick={() => setActiveTab('personal-projects')}
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

      case 'personal-projects':
        console.log('🔍 프로젝트 관리 렌더링 - 현재 프로젝트:', projects);
        console.log('📊 데모 모드:', isDemoMode, '프로젝트 수:', projects.length);
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
                    {!isDemoMode && (
                      <button
                        onClick={createSampleProject}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        샘플 프로젝트 생성
                      </button>
                    )}
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
        
      case 'personal-users':
        return user.role !== 'admin' ? (
          <Card title="접근 권한 없음">
            <div className="text-center py-8">
              <div className="text-red-500 text-lg mb-2">❌</div>
              <div className="text-red-600 font-medium">관리자만 접근 가능합니다.</div>
            </div>
          </Card>
        ) : (
          <UserManagement
            users={users}
            loading={loading}
            onCreateUser={createUser}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
            onRefresh={fetchUsers}
          />
        );
        
      case 'results':
        if (!selectedProjectId) {
          return (
            <Card title="결과 대시보드">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 선택해주세요.</p>
                <button
                  onClick={() => setActiveTab('personal-projects')}
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

      case 'evaluator-status':
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
                  onClick={() => setActiveTab('personal-projects')}
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