import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { evaluatorAPI } from '../../services/apiService';

interface Evaluator {
  id: string;
  code: string;
  name: string;
  email?: string;
  weight: number;
  isAssigned: boolean;
  accessKey?: string;
}

interface EvaluatorAssignmentProps {
  projectId: string;
  onComplete?: () => void;
}

const EvaluatorAssignment: React.FC<EvaluatorAssignmentProps> = ({ projectId, onComplete }) => {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [newEvaluatorCode, setNewEvaluatorCode] = useState('');
  const [newEvaluatorName, setNewEvaluatorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://ahp-forpaper.onrender.com';

  const generateAccessKey = (evaluatorCode: string) => {
    return `${evaluatorCode}-${projectId.substring(0, 8).toUpperCase()}`;
  };

  const fetchEvaluators = async () => {
    try {
      setLoading(true);
      const response = await evaluatorAPI.fetchByProject(parseInt(projectId));
      
      if (response.data) {
        setEvaluators(response.data.evaluators || []);
      } else if (response.error) {
        console.error('Failed to fetch evaluators:', response.error);
      }
    } catch (error) {
      console.error('Failed to fetch evaluators:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluators();
  }, [projectId]);

  const addEvaluator = async () => {
    if (!newEvaluatorCode.trim() || !newEvaluatorName.trim()) {
      alert('평가자 코드와 이름을 모두 입력해주세요.');
      return;
    }

    // 중복 코드 체크
    if (evaluators.some(e => e.code === newEvaluatorCode.toUpperCase())) {
      alert('이미 존재하는 평가자 코드입니다.');
      return;
    }

    try {
      setSaving(true);
      
      const response = await evaluatorAPI.assign({
        project_id: parseInt(projectId),
        evaluator_code: newEvaluatorCode.toUpperCase(),
        evaluator_name: newEvaluatorName,
        weight: 1.0
      });

      if (response.data) {
        // 성공적으로 추가된 경우 목록 새로고침
        await fetchEvaluators();
        setNewEvaluatorCode('');
        setNewEvaluatorName('');
        alert('평가자가 성공적으로 추가되었습니다.');
      } else if (response.error) {
        alert(`평가자 추가 실패: ${response.error}`);
      }
    } catch (error) {
      console.error('Failed to add evaluator:', error);
      alert('평가자 추가에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const updateEvaluatorWeight = async (evaluatorId: string, newWeight: number) => {
    if (newWeight < 0.1 || newWeight > 10) {
      alert('가중치는 0.1 ~ 10 사이의 값이어야 합니다.');
      return;
    }

    setEvaluators(evaluators.map(e => 
      e.id === evaluatorId ? {...e, weight: newWeight} : e
    ));
  };

  const removeEvaluator = async (evaluatorId: string) => {
    if (!confirm('정말로 이 평가자를 제거하시겠습니까?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // API 호출 (실제 구현 시)
      // await fetch(`${API_BASE_URL}/api/projects/${projectId}/evaluators/${evaluatorId}`, {
      //   method: 'DELETE',
      //   headers: { 'Authorization': `Bearer ${token}` },
      // });

      setEvaluators(evaluators.filter(e => e.id !== evaluatorId));
    } catch (error) {
      console.error('Failed to remove evaluator:', error);
      alert('평가자 제거에 실패했습니다.');
    }
  };

  const copyAccessKey = (accessKey: string) => {
    navigator.clipboard.writeText(accessKey);
    alert('접속키가 클립보드에 복사되었습니다.');
  };

  const exportEvaluatorList = () => {
    const csvContent = [
      ['평가자 코드', '이름', '접속키', '가중치'],
      ...evaluators.map(e => [e.code, e.name, e.accessKey || '', e.weight.toString()])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `evaluators_${projectId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card title="평가자 배정">
        <div className="text-center py-8">로딩 중...</div>
      </Card>
    );
  }

  return (
    <Card title="평가자 배정">
      <div className="space-y-6">
        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-800 mb-2">👥 평가자 관리</h5>
          <p className="text-blue-700 text-sm">
            평가자를 추가하고 접속키를 배포하세요. 각 평가자는 고유한 접속키로 평가에 참여할 수 있습니다.
          </p>
        </div>

        {/* 평가자 추가 폼 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium mb-3">새 평가자 추가</h5>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="평가자 코드 (예: P001)"
              value={newEvaluatorCode}
              onChange={(e) => setNewEvaluatorCode(e.target.value.toUpperCase())}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10}
            />
            <input
              type="text"
              placeholder="평가자 이름"
              value={newEvaluatorName}
              onChange={(e) => setNewEvaluatorName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-600">
              접속키: {newEvaluatorCode ? generateAccessKey(newEvaluatorCode.toUpperCase()) : '-'}
            </div>
            <button
              onClick={addEvaluator}
              disabled={saving || !newEvaluatorCode.trim() || !newEvaluatorName.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '추가 중...' : '추가'}
            </button>
          </div>
        </div>

        {/* 평가자 목록 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h5 className="font-medium">배정된 평가자 ({evaluators.length}명)</h5>
            {evaluators.length > 0 && (
              <button
                onClick={exportEvaluatorList}
                className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                목록 다운로드
              </button>
            )}
          </div>

          {evaluators.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
              배정된 평가자가 없습니다. 평가자를 추가해주세요.
            </div>
          ) : (
            <div className="space-y-2">
              {evaluators.map(evaluator => (
                <div key={evaluator.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                          {evaluator.code}
                        </span>
                        <span className="font-medium">{evaluator.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">접속키:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {evaluator.accessKey}
                        </code>
                        <button
                          onClick={() => copyAccessKey(evaluator.accessKey || '')}
                          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                          복사
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">가중치:</label>
                        <input
                          type="number"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={evaluator.weight}
                          onChange={(e) => updateEvaluatorWeight(evaluator.id, parseFloat(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => removeEvaluator(evaluator.id)}
                        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        제거
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• 평가자는 접속키를 사용하여 시스템에 로그인할 수 있습니다</p>
                      <p>• 가중치는 그룹 의사결정 시 해당 평가자 결과의 반영 비율입니다</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 그룹 가중치 요약 */}
        {evaluators.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-medium text-yellow-800 mb-2">📊 그룹 가중치 분배</h5>
            <div className="space-y-2">
              {evaluators.map(evaluator => {
                const totalWeight = evaluators.reduce((sum, e) => sum + e.weight, 0);
                const percentage = (evaluator.weight / totalWeight) * 100;
                return (
                  <div key={evaluator.id} className="flex justify-between items-center">
                    <span className="text-sm">{evaluator.code} ({evaluator.name})</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-yellow-700">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 완료 버튼 */}
        {evaluators.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={onComplete}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              평가자 배정 완료
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EvaluatorAssignment;