import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'evaluator';
  created_at: string;
  last_login?: string;
  status: 'active' | 'inactive' | 'pending';
}

interface Project {
  id: string;
  title: string;
  description: string;
  admin_id: string;
  status: 'active' | 'completed' | 'draft';
  created_at: string;
  evaluator_count: number;
  completion_rate: number;
}

interface SystemStats {
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalEvaluations: number;
  systemUptime: string;
  storageUsed: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalEvaluations: 0,
    systemUptime: '0일',
    storageUsed: '0MB'
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'projects' | 'system'>('dashboard');

  useEffect(() => {
    // 시스템 통계 로드
    setStats({
      totalUsers: 127,
      totalProjects: 23,
      activeProjects: 8,
      totalEvaluations: 2156,
      systemUptime: '45일',
      storageUsed: '1.2GB'
    });

    // 사용자 목록 로드
    setUsers([
      {
        id: '1',
        first_name: '김',
        last_name: '관리자',
        email: 'admin@company.com',
        role: 'admin',
        created_at: '2024-01-15',
        last_login: '2024-02-20T10:30:00Z',
        status: 'active'
      },
      {
        id: '2',
        first_name: '이',
        last_name: '프로젝트매니저',
        email: 'pm@company.com',
        role: 'admin',
        created_at: '2024-01-20',
        last_login: '2024-02-19T15:20:00Z',
        status: 'active'
      }
    ]);

    // 프로젝트 목록 로드
    setProjects([
      {
        id: '1',
        title: 'AI 개발 활용 방안 중요도 분석',
        description: '소프트웨어 개발자의 AI 활용 방안에 대한 중요도 분석',
        admin_id: '1',
        status: 'active',
        created_at: '2024-02-01',
        evaluator_count: 26,
        completion_rate: 85
      },
      {
        id: '2',
        title: '신제품 출시 전략 평가',
        description: '새로운 제품 출시를 위한 마케팅 전략 평가',
        admin_id: '2',
        status: 'active',
        created_at: '2024-02-10',
        evaluator_count: 15,
        completion_rate: 42
      }
    ]);
  }, []);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="🏢 시스템 현황">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">총 사용자</span>
              <span className="font-semibold text-blue-600">{stats.totalUsers}명</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">총 프로젝트</span>
              <span className="font-semibold text-green-600">{stats.totalProjects}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">활성 프로젝트</span>
              <span className="font-semibold text-purple-600">{stats.activeProjects}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">총 평가 수</span>
              <span className="font-semibold text-orange-600">{stats.totalEvaluations}건</span>
            </div>
          </div>
        </Card>

        <Card title="⚡ 시스템 성능">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">가동 시간</span>
              <span className="font-semibold text-green-600">{stats.systemUptime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">저장소 사용</span>
              <span className="font-semibold text-blue-600">{stats.storageUsed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">응답 시간</span>
              <span className="font-semibold text-green-600">~125ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">시스템 상태</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                정상
              </span>
            </div>
          </div>
        </Card>

        <Card title="📈 최근 활동">
          <div className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">신규 가입</span>
                <span className="font-semibold">+12명</span>
              </div>
              <div className="text-xs text-gray-500">지난 7일</div>
            </div>
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">프로젝트 생성</span>
                <span className="font-semibold">+3개</span>
              </div>
              <div className="text-xs text-gray-500">지난 7일</div>
            </div>
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">완료된 평가</span>
                <span className="font-semibold">+284건</span>
              </div>
              <div className="text-xs text-gray-500">지난 7일</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card title="📋 최근 프로젝트 활동">
        <div className="space-y-3">
          {projects.slice(0, 5).map((project) => (
            <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{project.title}</h4>
                <p className="text-sm text-gray-600">{project.description}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500">{project.evaluator_count}명 참여</span>
                  <span className="text-xs text-gray-500">완료율 {project.completion_rate}%</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status === 'active' ? '진행중' : 
                   project.status === 'completed' ? '완료' : '대기'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">사용자 관리</h3>
        <Button variant="primary">
          새 사용자 추가
        </Button>
      </div>

      <Card>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-900">
                    {user.first_name[0]}{user.last_name[0]}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{user.first_name} {user.last_name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? '관리자' : '평가자'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status === 'active' ? '활성' :
                       user.status === 'inactive' ? '비활성' : '대기'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm">
                  편집
                </Button>
                <Button variant="secondary" size="sm">
                  권한
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">프로젝트 관리</h3>
        <div className="flex space-x-2">
          <Button variant="secondary">
            내보내기
          </Button>
          <Button variant="primary">
            새 프로젝트
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{project.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500">생성일: {project.created_at}</span>
                  <span className="text-xs text-gray-500">{project.evaluator_count}명 참여</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">진행률:</span>
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
              <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm">
                  보기
                </Button>
                <Button variant="secondary" size="sm">
                  분석
                </Button>
                <Button variant="secondary" size="sm">
                  설정
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">시스템 설정</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="🔧 시스템 구성">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">자동 백업</span>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">활성화</span>
              </label>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">이메일 알림</span>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">활성화</span>
              </label>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">로그 보관 기간</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>30일</option>
                <option>60일</option>
                <option>90일</option>
              </select>
            </div>
          </div>
        </Card>

        <Card title="📊 데이터베이스">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">연결 상태</span>
              <span className="text-sm font-medium text-green-600">정상</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">마지막 백업</span>
              <span className="text-sm font-medium">2시간 전</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">DB 크기</span>
              <span className="text-sm font-medium">1.2GB</span>
            </div>
            <div className="pt-2">
              <Button variant="secondary" size="sm" className="w-full">
                수동 백업 실행
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card title="📈 시스템 로그">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <div className="text-xs font-mono bg-gray-50 p-2 rounded">
            <span className="text-gray-500">[2024-02-20 10:30:15]</span> 
            <span className="text-green-600"> INFO</span> - 사용자 로그인: admin@company.com
          </div>
          <div className="text-xs font-mono bg-gray-50 p-2 rounded">
            <span className="text-gray-500">[2024-02-20 10:25:33]</span> 
            <span className="text-blue-600"> INFO</span> - 프로젝트 생성: AI 개발 활용 방안
          </div>
          <div className="text-xs font-mono bg-gray-50 p-2 rounded">
            <span className="text-gray-500">[2024-02-20 10:20:45]</span> 
            <span className="text-green-600"> INFO</span> - 데이터베이스 백업 완료
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">총괄 관리자</h1>
          <p className="text-gray-600">AHP 시스템 전체 관리 및 모니터링</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            마지막 업데이트: {new Date().toLocaleString()}
          </div>
          <Button variant="secondary" size="sm">
            새로고침
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: '대시보드', icon: '📊' },
            { id: 'users', label: '사용자', icon: '👥' },
            { id: 'projects', label: '프로젝트', icon: '📋' },
            { id: 'system', label: '시스템', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'system' && renderSystem()}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;