import React from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  userRole: 'admin' | 'evaluator' | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, userRole, activeTab, onTabChange }) => {
  const adminMenuItems = [
    { id: 'projects', label: 'Projects', icon: '📋' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'model-builder', label: 'Model Builder', icon: '🏗️' },
    { id: 'results', label: 'Results', icon: '📊' }
  ];

  const evaluatorMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'evaluations', label: 'Evaluations', icon: '⚖️' },
    { id: 'progress', label: 'Progress', icon: '📈' }
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