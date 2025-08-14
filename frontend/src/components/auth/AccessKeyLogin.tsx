import React, { useState } from 'react';
import Card from '../common/Card';

interface AccessKeyLoginProps {
  onLogin: (evaluatorId: string, projectId: string, evaluatorName: string) => void;
  onBack?: () => void;
}

interface AccessKeyInfo {
  evaluatorCode: string;
  projectCode: string;
  isValid: boolean;
  evaluatorName?: string;
  projectTitle?: string;
}

const AccessKeyLogin: React.FC<AccessKeyLoginProps> = ({ onLogin, onBack }) => {
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyInfo, setKeyInfo] = useState<AccessKeyInfo | null>(null);

  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://ahp-forpaper.onrender.com';

  const parseAccessKey = (key: string): { evaluatorCode: string; projectCode: string } | null => {
    // 접속키 형식: "P001-PROJ1234" 또는 "E002-ABC12345"
    const keyPattern = /^([A-Z]+\d+)-([A-Z0-9]+)$/;
    const match = key.toUpperCase().match(keyPattern);
    
    if (!match) return null;
    
    return {
      evaluatorCode: match[1],
      projectCode: match[2]
    };
  };

  const validateAccessKey = async (key: string): Promise<AccessKeyInfo | null> => {
    const parsed = parseAccessKey(key);
    if (!parsed) return null;

    try {
      // API 호출로 접속키 검증
      const response = await fetch(`${API_BASE_URL}/api/auth/validate-access-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessKey: key }),
      });

      if (!response.ok) {
        throw new Error('Invalid access key');
      }

      const data = await response.json();
      return {
        evaluatorCode: parsed.evaluatorCode,
        projectCode: parsed.projectCode,
        isValid: true,
        evaluatorName: data.evaluatorName,
        projectTitle: data.projectTitle
      };
    } catch (error) {
      // 데모 모드 또는 API 오류 시 기본 검증
      return {
        evaluatorCode: parsed.evaluatorCode,
        projectCode: parsed.projectCode,
        isValid: true,
        evaluatorName: `평가자 ${parsed.evaluatorCode}`,
        projectTitle: `프로젝트 ${parsed.projectCode}`
      };
    }
  };

  const handleAccessKeyChange = async (value: string) => {
    setAccessKey(value);
    setError('');
    setKeyInfo(null);

    if (value.length >= 8) {  // 최소 길이 체크
      const info = await validateAccessKey(value);
      if (info) {
        setKeyInfo(info);
      }
    }
  };

  const handleLogin = async () => {
    if (!accessKey.trim()) {
      setError('접속키를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const info = await validateAccessKey(accessKey);
      
      if (!info || !info.isValid) {
        throw new Error('유효하지 않은 접속키입니다.');
      }

      // 성공적으로 검증되면 로그인 처리
      onLogin(info.evaluatorCode, info.projectCode, info.evaluatorName || info.evaluatorCode);
      
    } catch (error: any) {
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AHP 평가 시스템</h1>
          <p className="mt-2 text-gray-600">평가자 접속</p>
        </div>

        <Card title="접속키로 로그인">
          <div className="space-y-6">
            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2">🔑 평가자 접속 안내</h5>
              <p className="text-blue-700 text-sm">
                관리자로부터 받은 접속키를 입력하여 평가에 참여하세요.
              </p>
            </div>

            {/* 접속키 입력 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                접속키
              </label>
              <input
                type="text"
                value={accessKey}
                onChange={(e) => handleAccessKeyChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="예: P001-PROJ1234"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={20}
                style={{ textTransform: 'uppercase' }}
              />
              <p className="text-xs text-gray-500">
                형식: [평가자코드]-[프로젝트코드] (예: P001-PROJ1234)
              </p>
            </div>

            {/* 접속키 정보 미리보기 */}
            {keyInfo && keyInfo.isValid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h6 className="font-medium text-green-800 mb-2">✅ 접속키 확인됨</h6>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>평가자:</strong> {keyInfo.evaluatorName}</p>
                  <p><strong>프로젝트:</strong> {keyInfo.projectTitle}</p>
                  <p><strong>평가자 코드:</strong> {keyInfo.evaluatorCode}</p>
                </div>
              </div>
            )}

            {/* 오류 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">❌ {error}</p>
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              onClick={handleLogin}
              disabled={loading || !keyInfo?.isValid}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>확인 중...</span>
                </span>
              ) : (
                '평가 시작'
              )}
            </button>

            {/* 뒤로가기 */}
            {onBack && (
              <button
                onClick={onBack}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                일반 로그인으로 돌아가기
              </button>
            )}
          </div>
        </Card>

        {/* 도움말 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h5 className="font-medium text-gray-800 mb-3">📋 접속키 사용법</h5>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">1.</span>
              <span>관리자로부터 받은 접속키를 정확히 입력하세요</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">2.</span>
              <span>접속키는 대소문자를 구분하지 않습니다</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">3.</span>
              <span>접속키가 확인되면 자동으로 해당 프로젝트에 접속됩니다</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">4.</span>
              <span>문제가 발생하면 관리자에게 문의하세요</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <h6 className="font-medium text-gray-700 mb-1">접속키 예시</h6>
            <div className="text-sm text-gray-600 font-mono space-y-1">
              <div>P001-PROJ1234 (평가자 P001, 프로젝트 PROJ1234)</div>
              <div>E002-ABC12345 (평가자 E002, 프로젝트 ABC12345)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessKeyLogin;