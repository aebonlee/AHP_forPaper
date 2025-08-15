import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface Evaluator {
  id: string;
  name: string;
  status: 'completed' | 'incomplete';
  progress: number;
  weight: number;
  included: boolean;
}

interface GroupWeightAnalysisProps {
  projectId: string;
}

const GroupWeightAnalysis: React.FC<GroupWeightAnalysisProps> = ({ projectId }) => {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([
    { id: '1', name: '김평가', status: 'completed', progress: 100, weight: 1.0, included: true },
    { id: '2', name: '이전문', status: 'completed', progress: 100, weight: 1.0, included: true },
    { id: '3', name: '박전문가', status: 'incomplete', progress: 60, weight: 0.5, included: false },
    { id: '4', name: '최전문', status: 'completed', progress: 100, weight: 1.2, included: true }
  ]);

  const [results, setResults] = useState({
    criteria: [
      { name: '성능', weight: 0.45, rank: 1 },
      { name: '비용', weight: 0.35, rank: 2 },
      { name: '사용성', weight: 0.20, rank: 3 }
    ],
    alternatives: [
      { name: '대안 A', score: 0.421, rank: 1 },
      { name: '대안 B', score: 0.358, rank: 2 },
      { name: '대안 C', score: 0.221, rank: 3 }
    ]
  });

  const handleEvaluatorToggle = (id: string) => {
    setEvaluators(prev => prev.map(evaluator => 
      evaluator.id === id 
        ? { ...evaluator, included: !evaluator.included }
        : evaluator
    ));
  };

  const handleWeightChange = (id: string, weight: number) => {
    setEvaluators(prev => prev.map(evaluator => 
      evaluator.id === id 
        ? { ...evaluator, weight }
        : evaluator
    ));
  };

  const calculateResults = () => {
    // Simulate recalculation
    console.log('Recalculating with selected evaluators and weights...');
    // Update results based on selected evaluators and their weights
  };

  const exportToExcel = () => {
    // Simulate Excel export
    alert('Excel 파일로 내보내기 기능 (구현 예정)');
  };

  const completedEvaluators = evaluators.filter(e => e.status === 'completed');
  const includedEvaluators = evaluators.filter(e => e.included);

  return (
    <div className="space-y-6">
      <Card title="서브 기능 1) 그룹별 가중치 도출">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">⚖️ 평가자 별 가중치 조정</h4>
            <p className="text-sm text-blue-700">
              완료한 평가자만 통합 계산 대상으로 표시됩니다. 각 평가자의 가중치를 조정하여 
              일부 평가자의 통합 결과를 산출할 수 있습니다.
            </p>
          </div>

          {/* Evaluator Selection and Weight Adjustment */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">👥 평가자 선택 및 가중치 조정</h4>
            <div className="space-y-3">
              {evaluators.map((evaluator) => (
                <div
                  key={evaluator.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    evaluator.status === 'completed' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={evaluator.included}
                      onChange={() => handleEvaluatorToggle(evaluator.id)}
                      disabled={evaluator.status !== 'completed'}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <div>
                      <h5 className="font-medium text-gray-900">{evaluator.name}</h5>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          evaluator.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {evaluator.status === 'completed' ? '완료' : '미완료'}
                        </span>
                        <span className="text-gray-600">진행률: {evaluator.progress}%</span>
                      </div>
                    </div>
                  </div>

                  {evaluator.status === 'completed' && (
                    <div className="flex items-center space-x-3">
                      <label className="text-sm text-gray-700">가중치:</label>
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={evaluator.weight}
                        onChange={(e) => handleWeightChange(evaluator.id, parseFloat(e.target.value))}
                        disabled={!evaluator.included}
                        className="w-24"
                      />
                      <span className="w-12 text-sm text-gray-600">
                        {evaluator.weight.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span>
                  포함된 평가자: <strong>{includedEvaluators.length}</strong>명 
                  (총 {completedEvaluators.length}명 완료)
                </span>
                <Button onClick={calculateResults} variant="primary" size="sm">
                  결과보기
                </Button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">📊 통합 분석 결과</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Criteria Weights */}
              <div>
                <h5 className="font-medium text-gray-800 mb-3">기준별 가중치</h5>
                <div className="space-y-2">
                  {results.criteria.map((criterion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                          {criterion.rank}
                        </span>
                        <span className="font-medium">{criterion.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-900">
                          {(criterion.weight * 100).toFixed(1)}%
                        </div>
                        <div className="w-24 bg-blue-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${criterion.weight * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Scores */}
              <div>
                <h5 className="font-medium text-gray-800 mb-3">대안별 종합 점수</h5>
                <div className="space-y-2">
                  {results.alternatives.map((alternative, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full text-xs flex items-center justify-center">
                          {alternative.rank}
                        </span>
                        <span className="font-medium">{alternative.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-900">
                          {(alternative.score * 100).toFixed(1)}점
                        </div>
                        <div className="w-24 bg-green-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${alternative.score * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="border-t pt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-yellow-900">📥 결과 저장</h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    현재 결과는 임시 표시입니다. Excel 파일로 저장하여 보관하세요.
                  </p>
                </div>
                <Button onClick={exportToExcel} variant="primary">
                  Excel 저장
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">📈 분석 요약</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{completedEvaluators.length}</div>
                <div className="text-sm text-gray-600">완료 평가자</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{includedEvaluators.length}</div>
                <div className="text-sm text-gray-600">포함 평가자</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {results.alternatives[0].name}
                </div>
                <div className="text-sm text-gray-600">최적 대안</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">85.3%</div>
                <div className="text-sm text-gray-600">신뢰도</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GroupWeightAnalysis;