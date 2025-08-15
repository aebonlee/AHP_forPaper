import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface EvaluationItem {
  id: string;
  name: string;
  description?: string;
  value: number | '';
  originalValue: number | '';
  isInverted: boolean;
}

interface EvaluationGroup {
  id: string;
  name: string;
  items: EvaluationItem[];
  completed: boolean;
}

interface DirectInputEvaluationProps {
  projectId: string;
  projectTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

const DirectInputEvaluation: React.FC<DirectInputEvaluationProps> = ({
  projectId,
  projectTitle,
  onComplete,
  onBack
}) => {
  const [evaluationGroups, setEvaluationGroups] = useState<EvaluationGroup[]>([
    {
      id: 'criteria',
      name: '주요 기준 평가',
      items: [
        { id: '1', name: '성능', description: '시스템 처리 성능', value: '', originalValue: '', isInverted: false },
        { id: '2', name: '비용', description: '총 소유 비용', value: '', originalValue: '', isInverted: false },
        { id: '3', name: '사용성', description: '사용자 편의성', value: '', originalValue: '', isInverted: false }
      ],
      completed: false
    },
    {
      id: 'alternatives',
      name: '대안별 종합 평가',
      items: [
        { id: '1', name: '대안 A', description: '기존 시스템 개선', value: '', originalValue: '', isInverted: false },
        { id: '2', name: '대안 B', description: '새 시스템 도입', value: '', originalValue: '', isInverted: false },
        { id: '3', name: '대안 C', description: '외부 서비스 활용', value: '', originalValue: '', isInverted: false }
      ],
      completed: false
    }
  ]);

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [showWeightVisualization, setShowWeightVisualization] = useState(false);
  const [recentlyModifiedItem, setRecentlyModifiedItem] = useState<string | null>(null);

  const currentGroup = evaluationGroups[currentGroupIndex];

  useEffect(() => {
    // 최근 수정된 항목의 수정 제한 타이머
    if (recentlyModifiedItem) {
      const timer = setTimeout(() => {
        setRecentlyModifiedItem(null);
      }, 10000); // 10초 후 수정 가능

      return () => clearTimeout(timer);
    }
  }, [recentlyModifiedItem]);

  const handleValueChange = (itemId: string, value: string) => {
    if (recentlyModifiedItem === itemId) {
      return; // 최근 수정된 항목은 수정 불가
    }

    const numericValue = value === '' ? '' : parseFloat(value);
    
    setEvaluationGroups(prev => prev.map((group, groupIndex) => 
      groupIndex === currentGroupIndex 
        ? {
            ...group,
            items: group.items.map(item => 
              item.id === itemId 
                ? { 
                    ...item, 
                    value: numericValue,
                    originalValue: item.originalValue === '' ? numericValue : item.originalValue
                  }
                : item
            )
          }
        : group
    ));

    setRecentlyModifiedItem(itemId);
  };

  const handleInvertValues = (itemId: string) => {
    setEvaluationGroups(prev => prev.map((group, groupIndex) => 
      groupIndex === currentGroupIndex 
        ? {
            ...group,
            items: group.items.map(item => 
              item.id === itemId && typeof item.value === 'number' && item.value > 0
                ? { 
                    ...item, 
                    value: 1 / item.value,
                    isInverted: !item.isInverted
                  }
                : item
            )
          }
        : group
    ));

    setShowWeightVisualization(true);
    setTimeout(() => setShowWeightVisualization(false), 3000);
  };

  const calculateWeights = (items: EvaluationItem[]) => {
    const validValues = items
      .map(item => typeof item.value === 'number' ? item.value : 0)
      .filter(val => val > 0);
    
    if (validValues.length === 0) return items.map(() => 0);
    
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return items.map(item => {
      const val = typeof item.value === 'number' ? item.value : 0;
      return val > 0 ? (val / sum) * 100 : 0;
    });
  };

  const isGroupCompleted = () => {
    return currentGroup.items.every(item => 
      typeof item.value === 'number' && item.value > 0
    );
  };

  const handleNextGroup = () => {
    const updatedGroups = [...evaluationGroups];
    updatedGroups[currentGroupIndex].completed = true;
    setEvaluationGroups(updatedGroups);

    if (currentGroupIndex < evaluationGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
    } else {
      onComplete();
    }
  };

  const getProgressPercentage = () => {
    const completedGroups = evaluationGroups.filter(g => g.completed).length;
    const currentProgress = isGroupCompleted() ? 1 : 0;
    return Math.round(((completedGroups + currentProgress) / evaluationGroups.length) * 100);
  };

  const weights = calculateWeights(currentGroup.items);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              단계 2 — 평가하기 / 직접입력
            </h1>
            <p className="text-gray-600">
              프로젝트: <span className="font-medium">{projectTitle}</span>
            </p>
          </div>
          <Button variant="secondary" onClick={onBack}>
            프로젝트 선택으로
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">전체 진행률</span>
            <span className="text-sm text-gray-600">
              {currentGroupIndex + 1} / {evaluationGroups.length} 그룹
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getProgressPercentage()}% 완료
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Group */}
        <Card title={currentGroup.name}>
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📝 직접입력 방법</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 각 항목에 대해 0보다 큰 수치를 입력하세요</li>
                <li>• 상대적 비율이 중요하므로 절대값에 구애받지 마세요</li>
                <li>• <strong>데이터 값이 낮을수록 좋은 경우</strong> (예: 비용, 오류율)는 '역수 변환' 버튼을 클릭하세요</li>
                <li>• 입력 후 10초간은 해당 값을 수정할 수 없습니다</li>
              </ul>
            </div>

            {/* Input Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700">
                      평가 항목
                    </th>
                    <th className="border border-gray-300 p-3 text-left text-sm font-medium text-gray-700">
                      설명
                    </th>
                    <th className="border border-gray-300 p-3 text-center text-sm font-medium text-gray-700">
                      입력값
                    </th>
                    <th className="border border-gray-300 p-3 text-center text-sm font-medium text-gray-700">
                      가중치
                    </th>
                    <th className="border border-gray-300 p-3 text-center text-sm font-medium text-gray-700">
                      역수 변환
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentGroup.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.isInverted && (
                          <div className="text-xs text-orange-600 mt-1">
                            🔄 역수 변환됨
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 p-3 text-sm text-gray-600">
                        {item.description}
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="space-y-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.value}
                            onChange={(e) => handleValueChange(item.id, e.target.value)}
                            disabled={recentlyModifiedItem === item.id}
                            className={`w-full px-3 py-2 border rounded-md text-center ${
                              recentlyModifiedItem === item.id
                                ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                                : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }`}
                            placeholder="0.00"
                          />
                          {recentlyModifiedItem === item.id && (
                            <div className="text-xs text-orange-600 text-center">
                              수정 제한 중 (10초)
                            </div>
                          )}
                          {item.originalValue !== '' && item.originalValue !== item.value && (
                            <div className="text-xs text-gray-500 text-center">
                              원본: {item.originalValue}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <div className="space-y-1">
                          <div className="font-semibold text-lg">
                            {weights[index].toFixed(1)}%
                          </div>
                          {showWeightVisualization && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${weights[index]}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <button
                          onClick={() => handleInvertValues(item.id)}
                          disabled={typeof item.value !== 'number' || item.value <= 0}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            typeof item.value === 'number' && item.value > 0
                              ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          역수로
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inline Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm text-yellow-800">
                    <strong>데이터 값이 낮을수록 좋은 경우</strong> (예: 비용, 오류율, 처리시간 등)는 
                    <button 
                      className="mx-1 underline font-medium hover:text-yellow-900"
                      onClick={() => {
                        // 모든 항목에 대해 역수 변환 옵션 안내
                        alert('각 항목의 "역수로" 버튼을 클릭하여 역수 값을 취하도록 설정하세요.');
                      }}
                    >
                      여기를
                    </button> 
                    참고하여 역수 값을 취하도록 설정하세요.
                  </p>
                  <div className="text-xs text-yellow-700 mt-2">
                    역수 변환 시 "입력 데이터는 그대로, 중요도만 바뀜" - 낮은 값이 높은 가중치를 가지게 됩니다.
                  </div>
                </div>
              </div>
            </div>

            {/* Weight Visualization */}
            {showWeightVisualization && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">📊 중요도 변화</h4>
                <p className="text-sm text-green-700">
                  입력 데이터는 그대로 유지되며, 중요도 계산 방식만 변경되었습니다.
                </p>
              </div>
            )}

            {/* Completion Status */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-4">
                입력 완료: <span className="font-semibold">
                  {currentGroup.items.filter(item => typeof item.value === 'number' && item.value > 0).length} / {currentGroup.items.length}
                </span>
              </div>
              
              <Button
                onClick={handleNextGroup}
                variant="primary"
                size="lg"
                disabled={!isGroupCompleted()}
              >
                {currentGroupIndex === evaluationGroups.length - 1 ? '평가 완료' : '다음'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluationGroups.map((group, index) => (
            <div 
              key={group.id} 
              className={`p-4 border rounded-lg ${
                index === currentGroupIndex 
                  ? 'border-blue-500 bg-blue-50' 
                  : group.completed 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{group.name}</h4>
                <span className={`text-sm px-2 py-1 rounded ${
                  index === currentGroupIndex 
                    ? 'bg-blue-100 text-blue-800' 
                    : group.completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {index === currentGroupIndex ? '진행중' : group.completed ? '완료' : '대기'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DirectInputEvaluation;