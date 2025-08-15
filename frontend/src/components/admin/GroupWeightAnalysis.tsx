import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ScreenID from '../common/ScreenID';
import { MESSAGES } from '../../constants/messages';
import { SCREEN_IDS } from '../../constants/screenIds';

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
    { id: 'p001', name: '평가자 1', status: 'completed', progress: 100, weight: 1.0, included: true },
    { id: 'p002', name: '평가자 2', status: 'completed', progress: 100, weight: 1.0, included: true },
    { id: 'p003', name: '평가자 3', status: 'completed', progress: 100, weight: 1.0, included: true },
    { id: 'p004', name: '평가자 4', status: 'completed', progress: 100, weight: 1.0, included: true }
  ]);

  const [results, setResults] = useState({
    criteria: [
      { name: '개발 생산성 효율화', weight: 0.40386, rank: 1 },
      { name: '코딩 실무 품질 적합화', weight: 0.30101, rank: 2 },
      { name: '개발 프로세스 자동화', weight: 0.29513, rank: 3 }
    ],
    alternatives: [
      { name: '코딩 작성 속도 향상', score: 0.16959, rank: 1 },
      { name: '코드 품질 개선 및 최적화', score: 0.15672, rank: 2 },
      { name: '반복 작업 최소화', score: 0.13382, rank: 3 },
      { name: '형상관리 및 배포 지원', score: 0.11591, rank: 4 },
      { name: '디버깅 시간 단축', score: 0.10044, rank: 5 },
      { name: '기술 문서/주석 자동화', score: 0.09270, rank: 6 },
      { name: '테스트 케이스 자동 생성', score: 0.08653, rank: 7 },
      { name: '신규 기술/언어 학습지원', score: 0.07723, rank: 8 },
      { name: 'AI생성 코딩의 신뢰성', score: 0.06706, rank: 9 }
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
      <ScreenID id={SCREEN_IDS.ADMIN.STEP3_WEIGHTS} />
      <Card title="그룹별 가중치 도출">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">⚖️ 평가자 별 가중치 조정 / 일부 평가자의 통합 결과 산출</h4>
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
                    {MESSAGES.SAVE_WARNING}
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
                <div className="text-lg font-bold text-purple-600">99.8%</div>
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