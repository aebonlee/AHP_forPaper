import React from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  userRole: 'admin' | 'evaluator' | null;
  adminType?: 'super' | 'personal';
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, userRole, adminType, activeTab, onTabChange }) => {
  const superAdminMenuItems = [
    { id: 'super-admin', label: '대시보드', icon: '📊' },
    { id: 'admin-type-selection', label: '모드 전환', icon: '🔄' }
  ];

  const personalServiceMenuItems = [
    { id: 'personal-service', label: '개인 서비스', icon: '👤' },
    { id: 'admin-type-selection', label: '모드 전환', icon: '🔄' }
  ];

  const legacyAdminMenuItems = [
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

  const getMenuItems = () => {
    if (userRole === 'admin') {
      if (adminType === 'super') {
        return superAdminMenuItems;
      } else if (adminType === 'personal') {
        return personalServiceMenuItems;
      } else {
        // 관리자 유형이 선택되지 않은 경우 모드 선택만 표시
        return [{ id: 'admin-type-selection', label: '모드 선택', icon: '🔄' }];
      }
    }
    return evaluatorMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen`}>
      <div className="p-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold mb-6 text-gray-100">
            {userRole === 'admin' 
              ? (adminType === 'super' ? '총괄 관리자' : adminType === 'personal' ? '개인 서비스' : '관리자')
              : '평가자'
            }
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