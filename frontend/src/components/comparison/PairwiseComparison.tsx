import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import { DEMO_COMPARISONS } from '../../data/demoData';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  level: number;
  children?: Criterion[];
}

interface Alternative {
  id: string;
  name: string;
  description?: string;
}

interface Comparison {
  id?: string;
  criterion1_id?: string;
  criterion2_id?: string;
  alternative1_id?: string;
  alternative2_id?: string;
  value: number;
}

interface PairwiseComparisonProps {
  projectId: string;
  criterionId?: string;
  criterionName?: string;
  elements?: Criterion[] | Alternative[];
  elementType?: 'criteria' | 'alternatives';
  onComplete?: () => void;
  criteria?: Criterion[];
  alternatives?: Alternative[];
  demoMode?: boolean;
}

const SAATY_SCALE = [
  { value: 9, label: '9 - 절대적 중요', description: 'A가 B보다 절대적으로 중요' },
  { value: 8, label: '8', description: '8과 9 사이의 중간값' },
  { value: 7, label: '7 - 매우 강한 중요', description: 'A가 B보다 매우 강하게 중요' },
  { value: 6, label: '6', description: '6과 7 사이의 중간값' },
  { value: 5, label: '5 - 강한 중요', description: 'A가 B보다 강하게 중요' },
  { value: 4, label: '4', description: '4와 5 사이의 중간값' },
  { value: 3, label: '3 - 약한 중요', description: 'A가 B보다 약간 중요' },
  { value: 2, label: '2', description: '2와 3 사이의 중간값' },
  { value: 1, label: '1 - 동등', description: 'A와 B가 동등하게 중요' },
  { value: 1/2, label: '1/2', description: '2와 3 사이의 중간값 (B 우세)' },
  { value: 1/3, label: '1/3 - 약한 중요', description: 'B가 A보다 약간 중요' },
  { value: 1/4, label: '1/4', description: '4와 5 사이의 중간값 (B 우세)' },
  { value: 1/5, label: '1/5 - 강한 중요', description: 'B가 A보다 강하게 중요' },
  { value: 1/6, label: '1/6', description: '6과 7 사이의 중간값 (B 우세)' },
  { value: 1/7, label: '1/7 - 매우 강한 중요', description: 'B가 A보다 매우 강하게 중요' },
  { value: 1/8, label: '1/8', description: '8과 9 사이의 중간값 (B 우세)' },
  { value: 1/9, label: '1/9 - 절대적 중요', description: 'B가 A보다 절대적으로 중요' }
];

const PairwiseComparison: React.FC<PairwiseComparisonProps> = ({
  projectId,
  criterionId,
  criterionName,
  elements,
  elementType,
  onComplete,
  criteria = [],
  alternatives = [],
  demoMode = false
}) => {
  const [comparisons, setComparisons] = useState<Map<string, Comparison>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://ahp-forpaper.onrender.com';

  // Generate all possible pairs
  const pairs = React.useMemo(() => {
    if (!elements || elements.length < 2) return [];
    const pairList: Array<[Criterion | Alternative, Criterion | Alternative]> = [];
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        pairList.push([elements[i], elements[j]]);
      }
    }
    return pairList;
  }, [elements]);

  const fetchComparisons = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/comparisons/${projectId}/matrix/${criterionId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch comparisons');
      
      const data = await response.json();
      const comparisonMap = new Map<string, Comparison>();
      
      data.comparisons.forEach((comp: Comparison) => {
        let key = '';
        if (elementType === 'criteria' && comp.criterion1_id && comp.criterion2_id) {
          key = `${comp.criterion1_id}-${comp.criterion2_id}`;
        } else if (elementType === 'alternatives' && comp.alternative1_id && comp.alternative2_id) {
          key = `${comp.alternative1_id}-${comp.alternative2_id}`;
        }
        if (key) {
          comparisonMap.set(key, comp);
        }
      });
      
      setComparisons(comparisonMap);
    } catch (error) {
      console.error('Failed to fetch comparisons:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, criterionId, elementType]);

  useEffect(() => {
    fetchComparisons();
  }, [fetchComparisons]);

  const saveComparison = async (element1: Criterion | Alternative, element2: Criterion | Alternative, value: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSaving(true);
      
      const requestBody: any = {
        project_id: projectId,
        criterion_id: criterionId,
        value: value
      };

      if (elementType === 'criteria') {
        requestBody.criterion1_id = element1.id;
        requestBody.criterion2_id = element2.id;
      } else {
        requestBody.alternative1_id = element1.id;
        requestBody.alternative2_id = element2.id;
      }

      const response = await fetch(`${API_BASE_URL}/api/comparisons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to save comparison');

      // Update local state
      const key = `${element1.id}-${element2.id}`;
      const newComparison: Comparison = {
        ...requestBody,
        value
      };
      
      setComparisons(prev => new Map(prev.set(key, newComparison)));
      
      // Move to next pair if not at the end
      if (currentPairIndex < pairs.length - 1) {
        setCurrentPairIndex(currentPairIndex + 1);
      }
    } catch (error) {
      console.error('Failed to save comparison:', error);
    } finally {
      setSaving(false);
    }
  };

  const getComparisonValue = (element1: Criterion | Alternative, element2: Criterion | Alternative): number | null => {
    const key = `${element1.id}-${element2.id}`;
    const reverseKey = `${element2.id}-${element1.id}`;
    
    const comparison = comparisons.get(key);
    if (comparison) return comparison.value;
    
    const reverseComparison = comparisons.get(reverseKey);
    if (reverseComparison) return 1 / reverseComparison.value;
    
    return null;
  };

  const getCompletedCount = () => {
    return pairs.filter(([elem1, elem2]) => getComparisonValue(elem1, elem2) !== null).length;
  };

  const formatValue = (value: number): string => {
    if (value === 1) return '1';
    if (value > 1) return value.toString();
    return `1/${Math.round(1/value)}`;
  };

  // 데모 모드에서는 간단한 인터페이스 표시
  if (demoMode) {
    return (
      <div className="space-y-6">
        <Card title="쌍대비교 평가 (데모)">
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded p-4">
              <h5 className="font-medium text-orange-800">⚖️ Saaty 1-9 척도 평가</h5>
              <p className="text-orange-700 text-sm mt-1">
                기준과 대안을 쌍대비교하여 중요도를 평가합니다.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h6 className="font-medium mb-2">Saaty 척도 가이드:</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>1 = 동등하게 중요</div>
                <div>3 = 약간 더 중요</div>
                <div>5 = 강하게 더 중요</div>
                <div>7 = 매우 강하게 더 중요</div>
                <div>9 = 극도로 더 중요</div>
                <div>2,4,6,8 = 중간값</div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h6 className="font-medium text-green-800 mb-2">✅ 완료된 비교 샘플</h6>
              <div className="space-y-2 text-sm text-green-700">
                <div>• 비용 효율성 vs 기술적 우수성: 3 (비용 효율성이 약간 더 중요)</div>
                <div>• 비용 효율성 vs 시장성: 2 (비용 효율성이 조금 더 중요)</div>
                <div>• 기술적 우수성 vs 시장성: 1/2 (시장성이 조금 더 중요)</div>
                <div>• AI 솔루션 vs 전통적 방법: 5 (AI 솔루션이 강하게 우세)</div>
              </div>
            </div>
            
            <div className="text-gray-600">
              <p className="font-medium">평가 프로세스:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>기준 간 쌍대비교 (4개 기준, 6개 쌍)</li>
                <li>대안 간 쌍대비교 (각 기준별, 3개 대안, 3개 쌍 × 4기준 = 12개 쌍)</li>
                <li>일관성 검증 (CR &lt; 0.1)</li>
                <li>자동 상호비교 매트릭스 생성</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-blue-700 text-sm">
                💡 <strong>데모 모드:</strong> 샘플 데이터로 완료된 평가를 확인할 수 있습니다. 
                실제 평가를 진행하려면 백엔드 연결 후 다시 시도해주세요.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <Card title="쌍대비교">
        <div className="text-center py-8">로딩 중...</div>
      </Card>
    );
  }

  if (!elements || elements.length < 2) {
    return (
      <Card title="쌍대비교">
        <div className="text-center py-8">
          비교할 요소가 부족합니다. 최소 2개 이상의 {elementType === 'criteria' ? '기준' : '대안'}이 필요합니다.
        </div>
      </Card>
    );
  }

  const currentPair = pairs[currentPairIndex];
  const completedCount = getCompletedCount();
  const totalPairs = pairs.length;
  const isComplete = completedCount === totalPairs;

  return (
    <div className="space-y-6">
      <Card title={`쌍대비교: ${criterionName}`}>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">📊 진행 상황</h4>
            <div className="text-blue-700">
              <p>완료: {completedCount} / {totalPairs} 쌍</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalPairs) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {!isComplete && currentPair && (
            <Card title="현재 비교">
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-lg font-medium mb-4">
                    다음 두 {elementType === 'criteria' ? '기준' : '대안'} 중 어느 것이 더 중요합니까?
                  </p>
                  <div className="flex items-center justify-center space-x-8">
                    <div className="text-center">
                      <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 min-w-48">
                        <h4 className="font-bold text-blue-800">{currentPair[0].name}</h4>
                        {currentPair[0].description && (
                          <p className="text-sm text-blue-600 mt-1">{currentPair[0].description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-400">VS</div>
                    <div className="text-center">
                      <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 min-w-48">
                        <h4 className="font-bold text-green-800">{currentPair[1].name}</h4>
                        {currentPair[1].description && (
                          <p className="text-sm text-green-600 mt-1">{currentPair[1].description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-center">중요도를 선택하세요 (Saaty 1-9 척도)</h5>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {SAATY_SCALE.map((scale) => (
                      <button
                        key={scale.value}
                        onClick={() => saveComparison(currentPair[0], currentPair[1], scale.value)}
                        disabled={saving}
                        className={`p-3 text-left border rounded-lg hover:bg-gray-50 disabled:opacity-50 ${
                          scale.value === 1 ? 'border-yellow-300 bg-yellow-50' : 
                          scale.value > 1 ? 'border-blue-300 bg-blue-50' : 'border-green-300 bg-green-50'
                        }`}
                      >
                        <div className="font-medium">{scale.label}</div>
                        <div className="text-sm text-gray-600">{scale.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    onClick={() => setCurrentPairIndex(Math.max(0, currentPairIndex - 1))}
                    disabled={currentPairIndex === 0}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    이전
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentPairIndex + 1} / {totalPairs}
                  </span>
                  <button
                    onClick={() => setCurrentPairIndex(Math.min(pairs.length - 1, currentPairIndex + 1))}
                    disabled={currentPairIndex === pairs.length - 1}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            </Card>
          )}

          {isComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">✅ 비교 완료!</h4>
              <p className="text-green-700">
                모든 쌍대비교가 완료되었습니다. 이제 AHP 계산을 수행할 수 있습니다.
              </p>
              {onComplete && (
                <button
                  onClick={onComplete}
                  className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  계산 결과 보기
                </button>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card title="비교 매트릭스">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50"></th>
                {elements.map((element) => (
                  <th key={element.id} className="border p-2 bg-gray-50 min-w-20">
                    {element.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {elements.map((row) => (
                <tr key={row.id}>
                  <td className="border p-2 bg-gray-50 font-medium">{row.name}</td>
                  {elements.map((col) => {
                    if (row.id === col.id) {
                      return (
                        <td key={col.id} className="border p-2 text-center bg-yellow-50">
                          1
                        </td>
                      );
                    }
                    
                    const value = getComparisonValue(row, col);
                    return (
                      <td key={col.id} className="border p-2 text-center">
                        {value !== null ? (
                          <span className={`px-2 py-1 rounded text-xs ${
                            value > 1 ? 'bg-blue-100 text-blue-800' : 
                            value < 1 ? 'bg-green-100 text-green-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {formatValue(value)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>해석:</strong></p>
          <p>• 1 = 동등한 중요도</p>
          <p>• 1보다 큰 값 = 행(row) 요소가 더 중요</p>
          <p>• 1보다 작은 값 = 열(column) 요소가 더 중요</p>
        </div>
      </Card>
    </div>
  );
};

export default PairwiseComparison;