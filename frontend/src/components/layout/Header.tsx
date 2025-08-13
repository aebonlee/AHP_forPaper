import React from 'react';

interface HeaderProps {
  user?: {
    first_name: string;
    last_name: string;
    role: 'admin' | 'evaluator';
  } | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary-600">
                AHP Decision System
              </h1>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
              
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium text-gray-700 transition-colors duration-200"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;