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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'projects' | 'system' | 'monitoring' | 'database' | 'audit' | 'settings' | 'backup'>('dashboard');

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

  const renderMonitoring = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">시스템 모니터링</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="🔥 CPU 사용률">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">23%</div>
            <div className="text-sm text-gray-500 mt-1">정상</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
          </div>
        </Card>

        <Card title="💾 메모리 사용량">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">1.8GB</div>
            <div className="text-sm text-gray-500 mt-1">2GB 중</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
        </Card>

        <Card title="⚡ 응답 시간">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">125ms</div>
            <div className="text-sm text-gray-500 mt-1">평균</div>
            <div className="text-xs text-green-600 mt-2">🟢 우수</div>
          </div>
        </Card>

        <Card title="🌐 네트워크">
          <div className="text-center">
            <div className="text-sm text-gray-600">송신: 2.3MB/s</div>
            <div className="text-sm text-gray-600">수신: 1.8MB/s</div>
            <div className="text-xs text-green-600 mt-2">🟢 정상</div>
          </div>
        </Card>
      </div>

      <Card title="📊 실시간 활동 로그">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {[
            { time: '10:32:15', user: 'admin@company.com', action: '시스템 대시보드 조회', status: 'success' },
            { time: '10:31:42', user: 'p001@evaluator.com', action: '평가 완료: AI 개발 활용 방안', status: 'success' },
            { time: '10:30:18', user: 'p002@evaluator.com', action: '평가 시작: 쌍대비교', status: 'info' },
            { time: '10:29:55', user: 'manager@company.com', action: '프로젝트 상태 변경', status: 'warning' },
            { time: '10:28:33', user: 'system', action: '자동 백업 실행', status: 'success' }
          ].map((log, index) => (
            <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">[{log.time}]</span>
                <span className="font-medium">{log.user}</span>
                <span>{log.action}</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                log.status === 'success' ? 'bg-green-100 text-green-800' :
                log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderDatabase = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">데이터베이스 관리</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="🗄️ 데이터베이스 상태">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">연결 상태</span>
              <span className="text-sm font-medium text-green-600">🟢 정상</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">DB 종류</span>
              <span className="text-sm font-medium">PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">DB 크기</span>
              <span className="text-sm font-medium">1.2GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">활성 연결</span>
              <span className="text-sm font-medium">3개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">마지막 백업</span>
              <span className="text-sm font-medium">2시간 전</span>
            </div>
          </div>
        </Card>

        <Card title="📊 테이블 현황">
          <div className="space-y-3">
            {[
              { table: 'users', count: 27, size: '45MB' },
              { table: 'projects', count: 1, size: '12MB' },
              { table: 'criteria', count: 12, size: '8MB' },
              { table: 'alternatives', count: 9, size: '6MB' },
              { table: 'evaluation_sessions', count: 26, size: '15MB' },
              { table: 'ahp_results', count: 1, size: '25MB' }
            ].map((table, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="font-medium">{table.table}</span>
                <div className="text-right">
                  <div className="text-gray-600">{table.count}개 레코드</div>
                  <div className="text-xs text-gray-500">{table.size}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="🔧 데이터베이스 관리 도구">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="secondary" className="w-full">
            💾 즉시 백업
          </Button>
          <Button variant="secondary" className="w-full">
            🔄 인덱스 재구성
          </Button>
          <Button variant="secondary" className="w-full">
            📊 쿼리 성능 분석
          </Button>
          <Button variant="secondary" className="w-full">
            🧹 로그 정리
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderAudit = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">감사 로그</h3>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <select className="border border-gray-300 rounded px-3 py-2 text-sm">
            <option>모든 사용자</option>
            <option>관리자만</option>
            <option>평가자만</option>
          </select>
          <select className="border border-gray-300 rounded px-3 py-2 text-sm">
            <option>모든 활동</option>
            <option>로그인/로그아웃</option>
            <option>프로젝트 관리</option>
            <option>평가 활동</option>
            <option>시스템 설정</option>
          </select>
          <input 
            type="date" 
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>
        <Button variant="secondary" size="sm">
          📥 로그 내보내기
        </Button>
      </div>

      <Card title="📋 활동 내역">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {[
            { time: '2024-02-20 10:32:15', user: 'admin@company.com', ip: '192.168.1.100', action: '시스템 대시보드 접근', category: 'navigation', status: 'success' },
            { time: '2024-02-20 10:31:42', user: 'p001@evaluator.com', ip: '192.168.1.101', action: 'AI 개발 활용 방안 평가 완료', category: 'evaluation', status: 'success' },
            { time: '2024-02-20 10:30:18', user: 'p002@evaluator.com', ip: '192.168.1.102', action: '쌍대비교 평가 시작', category: 'evaluation', status: 'info' },
            { time: '2024-02-20 10:29:55', user: 'manager@company.com', ip: '192.168.1.103', action: '프로젝트 상태 변경: active → completed', category: 'project', status: 'warning' },
            { time: '2024-02-20 10:28:33', user: 'system', ip: '-', action: '자동 백업 실행', category: 'system', status: 'success' },
            { time: '2024-02-20 10:27:12', user: 'admin@company.com', ip: '192.168.1.100', action: '새 사용자 생성: test@example.com', category: 'user', status: 'success' },
            { time: '2024-02-20 10:25:45', user: 'p003@evaluator.com', ip: '192.168.1.104', action: '로그인 시도 실패', category: 'auth', status: 'error' }
          ].map((log, index) => (
            <div key={index} className="border-l-4 border-l-blue-500 bg-gray-50 p-3 rounded-r">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="font-medium text-gray-900">{log.user}</span>
                    <span className="text-gray-500">({log.ip})</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.category === 'auth' ? 'bg-purple-100 text-purple-800' :
                      log.category === 'evaluation' ? 'bg-green-100 text-green-800' :
                      log.category === 'project' ? 'bg-blue-100 text-blue-800' :
                      log.category === 'user' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{log.action}</div>
                  <div className="text-xs text-gray-500 mt-1">{log.time}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  log.status === 'success' ? 'bg-green-100 text-green-800' :
                  log.status === 'error' ? 'bg-red-100 text-red-800' :
                  log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">시스템 설정</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="🔧 전역 설정">
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
              <span className="text-sm text-gray-600">로그 보관 정책</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>30일</option>
                <option>60일</option>
                <option selected>90일</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">세션 타임아웃</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>30분</option>
                <option selected>1시간</option>
                <option>2시간</option>
                <option>4시간</option>
              </select>
            </div>
          </div>
        </Card>

        <Card title="🔐 보안 정책">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">비밀번호 최소 길이</span>
              <input type="number" defaultValue="8" min="6" max="20" className="w-16 text-sm border border-gray-300 rounded px-2 py-1" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">로그인 시도 제한</span>
              <input type="number" defaultValue="5" min="3" max="10" className="w-16 text-sm border border-gray-300 rounded px-2 py-1" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API 접근 제한</span>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">활성화</span>
              </label>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">IP 화이트리스트</span>
              <Button variant="secondary" size="sm">
                관리
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card title="📧 알림 설정">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">시스템 알림</h4>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" defaultChecked />
              <span className="ml-2 text-sm">시스템 오류</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" defaultChecked />
              <span className="ml-2 text-sm">백업 완료</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2 text-sm">성능 임계치 초과</span>
            </label>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm">사용자 알림</h4>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" defaultChecked />
              <span className="ml-2 text-sm">새 사용자 가입</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" defaultChecked />
              <span className="ml-2 text-sm">평가 완료</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2 text-sm">비정상 활동 감지</span>
            </label>
          </div>
        </div>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button variant="secondary">
          취소
        </Button>
        <Button variant="primary">
          설정 저장
        </Button>
      </div>
    </div>
  );

  const renderBackup = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">백업 및 복원</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="⚡ 즉시 백업">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              전체 시스템 데이터를 즉시 백업합니다.
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">사용자 데이터</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">프로젝트 데이터</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">평가 결과</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">시스템 설정</span>
              </label>
            </div>
            <Button variant="primary" className="w-full">
              💾 지금 백업 실행
            </Button>
          </div>
        </Card>

        <Card title="⏰ 자동 백업 설정">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">자동 백업</span>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">활성화</span>
              </label>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">백업 주기</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>매일</option>
                <option selected>매주</option>
                <option>매월</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">백업 시간</span>
              <input type="time" defaultValue="02:00" className="text-sm border border-gray-300 rounded px-2 py-1" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">보관 기간</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>7일</option>
                <option>30일</option>
                <option selected>90일</option>
                <option>1년</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      <Card title="📥 백업 파일 목록">
        <div className="space-y-3">
          {[
            { date: '2024-02-20 02:00', size: '1.2GB', type: 'auto', status: 'success' },
            { date: '2024-02-19 15:30', size: '1.1GB', type: 'manual', status: 'success' },
            { date: '2024-02-19 02:00', size: '1.1GB', type: 'auto', status: 'success' },
            { date: '2024-02-18 02:00', size: '1.0GB', type: 'auto', status: 'success' },
            { date: '2024-02-17 02:00', size: '980MB', type: 'auto', status: 'failed' }
          ].map((backup, index) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  backup.status === 'success' ? 'bg-green-500' :
                  backup.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <div className="text-sm font-medium">{backup.date}</div>
                  <div className="text-xs text-gray-500">{backup.size} · {backup.type === 'auto' ? '자동' : '수동'}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">
                  📥 다운로드
                </Button>
                <Button variant="secondary" size="sm">
                  🔄 복원
                </Button>
                <Button variant="secondary" size="sm" className="text-red-600">
                  🗑️ 삭제
                </Button>
              </div>
            </div>
          ))}
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

      {/* Navigation Menu - 2 Row Button Layout */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          {/* First Row - Dashboard & Core Management */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'dashboard', label: '시스템 대시보드', icon: '📊', desc: '전체 현황 및 통계' },
              { id: 'users', label: '사용자 관리', icon: '👥', desc: '계정 및 권한 관리' },
              { id: 'projects', label: '전체 프로젝트', icon: '📋', desc: '모든 프로젝트 통합 관리' },
              { id: 'monitoring', label: '시스템 모니터링', icon: '⚡', desc: '실시간 성능 추적' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  activeTab === item.id
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

          {/* Second Row - Advanced Admin Functions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'database', label: 'DB 관리', icon: '🗄️', desc: '데이터베이스 상태 관리' },
              { id: 'audit', label: '감사 로그', icon: '📝', desc: '활동 내역 및 보안' },
              { id: 'settings', label: '시스템 설정', icon: '⚙️', desc: '전역 설정 및 정책' },
              { id: 'backup', label: '백업/복원', icon: '💾', desc: '데이터 백업 관리' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  activeTab === item.id
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

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'monitoring' && renderMonitoring()}
          {activeTab === 'database' && renderDatabase()}
          {activeTab === 'audit' && renderAudit()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'backup' && renderBackup()}
          {activeTab === 'system' && renderSystem()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;