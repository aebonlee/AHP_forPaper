export interface ComparisonMatrix {
  size: number;
  matrix: number[][];
  elementNames: string[];
  elementIds: string[];
}

export interface AHPResult {
  priorities: number[];
  consistencyRatio: number;
  isConsistent: boolean;
  eigenVector: number[];
  lambdaMax: number;
}

// Random Index for consistency calculation
const RANDOM_INDEX: { [key: number]: number } = {
  1: 0,
  2: 0,
  3: 0.52,
  4: 0.89,
  5: 1.11,
  6: 1.25,
  7: 1.35,
  8: 1.40,
  9: 1.45,
  10: 1.49,
  11: 1.52,
  12: 1.54,
  13: 1.56,
  14: 1.58,
  15: 1.59
};

/**
 * Power Method를 사용하여 주고유벡터(principal eigenvector)를 계산
 */
export function calculateEigenVector(matrix: number[][]): number[] {
  const n = matrix.length;
  if (n === 0) return [];
  
  // 초기 벡터 (모든 원소가 1/n)
  let vector = new Array(n).fill(1 / n);
  let prevVector = [...vector];
  
  const maxIterations = 1000;
  const tolerance = 1e-10;
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    prevVector = [...vector];
    
    // 매트릭스-벡터 곱셈
    for (let i = 0; i < n; i++) {
      vector[i] = 0;
      for (let j = 0; j < n; j++) {
        vector[i] += matrix[i][j] * prevVector[j];
      }
    }
    
    // 정규화
    const sum = vector.reduce((acc, val) => acc + val, 0);
    if (sum === 0) break;
    
    for (let i = 0; i < n; i++) {
      vector[i] /= sum;
    }
    
    // 수렴 체크
    let hasConverged = true;
    for (let i = 0; i < n; i++) {
      if (Math.abs(vector[i] - prevVector[i]) > tolerance) {
        hasConverged = false;
        break;
      }
    }
    
    if (hasConverged) break;
  }
  
  return vector;
}

/**
 * 최대 고유값(lambda max) 계산
 */
export function calculateLambdaMax(matrix: number[][], eigenVector: number[]): number {
  const n = matrix.length;
  let lambdaMax = 0;
  
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += matrix[i][j] * eigenVector[j];
    }
    if (eigenVector[i] !== 0) {
      lambdaMax += sum / eigenVector[i];
    }
  }
  
  return lambdaMax / n;
}

/**
 * 일관성 비율(Consistency Ratio) 계산
 */
export function calculateConsistencyRatio(lambdaMax: number, n: number): number {
  if (n <= 2) return 0;
  
  const consistencyIndex = (lambdaMax - n) / (n - 1);
  const randomIndex = RANDOM_INDEX[n] || 1.59;
  
  return consistencyIndex / randomIndex;
}

/**
 * AHP 계산 수행
 */
export function calculateAHP(comparisonMatrix: ComparisonMatrix): AHPResult {
  const { matrix, size } = comparisonMatrix;
  
  if (size <= 1) {
    return {
      priorities: size === 1 ? [1] : [],
      consistencyRatio: 0,
      isConsistent: true,
      eigenVector: size === 1 ? [1] : [],
      lambdaMax: size === 1 ? 1 : 0
    };
  }
  
  // 고유벡터 계산
  const eigenVector = calculateEigenVector(matrix);
  
  // 최대 고유값 계산
  const lambdaMax = calculateLambdaMax(matrix, eigenVector);
  
  // 일관성 비율 계산
  const consistencyRatio = calculateConsistencyRatio(lambdaMax, size);
  
  // 일관성 체크 (일반적으로 0.1 이하면 일관성 있음)
  const isConsistent = consistencyRatio <= 0.1;
  
  return {
    priorities: eigenVector,
    consistencyRatio,
    isConsistent,
    eigenVector,
    lambdaMax
  };
}

/**
 * 비교 데이터를 매트릭스로 변환
 */
export function buildComparisonMatrix(
  elements: Array<{ id: string; name: string }>,
  comparisons: Array<{
    element1_id: string;
    element2_id: string;
    value: number;
  }>
): ComparisonMatrix {
  const n = elements.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(1));
  
  // 요소 ID to 인덱스 매핑
  const idToIndex: { [key: string]: number } = {};
  elements.forEach((element, index) => {
    idToIndex[element.id] = index;
  });
  
  // 비교 데이터로 매트릭스 채우기
  comparisons.forEach(comparison => {
    const i = idToIndex[comparison.element1_id];
    const j = idToIndex[comparison.element2_id];
    
    if (i !== undefined && j !== undefined) {
      matrix[i][j] = comparison.value;
      matrix[j][i] = 1 / comparison.value; // 역수
    }
  });
  
  return {
    size: n,
    matrix,
    elementNames: elements.map(e => e.name),
    elementIds: elements.map(e => e.id)
  };
}

/**
 * 계층적 AHP 계산 (전체 시스템)
 */
export interface HierarchicalAHPInput {
  criteriaWeights: { [criterionId: string]: number };
  alternativeScores: { 
    [criterionId: string]: { 
      [alternativeId: string]: number 
    } 
  };
  alternatives: Array<{ id: string; name: string }>;
}

export interface HierarchicalAHPResult {
  finalScores: { [alternativeId: string]: number };
  ranking: Array<{ alternativeId: string; alternativeName: string; score: number; rank: number }>;
  criteriaContributions: { 
    [alternativeId: string]: { 
      [criterionId: string]: number 
    } 
  };
}

export function calculateHierarchicalAHP(input: HierarchicalAHPInput): HierarchicalAHPResult {
  const { criteriaWeights, alternativeScores, alternatives } = input;
  
  const finalScores: { [alternativeId: string]: number } = {};
  const criteriaContributions: { [alternativeId: string]: { [criterionId: string]: number } } = {};
  
  // 각 대안에 대해 최종 점수 계산
  alternatives.forEach(alternative => {
    finalScores[alternative.id] = 0;
    criteriaContributions[alternative.id] = {};
    
    // 각 기준에 대해 가중 점수 계산
    Object.keys(criteriaWeights).forEach(criterionId => {
      const criterionWeight = criteriaWeights[criterionId];
      const alternativeScore = alternativeScores[criterionId]?.[alternative.id] || 0;
      const contribution = criterionWeight * alternativeScore;
      
      finalScores[alternative.id] += contribution;
      criteriaContributions[alternative.id][criterionId] = contribution;
    });
  });
  
  // 랭킹 생성
  const ranking = alternatives
    .map(alternative => ({
      alternativeId: alternative.id,
      alternativeName: alternative.name,
      score: finalScores[alternative.id],
      rank: 0
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));
  
  return {
    finalScores,
    ranking,
    criteriaContributions
  };
}

/**
 * 매트릭스를 보기 좋게 출력하기 위한 헬퍼 함수
 */
export function formatMatrix(matrix: number[][], precision: number = 3): string[][] {
  return matrix.map(row => 
    row.map(value => 
      value === 1 ? '1' : 
      value > 1 ? value.toFixed(precision) : 
      `1/${(1/value).toFixed(precision)}`
    )
  );
}

/**
 * 일관성 체크를 위한 헬퍼 함수들
 */
export function getConsistencyLevel(cr: number): string {
  if (cr <= 0.05) return 'Excellent';
  if (cr <= 0.08) return 'Good';
  if (cr <= 0.10) return 'Acceptable';
  return 'Poor';
}

export function getConsistencyColor(cr: number): string {
  if (cr <= 0.05) return 'green';
  if (cr <= 0.08) return 'blue';
  if (cr <= 0.10) return 'yellow';
  return 'red';
}