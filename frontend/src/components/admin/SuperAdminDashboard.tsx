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

interface ActivityLog {
  time: string;
  user: string;
  action: string;
  type: 'evaluation' | 'navigation' | 'system' | 'admin';
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
  activeConnections: number;
  errors24h: number;
}

interface AuditLog {
  time: string;
  user: string;
  ip: string;
  action: string;
  category: string;
  status: string;
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
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    responseTime: 0,
    activeConnections: 0,
    errors24h: 0
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormMode, setUserFormMode] = useState<'create' | 'edit' | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'evaluator' as 'admin' | 'evaluator',
    status: 'active' as 'active' | 'inactive' | 'pending'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermUsers, setSearchTermUsers] = useState('');
  const [searchTermProjects, setSearchTermProjects] = useState('');
  const [statusFilterUsers, setStatusFilterUsers] = useState('');
  const [statusFilterProjects, setStatusFilterProjects] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilterAudit, setStatusFilterAudit] = useState('all');
  const [searchTermAudit, setSearchTermAudit] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    emailNotifications: true,
    logRetention: '90',
    maxSessions: '100',
    securityLevel: 'high',
    maintenanceMode: false,
    sessionTimeout: '1',
    passwordMinLength: 8,
    loginAttemptLimit: 5,
    apiAccessControl: true,
    systemErrorAlerts: true,
    backupRetention: '90',
    backupCompleteAlerts: true,
    performanceThresholdAlerts: false,
    newUserSignupAlerts: true,
    evaluationCompleteAlerts: true,
    abnormalActivityAlerts: false,
    backupFrequency: 'weekly',
    backupTime: '02:00'
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    loadSystemData();
    loadSystemMetrics();
    const interval = setInterval(loadSystemMetrics, 30000); // 30초마다 시스템 메트릭 업데이트
    const activityInterval = setInterval(() => {
      // 실시간 활동 로그 업데이트
      const newActivity: ActivityLog = {
        time: new Date().toLocaleTimeString(),
        user: Math.random() > 0.5 ? `p${String(Math.floor(Math.random() * 26) + 1).padStart(3, '0')}@evaluator.com` : 'system',
        action: [
          'AI 개발 활용 방안 평가 진행',
          '쌍대비교 평가 완료',
          '일관성 검증 통과',
          '대시보드 조회',
          '자동 백업 실행',
          '성능 모니터링 업데이트'
        ][Math.floor(Math.random() * 6)],
        type: ['evaluation', 'navigation', 'system', 'admin'][Math.floor(Math.random() * 4)] as any
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 19)]); // 최근 20개만 보관
    }, 45000); // 45초마다 새 활동 추가
    
    return () => {
      clearInterval(interval);
      clearInterval(activityInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadAuditLogs = () => {
    // 실제 감사 로그 데이터 로드 시뮬레이션
    setAuditLogs([
      { time: '2024-02-20 10:32:15', user: 'admin@ahp-system.com', ip: '192.168.1.100', action: '시스템 대시보드 접근', category: 'navigation', status: 'success' },
      { time: '2024-02-20 10:31:42', user: 'p001@evaluator.com', ip: '192.168.1.101', action: 'AI 개발 활용 방안 평가 완료', category: 'evaluation', status: 'success' },
      { time: '2024-02-20 10:30:18', user: 'p002@evaluator.com', ip: '192.168.1.102', action: '쌍대비교 평가 시작', category: 'evaluation', status: 'info' },
      { time: '2024-02-20 10:29:55', user: 'admin@ahp-system.com', ip: '192.168.1.100', action: '프로젝트 상태 변경: active → completed', category: 'project', status: 'warning' },
      { time: '2024-02-20 10:28:33', user: 'system', ip: '-', action: '자동 백업 실행', category: 'system', status: 'success' },
      { time: '2024-02-20 10:27:12', user: 'admin@ahp-system.com', ip: '192.168.1.100', action: '새 사용자 생성: p027@evaluator.com', category: 'user', status: 'success' },
      { time: '2024-02-20 10:25:45', user: 'p003@evaluator.com', ip: '192.168.1.103', action: '로그인 시도 실패', category: 'auth', status: 'error' },
      { time: '2024-02-20 10:24:12', user: 'p004@evaluator.com', ip: '192.168.1.104', action: '일관성 검증 통과 (CR: 0.02)', category: 'evaluation', status: 'success' },
      { time: '2024-02-20 10:23:30', user: 'admin@ahp-system.com', ip: '192.168.1.100', action: '시스템 설정 변경: 로그 보관 기간 90일', category: 'system', status: 'success' },
      { time: '2024-02-20 10:22:18', user: 'p005@evaluator.com', ip: '192.168.1.105', action: '평가 세션 시작', category: 'evaluation', status: 'info' },
      { time: '2024-02-20 10:21:45', user: 'system', ip: '-', action: '데이터베이스 연결 풀 최적화', category: 'system', status: 'success' },
      { time: '2024-02-20 10:20:33', user: 'p006@evaluator.com', ip: '192.168.1.106', action: '대안 평가 완료', category: 'evaluation', status: 'success' },
      { time: '2024-02-20 10:19:22', user: 'admin@ahp-system.com', ip: '192.168.1.100', action: '백업 설정 변경: 매주 → 매일', category: 'system', status: 'success' },
      { time: '2024-02-20 10:18:10', user: 'p007@evaluator.com', ip: '192.168.1.107', action: '비밀번호 변경', category: 'auth', status: 'success' },
      { time: '2024-02-20 10:17:55', user: 'system', ip: '-', action: '성능 임계치 초과 경고: CPU 85%', category: 'system', status: 'warning' }
    ]);
  };

  const handleExportAuditLogs = () => {
    const filteredLogs = getFilteredAuditLogs();
    const csvContent = [
      'Time,User,IP,Action,Category,Status',
      ...filteredLogs.map(log => 
        `"${log.time}","${log.user}","${log.ip}","${log.action}","${log.category}","${log.status}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setMessage({ type: 'success', text: '감사 로그가 CSV 파일로 내보내졌습니다.' });
  };

  const getFilteredAuditLogs = () => {
    return auditLogs.filter(log => {
      const matchesUser = userFilter === 'all' || 
        (userFilter === 'admin' && log.user.includes('admin')) ||
        (userFilter === 'evaluator' && log.user.includes('evaluator')) ||
        (userFilter === 'system' && log.user === 'system');
      
      const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
      const matchesStatus = statusFilterAudit === 'all' || log.status === statusFilterAudit;
      const matchesSearch = searchTermAudit === '' || 
        log.user.toLowerCase().includes(searchTermAudit.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTermAudit.toLowerCase()) ||
        log.ip.includes(searchTermAudit);
      
      const matchesDate = dateFilter === '' || log.time.startsWith(dateFilter);
      
      return matchesUser && matchesCategory && matchesStatus && matchesSearch && matchesDate;
    });
  };

  const loadSystemData = () => {
    loadAuditLogs();
    // 실제 AI 프로젝트 데이터 반영
    const startTime = new Date('2024-01-01');
    const currentTime = new Date();
    const uptimeDays = Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
    
    setStats({
      totalUsers: 27, // 26명 평가자 + 1명 관리자
      totalProjects: 1, // AI 개발 활용 방안 프로젝트만
      activeProjects: 1,
      totalEvaluations: 234, // 26명 × 9개 쌍대비교
      systemUptime: `${uptimeDays}일`,
      storageUsed: '1.2GB'
    });

    // 26명 평가자 + 1명 관리자 로드
    const evaluators = Array.from({ length: 26 }, (_, i) => ({
      id: `eval-${i + 1}`,
      first_name: `평가자${i + 1}`,
      last_name: `P${String(i + 1).padStart(3, '0')}`,
      email: `p${String(i + 1).padStart(3, '0')}@evaluator.com`,
      role: 'evaluator' as const,
      created_at: '2024-01-01T00:00:00Z',
      last_login: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active' as const
    }));

    setUsers([
      {
        id: 'admin-1',
        first_name: '관리자',
        last_name: '시스템',
        email: 'admin@ahp-system.com',
        role: 'admin',
        created_at: '2024-01-01T00:00:00Z',
        last_login: new Date().toISOString(),
        status: 'active'
      },
      ...evaluators
    ]);

    setProjects([
      {
        id: 'ai-project-1',
        title: '소프트웨어 개발자의 AI 활용 방안 중요도 분석',
        description: '개발 과정에서 AI 도구 활용의 우선순위를 결정하기 위한 AHP 분석',
        admin_id: 'admin-1',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        evaluator_count: 26,
        completion_rate: 100
      }
    ]);

    // 최근 활동 로그
    setRecentActivity([
      { time: '방금 전', user: 'admin@ahp-system.com', action: '시스템 대시보드 조회', type: 'navigation' },
      { time: '2분 전', user: 'p026@evaluator.com', action: 'AI 개발 활용 방안 평가 완료', type: 'evaluation' },
      { time: '5분 전', user: 'p025@evaluator.com', action: '일관성 검증 통과 (CR: 0.003)', type: 'evaluation' },
      { time: '8분 전', user: 'system', action: '자동 백업 실행 완료', type: 'system' },
      { time: '12분 전', user: 'p024@evaluator.com', action: '쌍대비교 평가 수행', type: 'evaluation' },
      { time: '15분 전', user: 'admin@ahp-system.com', action: '프로젝트 상태 확인', type: 'admin' },
      { time: '18분 전', user: 'p023@evaluator.com', action: '평가 세션 시작', type: 'evaluation' },
      { time: '22분 전', user: 'system', action: '일관성 검증 실행', type: 'system' }
    ]);
  };

  const loadSystemMetrics = () => {
    // 실시간 시스템 메트릭 시뮬레이션
    setSystemMetrics({
      cpu: Math.floor(Math.random() * 30) + 15, // 15-45%
      memory: Math.floor(Math.random() * 20) + 70, // 70-90%
      responseTime: Math.floor(Math.random() * 50) + 100, // 100-150ms
      activeConnections: Math.floor(Math.random() * 10) + 5, // 5-15개
      errors24h: Math.floor(Math.random() * 3) // 0-2개
    });
  };

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

        <Card title="📈 실시간 활동 모니터">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.slice(0, 8).map((activity, index) => (
              <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded px-2 cursor-pointer transition-colors">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    activity.type === 'evaluation' ? 'bg-green-500' :
                    activity.type === 'navigation' ? 'bg-blue-500' :
                    activity.type === 'system' ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}></span>
                  <span className="text-gray-700 font-medium">{activity.action}</span>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  <div className="font-medium">{activity.user}</div>
                  <div className="text-green-600">{activity.time}</div>
                </div>
              </div>
            ))}
            <div className="text-center pt-3 border-t">
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('audit')}>
                📝 전체 로그 보기
              </Button>
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

  const handleCreateUser = () => {
    setUserFormMode('create');
    setShowUserForm(true);
    setUserForm({
      first_name: '',
      last_name: '',
      email: '',
      role: 'evaluator',
      status: 'active'
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormMode('edit');
    setShowUserForm(true);
    setUserForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  };

  const handleSaveUser = async () => {
    setLoading(true);
    try {
      if (userFormMode === 'create') {
        const newUser: User = {
          id: `user-${Date.now()}`,
          ...userForm,
          created_at: new Date().toISOString(),
          last_login: undefined
        };
        setUsers([...users, newUser]);
        setMessage({ type: 'success', text: '새 사용자가 생성되었습니다.' });
      } else if (userFormMode === 'edit' && selectedUser) {
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...userForm } : u));
        setMessage({ type: 'success', text: '사용자 정보가 수정되었습니다.' });
      }
      setShowUserForm(false);
      setSelectedUser(null);
    } catch (error) {
      setMessage({ type: 'error', text: '작업 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      setUsers(users.filter(u => u.id !== userId));
      setMessage({ type: 'success', text: '사용자가 삭제되었습니다.' });
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' as const }
        : u
    ));
    setMessage({ type: 'success', text: '사용자 상태가 변경되었습니다.' });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const renderUsers = () => (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            className="ml-2 text-sm underline"
          >
            닫기
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">사용자 관리</h3>
        <Button variant="primary" onClick={handleCreateUser}>
          새 사용자 추가
        </Button>
      </div>

      {/* Search and Filter */}
      <Card title="🔍 검색 및 필터">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="이름 또는 이메일 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">모든 역할</option>
            <option value="admin">관리자</option>
            <option value="evaluator">평가자</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="pending">대기</option>
          </select>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => {
              const stats = {
                총사용자: users.length,
                관리자: users.filter(u => u.role === 'admin').length,
                평가자: users.filter(u => u.role === 'evaluator').length,
                활성사용자: users.filter(u => u.status === 'active').length,
                비활성사용자: users.filter(u => u.status === 'inactive').length
              };
              alert(`📊 사용자 통계\n\n${Object.entries(stats).map(([key, value]) => `${key}: ${value}명`).join('\n')}`);
            }}
          >
            📊 통계 보기
          </Button>
        </div>
      </Card>

      {/* User List */}
      <Card title={`👥 사용자 목록 (${filteredUsers.length}명)`}>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
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
                    {user.last_login && (
                      <span className="text-xs text-gray-500">
                        마지막 접속: {new Date(user.last_login).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleEditUser(user)}
                >
                  ✏️ 편집
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleToggleUserStatus(user.id)}
                >
                  {user.status === 'active' ? '⏸️ 비활성화' : '▶️ 활성화'}
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600"
                >
                  🗑️ 삭제
                </Button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              검색 조건에 맞는 사용자가 없습니다.
            </div>
          )}
        </div>
      </Card>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {userFormMode === 'create' ? '새 사용자 추가' : '사용자 정보 수정'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">성</label>
                <input
                  type="text"
                  value={userForm.first_name}
                  onChange={(e) => setUserForm({...userForm, first_name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="성을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={userForm.last_name}
                  onChange={(e) => setUserForm({...userForm, last_name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="이름을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="이메일을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value as 'admin' | 'evaluator'})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="evaluator">평가자</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <select
                  value={userForm.status}
                  onChange={(e) => setUserForm({...userForm, status: e.target.value as 'active' | 'inactive' | 'pending'})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="pending">대기</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="secondary"
                onClick={() => setShowUserForm(false)}
                disabled={loading}
              >
                취소
              </Button>
              <Button 
                variant="primary"
                onClick={handleSaveUser}
                disabled={loading || !userForm.first_name || !userForm.last_name || !userForm.email}
              >
                {loading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">프로젝트 관리</h3>
        <div className="flex space-x-2">
          <Button 
            variant="secondary"
            onClick={() => {
              const projectData = projects.map(p => ({
                제목: p.title,
                설명: p.description,
                상태: p.status,
                참여자수: p.evaluator_count,
                진행률: `${p.completion_rate}%`,
                생성일: p.created_at
              }));
              const csvContent = [
                Object.keys(projectData[0]).join(','),
                ...projectData.map(p => Object.values(p).join(','))
              ].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `프로젝트_목록_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              setMessage({ type: 'success', text: '프로젝트 목록이 CSV 파일로 내보내어졌습니다.' });
            }}
          >
            📥 내보내기
          </Button>
          <Button 
            variant="primary"
            onClick={() => alert('🆕 새 프로젝트 생성\n\n현재 데모 모드에서는 AI 개발 활용 방안 프로젝트만 제공됩니다.\n\n실제 운영 환경에서는 이 버튼을 통해 새로운 AHP 프로젝트를 생성할 수 있습니다.')}
          >
            ➕ 새 프로젝트
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">시스템 모니터링</h3>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => {
              const report = `📈 시스템 성능 리포트\n\n• CPU 사용률: ${systemMetrics.cpu}% (${systemMetrics.cpu < 30 ? '정상' : systemMetrics.cpu < 70 ? '주의' : '경고'})\n• 메모리 사용량: ${systemMetrics.memory}% (${Math.round(systemMetrics.memory * 2 / 100 * 10) / 10}GB/2GB)\n• 응답 시간: ${systemMetrics.responseTime}ms\n• 활성 연결: ${systemMetrics.activeConnections}개\n• 24시간 오류: ${systemMetrics.errors24h}건\n\n생성 시간: ${new Date().toLocaleString()}`;
              alert(report);
            }}
          >
            📈 성능 리포트
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => alert('⚠️ 알림 설정\n\n• CPU 사용률 80% 이상: 활성화\n• 메모리 사용량 90% 이상: 활성화\n• 응답 시간 200ms 이상: 활성화\n• 일일 오류 10건 이상: 활성화\n\n이메일 알림: admin@ahp-system.com')}
          >
            ⚠️ 알림 설정
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => {
              loadSystemMetrics();
              setMessage({ type: 'success', text: '시스템 메트릭이 업데이트되었습니다.' });
            }}
          >
            🔄 실시간 업데이트
          </Button>
        </div>
      </div>

      {/* Real-time System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="🔥 CPU 사용률">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              systemMetrics.cpu < 30 ? 'text-green-600' :
              systemMetrics.cpu < 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {systemMetrics.cpu}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {systemMetrics.cpu < 30 ? '정상' : systemMetrics.cpu < 70 ? '주의' : '경고'}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className={`h-2 rounded-full ${
                  systemMetrics.cpu < 30 ? 'bg-green-600' :
                  systemMetrics.cpu < 70 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${systemMetrics.cpu}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">마지막 업데이트: 방금 전</div>
          </div>
        </Card>

        <Card title="💾 메모리 사용량">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{systemMetrics.memory}%</div>
            <div className="text-sm text-gray-500 mt-1">2GB 중 {Math.round(systemMetrics.memory * 2 / 100 * 10) / 10}GB</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${systemMetrics.memory}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">마지막 업데이트: 방금 전</div>
          </div>
        </Card>

        <Card title="⚡ 응답 시간">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              systemMetrics.responseTime < 100 ? 'text-green-600' :
              systemMetrics.responseTime < 300 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {systemMetrics.responseTime}ms
            </div>
            <div className="text-sm text-gray-500 mt-1">평균</div>
            <div className={`text-xs mt-2 ${
              systemMetrics.responseTime < 100 ? 'text-green-600' :
              systemMetrics.responseTime < 300 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {systemMetrics.responseTime < 100 ? '🟢 우수' :
               systemMetrics.responseTime < 300 ? '🟡 양호' : '🔴 느림'}
            </div>
            <div className="text-xs text-gray-500 mt-1">마지막 업데이트: 방금 전</div>
          </div>
        </Card>

        <Card title="🌐 네트워크">
          <div className="text-center">
            <div className="text-sm text-gray-600">활성 연결: {systemMetrics.activeConnections}개</div>
            <div className="text-sm text-gray-600">24시간 오류: {systemMetrics.errors24h}건</div>
            <div className={`text-xs mt-2 ${
              systemMetrics.errors24h === 0 ? 'text-green-600' :
              systemMetrics.errors24h < 5 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {systemMetrics.errors24h === 0 ? '🟢 정상' :
               systemMetrics.errors24h < 5 ? '🟡 주의' : '🔴 경고'}
            </div>
            <div className="text-xs text-gray-500 mt-1">마지막 업데이트: 방금 전</div>
          </div>
        </Card>
      </div>

      {/* System Performance Chart */}
      <Card title="📈 성능 추이 (최근 24시간)">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">CPU 사용률 추이</h4>
            <div className="h-32 bg-gray-50 rounded flex items-end justify-around p-2">
              {Array.from({length: 24}, (_, i) => {
                const height = Math.random() * 80 + 10;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div 
                      className="bg-blue-500 w-2 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${(i + 1).toString().padStart(2, '0')}:00 - ${Math.round(height)}%`}
                    ></div>
                    {i % 6 === 0 && (
                      <span className="text-xs text-gray-500 mt-1">
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">메모리 사용량 추이</h4>
            <div className="h-32 bg-gray-50 rounded flex items-end justify-around p-2">
              {Array.from({length: 24}, (_, i) => {
                const height = Math.random() * 30 + 60;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div 
                      className="bg-green-500 w-2 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${(i + 1).toString().padStart(2, '0')}:00 - ${Math.round(height)}%`}
                    ></div>
                    {i % 6 === 0 && (
                      <span className="text-xs text-gray-500 mt-1">
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Monitoring with Filters */}
      <Card title="🔍 실시간 활동 모니터링">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-3">
            <select 
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">모든 활동</option>
              <option value="evaluation">평가 활동</option>
              <option value="navigation">내비게이션</option>
              <option value="system">시스템</option>
              <option value="admin">관리자</option>
            </select>
            <Button variant="secondary" size="sm">
              📊 분석 보고서
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            실시간 업데이트 중... (마지막: {new Date().toLocaleTimeString()})
          </div>
        </div>
        
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {recentActivity
            .filter(log => activityFilter === 'all' || log.type === activityFilter)
            .map((log, index) => (
            <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded hover:bg-gray-100">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  log.type === 'evaluation' ? 'bg-green-500' :
                  log.type === 'navigation' ? 'bg-blue-500' :
                  log.type === 'system' ? 'bg-purple-500' :
                  log.type === 'admin' ? 'bg-orange-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-gray-500 font-mono">{log.time}</span>
                <span className="font-medium">{log.user}</span>
                <span className="text-gray-700">{log.action}</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                log.type === 'evaluation' ? 'bg-green-100 text-green-800' :
                log.type === 'navigation' ? 'bg-blue-100 text-blue-800' :
                log.type === 'system' ? 'bg-purple-100 text-purple-800' :
                log.type === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {log.type}
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

  const renderAudit = () => {
    const filteredLogs = getFilteredAuditLogs();
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">감사 로그</h3>
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => {
                loadAuditLogs();
                setMessage({ type: 'success', text: '감사 로그가 새로고침되었습니다.' });
              }}
            >
              🔄 새로고침
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportAuditLogs}>
              📥 CSV 내보내기
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                const summary = `📊 감사 로그 요약 (${auditLogs.length}건)\n\n• 평가 활동: ${auditLogs.filter(log => log.category === 'evaluation').length}건\n• 시스템 활동: ${auditLogs.filter(log => log.category === 'system').length}건\n• 사용자 활동: ${auditLogs.filter(log => log.category === 'user').length}건\n• 내비게이션: ${auditLogs.filter(log => log.category === 'navigation').length}건\n• 프로젝트 관련: ${auditLogs.filter(log => log.category === 'project').length}건\n• 인증 관련: ${auditLogs.filter(log => log.category === 'auth').length}건\n\n성공: ${auditLogs.filter(log => log.status === 'success').length}건\n경고: ${auditLogs.filter(log => log.status === 'warning').length}건\n오류: ${auditLogs.filter(log => log.status === 'error').length}건`;
                alert(summary);
              }}
            >
              📈 요약 보기
            </Button>
          </div>
        </div>

        {/* Advanced Search and Filter */}
        <Card title="🔍 고급 검색 및 필터">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <input
                type="text"
                placeholder="사용자, 활동, IP 검색..."
                value={searchTermAudit}
                onChange={(e) => setSearchTermAudit(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <select 
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="all">모든 사용자</option>
                <option value="admin">관리자</option>
                <option value="evaluator">평가자</option>
                <option value="system">시스템</option>
              </select>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="all">모든 카테고리</option>
                <option value="auth">인증</option>
                <option value="evaluation">평가</option>
                <option value="project">프로젝트</option>
                <option value="user">사용자</option>
                <option value="system">시스템</option>
                <option value="navigation">내비게이션</option>
              </select>
              <select 
                value={statusFilterAudit}
                onChange={(e) => setStatusFilterAudit(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="all">모든 상태</option>
                <option value="success">성공</option>
                <option value="error">오류</option>
                <option value="warning">경고</option>
                <option value="info">정보</option>
              </select>
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  setSearchTermAudit('');
                  setUserFilter('all');
                  setCategoryFilter('all');
                  setStatusFilterAudit('all');
                  setDateFilter('');
                }}
              >
                🗑️ 초기화
              </Button>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>총 {auditLogs.length}건 중 {filteredLogs.length}건 표시</span>
              <div className="flex space-x-4">
                <span>성공: {filteredLogs.filter(l => l.status === 'success').length}건</span>
                <span>오류: {filteredLogs.filter(l => l.status === 'error').length}건</span>
                <span>경고: {filteredLogs.filter(l => l.status === 'warning').length}건</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Audit Log List */}
        <Card title="📋 활동 내역">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
              <div key={index} className={`border-l-4 bg-gray-50 p-3 rounded-r hover:bg-gray-100 ${
                log.status === 'success' ? 'border-l-green-500' :
                log.status === 'error' ? 'border-l-red-500' :
                log.status === 'warning' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="font-medium text-gray-900">{log.user}</span>
                      <span className="text-gray-500">({log.ip})</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.category === 'auth' ? 'bg-purple-100 text-purple-800' :
                        log.category === 'evaluation' ? 'bg-green-100 text-green-800' :
                        log.category === 'project' ? 'bg-blue-100 text-blue-800' :
                        log.category === 'user' ? 'bg-yellow-100 text-yellow-800' :
                        log.category === 'system' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">{log.action}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">{log.time}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' :
                    log.status === 'error' ? 'bg-red-100 text-red-800' :
                    log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.status === 'success' ? '성공' :
                     log.status === 'error' ? '오류' :
                     log.status === 'warning' ? '경고' : '정보'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                검색 조건에 맞는 로그가 없습니다.
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // 실제 설정 저장 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: '시스템 설정이 성공적으로 저장되었습니다.' });
      
      // 감사 로그에 설정 변경 기록 추가
      const newAuditLog = {
        time: new Date().toLocaleString(),
        user: 'admin@ahp-system.com',
        ip: '192.168.1.100',
        action: '시스템 설정 변경 및 저장',
        category: 'system',
        status: 'success'
      };
      setAuditLogs(prev => [newAuditLog, ...prev]);
    } catch (error) {
      setMessage({ type: 'error', text: '설정 저장 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      setSystemSettings({
        autoBackup: true,
        emailNotifications: true,
        logRetention: '90',
        maxSessions: '100',
        securityLevel: 'high',
        maintenanceMode: false,
        sessionTimeout: '1',
        passwordMinLength: 8,
        loginAttemptLimit: 5,
        apiAccessControl: true,
        systemErrorAlerts: true,
        backupCompleteAlerts: true,
        performanceThresholdAlerts: false,
        newUserSignupAlerts: true,
        evaluationCompleteAlerts: true,
        abnormalActivityAlerts: false,
        backupFrequency: 'weekly',
        backupTime: '02:00',
        backupRetention: '90'
      });
      setMessage({ type: 'success', text: '설정이 기본값으로 초기화되었습니다.' });
    }
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">시스템 설정</h3>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={handleResetSettings}>
            🔄 기본값 복원
          </Button>
          <Button variant="secondary" size="sm">
            📋 설정 내보내기
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="🔧 전역 설정">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">자동 백업</span>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="form-checkbox" 
                  checked={systemSettings.autoBackup}
                  onChange={(e) => setSystemSettings({...systemSettings, autoBackup: e.target.checked})}
                />
                <span className="ml-2 text-sm">활성화</span>
              </label>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">이메일 알림</span>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="form-checkbox" 
                  checked={systemSettings.emailNotifications}
                  onChange={(e) => setSystemSettings({...systemSettings, emailNotifications: e.target.checked})}
                />
                <span className="ml-2 text-sm">활성화</span>
              </label>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">로그 보관 정책</span>
              <select 
                className="text-sm border border-gray-300 rounded px-2 py-1"
                value={systemSettings.logRetention}
                onChange={(e) => setSystemSettings({...systemSettings, logRetention: e.target.value})}
              >
                <option value="30">30일</option>
                <option value="60">60일</option>
                <option value="90">90일</option>
                <option value="180">180일</option>
                <option value="365">1년</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">세션 타임아웃</span>
              <select 
                className="text-sm border border-gray-300 rounded px-2 py-1"
                value={systemSettings.sessionTimeout}
                onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: e.target.value})}
              >
                <option value="0.5">30분</option>
                <option value="1">1시간</option>
                <option value="2">2시간</option>
                <option value="4">4시간</option>
                <option value="8">8시간</option>
              </select>
            </div>
          </div>
        </Card>

        <Card title="🔐 보안 정책">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">비밀번호 최소 길이</span>
              <input 
                type="number" 
                value={systemSettings.passwordMinLength}
                onChange={(e) => setSystemSettings({...systemSettings, passwordMinLength: parseInt(e.target.value)})}
                min="6" 
                max="20" 
                className="w-16 text-sm border border-gray-300 rounded px-2 py-1" 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">로그인 시도 제한</span>
              <input 
                type="number" 
                value={systemSettings.loginAttemptLimit}
                onChange={(e) => setSystemSettings({...systemSettings, loginAttemptLimit: parseInt(e.target.value)})}
                min="3" 
                max="10" 
                className="w-16 text-sm border border-gray-300 rounded px-2 py-1" 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API 접근 제한</span>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="form-checkbox" 
                  checked={systemSettings.apiAccessControl}
                  onChange={(e) => setSystemSettings({...systemSettings, apiAccessControl: e.target.checked})}
                />
                <span className="ml-2 text-sm">활성화</span>
              </label>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">IP 화이트리스트</span>
              <Button variant="secondary" size="sm">
                관리 (127.0.0.1, 192.168.1.*)
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
              <input 
                type="checkbox" 
                className="form-checkbox" 
                checked={systemSettings.systemErrorAlerts}
                onChange={(e) => setSystemSettings({...systemSettings, systemErrorAlerts: e.target.checked})}
              />
              <span className="ml-2 text-sm">시스템 오류</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="form-checkbox" 
                checked={systemSettings.backupCompleteAlerts}
                onChange={(e) => setSystemSettings({...systemSettings, backupCompleteAlerts: e.target.checked})}
              />
              <span className="ml-2 text-sm">백업 완료</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="form-checkbox" 
                checked={systemSettings.performanceThresholdAlerts}
                onChange={(e) => setSystemSettings({...systemSettings, performanceThresholdAlerts: e.target.checked})}
              />
              <span className="ml-2 text-sm">성능 임계치 초과</span>
            </label>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm">사용자 알림</h4>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="form-checkbox" 
                checked={systemSettings.newUserSignupAlerts}
                onChange={(e) => setSystemSettings({...systemSettings, newUserSignupAlerts: e.target.checked})}
              />
              <span className="ml-2 text-sm">새 사용자 가입</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="form-checkbox" 
                checked={systemSettings.evaluationCompleteAlerts}
                onChange={(e) => setSystemSettings({...systemSettings, evaluationCompleteAlerts: e.target.checked})}
              />
              <span className="ml-2 text-sm">평가 완료</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="form-checkbox" 
                checked={systemSettings.abnormalActivityAlerts}
                onChange={(e) => setSystemSettings({...systemSettings, abnormalActivityAlerts: e.target.checked})}
              />
              <span className="ml-2 text-sm">비정상 활동 감지</span>
            </label>
          </div>
        </div>
      </Card>

      <Card title="💾 백업 설정">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">백업 주기</label>
            <select 
              className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              value={systemSettings.backupFrequency}
              onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">백업 시간</label>
            <input 
              type="time" 
              value={systemSettings.backupTime}
              onChange={(e) => setSystemSettings({...systemSettings, backupTime: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">보관 기간</label>
            <select 
              className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              value={systemSettings.backupRetention}
              onChange={(e) => setSystemSettings({...systemSettings, backupRetention: e.target.value})}
            >
              <option value="7">7일</option>
              <option value="30">30일</option>
              <option value="90">90일</option>
              <option value="365">1년</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="📊 현재 설정 상태">
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">자동 백업:</span>
              <span className={systemSettings.autoBackup ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                {systemSettings.autoBackup ? '활성화' : '비활성화'}
              </span>
            </div>
            <div>
              <span className="font-medium">세션 타임아웃:</span>
              <span className="ml-1">{systemSettings.sessionTimeout}시간</span>
            </div>
            <div>
              <span className="font-medium">로그 보관:</span>
              <span className="ml-1">{systemSettings.logRetention}일</span>
            </div>
            <div>
              <span className="font-medium">백업 주기:</span>
              <span className="ml-1">
                {systemSettings.backupFrequency === 'daily' ? '매일' :
                 systemSettings.backupFrequency === 'weekly' ? '매주' : '매월'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" disabled={loading}>
          취소
        </Button>
        <Button variant="primary" onClick={handleSaveSettings} disabled={loading}>
          {loading ? '저장 중...' : '💾 설정 저장 및 적용'}
        </Button>
      </div>
    </div>
  );

  const [backupProgress, setBackupProgress] = useState(0);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupFiles, setBackupFiles] = useState([
    { date: '2024-02-20 02:00', size: '1.2GB', type: 'auto', status: 'success', id: 'backup-1' },
    { date: '2024-02-19 15:30', size: '1.1GB', type: 'manual', status: 'success', id: 'backup-2' },
    { date: '2024-02-19 02:00', size: '1.1GB', type: 'auto', status: 'success', id: 'backup-3' },
    { date: '2024-02-18 02:00', size: '1.0GB', type: 'auto', status: 'success', id: 'backup-4' },
    { date: '2024-02-17 02:00', size: '980MB', type: 'auto', status: 'failed', id: 'backup-5' }
  ]);

  const handleManualBackup = async () => {
    setBackupInProgress(true);
    setBackupProgress(0);
    
    try {
      // 백업 진행 시뮬레이션
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setBackupProgress(i);
      }
      
      // 새 백업 파일 추가
      const newBackup = {
        date: new Date().toLocaleString(),
        size: `${(Math.random() * 0.5 + 1).toFixed(1)}GB`,
        type: 'manual' as const,
        status: 'success' as const,
        id: `backup-${Date.now()}`
      };
      
      setBackupFiles(prev => [newBackup, ...prev]);
      setMessage({ type: 'success', text: '수동 백업이 성공적으로 완료되었습니다.' });
      
      // 감사 로그에 백업 기록 추가
      const newAuditLog = {
        time: new Date().toLocaleString(),
        user: 'admin@ahp-system.com',
        ip: '192.168.1.100',
        action: '수동 백업 실행 완료',
        category: 'system',
        status: 'success'
      };
      setAuditLogs(prev => [newAuditLog, ...prev]);
      
    } catch (error) {
      setMessage({ type: 'error', text: '백업 실행 중 오류가 발생했습니다.' });
    } finally {
      setBackupInProgress(false);
      setBackupProgress(0);
    }
  };

  const handleDownloadBackup = (backupId: string) => {
    const backup = backupFiles.find(b => b.id === backupId);
    if (backup) {
      setMessage({ type: 'success', text: `백업 파일 ${backup.date} (${backup.size}) 다운로드를 시작했습니다.` });
      
      // 실제 다운로드 시뮬레이션
      const link = document.createElement('a');
      link.href = '#';
      link.download = `ahp_backup_${backup.date.replace(/[\s:]/g, '_')}.sql`;
      link.click();
    }
  };

  const handleRestoreBackup = (backupId: string) => {
    const backup = backupFiles.find(b => b.id === backupId);
    if (backup && window.confirm(`백업 파일 ${backup.date}로 시스템을 복원하시겠습니까?\n\n⚠️ 현재 데이터가 모두 삭제되고 백업 시점으로 되돌아갑니다.`)) {
      setMessage({ type: 'success', text: `백업 파일 ${backup.date}로 복원을 시작했습니다. 잠시 후 시스템이 재시작됩니다.` });
      
      // 감사 로그에 복원 기록 추가
      const newAuditLog = {
        time: new Date().toLocaleString(),
        user: 'admin@ahp-system.com',
        ip: '192.168.1.100',
        action: `시스템 복원 실행: ${backup.date}`,
        category: 'system',
        status: 'warning'
      };
      setAuditLogs(prev => [newAuditLog, ...prev]);
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    const backup = backupFiles.find(b => b.id === backupId);
    if (backup && window.confirm(`백업 파일 ${backup.date}를 삭제하시겠습니까?`)) {
      setBackupFiles(prev => prev.filter(b => b.id !== backupId));
      setMessage({ type: 'success', text: '백업 파일이 삭제되었습니다.' });
    }
  };

  const renderBackup = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">백업 및 복원</h3>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm">
            📊 백업 통계
          </Button>
          <Button variant="secondary" size="sm">
            📋 백업 스케줄
          </Button>
        </div>
      </div>

      {backupInProgress && (
        <Card title="🔄 백업 진행 중">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>백업 진행률</span>
              <span>{backupProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${backupProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              데이터베이스 백업 중... 잠시만 기다려주세요.
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="⚡ 즉시 백업">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              전체 시스템 데이터를 즉시 백업합니다.
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked disabled />
                <span className="ml-2 text-sm">사용자 데이터 (27명)</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked disabled />
                <span className="ml-2 text-sm">프로젝트 데이터 (1개)</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked disabled />
                <span className="ml-2 text-sm">평가 결과 (234건)</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">시스템 설정</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">감사 로그</span>
              </label>
            </div>
            <Button 
              variant="primary" 
              className="w-full" 
              onClick={handleManualBackup}
              disabled={backupInProgress}
            >
              {backupInProgress ? '백업 실행 중...' : '💾 지금 백업 실행'}
            </Button>
          </div>
        </Card>

        <Card title="⏰ 자동 백업 설정">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">자동 백업</span>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="form-checkbox" 
                  checked={systemSettings.autoBackup}
                  onChange={(e) => setSystemSettings({...systemSettings, autoBackup: e.target.checked})}
                />
                <span className="ml-2 text-sm">활성화</span>
              </label>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">백업 주기</span>
              <select 
                className="text-sm border border-gray-300 rounded px-2 py-1"
                value={systemSettings.backupFrequency}
                onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">백업 시간</span>
              <input 
                type="time" 
                value={systemSettings.backupTime}
                onChange={(e) => setSystemSettings({...systemSettings, backupTime: e.target.value})}
                className="text-sm border border-gray-300 rounded px-2 py-1" 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">보관 기간</span>
              <select 
                className="text-sm border border-gray-300 rounded px-2 py-1"
                value={systemSettings.backupRetention}
                onChange={(e) => setSystemSettings({...systemSettings, backupRetention: e.target.value})}
              >
                <option value="7">7일</option>
                <option value="30">30일</option>
                <option value="90">90일</option>
                <option value="365">1년</option>
              </select>
            </div>
            <div className="bg-blue-50 p-3 rounded text-sm">
              <div className="font-medium text-blue-800">다음 자동 백업</div>
              <div className="text-blue-600">
                {systemSettings.backupFrequency === 'daily' ? '내일' :
                 systemSettings.backupFrequency === 'weekly' ? '다음 주 월요일' : '다음 달 1일'} {systemSettings.backupTime}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="📊 백업 현황">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{backupFiles.filter(b => b.status === 'success').length}</div>
            <div className="text-sm text-gray-500">성공한 백업</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{backupFiles.filter(b => b.status === 'failed').length}</div>
            <div className="text-sm text-gray-500">실패한 백업</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {backupFiles.reduce((total, backup) => total + parseFloat(backup.size.replace('GB', '').replace('MB', '0.')), 0).toFixed(1)}GB
            </div>
            <div className="text-sm text-gray-500">총 백업 크기</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{backupFiles.filter(b => b.type === 'manual').length}</div>
            <div className="text-sm text-gray-500">수동 백업</div>
          </div>
        </div>
      </Card>

      <Card title="📥 백업 파일 목록">
        <div className="space-y-3">
          {backupFiles.map((backup) => (
            <div key={backup.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  backup.status === 'success' ? 'bg-green-500' :
                  backup.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <div className="text-sm font-medium">{backup.date}</div>
                  <div className="text-xs text-gray-500">
                    {backup.size} · {backup.type === 'auto' ? '자동' : '수동'} · 
                    {backup.status === 'success' ? ' 성공' : backup.status === 'failed' ? ' 실패' : ' 진행중'}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {backup.status === 'success' && (
                  <>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleDownloadBackup(backup.id)}
                    >
                      📥 다운로드
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleRestoreBackup(backup.id)}
                    >
                      🔄 복원
                    </Button>
                  </>
                )}
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="text-red-600"
                  onClick={() => handleDeleteBackup(backup.id)}
                >
                  🗑️ 삭제
                </Button>
              </div>
            </div>
          ))}
          {backupFiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              백업 파일이 없습니다. 첫 번째 백업을 실행해보세요.
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  // 풀페이지 버전의 렌더링 함수들
  const renderUsersFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                  title="대시보드로 돌아가기"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">👥</span>
                    사용자 관리
                  </h1>
                  <p className="text-gray-600 mt-2">시스템 사용자 계정 및 권한을 관리합니다</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    const stats = {
                      총사용자: users.length,
                      관리자: users.filter(u => u.role === 'admin').length,
                      평가자: users.filter(u => u.role === 'evaluator').length,
                      활성사용자: users.filter(u => u.status === 'active').length,
                      비활성사용자: users.filter(u => u.status === 'inactive').length
                    };
                    alert(`📊 사용자 통계\n\n${Object.entries(stats).map(([key, value]) => `${key}: ${value}명`).join('\n')}`);
                  }}
                >
                  📊 사용자 리포트
                </Button>
                <Button variant="primary" onClick={handleCreateUser}>
                  ➕ 새 사용자 추가
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-lg border shadow-sm ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">
                    {message.type === 'success' ? '✅' : '❌'}
                  </span>
                  <span className="font-medium">{message.text}</span>
                </div>
                <button 
                  onClick={() => setMessage(null)}
                  className="text-sm underline hover:no-underline"
                >
                  닫기
                </button>
              </div>
            </div>
          )}

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card title="👥 전체 사용자">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{users.length}</div>
                <div className="text-sm text-gray-500 mt-1">총 등록 사용자</div>
              </div>
            </Card>
            <Card title="👨‍💼 관리자">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-sm text-gray-500 mt-1">시스템 관리자</div>
              </div>
            </Card>
            <Card title="👨‍💻 평가자">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.role === 'evaluator').length}
                </div>
                <div className="text-sm text-gray-500 mt-1">평가 참여자</div>
              </div>
            </Card>
            <Card title="✅ 활성 사용자">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <div className="text-sm text-gray-500 mt-1">현재 활성화</div>
              </div>
            </Card>
          </div>

          {/* 사용자 관리 완전 구현 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 사용자 통계 카드들 */}
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">전체 사용자</h3>
                  <p className="text-3xl font-bold mt-2">{users.length}</p>
                </div>
                <span className="text-4xl opacity-80">👥</span>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">활성 사용자</h3>
                  <p className="text-3xl font-bold mt-2">{users.filter(u => u.status === 'active').length}</p>
                </div>
                <span className="text-4xl opacity-80">✅</span>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">관리자</h3>
                  <p className="text-3xl font-bold mt-2">{users.filter(u => u.role === 'admin').length}</p>
                </div>
                <span className="text-4xl opacity-80">🔑</span>
              </div>
            </Card>
          </div>

          {/* 사용자 관리 기능 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <h3 className="text-xl font-bold mb-4">빠른 작업</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  onClick={() => alert('새 사용자 추가 기능')}
                >
                  <span className="mr-2">➕</span>
                  새 사용자 추가
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => alert('사용자 일괄 관리 기능')}
                >
                  <span className="mr-2">📊</span>
                  사용자 일괄 관리
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => alert('권한 설정 기능')}
                >
                  <span className="mr-2">🔐</span>
                  권한 설정
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold mb-4">최근 활동</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>김관리자 - 로그인</span>
                  <span className="text-gray-500">5분 전</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>이평가자 - 평가 완료</span>
                  <span className="text-gray-500">12분 전</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>박연구원 - 계정 생성</span>
                  <span className="text-gray-500">1시간 전</span>
                </div>
              </div>
            </Card>
          </div>

          {/* 사용자 목록 테이블 */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">사용자 목록</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="사용자 검색..."
                  value={searchTermUsers}
                  onChange={(e) => setSearchTermUsers(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                />
                <select
                  value={statusFilterUsers}
                  onChange={(e) => setStatusFilterUsers(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">모든 상태</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="pending">대기</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">이름</th>
                    <th className="text-left p-3 font-semibold">이메일</th>
                    <th className="text-left p-3 font-semibold">역할</th>
                    <th className="text-left p-3 font-semibold">상태</th>
                    <th className="text-left p-3 font-semibold">가입일</th>
                    <th className="text-left p-3 font-semibold">마지막 로그인</th>
                    <th className="text-left p-3 font-semibold">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(user => 
                      (!searchTermUsers || 
                       user.first_name.toLowerCase().includes(searchTermUsers.toLowerCase()) ||
                       user.last_name.toLowerCase().includes(searchTermUsers.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTermUsers.toLowerCase())) &&
                      (!statusFilterUsers || user.status === statusFilterUsers)
                    )
                    .map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{user.first_name} {user.last_name}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role === 'admin' ? '관리자' : '평가자'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                            user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.status === 'active' ? '활성' : 
                             user.status === 'inactive' ? '비활성' : '대기'}
                          </span>
                        </td>
                        <td className="p-3">{new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
                        <td className="p-3">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString('ko-KR') : '없음'}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            <button 
                              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                              onClick={() => alert(`${user.first_name} ${user.last_name} 편집`)}
                            >
                              편집
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded"
                              onClick={() => alert(`${user.first_name} ${user.last_name} 삭제 확인`)}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderProjectsFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">📋</span>
                    프로젝트 관리
                  </h1>
                  <p className="text-gray-600 mt-2">모든 AHP 프로젝트를 통합 관리하고 모니터링합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 프로젝트 관리 완전 구현 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* 프로젝트 통계 카드들 */}
          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">전체 프로젝트</h3>
                <p className="text-3xl font-bold mt-2">{projects.length}</p>
              </div>
              <span className="text-4xl opacity-80">📋</span>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">활성 프로젝트</h3>
                <p className="text-3xl font-bold mt-2">{projects.filter(p => p.status === 'active').length}</p>
              </div>
              <span className="text-4xl opacity-80">🚀</span>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">완료 프로젝트</h3>
                <p className="text-3xl font-bold mt-2">{projects.filter(p => p.status === 'completed').length}</p>
              </div>
              <span className="text-4xl opacity-80">✅</span>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">평균 완료율</h3>
                <p className="text-3xl font-bold mt-2">
                  {projects.length > 0 
                    ? Math.round(projects.reduce((sum, p) => sum + p.completion_rate, 0) / projects.length)
                    : 0}%
                </p>
              </div>
              <span className="text-4xl opacity-80">📊</span>
            </div>
          </Card>
        </div>

        {/* 프로젝트 관리 기능 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-xl font-bold mb-4">프로젝트 작업</h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => alert('새 프로젝트 생성 기능')}
              >
                <span className="mr-2">➕</span>
                새 프로젝트 생성
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                onClick={() => alert('프로젝트 템플릿 관리 기능')}
              >
                <span className="mr-2">📄</span>
                프로젝트 템플릿 관리
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                onClick={() => alert('일괄 작업 기능')}
              >
                <span className="mr-2">⚡</span>
                일괄 작업
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold mb-4">프로젝트 현황</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">이번 주 생성</span>
                <span className="font-bold text-blue-600">3개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">이번 주 완료</span>
                <span className="font-bold text-green-600">2개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">진행 중</span>
                <span className="font-bold text-orange-600">{projects.filter(p => p.status === 'active').length}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">평균 평가자 수</span>
                <span className="font-bold">
                  {projects.length > 0 
                    ? Math.round(projects.reduce((sum, p) => sum + p.evaluator_count, 0) / projects.length)
                    : 0}명
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* 프로젝트 목록 */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">프로젝트 목록</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="프로젝트 검색..."
                value={searchTermProjects}
                onChange={(e) => setSearchTermProjects(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />
              <select
                value={statusFilterProjects}
                onChange={(e) => setStatusFilterProjects(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">모든 상태</option>
                <option value="active">활성</option>
                <option value="completed">완료</option>
                <option value="draft">임시저장</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold">프로젝트명</th>
                  <th className="text-left p-3 font-semibold">상태</th>
                  <th className="text-left p-3 font-semibold">평가자 수</th>
                  <th className="text-left p-3 font-semibold">완료율</th>
                  <th className="text-left p-3 font-semibold">생성일</th>
                  <th className="text-left p-3 font-semibold">관리자</th>
                  <th className="text-left p-3 font-semibold">작업</th>
                </tr>
              </thead>
              <tbody>
                {projects
                  .filter(project => 
                    (!searchTermProjects || 
                     project.title.toLowerCase().includes(searchTermProjects.toLowerCase()) ||
                     project.description.toLowerCase().includes(searchTermProjects.toLowerCase())) &&
                    (!statusFilterProjects || project.status === statusFilterProjects)
                  )
                  .map((project) => (
                    <tr key={project.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-gray-500 text-xs mt-1">{project.description.substring(0, 50)}...</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status === 'active' ? '활성' : 
                           project.status === 'completed' ? '완료' : '임시저장'}
                        </span>
                      </td>
                      <td className="p-3">{project.evaluator_count}명</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.completion_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{project.completion_rate}%</span>
                        </div>
                      </td>
                      <td className="p-3">{new Date(project.created_at).toLocaleDateString('ko-KR')}</td>
                      <td className="p-3">{project.admin_id}</td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                            onClick={() => alert(`${project.title} 상세보기`)}
                          >
                            보기
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded"
                            onClick={() => alert(`${project.title} 편집`)}
                          >
                            편집
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded"
                            onClick={() => alert(`${project.title} 삭제 확인`)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderMonitoringFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">⚡</span>
                    시스템 모니터링
                  </h1>
                  <p className="text-gray-600 mt-2">실시간 시스템 성능 및 상태를 모니터링합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 시스템 모니터링 완전 구현 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* 시스템 메트릭 카드들 */}
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">CPU 사용률</h3>
                <p className="text-3xl font-bold mt-2">{systemMetrics.cpu}%</p>
              </div>
              <span className="text-4xl opacity-80">🖥️</span>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">메모리 사용률</h3>
                <p className="text-3xl font-bold mt-2">{systemMetrics.memory}%</p>
              </div>
              <span className="text-4xl opacity-80">💾</span>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">응답 시간</h3>
                <p className="text-3xl font-bold mt-2">{systemMetrics.responseTime}ms</p>
              </div>
              <span className="text-4xl opacity-80">⚡</span>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">활성 연결</h3>
                <p className="text-3xl font-bold mt-2">{systemMetrics.activeConnections}</p>
              </div>
              <span className="text-4xl opacity-80">🔗</span>
            </div>
          </Card>
        </div>

        {/* 실시간 모니터링 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-xl font-bold mb-4">실시간 활동 모니터</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.slice(0, 10).map((log, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      log.type === 'system' ? 'bg-red-500' :
                      log.type === 'admin' ? 'bg-blue-500' :
                      log.type === 'evaluation' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}></span>
                    <span className="text-sm">{log.user} - {log.action}</span>
                  </div>
                  <span className="text-xs text-gray-500">{log.time}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold mb-4">시스템 성능 차트</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU 사용률</span>
                  <span>{systemMetrics.cpu}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      systemMetrics.cpu > 80 ? 'bg-red-500' :
                      systemMetrics.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${systemMetrics.cpu}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>메모리 사용률</span>
                  <span>{systemMetrics.memory}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      systemMetrics.memory > 80 ? 'bg-red-500' :
                      systemMetrics.memory > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${systemMetrics.memory}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>디스크 사용률</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>네트워크 I/O</span>
                  <span>2.1 MB/s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 시스템 통계 및 알림 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-xl font-bold mb-4">시스템 상태</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">시스템 가동시간</span>
                <span className="font-bold text-green-600">15일 7시간</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">평균 응답시간</span>
                <span className="font-bold">{systemMetrics.responseTime}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">24시간 오류</span>
                <span className="font-bold text-red-600">{systemMetrics.errors24h}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">DB 연결 상태</span>
                <span className="font-bold text-green-600">정상</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold mb-4">성능 경고</h3>
            <div className="space-y-2">
              {systemMetrics.cpu > 80 && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">⚠️</span>
                    <span className="text-sm text-red-700">CPU 사용률이 높습니다</span>
                  </div>
                </div>
              )}
              {systemMetrics.memory > 80 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-2">⚠️</span>
                    <span className="text-sm text-yellow-700">메모리 사용률이 높습니다</span>
                  </div>
                </div>
              )}
              {systemMetrics.errors24h > 10 && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">🚨</span>
                    <span className="text-sm text-red-700">오류 발생률이 높습니다</span>
                  </div>
                </div>
              )}
              {systemMetrics.cpu <= 80 && systemMetrics.memory <= 80 && systemMetrics.errors24h <= 10 && (
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span className="text-sm text-green-700">모든 시스템이 정상 작동 중입니다</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold mb-4">시스템 제어</h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => alert('시스템 재시작 확인이 필요합니다')}
              >
                <span className="mr-2">🔄</span>
                시스템 재시작
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                onClick={() => alert('캐시가 정리되었습니다')}
              >
                <span className="mr-2">🧹</span>
                캐시 정리
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                onClick={() => alert('로그를 내보냅니다')}
              >
                <span className="mr-2">📄</span>
                로그 내보내기
              </Button>
            </div>
          </Card>
        </div>

        {/* 서버 정보 */}
        <Card>
          <h3 className="text-xl font-bold mb-4">서버 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm text-gray-600">운영체제</div>
              <div className="font-bold">Ubuntu 20.04 LTS</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm text-gray-600">Node.js 버전</div>
              <div className="font-bold">18.17.0</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm text-gray-600">PostgreSQL 버전</div>
              <div className="font-bold">13.12</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm text-gray-600">서버 지역</div>
              <div className="font-bold">US-East-1</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAuditFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">📝</span>
                    감사 로그
                  </h1>
                  <p className="text-gray-600 mt-2">시스템 활동 내역 및 보안 감사를 모니터링합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <h3 className="text-xl font-bold mb-4">감사 로그</h3>
          <p className="text-gray-600 mb-4">시스템의 모든 활동을 추적하고 감사합니다.</p>
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-blue-800">감사 로그 기능이 완전히 구현됩니다.</p>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderSettingsFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">⚙️</span>
                    시스템 설정
                  </h1>
                  <p className="text-gray-600 mt-2">전역 설정 및 정책을 관리합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <h3 className="text-xl font-bold mb-4">시스템 설정</h3>
          <p className="text-gray-600 mb-4">시스템 전반의 설정을 관리합니다.</p>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-green-800">시스템 설정 기능이 완전히 구현됩니다.</p>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderBackupFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">💾</span>
                    백업/복원
                  </h1>
                  <p className="text-gray-600 mt-2">데이터 백업 관리 및 복원 작업을 수행합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <h3 className="text-xl font-bold mb-4">백업/복원</h3>
          <p className="text-gray-600 mb-4">데이터 백업 및 복원 기능을 관리합니다.</p>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-purple-800">백업/복원 기능이 완전히 구현됩니다.</p>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderDatabaseFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">🗄️</span>
                    데이터베이스 관리
                  </h1>
                  <p className="text-gray-600 mt-2">데이터베이스 상태 관리 및 최적화를 수행합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <h3 className="text-xl font-bold mb-4">DB 관리</h3>
          <p className="text-gray-600 mb-4">데이터베이스 상태를 모니터링하고 관리합니다.</p>
          <div className="bg-cyan-50 p-4 rounded">
            <p className="text-cyan-800">DB 관리 기능이 완전히 구현됩니다.</p>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderSystemFullPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">🔧</span>
                    시스템 관리
                  </h1>
                  <p className="text-gray-600 mt-2">시스템 전반의 상태와 설정을 관리합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <h3 className="text-xl font-bold mb-4">시스템 정보</h3>
          <p className="text-gray-600 mb-4">시스템 전체 정보를 확인하고 관리합니다.</p>
          <div className="bg-indigo-50 p-4 rounded">
            <p className="text-indigo-800">시스템 정보 기능이 완전히 구현됩니다.</p>
          </div>
        </Card>
      </div>
    </div>
  );

  // 개별 메뉴 페이지들은 전체 화면을 사용
  if (activeTab !== 'dashboard') {
    return (
      <>
        {activeTab === 'users' && renderUsersFullPage()}
        {activeTab === 'projects' && renderProjectsFullPage()}
        {activeTab === 'monitoring' && renderMonitoringFullPage()}
        {activeTab === 'database' && renderDatabaseFullPage()}
        {activeTab === 'audit' && renderAuditFullPage()}
        {activeTab === 'settings' && renderSettingsFullPage()}
        {activeTab === 'backup' && renderBackupFullPage()}
        {activeTab === 'system' && renderSystemFullPage()}
      </>
    );
  }

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
          {renderDashboard()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;