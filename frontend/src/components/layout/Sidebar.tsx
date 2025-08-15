import React from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  userRole: 'admin' | 'evaluator' | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, userRole, activeTab, onTabChange }) => {
  const adminMenuItems = [
    { id: 'landing', label: '시작하기', icon: '🏠' },
    { id: 'projects', label: '프로젝트', icon: '📋' },
    { id: 'project-creation', label: '프로젝트 생성', icon: '➕' },
    { id: 'model-building', label: '모델 구축', icon: '🏗️' },
    { id: 'evaluation-results', label: '평가 결과', icon: '📊' },
    { id: 'project-completion', label: '프로젝트 완료', icon: '✅' },
    { id: 'users', label: '사용자 관리', icon: '👥' },
    { id: 'results', label: '기존 결과', icon: '📈' }
  ];

  const evaluatorMenuItems = [
    { id: 'evaluator-dashboard', label: '프로젝트 선택', icon: '📋' },
    { id: 'pairwise-evaluation', label: '쌍대비교 평가', icon: '⚖️' },
    { id: 'direct-evaluation', label: '직접입력 평가', icon: '📝' },
    { id: 'dashboard', label: '대시보드', icon: '🏠' },
    { id: 'progress', label: '진행 현황', icon: '📈' }
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : evaluatorMenuItems;

  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen`}>
      <div className="p-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold mb-6 text-gray-100">
            {userRole === 'admin' ? 'Administration' : 'Evaluation'}
          </h2>
        )}
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                activeTab === item.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;