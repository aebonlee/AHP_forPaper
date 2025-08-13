import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    first_name: string;
    last_name: string;
    role: 'admin' | 'evaluator';
  } | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  activeTab, 
  onTabChange, 
  onLogout 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="flex">
        {user && (
          <>
            <Sidebar
              isCollapsed={sidebarCollapsed}
              userRole={user.role}
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="fixed top-20 left-2 z-10 bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
              style={{ left: sidebarCollapsed ? '4rem' : '16rem' }}
            >
              <span className="text-sm">
                {sidebarCollapsed ? '→' : '←'}
              </span>
            </button>
          </>
        )}
        
        <main className={`flex-1 p-6 transition-all duration-300 ${
          user ? 'ml-0' : 'ml-0'
        }`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;