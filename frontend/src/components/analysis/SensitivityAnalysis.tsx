/**
 * 실시간 민감도 분석 컴포넌트
 * 상위기준 가중치 변경에 따른 대안 순위 변화를 실시간으로 분석
 */

import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';

interface CriterionNode {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
  localWeight: number;
  globalWeight: number;
  children: CriterionNode[];
}

interface AlternativeScore {
  alternativeId: string;
  alternativeName: string;
  scoresByCriterion: { [criterionId: string]: number };
  totalScore: number;
  rank: number;
}

interface WeightAdjustment {
  criterionId: string;
  originalWeight: number;
  newWeight: number;
}

interface RankChange {
  alternativeId: string;
  alternativeName: string;
  originalRank: number;
  newRank: number;
  rankDelta: number;
  scoreChange: number;
}

interface SensitivityAnalysisProps {
  projectId: string;
  criteriaHierarchy: CriterionNode[];
  alternativeScores: AlternativeScore[];
  onClose?: () => void;
}

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({
  projectId,
  criteriaHierarchy,
  alternativeScores,
  onClose
}) => {
  const [selectedCriterion, setSelectedCriterion] = useState<string>('');
  const [weightAdjustments, setWeightAdjustments] = useState<WeightAdjustment[]>([]);
  const [baselineRanking, setBaselineRanking] = useState<AlternativeScore[]>([]);
  const [adjustedRanking, setAdjustedRanking] = useState<AlternativeScore[]>([]);
  const [rankChanges, setRankChanges] = useState<RankChange[]>([]);
  const [stabilityIndex, setStabilityIndex] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visualizationData, setVisualizationData] = useState<any[]>([]);

  // 최상위 기준들만 필터링 (레벨 1)
  const topLevelCriteria = criteriaHierarchy.filter(c => c.level === 1);

  useEffect(() => {
    if (alternativeScores.length > 0) {
      const sorted = [...alternativeScores].sort((a, b) => b.totalScore - a.totalScore);
      setBaselineRanking(sorted);
      setAdjustedRanking(sorted);
    }
  }, [alternativeScores]);

  // 선택된 기준의 하위 기준들 가져오기
  const getSubCriteria = useCallback((criterionId: string): CriterionNode[] => {
    const findCriterion = (criteria: CriterionNode[], id: string): CriterionNode | null => {
      for (const criterion of criteria) {
        if (criterion.id === id) return criterion;
        if (criterion.children.length > 0) {
          const found = findCriterion(criterion.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const criterion = findCriterion(criteriaHierarchy, criterionId);
    return criterion?.children || [];
  }, [criteriaHierarchy]);

  // 가중치 조정 핸들러
  const handleWeightChange = useCallback((criterionId: string, newWeight: number) => {
    setWeightAdjustments(prev => {
      const existing = prev.find(adj => adj.criterionId === criterionId);
      const originalCriterion = criteriaHierarchy.find(c => c.id === criterionId);
      const originalWeight = originalCriterion?.localWeight || 0;

      if (existing) {
        return prev.map(adj => 
          adj.criterionId === criterionId 
            ? { ...adj, newWeight }
            : adj
        );
      } else {
        return [...prev, { criterionId, originalWeight, newWeight }];
      }
    });

    // 실시간 분석 수행
    performRealTimeAnalysis(criterionId, newWeight);
  }, [criteriaHierarchy]);

  // 실시간 민감도 분석 수행
  const performRealTimeAnalysis = useCallback(async (targetCriterionId: string, newWeight: number) => {
    setIsAnalyzing(true);
    
    try {
      // 간단한 클라이언트 사이드 계산 (데모용)
      // 실제로는 백엔드 API 호출
      const updatedScores = recalculateScores(targetCriterionId, newWeight);
      const newRanking = [...updatedScores].sort((a, b) => b.totalScore - a.totalScore)
        .map((alt, index) => ({ ...alt, rank: index + 1 }));
      
      setAdjustedRanking(newRanking);
      
      const changes = analyzeRankChanges(baselineRanking, newRanking);
      setRankChanges(changes);
      
      const stability = calculateStabilityIndex(changes);
      setStabilityIndex(stability);

      // 시각화 데이터 생성
      generateVisualizationData(targetCriterionId);
      
    } catch (error) {
      console.error('Sensitivity analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [baselineRanking]);

  // 점수 재계산 (간단한 구현)
  const recalculateScores = (targetCriterionId: string, newWeight: number): AlternativeScore[] => {
    return alternativeScores.map(alt => {
      let newTotalScore = alt.totalScore;
      
      // 대상 기준의 기여도 조정
      const targetScore = alt.scoresByCriterion[targetCriterionId] || 0;
      const originalCriterion = criteriaHierarchy.find(c => c.id === targetCriterionId);
      const originalWeight = originalCriterion?.globalWeight || 0;
      
      // 기존 기여도 제거하고 새로운 기여도 추가
      newTotalScore = newTotalScore - (targetScore * originalWeight) + (targetScore * newWeight);
      
      return {
        ...alt,
        totalScore: newTotalScore
      };
    });
  };

  // 순위 변화 분석
  const analyzeRankChanges = (baseline: AlternativeScore[], adjusted: AlternativeScore[]): RankChange[] => {
    const baselineMap = new Map(baseline.map((alt, index) => [alt.alternativeId, index + 1]));
    
    return adjusted.map((alt, newIndex) => {
      const originalRank = baselineMap.get(alt.alternativeId) || 0;
      const newRank = newIndex + 1;
      const originalScore = baseline.find(b => b.alternativeId === alt.alternativeId)?.totalScore || 0;
      
      return {
        alternativeId: alt.alternativeId,
        alternativeName: alt.alternativeName,
        originalRank,
        newRank,
        rankDelta: originalRank - newRank,
        scoreChange: alt.totalScore - originalScore
      };
    });
  };

  // 안정성 지수 계산
  const calculateStabilityIndex = (changes: RankChange[]): number => {
    if (changes.length === 0) return 1;
    
    const rankDeltas = changes.map(change => Math.abs(change.rankDelta));
    const averageDelta = rankDeltas.reduce((sum, delta) => sum + delta, 0) / rankDeltas.length;
    const maxPossibleDelta = changes.length - 1;
    
    return Math.max(0, 1 - (averageDelta / maxPossibleDelta));
  };

  // 시각화 데이터 생성
  const generateVisualizationData = (criterionId: string) => {
    const steps = 21;
    const data = [];
    
    for (let i = 0; i < steps; i++) {
      const weight = i / (steps - 1); // 0 to 1
      const scores = recalculateScores(criterionId, weight);
      const ranking = [...scores].sort((a, b) => b.totalScore - a.totalScore);
      
      data.push({
        weight: weight,
        rankings: ranking.map((alt, index) => ({
          alternativeId: alt.alternativeId,
          rank: index + 1,
          score: alt.totalScore
        }))
      });
    }
    
    setVisualizationData(data);
  };

  // 스냅샷 캡처
  const captureSnapshot = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    // 여기에 차트/그래프 캡처 로직 구현
    // 실제로는 Chart.js나 D3.js 등의 차트 라이브러리 사용
    
    // 간단한 텍스트 기반 스냅샷
    const snapshotData = {
      criterion: selectedCriterion,
      adjustments: weightAdjustments,
      ranking: adjustedRanking,
      stability: stabilityIndex,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(snapshotData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensitivity_analysis_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card title="실시간 민감도 분석">
        <div className="space-y-6">
          {/* 분석 대상 기준 선택 */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-800">분석 대상 상위기준 선택</h5>
            <select
              value={selectedCriterion}
              onChange={(e) => setSelectedCriterion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">기준을 선택하세요</option>
              {topLevelCriteria.map(criterion => (
                <option key={criterion.id} value={criterion.id}>
                  {criterion.name} (현재 가중치: {(criterion.localWeight * 100).toFixed(1)}%)
                </option>
              ))}
            </select>
          </div>

          {/* 가중치 조정 슬라이더 */}
          {selectedCriterion && (
            <div className="space-y-4">
              <h5 className="font-medium text-gray-800">하위 기준 가중치 조정</h5>
              {getSubCriteria(selectedCriterion).map(subCriterion => (
                <div key={subCriterion.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      {subCriterion.name}
                    </label>
                    <span className="text-sm text-gray-600">
                      {((weightAdjustments.find(adj => adj.criterionId === subCriterion.id)?.newWeight || subCriterion.localWeight) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={weightAdjustments.find(adj => adj.criterionId === subCriterion.id)?.newWeight || subCriterion.localWeight}
                    onChange={(e) => handleWeightChange(subCriterion.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 분석 결과 */}
          {isAnalyzing && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">실시간 분석 중...</p>
            </div>
          )}
        </div>
      </Card>

      {/* 순위 변화 결과 */}
      {adjustedRanking.length > 0 && !isAnalyzing && (
        <Card title="순위 변화 분석 결과">
          <div className="space-y-4">
            {/* 안정성 지수 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h6 className="font-medium text-blue-800">안정성 지수</h6>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    stabilityIndex > 0.8 ? 'text-green-600' : 
                    stabilityIndex > 0.6 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(stabilityIndex * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-600">
                    {stabilityIndex > 0.8 ? '매우 안정' : 
                     stabilityIndex > 0.6 ? '보통' : '불안정'}
                  </div>
                </div>
              </div>
            </div>

            {/* 순위 비교 테이블 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 기준 순위 */}
              <div>
                <h6 className="font-medium text-gray-800 mb-3">기준 순위</h6>
                <div className="space-y-2">
                  {baselineRanking.map((alt, index) => (
                    <div key={alt.alternativeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-gray-400 text-white text-sm font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-medium">{alt.alternativeName}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {alt.totalScore.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 조정된 순위 */}
              <div>
                <h6 className="font-medium text-gray-800 mb-3">조정된 순위</h6>
                <div className="space-y-2">
                  {adjustedRanking.map((alt, index) => {
                    const change = rankChanges.find(rc => rc.alternativeId === alt.alternativeId);
                    const rankDelta = change?.rankDelta || 0;
                    
                    return (
                      <div key={alt.alternativeId} className={`flex items-center justify-between p-3 rounded-lg ${
                        rankDelta > 0 ? 'bg-green-50 border border-green-200' :
                        rankDelta < 0 ? 'bg-red-50 border border-red-200' :
                        'bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <span className={`w-6 h-6 text-white text-sm font-bold rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-amber-600' :
                            'bg-gray-300'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="font-medium">{alt.alternativeName}</span>
                          {rankDelta !== 0 && (
                            <span className={`text-sm font-medium ${
                              rankDelta > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {rankDelta > 0 ? '↑' : '↓'} {Math.abs(rankDelta)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {alt.totalScore.toFixed(3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 주요 변화 요약 */}
            {rankChanges.some(rc => rc.rankDelta !== 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h6 className="font-medium text-yellow-800 mb-2">주요 순위 변화</h6>
                <div className="space-y-1">
                  {rankChanges
                    .filter(rc => rc.rankDelta !== 0)
                    .sort((a, b) => Math.abs(b.rankDelta) - Math.abs(a.rankDelta))
                    .slice(0, 3)
                    .map(change => (
                      <p key={change.alternativeId} className="text-sm text-yellow-700">
                        <strong>{change.alternativeName}</strong>: {change.originalRank}위 → {change.newRank}위 
                        ({change.rankDelta > 0 ? '+' : ''}{change.rankDelta})
                      </p>
                    ))}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={captureSnapshot}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                📸 스냅샷 캡처
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setWeightAdjustments([]);
                    setAdjustedRanking(baselineRanking);
                    setRankChanges([]);
                    setStabilityIndex(1);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  초기화
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    닫기
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SensitivityAnalysis;