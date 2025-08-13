import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import Card from './components/common/Card';
import Button from './components/common/Button';

// Demo data for GitHub Pages
const DEMO_USER = {
  first_name: 'Demo',
  last_name: 'User',
  role: 'admin' as const
};

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
      // Demo login - accept any credentials
      setTimeout(() => {
        if (email && password) {
          setUser(DEMO_USER);
        } else {
          setLoginError('Please enter email and password');
        }
        setLoginLoading(false);
      }, 1000);
      
    } catch (error) {
      setLoginError('Login failed');
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('projects');
  };

  const renderDemoNotice = () => (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-blue-800 font-medium mb-2">🚀 AHP Decision Support System - Demo Version</h3>
      <p className="text-blue-700 text-sm mb-3">
        이것은 GitHub Pages에서 호스팅되는 데모 버전입니다. 백엔드 기능은 시뮬레이션됩니다.
      </p>
      <div className="text-blue-600 text-xs space-y-1">
        <div>
          <strong>완전한 백엔드 API:</strong> 
          <a 
            href="https://ahp-forpaper.onrender.com/api/health" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ml-2 underline"
          >
            https://ahp-forpaper.onrender.com
          </a>
        </div>
        <div>
          <strong>소스코드:</strong> 
          <a 
            href="https://github.com/aebonlee/AHP_forPaper" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ml-2 underline"
          >
            GitHub 저장소
          </a>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!user) {
      return null;
    }

    const demoData = {
      projects: [
        { id: 1, name: '소프트웨어 선택 프로젝트', status: '활성', evaluators: 3, criteria: 8, alternatives: 5 },
        { id: 2, name: '공급업체 선정', status: '완료', evaluators: 5, criteria: 6, alternatives: 4 },
        { id: 3, name: '투자 우선순위 결정', status: '초안', evaluators: 2, criteria: 12, alternatives: 7 }
      ],
      criteria: [
        { name: '비용', weight: 0.35, children: ['초기비용', '유지보수비용', '교육비용'] },
        { name: '기능', weight: 0.45, children: ['핵심기능', '고급기능'] },
        { name: '사용성', weight: 0.20, children: ['사용자인터페이스', '학습곡선', '문서화'] }
      ],
      alternatives: [
        { name: 'Software A', score: 0.28, rank: 2 },
        { name: 'Software B', score: 0.32, rank: 1 },
        { name: 'Software C', score: 0.15, rank: 4 },
        { name: 'Software D', score: 0.18, rank: 3 },
        { name: 'Software E', score: 0.07, rank: 5 }
      ]
    };

    switch (activeTab) {
      case 'projects':
        return (
          <div className="space-y-6">
            {renderDemoNotice()}
            <Card title="AHP 프로젝트 관리">
              <div className="mb-4">
                <Button variant="primary" className="mr-3">새 프로젝트 생성</Button>
                <Button variant="secondary">프로젝트 가져오기</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">프로젝트명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평가자</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기준</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대안</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {demoData.projects.map(project => (
                      <tr key={project.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === '활성' ? 'bg-green-100 text-green-800' :
                            project.status === '완료' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.evaluators}명</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.criteria}개</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.alternatives}개</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button size="sm" variant="primary" className="mr-2">편집</Button>
                          <Button size="sm" variant="secondary">결과</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );

      case 'model-builder':
        return (
          <div className="space-y-6">
            {renderDemoNotice()}
            <Card title="계층적 모델 빌더">
              <div className="mb-4">
                <Button variant="primary" className="mr-3">기준 추가</Button>
                <Button variant="secondary" className="mr-3">대안 추가</Button>
                <Button variant="success">모델 검증</Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-3">평가 기준 계층</h4>
                  <div className="border rounded-lg p-4">
                    {demoData.criteria.map((criterion, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <span className="font-medium">{criterion.name}</span>
                          <span className="text-sm text-gray-500">가중치: {criterion.weight}</span>
                        </div>
                        <div className="ml-4 mt-2">
                          {criterion.children.map((child, childIndex) => (
                            <div key={childIndex} className="py-1 px-3 text-sm text-gray-600">
                              └ {child}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-3">대안 목록</h4>
                  <div className="border rounded-lg p-4">
                    {demoData.alternatives.map((alternative, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span>{alternative.name}</span>
                        <div className="text-sm text-gray-500">
                          순위 #{alternative.rank} (점수: {alternative.score.toFixed(3)})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'results':
        return (
          <div className="space-y-6">
            {renderDemoNotice()}
            <Card title="AHP 결과 분석">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-3">최종 순위</h4>
                  <div className="space-y-2">
                    {demoData.alternatives.sort((a, b) => a.rank - b.rank).map((alternative, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="font-bold text-lg mr-3">#{alternative.rank}</span>
                          <span>{alternative.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{(alternative.score * 100).toFixed(1)}%</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{width: `${alternative.score * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-3">기준별 가중치</h4>
                  <div className="space-y-3">
                    {demoData.criteria.map((criterion, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span>{criterion.name}</span>
                          <span className="font-medium">{(criterion.weight * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-secondary-600 h-3 rounded-full" 
                            style={{width: `${criterion.weight * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <Card title="Welcome">
            <p className="text-gray-600">AHP 의사결정 지원 시스템에 오신 것을 환영합니다!</p>
          </Card>
        );
    }
  };

  if (!user) {
    return (
      <div>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-yellow-800 font-medium mb-2">📖 Demo Version</h3>
              <p className="text-yellow-700 text-sm mb-2">
                이것은 GitHub Pages 데모 버전입니다. 아무 이메일과 비밀번호로 로그인하세요.
              </p>
              <p className="text-yellow-600 text-xs mb-2">
                예: demo@example.com / 123456
              </p>
              <div className="text-yellow-600 text-xs border-t pt-2 mt-2">
                <div className="font-medium">완전한 백엔드 API:</div>
                <a 
                  href="https://ahp-forpaper.onrender.com/api/health" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline"
                >
                  https://ahp-forpaper.onrender.com
                </a>
              </div>
            </div>
          </div>
        </div>
        <LoginForm
          onLogin={handleLogin}
          loading={loginLoading}
          error={loginError}
        />
      </div>
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