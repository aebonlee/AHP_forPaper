import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import Card from './components/common/Card';
import ModelBuilder from './components/model/ModelBuilder';
import { API_BASE_URL } from './config/api';

function App() {
  const [user, setUser] = useState<{
    first_name: string;
    last_name: string;
    role: 'admin' | 'evaluator';
  } | null>(null);
  const [activeTab, setActiveTab] = useState('projects');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    // 페이지 로드 시 토큰 확인
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    }
  }, []);

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
    setActiveTab('projects');
  };

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

  useEffect(() => {
    if (user && activeTab === 'projects') {
      fetchProjects();
    } else if (user && activeTab === 'users' && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, activeTab]);

  const renderDemoNotice = () => (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-blue-800 font-medium mb-2">🚀 AHP Decision Support System - 실제 API 연결됨</h3>
      <div className="text-blue-600 text-xs space-y-1">
        <div>
          <strong>백엔드 API:</strong> 
          <a href="https://ahp-forpaper.onrender.com/api/health" target="_blank" rel="noopener noreferrer" className="underline ml-1">
            https://ahp-forpaper.onrender.com
          </a>
        </div>
        <div><strong>데모 계정:</strong> admin@ahp-system.com / password123</div>
        <div><strong>기능:</strong> 실제 데이터베이스 연동, JWT 인증, CRUD 작업</div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!user) {
      return null;
    }

    switch (activeTab) {
      case 'projects':
        return (
          <Card title="프로젝트 관리">
            {loading ? (
              <div className="text-center py-4">데이터 로딩 중...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">내 프로젝트 ({projects.length}개)</h4>
                  <button
                    onClick={createSampleProject}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    샘플 프로젝트 생성
                  </button>
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
                                setSelectedProjectId(project.id);
                                setActiveTab('model-builder');
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
        return <ModelBuilder projectId={selectedProjectId} />;
        
      case 'results':
        return (
          <Card title="결과 대시보드">
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h5 className="font-medium text-green-800">📊 AHP 분석 결과</h5>
                <p className="text-green-700 text-sm mt-1">
                  최종 우선순위와 일관성 비율을 확인할 수 있습니다.
                </p>
              </div>
              <div className="text-gray-600">
                <p>표시될 결과:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>대안별 최종 우선순위 (가중치)</li>
                  <li>기준별 중요도 순위</li>
                  <li>일관성 비율 (CR) 검증</li>
                  <li>민감도 분석</li>
                  <li>시각화 차트 (Recharts)</li>
                </ul>
              </div>
            </div>
          </Card>
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
        return (
          <Card title="쌍대비교 평가">
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded p-4">
                <h5 className="font-medium text-orange-800">⚖️ Saaty 1-9 척도 평가</h5>
                <p className="text-orange-700 text-sm mt-1">
                  기준과 대안을 쌍대비교하여 중요도를 평가합니다.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium mb-2">Saaty 척도 가이드:</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>1 = 동등하게 중요</div>
                  <div>3 = 약간 더 중요</div>
                  <div>5 = 강하게 더 중요</div>
                  <div>7 = 매우 강하게 더 중요</div>
                  <div>9 = 극도로 더 중요</div>
                  <div>2,4,6,8 = 중간값</div>
                </div>
              </div>
              
              <div className="text-gray-600">
                <p>평가 프로세스:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>기준 간 쌍대비교</li>
                  <li>대안 간 쌍대비교 (각 기준별)</li>
                  <li>일관성 검증</li>
                  <li>자동 상호비교 매트릭스 생성</li>
                </ul>
              </div>
            </div>
          </Card>
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