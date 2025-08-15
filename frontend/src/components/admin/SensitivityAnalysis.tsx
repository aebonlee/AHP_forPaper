import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface SensitivityAnalysisProps {
  projectId: string;
}

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({ projectId }) => {
  const [selectedCriterion, setSelectedCriterion] = useState('');
  const [selectedSubCriterion, setSelectedSubCriterion] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const criteria = [
    { id: 'performance', name: '성능', weight: 0.45 },
    { id: 'cost', name: '비용', weight: 0.35 },
    { id: 'usability', name: '사용성', weight: 0.20 }
  ];

  const subCriteria = {
    performance: [
      { id: 'speed', name: '처리속도', weight: 0.7 },
      { id: 'stability', name: '안정성', weight: 0.3 }
    ],
    cost: [
      { id: 'initial', name: '초기비용', weight: 0.6 },
      { id: 'maintenance', name: '유지비용', weight: 0.4 }
    ],
    usability: [
      { id: 'interface', name: '인터페이스', weight: 0.8 },
      { id: 'learning', name: '학습용이성', weight: 0.2 }
    ]
  };

  const getCurrentSubCriteria = () => {
    return selectedCriterion ? subCriteria[selectedCriterion as keyof typeof subCriteria] || [] : [];
  };

  const handleAnalysis = async () => {
    if (!selectedCriterion || !selectedSubCriterion || !newValue) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResults({
      original: {
        alternatives: [
          { name: '대안 A', score: 0.421, rank: 1 },
          { name: '대안 B', score: 0.358, rank: 2 },
          { name: '대안 C', score: 0.221, rank: 3 }
        ]
      },
      modified: {
        alternatives: [
          { name: '대안 A', score: 0.385, rank: 2 },
          { name: '대안 B', score: 0.394, rank: 1 },
          { name: '대안 C', score: 0.221, rank: 3 }
        ]
      },
      changes: [
        { criterion: selectedSubCriterion, from: 0.7, to: parseFloat(newValue) }
      ]
    });
    
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setResults(null);
    setSelectedCriterion('');
    setSelectedSubCriterion('');
    setNewValue('');
  };

  const captureResults = () => {
    alert('화면 캡처 기능 (구현 예정) - 서버에 저장되지 않으니 캡처하여 보관하세요.');
  };

  return (
    <div className="space-y-6">
      <Card title="서브 기능 2) 민감도 분석">
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">📊 민감도 분석</h4>
            <p className="text-sm text-purple-700">
              기준 가중치 변경에 따른 대안 순위 변화를 분석합니다.
            </p>
          </div>

          {/* Help Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 text-lg">❓</span>
              <div>
                <h5 className="font-medium text-blue-900 mb-2">사용 흐름</h5>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li><strong>①</strong> 상위기준 선택</li>
                  <li><strong>②</strong> 변경 기준 클릭</li>
                  <li><strong>③</strong> 값 입력</li>
                  <li><strong>④</strong> 분석 시작</li>
                  <li><strong>⑤</strong> 결과 확인 (서버 미저장·캡처 안내)</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Analysis Steps */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">📋 분석 설정</h4>
            
            {/* Step 1: Select Top Criterion */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ① 상위기준 선택
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {criteria.map((criterion) => (
                  <button
                    key={criterion.id}
                    onClick={() => {
                      setSelectedCriterion(criterion.id);
                      setSelectedSubCriterion('');
                      setNewValue('');
                      setResults(null);
                    }}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedCriterion === criterion.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h5 className="font-medium">{criterion.name}</h5>
                    <p className="text-sm text-gray-600">
                      현재 가중치: {(criterion.weight * 100).toFixed(1)}%
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Sub Criterion */}
            {selectedCriterion && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ② 변경 기준 클릭
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getCurrentSubCriteria().map((subCriterion) => (
                    <button
                      key={subCriterion.id}
                      onClick={() => {
                        setSelectedSubCriterion(subCriterion.id);
                        setNewValue(subCriterion.weight.toString());
                        setResults(null);
                      }}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedSubCriterion === subCriterion.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h6 className="font-medium">{subCriterion.name}</h6>
                      <p className="text-sm text-gray-600">
                        현재: {(subCriterion.weight * 100).toFixed(1)}%
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Input New Value */}
            {selectedSubCriterion && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ③ 새로운 가중치 값 입력 (0.0 ~ 1.0)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0 - 1.0"
                  />
                  <span className="text-sm text-gray-600">
                    ({(parseFloat(newValue || '0') * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}

            {/* Step 4: Start Analysis */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleAnalysis}
                  variant="primary"
                  loading={isAnalyzing}
                  disabled={!selectedCriterion || !selectedSubCriterion || !newValue || isAnalyzing}
                >
                  {isAnalyzing ? '④ 분석 중...' : '④ 분석 시작'}
                </Button>
                
                {results && (
                  <Button onClick={resetAnalysis} variant="secondary">
                    다시 설정
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Step 5: Results */}
          {results && (
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">⑤ 분석 결과</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Original Results */}
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">기존 결과</h5>
                  <div className="space-y-2">
                    {results.original.alternatives.map((alternative: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-gray-500 text-white rounded-full text-xs flex items-center justify-center">
                            {alternative.rank}
                          </span>
                          <span className="font-medium">{alternative.name}</span>
                        </div>
                        <span className="text-gray-700">
                          {(alternative.score * 100).toFixed(1)}점
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modified Results */}
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">변경 후 결과</h5>
                  <div className="space-y-2">
                    {results.modified.alternatives.map((alternative: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                            alternative.rank !== results.original.alternatives[index].rank
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }`}>
                            {alternative.rank}
                          </span>
                          <span className="font-medium">{alternative.name}</span>
                        </div>
                        <span className="text-orange-700">
                          {(alternative.score * 100).toFixed(1)}점
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Changes Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-yellow-900 mb-2">📋 변경 내용</h5>
                {results.changes.map((change: any, index: number) => (
                  <p key={index} className="text-sm text-yellow-700">
                    <strong>{getCurrentSubCriteria().find(c => c.id === change.criterion)?.name}</strong> 
                    가중치: {(change.from * 100).toFixed(1)}% → {(change.to * 100).toFixed(1)}%
                  </p>
                ))}
              </div>

              {/* Save Notice */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-red-900">⚠️ 중요 안내</h5>
                    <p className="text-sm text-red-700 mt-1">
                      분석 결과는 서버에 저장되지 않습니다. 화면 캡처를 통해 결과를 보관하세요.
                    </p>
                  </div>
                  <Button onClick={captureResults} variant="primary">
                    결과 캡처
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SensitivityAnalysis;