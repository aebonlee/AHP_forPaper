/**
 * 고급 민감도 분석 컴포넌트
 * I MAKE IT 분석을 기반으로 구현된 종합적인 민감도, 파레토, 강건성 분석
 * - 실시간 민감도 분석
 * - 파레토 프론티어 분석
 * - 토네이도 차트
 * - Google Charts 통합
 */

import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

// Google Charts 타입 정의
declare const google: any;

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

// 파레토 분석 관련 인터페이스
interface ParetoPoint {
  alternative: string;
  criteria: { [criterion: string]: number };
  isDominated: boolean;
  dominates: string[];
  efficiency: number;
}

interface ParetoAnalysis {
  paretoFrontier: ParetoPoint[];
  dominated: ParetoPoint[];
  efficiencyScores: { [alternative: string]: number };
  tradeoffAnalysis: {
    criterionPair: [string, string];
    tradeoffStrength: number;
    alternatives: string[];
  }[];
}

// 확장된 민감도 결과
interface ExtendedSensitivityResult {
  criterion: string;
  originalWeight: number;
  alternatives: {
    [alternative: string]: {
      baseScore: number;
      sensitivityRange: { min: number; max: number; };
      rankStability: 'stable' | 'moderate' | 'volatile';
      criticalThreshold?: number;
    };
  };
  overallImpact: 'high' | 'medium' | 'low';
  recommendations: string[];
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
  // 탭 상태
  const [activeTab, setActiveTab] = useState<'sensitivity' | 'pareto' | 'tornado' | 'robustness'>('sensitivity');
  
  // 기존 민감도 분석 상태
  const [selectedCriterion, setSelectedCriterion] = useState<string>('');
  const [weightAdjustments, setWeightAdjustments] = useState<WeightAdjustment[]>([]);
  const [baselineRanking, setBaselineRanking] = useState<AlternativeScore[]>([]);
  const [adjustedRanking, setAdjustedRanking] = useState<AlternativeScore[]>([]);
  const [rankChanges, setRankChanges] = useState<RankChange[]>([]);
  const [stabilityIndex, setStabilityIndex] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visualizationData, setVisualizationData] = useState<any[]>([]);
  
  // 새로운 고급 분석 상태
  const [extendedSensitivityResults, setExtendedSensitivityResults] = useState<ExtendedSensitivityResult[]>([]);
  const [paretoAnalysis, setParetoAnalysis] = useState<ParetoAnalysis | null>(null);
  const [sensitivityRange, setSensitivityRange] = useState(20); // ±20%

  // 최상위 기준들만 필터링 (레벨 1)
  const topLevelCriteria = criteriaHierarchy.filter(c => c.level === 1);

  useEffect(() => {
    if (alternativeScores.length > 0) {
      const sorted = [...alternativeScores].sort((a, b) => b.totalScore - a.totalScore);
      setBaselineRanking(sorted);
      setAdjustedRanking(sorted);
      
      // 고급 분석 실행
      performExtendedAnalysis();
    }
  }, [alternativeScores]);

  // Google Charts 초기화
  useEffect(() => {
    const loadGoogleCharts = () => {
      if (typeof google !== 'undefined' && google.charts) {
        google.charts.load('current', { 
          packages: ['corechart', 'scatter', 'bar', 'table'],
          language: 'ko'
        });
        google.charts.setOnLoadCallback(initializeCharts);
      } else {
        // Google Charts 스크립트 로드
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          google.charts.load('current', { 
            packages: ['corechart', 'scatter', 'bar', 'table'],
            language: 'ko'
          });
          google.charts.setOnLoadCallback(initializeCharts);
        };
        document.head.appendChild(script);
      }
    };

    loadGoogleCharts();
  }, []);

  const initializeCharts = useCallback(() => {
    if (activeTab === 'sensitivity' && extendedSensitivityResults.length > 0) {
      drawSensitivityChart();
    } else if (activeTab === 'pareto' && paretoAnalysis) {
      drawParetoChart();
    } else if (activeTab === 'tornado' && selectedCriterion) {
      drawTornadoChart();
    }
  }, [activeTab, extendedSensitivityResults, paretoAnalysis, selectedCriterion]);

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

  // 고급 분석 수행
  const performExtendedAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // 확장된 민감도 분석
      const extendedResults = await performExtendedSensitivityAnalysis();
      setExtendedSensitivityResults(extendedResults);

      // 파레토 분석
      const paretoResults = await performParetoAnalysis();
      setParetoAnalysis(paretoResults);
      
    } catch (error) {
      console.error('Extended analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [alternativeScores, criteriaHierarchy, sensitivityRange]);

  // 확장된 민감도 분석
  const performExtendedSensitivityAnalysis = async (): Promise<ExtendedSensitivityResult[]> => {
    const results: ExtendedSensitivityResult[] = [];
    const rangePercent = sensitivityRange / 100;

    for (const criterion of topLevelCriteria) {
      const sensitivityResult: ExtendedSensitivityResult = {
        criterion: criterion.name,
        originalWeight: criterion.localWeight,
        alternatives: {},
        overallImpact: 'low',
        recommendations: []
      };

      let maxImpact = 0;

      // 각 대안에 대해 민감도 계산
      for (const alternative of alternativeScores) {
        const baseScore = alternative.totalScore;
        const scores: number[] = [];

        // 가중치 변화 시나리오 (-range% ~ +range%)
        for (let i = -rangePercent; i <= rangePercent; i += rangePercent / 10) {
          const adjustedWeight = Math.max(0, Math.min(1, criterion.localWeight * (1 + i)));
          const adjustedScore = calculateAdjustedScore(alternative, criterion.id, adjustedWeight);
          scores.push(adjustedScore);
        }

        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        const impact = maxScore - minScore;
        
        maxImpact = Math.max(maxImpact, impact);

        // 순위 안정성 분석
        let rankStability: 'stable' | 'moderate' | 'volatile' = 'stable';
        if (impact > 0.1) rankStability = 'volatile';
        else if (impact > 0.05) rankStability = 'moderate';

        sensitivityResult.alternatives[alternative.alternativeName] = {
          baseScore,
          sensitivityRange: { min: minScore, max: maxScore },
          rankStability,
          criticalThreshold: findCriticalThreshold(alternative, criterion)
        };
      }

      // 전체 영향도 분류
      if (maxImpact > 0.15) {
        sensitivityResult.overallImpact = 'high';
        sensitivityResult.recommendations.push(
          `${criterion.name} 기준의 가중치 변화가 결과에 큰 영향을 미칩니다. 신중한 가중치 설정이 필요합니다.`
        );
      } else if (maxImpact > 0.08) {
        sensitivityResult.overallImpact = 'medium';
        sensitivityResult.recommendations.push(
          `${criterion.name} 기준의 영향도가 중간 수준입니다. 추가 검토를 권장합니다.`
        );
      } else {
        sensitivityResult.overallImpact = 'low';
        sensitivityResult.recommendations.push(
          `${criterion.name} 기준의 가중치는 안정적입니다.`
        );
      }

      results.push(sensitivityResult);
    }

    return results;
  };

  // 조정된 점수 계산
  const calculateAdjustedScore = (
    alternative: AlternativeScore,
    criterionId: string,
    newWeight: number
  ): number => {
    const criterion = criteriaHierarchy.find(c => c.id === criterionId);
    if (!criterion) return alternative.totalScore;

    const criterionScore = alternative.scoresByCriterion[criterionId] || 0;
    const originalContribution = criterionScore * criterion.globalWeight;
    const newContribution = criterionScore * newWeight;
    
    return alternative.totalScore - originalContribution + newContribution;
  };

  // 임계값 찾기
  const findCriticalThreshold = (
    alternative: AlternativeScore,
    criterion: CriterionNode
  ): number | undefined => {
    // 순위가 변하는 임계 가중치 찾기 (간단한 구현)
    const baseScore = alternative.totalScore;
    let threshold: number | undefined;

    // 이진 탐색으로 임계값 찾기
    let low = 0;
    let high = 1;
    const epsilon = 0.001;

    while (high - low > epsilon) {
      const mid = (low + high) / 2;
      const adjustedScore = calculateAdjustedScore(alternative, criterion.id, mid);
      
      if (Math.abs(adjustedScore - baseScore) > 0.05) {
        threshold = mid;
        high = mid;
      } else {
        low = mid;
      }
    }

    return threshold;
  };

  // 파레토 분석
  const performParetoAnalysis = async (): Promise<ParetoAnalysis> => {
    const paretoPoints: ParetoPoint[] = [];

    // 각 대안을 파레토 포인트로 변환
    alternativeScores.forEach(alternative => {
      const point: ParetoPoint = {
        alternative: alternative.alternativeName,
        criteria: alternative.scoresByCriterion,
        isDominated: false,
        dominates: [],
        efficiency: 0
      };
      paretoPoints.push(point);
    });

    // 지배관계 분석
    paretoPoints.forEach(point1 => {
      paretoPoints.forEach(point2 => {
        if (point1.alternative !== point2.alternative) {
          if (dominates(point1, point2)) {
            point1.dominates.push(point2.alternative);
            point2.isDominated = true;
          }
        }
      });
    });

    // 파레토 프론티어와 지배당하는 점들 분리
    const paretoFrontier = paretoPoints.filter(p => !p.isDominated);
    const dominated = paretoPoints.filter(p => p.isDominated);

    // 효율성 점수 계산
    const efficiencyScores: { [alternative: string]: number } = {};
    paretoPoints.forEach(point => {
      const efficiency = calculateEfficiency(point, paretoFrontier);
      point.efficiency = efficiency;
      efficiencyScores[point.alternative] = efficiency;
    });

    // 트레이드오프 분석
    const tradeoffAnalysis = analyzeTradeoffs(paretoFrontier);

    return {
      paretoFrontier,
      dominated,
      efficiencyScores,
      tradeoffAnalysis
    };
  };

  // 지배 관계 확인
  const dominates = (point1: ParetoPoint, point2: ParetoPoint): boolean => {
    const criteria = Object.keys(point1.criteria);
    let atLeastOneBetter = false;

    for (const criterion of criteria) {
      const score1 = point1.criteria[criterion] || 0;
      const score2 = point2.criteria[criterion] || 0;

      if (score1 < score2) {
        return false; // point1이 point2보다 나쁜 기준이 있음
      }
      if (score1 > score2) {
        atLeastOneBetter = true;
      }
    }

    return atLeastOneBetter;
  };

  // 효율성 계산
  const calculateEfficiency = (point: ParetoPoint, frontier: ParetoPoint[]): number => {
    if (frontier.includes(point)) {
      return 1.0; // 파레토 프론티어에 있으면 100% 효율적
    }

    // 프론티어까지의 최소 거리 계산
    const criteria = Object.keys(point.criteria);
    let maxEfficiency = 0;

    frontier.forEach(frontierPoint => {
      let efficiency = 1;
      criteria.forEach(criterion => {
        const pointScore = point.criteria[criterion] || 0;
        const frontierScore = frontierPoint.criteria[criterion] || 0;
        if (frontierScore > 0) {
          efficiency = Math.min(efficiency, pointScore / frontierScore);
        }
      });
      maxEfficiency = Math.max(maxEfficiency, efficiency);
    });

    return maxEfficiency;
  };

  // 트레이드오프 분석
  const analyzeTradeoffs = (frontier: ParetoPoint[]) => {
    const tradeoffs: {
      criterionPair: [string, string];
      tradeoffStrength: number;
      alternatives: string[];
    }[] = [];

    if (frontier.length < 2) return tradeoffs;

    const criteria = Object.keys(frontier[0].criteria);
    
    // 기준 쌍별 트레이드오프 분석
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        const criterion1 = criteria[i];
        const criterion2 = criteria[j];

        // 상관관계 계산
        const scores1 = frontier.map(p => p.criteria[criterion1] || 0);
        const scores2 = frontier.map(p => p.criteria[criterion2] || 0);
        const correlation = calculateCorrelation(scores1, scores2);

        // 음의 상관관계가 있으면 트레이드오프
        if (correlation < -0.3) {
          tradeoffs.push({
            criterionPair: [criterion1, criterion2],
            tradeoffStrength: Math.abs(correlation),
            alternatives: frontier.map(p => p.alternative)
          });
        }
      }
    }

    return tradeoffs;
  };

  // 상관관계 계산
  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Google Charts 그리기 함수들
  const drawSensitivityChart = () => {
    if (!google || !google.visualization || extendedSensitivityResults.length === 0) return;

    const data = new google.visualization.DataTable();
    data.addColumn('string', '기준');
    
    alternativeScores.forEach(alt => {
      data.addColumn('number', alt.alternativeName);
    });

    extendedSensitivityResults.forEach(result => {
      const row: any[] = [result.criterion];
      alternativeScores.forEach(alt => {
        const altResult = result.alternatives[alt.alternativeName];
        if (altResult) {
          const impact = altResult.sensitivityRange.max - altResult.sensitivityRange.min;
          row.push(impact * 100); // 퍼센트로 변환
        } else {
          row.push(0);
        }
      });
      data.addRow(row);
    });

    const options = {
      title: '기준별 민감도 분석',
      titleTextStyle: { fontSize: 16, bold: true },
      hAxis: { title: '평가 기준' },
      vAxis: { title: '민감도 (%)', minValue: 0 },
      legend: { position: 'top', maxLines: 3 },
      colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
      animation: { startup: true, duration: 1000, easing: 'out' }
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('advanced-sensitivity-chart'));
    chart.draw(data, options);
  };

  const drawParetoChart = () => {
    if (!google || !google.visualization || !paretoAnalysis || paretoAnalysis.paretoFrontier.length === 0) return;

    const data = new google.visualization.DataTable();
    const criteria = Object.keys(paretoAnalysis.paretoFrontier[0].criteria);
    
    if (criteria.length < 2) return;

    data.addColumn('number', criteria[0]);
    data.addColumn('number', criteria[1]);
    data.addColumn('string', '대안');
    data.addColumn('string', '상태');

    // 파레토 프론티어 점들
    paretoAnalysis.paretoFrontier.forEach(point => {
      data.addRow([
        point.criteria[criteria[0]] || 0,
        point.criteria[criteria[1]] || 0,
        point.alternative,
        '파레토 최적'
      ]);
    });

    // 지배당하는 점들
    paretoAnalysis.dominated.forEach(point => {
      data.addRow([
        point.criteria[criteria[0]] || 0,
        point.criteria[criteria[1]] || 0,
        point.alternative,
        '지배당함'
      ]);
    });

    const options = {
      title: `파레토 분석: ${criteria[0]} vs ${criteria[1]}`,
      titleTextStyle: { fontSize: 16, bold: true },
      hAxis: { title: criteria[0] },
      vAxis: { title: criteria[1] },
      legend: { position: 'right' },
      pointSize: 8,
      colors: ['#2ca02c', '#d62728'],
      series: {
        0: { pointShape: 'circle' },
        1: { pointShape: 'triangle' }
      }
    };

    const chart = new google.visualization.ScatterChart(document.getElementById('pareto-chart'));
    chart.draw(data, options);
  };

  const drawTornadoChart = () => {
    if (!google || !google.visualization || extendedSensitivityResults.length === 0 || !selectedCriterion) return;

    const result = extendedSensitivityResults.find(r => r.criterion === selectedCriterion);
    if (!result) return;

    const data = new google.visualization.DataTable();
    data.addColumn('string', '대안');
    data.addColumn('number', '하한');
    data.addColumn('number', '상한');

    Object.entries(result.alternatives).forEach(([alternative, altResult]) => {
      data.addRow([
        alternative,
        altResult.sensitivityRange.min * 100,
        altResult.sensitivityRange.max * 100
      ]);
    });

    const options = {
      title: `토네이도 차트: ${selectedCriterion}`,
      titleTextStyle: { fontSize: 16, bold: true },
      hAxis: { title: '점수 범위 (%)' },
      vAxis: { title: '대안' },
      legend: { position: 'none' },
      orientation: 'vertical',
      colors: ['#1f77b4']
    };

    const chart = new google.visualization.CandlestickChart(document.getElementById('tornado-chart'));
    chart.draw(data, options);
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
      extendedResults: extendedSensitivityResults,
      paretoAnalysis: paretoAnalysis,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(snapshotData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `advanced_sensitivity_analysis_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 탭별 렌더링 함수들
  const renderSensitivityTab = () => (
    <div className="space-y-6">
      {/* 기존 실시간 민감도 분석 */}
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

      {/* 고급 민감도 분석 결과 */}
      {extendedSensitivityResults.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="민감도 설정">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    분석 범위: ±{sensitivityRange}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={sensitivityRange}
                    onChange={(e) => setSensitivityRange(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <Button 
                  variant="primary" 
                  onClick={performExtendedAnalysis}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? '분석 중...' : '분석 실행'}
                </Button>
              </div>
            </Card>

            <Card title="전체 영향도">
              <div className="space-y-2">
                {extendedSensitivityResults.map(result => (
                  <div key={result.criterion} className="flex justify-between items-center">
                    <span className="text-sm">{result.criterion}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.overallImpact === 'high' ? 'bg-red-100 text-red-800' :
                      result.overallImpact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {result.overallImpact === 'high' ? '높음' :
                       result.overallImpact === 'medium' ? '중간' : '낮음'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="안정성 분석">
              <div className="space-y-2">
                {alternativeScores.map(alt => {
                  const volatileCount = extendedSensitivityResults.filter(r => 
                    r.alternatives[alt.alternativeName]?.rankStability === 'volatile'
                  ).length;
                  const stability = volatileCount > extendedSensitivityResults.length / 2 ? '불안정' :
                                  volatileCount > 0 ? '보통' : '안정';
                  
                  return (
                    <div key={alt.alternativeName} className="flex justify-between items-center">
                      <span className="text-sm">{alt.alternativeName}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        stability === '불안정' ? 'bg-red-100 text-red-800' :
                        stability === '보통' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {stability}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card title="고급 민감도 차트">
            <div id="advanced-sensitivity-chart" className="w-full h-96"></div>
          </Card>

          <Card title="권장사항">
            <div className="space-y-3">
              {extendedSensitivityResults.map(result => (
                <div key={result.criterion} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">{result.criterion}</h4>
                  <ul className="text-sm text-gray-600 mt-1">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* 기존 순위 변화 결과 */}
      {adjustedRanking.length > 0 && !isAnalyzing && (
        <Card title="실시간 순위 변화 분석">
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
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={captureSnapshot}>
                  📸 스냅샷 캡처
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setWeightAdjustments([]);
                    setAdjustedRanking(baselineRanking);
                    setRankChanges([]);
                    setStabilityIndex(1);
                  }}
                >
                  초기화
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderParetoTab = () => (
    <div className="space-y-6">
      {paretoAnalysis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="파레토 프론티어">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 mb-2">
                  최적 솔루션: {paretoAnalysis.paretoFrontier.length}개
                </div>
                {paretoAnalysis.paretoFrontier.map(point => (
                  <div key={point.alternative} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{point.alternative}</span>
                    <span className="text-xs text-green-600">최적</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="효율성 점수">
              <div className="space-y-2">
                {Object.entries(paretoAnalysis.efficiencyScores)
                  .sort(([,a], [,b]) => b - a)
                  .map(([alternative, efficiency]) => (
                    <div key={alternative} className="flex justify-between items-center">
                      <span className="text-sm">{alternative}</span>
                      <span className="text-sm font-medium">
                        {(efficiency * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </Card>

            <Card title="트레이드오프">
              <div className="space-y-2">
                {paretoAnalysis.tradeoffAnalysis.length > 0 ? (
                  paretoAnalysis.tradeoffAnalysis.map((tradeoff, index) => (
                    <div key={index} className="text-xs">
                      <div className="font-medium">
                        {tradeoff.criterionPair[0]} ↔ {tradeoff.criterionPair[1]}
                      </div>
                      <div className="text-gray-600">
                        강도: {(tradeoff.tradeoffStrength * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">트레이드오프 없음</div>
                )}
              </div>
            </Card>
          </div>

          <Card title="파레토 분석 차트">
            <div id="pareto-chart" className="w-full h-96"></div>
          </Card>
        </>
      )}
    </div>
  );

  const renderTornadoTab = () => (
    <div className="space-y-6">
      <Card title="토네이도 차트 설정">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">기준 선택:</label>
          <select
            value={selectedCriterion}
            onChange={(e) => setSelectedCriterion(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">기준을 선택하세요</option>
            {topLevelCriteria.map(criterion => (
              <option key={criterion.id} value={criterion.name}>
                {criterion.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedCriterion && (
        <Card title={`토네이도 차트: ${selectedCriterion}`}>
          <div id="tornado-chart" className="w-full h-96"></div>
        </Card>
      )}
    </div>
  );

  const renderRobustnessTab = () => (
    <div className="space-y-6">
      <Card title="강건성 분석">
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">
            불확실한 환경에서의 의사결정 강건성을 분석합니다
          </div>
          <Button variant="primary">강건성 분석 실행</Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">고급 민감도 및 파레토 분석</h2>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={captureSnapshot}>
            📸 스냅샷 저장
          </Button>
          <Button variant="primary" onClick={performExtendedAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? '분석 중...' : '전체 분석 재실행'}
          </Button>
          {onClose && (
            <Button variant="secondary" onClick={onClose}>
              닫기
            </Button>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'sensitivity', name: '민감도 분석', icon: '📊' },
            { id: 'pareto', name: '파레토 분석', icon: '🎯' },
            { id: 'tornado', name: '토네이도 차트', icon: '🌪️' },
            { id: 'robustness', name: '강건성 분석', icon: '🛡️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'sensitivity' && renderSensitivityTab()}
      {activeTab === 'pareto' && renderParetoTab()}
      {activeTab === 'tornado' && renderTornadoTab()}
      {activeTab === 'robustness' && renderRobustnessTab()}
    </div>
  );
};

export default SensitivityAnalysis;