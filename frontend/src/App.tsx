import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import Card from './components/common/Card';

function App() {
  const [user, setUser] = useState<{
    first_name: string;
    last_name: string;
    role: 'admin' | 'evaluator';
  } | null>(null);
  const [activeTab, setActiveTab] = useState('projects');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
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

  const renderContent = () => {
    if (!user) {
      return null;
    }

    switch (activeTab) {
      case 'projects':
        return (
          <Card title="Projects">
            <p className="text-gray-600">Project management will be implemented here.</p>
          </Card>
        );
      case 'users':
        return (
          <Card title="User Management">
            <p className="text-gray-600">User management will be implemented here.</p>
          </Card>
        );
      case 'model-builder':
        return (
          <Card title="Model Builder">
            <p className="text-gray-600">Hierarchical model builder will be implemented here.</p>
          </Card>
        );
      case 'results':
        return (
          <Card title="Results">
            <p className="text-gray-600">Results dashboard will be implemented here.</p>
          </Card>
        );
      case 'dashboard':
        return (
          <Card title="Dashboard">
            <p className="text-gray-600">Evaluator dashboard will be implemented here.</p>
          </Card>
        );
      case 'evaluations':
        return (
          <Card title="Evaluations">
            <p className="text-gray-600">Pairwise comparisons will be implemented here.</p>
          </Card>
        );
      case 'progress':
        return (
          <Card title="Progress">
            <p className="text-gray-600">Progress tracking will be implemented here.</p>
          </Card>
        );
      default:
        return (
          <Card title="Welcome">
            <p className="text-gray-600">Welcome to the AHP Decision Support System!</p>
          </Card>
        );
    }
  };

  if (!user) {
    return (
      <LoginForm
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
      />
    );
  }

  return (
    <Layout
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
