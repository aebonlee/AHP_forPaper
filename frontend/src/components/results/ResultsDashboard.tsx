import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../common/Card';
import { 
  calculateAHP, 
  buildComparisonMatrix, 
  calculateHierarchicalAHP,
  getConsistencyLevel,
  getConsistencyColor,
  type HierarchicalAHPInput,
  type AHPResult 
} from '../../utils/ahpCalculator';

interface Criterion {
  id: string;
  name: string;
  level: number;
  children?: Criterion[];
}

interface Alternative {
  id: string;
  name: string;
}

interface Comparison {
  criterion1_id?: string;
  criterion2_id?: string;
  alternative1_id?: string;
  alternative2_id?: string;
  value: number;
}

interface ResultsDashboardProps {
  projectId: string;
  projectTitle: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'];

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ projectId, projectTitle }) => {
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [criteriaResults, setCriteriaResults] = useState<{ [key: string]: AHPResult }>({});
  const [alternativeResults, setAlternativeResults] = useState<{ [key: string]: AHPResult }>({});
  const [finalResults, setFinalResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://ahp-forpaper.onrender.com';

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      // Fetch criteria
      const criteriaResponse = await fetch(`${API_BASE_URL}/api/criteria/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!criteriaResponse.ok) throw new Error('Failed to fetch criteria');
      const criteriaData = await criteriaResponse.json();
      const criteriaList = criteriaData.criteria || [];

      // Fetch alternatives
      const alternativesResponse = await fetch(`${API_BASE_URL}/api/alternatives/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!alternativesResponse.ok) throw new Error('Failed to fetch alternatives');
      const alternativesData = await alternativesResponse.json();
      const alternativesList = alternativesData.alternatives || [];

      // Fetch all comparisons
      const comparisonsResponse = await fetch(`${API_BASE_URL}/api/comparisons/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!comparisonsResponse.ok) throw new Error('Failed to fetch comparisons');
      const comparisonsData = await comparisonsResponse.json();
      const comparisonsList = comparisonsData.comparisons || [];

      setCriteria(criteriaList);
      setAlternatives(alternativesList);
      setComparisons(comparisonsList);

    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const calculateResults = useCallback(() => {
    try {
      if (criteria.length === 0 || alternatives.length === 0) return;

      const newCriteriaResults: { [key: string]: AHPResult } = {};
      const newAlternativeResults: { [key: string]: AHPResult } = {};

      // Calculate criteria weights (top-level criteria only)
      const topLevelCriteria = criteria.filter(c => c.level === 1);
      
      if (topLevelCriteria.length > 0) {
        const criteriaComparisons = comparisons.filter(c => c.criterion1_id && c.criterion2_id);
        
        if (criteriaComparisons.length > 0) {
          const criteriaMatrix = buildComparisonMatrix(
            topLevelCriteria,
            criteriaComparisons.map(c => ({
              element1_id: c.criterion1_id!,
              element2_id: c.criterion2_id!,
              value: c.value
            }))
          );

          const criteriaResult = calculateAHP(criteriaMatrix);
          newCriteriaResults['main'] = criteriaResult;
        }
      }

      // Calculate alternative scores for each criterion
      const criteriaWeights: { [key: string]: number } = {};
      const alternativeScores: { [criterionId: string]: { [alternativeId: string]: number } } = {};

      topLevelCriteria.forEach((criterion, index) => {
        // Set criterion weight
        const mainResult = newCriteriaResults['main'];
        criteriaWeights[criterion.id] = mainResult?.priorities[index] || 1 / topLevelCriteria.length;

        // Calculate alternative scores for this criterion
        const alternativeComparisons = comparisons.filter(c => 
          c.alternative1_id && 
          c.alternative2_id && 
          // This would need criterion_id field in comparison data to properly filter
          true // For now, assume all alternative comparisons are for each criterion
        );

        if (alternativeComparisons.length > 0 && alternatives.length > 0) {
          const alternativeMatrix = buildComparisonMatrix(
            alternatives,
            alternativeComparisons.map(c => ({
              element1_id: c.alternative1_id!,
              element2_id: c.alternative2_id!,
              value: c.value
            }))
          );

          const alternativeResult = calculateAHP(alternativeMatrix);
          newAlternativeResults[criterion.id] = alternativeResult;

          // Store scores for hierarchical calculation
          alternativeScores[criterion.id] = {};
          alternatives.forEach((alt, altIndex) => {
            alternativeScores[criterion.id][alt.id] = alternativeResult.priorities[altIndex] || 0;
          });
        }
      });

      // Calculate final hierarchical results
      if (Object.keys(criteriaWeights).length > 0 && Object.keys(alternativeScores).length > 0) {
        const hierarchicalInput: HierarchicalAHPInput = {
          criteriaWeights,
          alternativeScores,
          alternatives
        };

        const hierarchicalResult = calculateHierarchicalAHP(hierarchicalInput);
        setFinalResults(hierarchicalResult);
      }

      setCriteriaResults(newCriteriaResults);
      setAlternativeResults(newAlternativeResults);

    } catch (error) {
      console.error('Failed to calculate results:', error);
      setError('계산 중 오류가 발생했습니다.');
    }
  }, [criteria, alternatives, comparisons]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading && criteria.length > 0 && alternatives.length > 0) {
      calculateResults();
    }
  }, [loading, criteria, alternatives, comparisons, calculateResults]);

  if (loading) {
    return (
      <Card title="결과 대시보드">
        <div className="text-center py-8">계산 중...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="결과 대시보드">
        <div className="text-center py-8 text-red-600">{error}</div>
      </Card>
    );
  }

  if (!finalResults) {
    return (
      <Card title="결과 대시보드">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">결과를 계산할 수 있는 충분한 데이터가 없습니다.</p>
          <p className="text-sm text-gray-500">
            모든 기준과 대안에 대한 쌍대비교가 완료되어야 합니다.
          </p>
        </div>
      </Card>
    );
  }

  const mainCriteriaResult = criteriaResults['main'];
  const topLevelCriteria = criteria.filter(c => c.level === 1);

  // Prepare chart data
  const rankingData = finalResults.ranking.map((item: any) => ({
    name: item.alternativeName,
    score: (item.score * 100).toFixed(1),
    fullScore: item.score
  }));

  const criteriaWeightData = topLevelCriteria.map((criterion, index) => ({
    name: criterion.name,
    weight: mainCriteriaResult ? (mainCriteriaResult.priorities[index] * 100).toFixed(1) : 0,
    fullWeight: mainCriteriaResult ? mainCriteriaResult.priorities[index] : 0
  }));

  return (
    <div className="space-y-6">
      <Card title={`AHP 분석 결과: ${projectTitle}`}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">📊 최종 순위</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {finalResults.ranking.map((item: any, index: number) => (
              <div key={item.alternativeId} className={`p-3 rounded-lg border-2 ${
                index === 0 ? 'border-yellow-400 bg-yellow-50' :
                index === 1 ? 'border-gray-400 bg-gray-50' :
                index === 2 ? 'border-amber-600 bg-amber-50' :
                'border-gray-200 bg-white'
              }`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-600' :
                    index === 1 ? 'text-gray-600' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-500'
                  }`}>
                    #{item.rank}
                  </div>
                  <div className="font-medium text-gray-800">{item.alternativeName}</div>
                  <div className="text-sm text-gray-600">
                    {(item.score * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="대안별 점수">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rankingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, '점수']} />
              <Bar dataKey="score" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="기준별 가중치">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={criteriaWeightData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, weight}) => `${name}: ${weight}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="weight"
              >
                {criteriaWeightData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, '가중치']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="일관성 분석">
        <div className="space-y-4">
          {mainCriteriaResult && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium mb-3">기준 비교 일관성</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {mainCriteriaResult.consistencyRatio.toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-600">일관성 비율 (CR)</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold text-${getConsistencyColor(mainCriteriaResult.consistencyRatio)}-600`}>
                    {getConsistencyLevel(mainCriteriaResult.consistencyRatio)}
                  </div>
                  <div className="text-sm text-gray-600">일관성 수준</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    mainCriteriaResult.isConsistent ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {mainCriteriaResult.isConsistent ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {mainCriteriaResult.isConsistent ? '일관성 있음' : '일관성 부족'}
                  </div>
                </div>
              </div>
              {!mainCriteriaResult.isConsistent && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ 일관성 비율이 0.1을 초과합니다. 쌍대비교를 다시 검토하시기 바랍니다.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium mb-2">일관성 지표 설명</h5>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• <strong>CR &le; 0.05:</strong> 매우 일관성 있음 (Excellent)</p>
              <p>• <strong>0.05 &lt; CR &le; 0.08:</strong> 일관성 양호 (Good)</p>
              <p>• <strong>0.08 &lt; CR &le; 0.10:</strong> 허용 가능한 수준 (Acceptable)</p>
              <p>• <strong>CR &gt; 0.10:</strong> 일관성 부족 (Poor) - 재검토 필요</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="상세 분석">
        <div className="space-y-6">
          <div>
            <h5 className="font-medium mb-3">기준별 가중치 상세</h5>
            <div className="space-y-2">
              {topLevelCriteria.map((criterion, index) => (
                <div key={criterion.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{criterion.name}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">
                      {mainCriteriaResult ? (mainCriteriaResult.priorities[index] * 100).toFixed(1) : 0}%
                    </span>
                    <div className="text-xs text-gray-500">
                      (우선순위: {mainCriteriaResult ? mainCriteriaResult.priorities[index].toFixed(4) : 0})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-3">대안별 상세 점수</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">대안</th>
                    {topLevelCriteria.map(criterion => (
                      <th key={criterion.id} className="border p-2 text-center">
                        {criterion.name}
                      </th>
                    ))}
                    <th className="border p-2 text-center">최종 점수</th>
                    <th className="border p-2 text-center">순위</th>
                  </tr>
                </thead>
                <tbody>
                  {finalResults.ranking.map((item: any) => (
                    <tr key={item.alternativeId}>
                      <td className="border p-2 font-medium">{item.alternativeName}</td>
                      {topLevelCriteria.map(criterion => (
                        <td key={criterion.id} className="border p-2 text-center">
                          {alternativeResults[criterion.id] ? 
                            (alternativeResults[criterion.id].priorities[
                              alternatives.findIndex(alt => alt.id === item.alternativeId)
                            ] * 100).toFixed(1) + '%' : 
                            '-'
                          }
                        </td>
                      ))}
                      <td className="border p-2 text-center font-bold text-blue-600">
                        {(item.score * 100).toFixed(1)}%
                      </td>
                      <td className="border p-2 text-center font-bold">
                        #{item.rank}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResultsDashboard;