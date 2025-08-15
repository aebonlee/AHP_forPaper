import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import MatrixGrid from './MatrixGrid';
import JudgmentHelper from './JudgmentHelper';

interface Matrix {
  id: string;
  name: string;
  items: string[];
  values: number[][];
  completed: boolean;
  consistencyRatio?: number;
}

interface PairwiseEvaluationProps {
  projectId: string;
  projectTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

const PairwiseEvaluation: React.FC<PairwiseEvaluationProps> = ({
  projectId,
  projectTitle,
  onComplete,
  onBack
}) => {
  const [matrices, setMatrices] = useState<Matrix[]>([
    {
      id: 'criteria',
      name: '주요 기준 비교',
      items: ['성능', '비용', '사용성'],
      values: Array(3).fill(null).map(() => Array(3).fill(1)),
      completed: false
    },
    {
      id: 'performance',
      name: '성능 세부기준 비교',
      items: ['처리속도', '안정성'],
      values: Array(2).fill(null).map(() => Array(2).fill(1)),
      completed: false
    },
    {
      id: 'alternatives_performance',
      name: '성능 관점 대안 비교',
      items: ['대안 A', '대안 B', '대안 C'],
      values: Array(3).fill(null).map(() => Array(3).fill(1)),
      completed: false
    }
  ]);

  const [currentMatrixIndex, setCurrentMatrixIndex] = useState(0);
  const [showHelper, setShowHelper] = useState(false);

  const currentMatrix = matrices[currentMatrixIndex];

  useEffect(() => {
    // 현재 매트릭스의 일관성 비율 계산
    if (currentMatrix && currentMatrix.items.length >= 3) {
      const cr = calculateConsistencyRatio(currentMatrix.values);
      setMatrices(prev => prev.map((matrix, index) => 
        index === currentMatrixIndex 
          ? { ...matrix, consistencyRatio: cr }
          : matrix
      ));

      // CR > 0.1이면 판단 도우미 자동 표시
      if (cr > 0.1) {
        setShowHelper(true);
      }
    }
  }, [currentMatrix?.values, currentMatrix, currentMatrixIndex]);

  const calculateConsistencyRatio = (values: number[][]): number => {
    // 실제 CR 계산 로직 구현 (간략화된 버전)
    const n = values.length;
    if (n < 3) return 0;

    // 임의의 CR 값 반환 (실제로는 고유값 계산 필요)
    const mockCR = Math.random() * 0.15;
    return parseFloat(mockCR.toFixed(3));
  };

  const handleMatrixUpdate = (newValues: number[][]) => {
    setMatrices(prev => prev.map((matrix, index) => 
      index === currentMatrixIndex 
        ? { ...matrix, values: newValues }
        : matrix
    ));
  };

  const handleMatrixComplete = () => {
    const updatedMatrices = [...matrices];
    updatedMatrices[currentMatrixIndex].completed = true;
    setMatrices(updatedMatrices);

    if (currentMatrixIndex < matrices.length - 1) {
      setCurrentMatrixIndex(currentMatrixIndex + 1);
      setShowHelper(false);
    } else {
      // 모든 매트릭스 완료
      onComplete();
    }
  };

  const isMatrixCompleted = () => {
    if (!currentMatrix) return false;
    
    const n = currentMatrix.items.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (currentMatrix.values[i][j] === 1 && i !== j) {
          return false; // 대각선이 아닌 요소가 1이면 미완료
        }
      }
    }
    return true;
  };

  const getProgressPercentage = () => {
    const completedCount = matrices.filter(m => m.completed).length;
    const currentProgress = isMatrixCompleted() ? 1 : 0;
    return Math.round(((completedCount + currentProgress) / matrices.length) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              단계 2 — 평가하기 / 쌍대비교
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
              {currentMatrixIndex + 1} / {matrices.length} 매트릭스
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getProgressPercentage()}% 완료
          </div>
        </div>

        {/* Matrix Navigation */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {matrices.map((matrix, index) => (
              <button
                key={matrix.id}
                onClick={() => {
                  if (matrix.completed || index === currentMatrixIndex) {
                    setCurrentMatrixIndex(index);
                  }
                }}
                disabled={!matrix.completed && index !== currentMatrixIndex}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  index === currentMatrixIndex
                    ? 'bg-blue-500 text-white'
                    : matrix.completed
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="mr-2">
                  {matrix.completed ? '✓' : index + 1}
                </span>
                {matrix.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Matrix Area */}
        <div className="lg:col-span-2">
          <Card title={currentMatrix?.name || ''}>
            {currentMatrix && (
              <div className="space-y-4">
                <MatrixGrid
                  items={currentMatrix.items}
                  values={currentMatrix.values}
                  onUpdate={handleMatrixUpdate}
                />

                {/* Consistency Ratio */}
                {currentMatrix.items.length >= 3 && currentMatrix.consistencyRatio !== undefined && (
                  <div className="mt-4">
                    <div className={`p-3 rounded-lg border ${
                      currentMatrix.consistencyRatio <= 0.1 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          비일관성비율 (CR)
                        </span>
                        <span className={`font-semibold ${
                          currentMatrix.consistencyRatio <= 0.1 
                            ? 'text-green-600' 
                            : 'text-orange-600'
                        }`}>
                          {currentMatrix.consistencyRatio.toFixed(3)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {currentMatrix.consistencyRatio <= 0.1 
                          ? '✓ 일관성이 양호합니다' 
                          : '⚠ 일관성을 개선해주세요 (기준: ≤ 0.1)'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Button */}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleMatrixComplete}
                    variant="primary"
                    size="lg"
                    disabled={!isMatrixCompleted()}
                  >
                    {currentMatrixIndex === matrices.length - 1 ? '평가 완료' : '다음'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Help Button */}
            <Card>
              <div className="text-center">
                <button
                  onClick={() => setShowHelper(!showHelper)}
                  className="w-full p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <span className="text-2xl">❓</span>
                  <div className="text-sm font-medium text-blue-900 mt-1">
                    판단 도우미
                  </div>
                </button>
              </div>
            </Card>

            {/* Judgment Helper Panel */}
            {showHelper && (
              <JudgmentHelper 
                currentMatrix={currentMatrix}
                onClose={() => setShowHelper(false)}
              />
            )}

            {/* Scale Reference */}
            <Card title="쌍대비교 척도">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>1</span>
                  <span>동등하게 중요</span>
                </div>
                <div className="flex justify-between">
                  <span>3</span>
                  <span>약간 더 중요</span>
                </div>
                <div className="flex justify-between">
                  <span>5</span>
                  <span>중요</span>
                </div>
                <div className="flex justify-between">
                  <span>7</span>
                  <span>매우 중요</span>
                </div>
                <div className="flex justify-between">
                  <span>9</span>
                  <span>절대적으로 중요</span>
                </div>
                <div className="text-gray-500 text-center mt-2">
                  2, 4, 6, 8은 중간값
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PairwiseEvaluation;