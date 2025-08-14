// AHP Calculator utilities for hierarchical analysis
export interface AHPResult {
  priorities: number[];
  consistencyRatio: number;
  lambdaMax: number;
  isConsistent: boolean;
  eigenVector: number[];
}

export interface HierarchicalAHPInput {
  criteriaWeights: { [key: string]: number };
  alternativeScores: { [criterionId: string]: { [alternativeId: string]: number } };
  alternatives: Array<{ id: string; name: string }>;
}

export interface ComparisonInput {
  element1_id: string;
  element2_id: string;
  value: number;
  i?: number;
  j?: number;
}

// Random Index (RI) values for consistency ratio calculation
const RANDOM_INDEX: { [key: number]: number } = {
  1: 0.0,
  2: 0.0,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
  11: 1.51,
  12: 1.48,
  13: 1.56,
  14: 1.57,
  15: 1.59
};

/**
 * Build comparison matrix from elements and comparisons
 */
export function buildComparisonMatrix(
  elements: Array<{ id: string; name: string }>,
  comparisons: ComparisonInput[]
): number[][] {
  const n = elements.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(1));

  // Create element ID to index mapping
  const elementIndex: { [key: string]: number } = {};
  elements.forEach((element, index) => {
    elementIndex[element.id] = index;
  });

  // Fill matrix with comparison values
  comparisons.forEach(comp => {
    const i = elementIndex[comp.element1_id];
    const j = elementIndex[comp.element2_id];
    
    if (i !== undefined && j !== undefined) {
      matrix[i][j] = comp.value;
      matrix[j][i] = 1 / comp.value; // Reciprocal
    }
  });

  return matrix;
}

/**
 * Calculate eigenvector using geometric mean method
 */
export function calculateEigenVector(matrix: number[][]): number[] {
  const n = matrix.length;
  const eigenVector: number[] = new Array(n);

  for (let i = 0; i < n; i++) {
    let product = 1;
    for (let j = 0; j < n; j++) {
      product *= matrix[i][j];
    }
    eigenVector[i] = Math.pow(product, 1 / n);
  }

  // Normalize
  const sum = eigenVector.reduce((acc, val) => acc + val, 0);
  return eigenVector.map(val => val / sum);
}

/**
 * Calculate lambda max (principal eigenvalue)
 */
export function calculateLambdaMax(matrix: number[][], eigenVector: number[]): number {
  const n = matrix.length;
  let lambdaMax = 0;

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += matrix[i][j] * eigenVector[j];
    }
    lambdaMax += sum / eigenVector[i];
  }

  return lambdaMax / n;
}

/**
 * Calculate consistency ratio (CR)
 */
export function calculateConsistencyRatio(lambdaMax: number, n: number): number {
  if (n <= 2) return 0; // No inconsistency possible for n <= 2
  
  const CI = (lambdaMax - n) / (n - 1); // Consistency Index
  const RI = RANDOM_INDEX[n] || 1.59; // Random Index
  
  return CI / RI;
}

/**
 * Main AHP calculation function
 */
export function calculateAHP(matrix: number[][]): AHPResult {
  const eigenVector = calculateEigenVector(matrix);
  const lambdaMax = calculateLambdaMax(matrix, eigenVector);
  const consistencyRatio = calculateConsistencyRatio(lambdaMax, matrix.length);
  const isConsistent = consistencyRatio <= 0.1;

  return {
    priorities: eigenVector,
    consistencyRatio,
    lambdaMax,
    isConsistent,
    eigenVector
  };
}

/**
 * Calculate hierarchical AHP with multiple criteria and alternatives
 */
export function calculateHierarchicalAHP(input: HierarchicalAHPInput) {
  const { criteriaWeights, alternativeScores, alternatives } = input;

  // Calculate final scores for each alternative
  const finalScores: { [alternativeId: string]: number } = {};
  
  alternatives.forEach(alternative => {
    let totalScore = 0;
    
    Object.entries(criteriaWeights).forEach(([criterionId, weight]) => {
      const alternativeScore = alternativeScores[criterionId]?.[alternative.id] || 0;
      totalScore += weight * alternativeScore;
    });
    
    finalScores[alternative.id] = totalScore;
  });

  // Create ranking
  const ranking = alternatives
    .map(alternative => ({
      alternativeId: alternative.id,
      alternativeName: alternative.name,
      score: finalScores[alternative.id],
      rank: 0
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));

  return {
    finalScores,
    ranking,
    criteriaWeights,
    alternativeScores
  };
}

/**
 * Get consistency level description
 */
export function getConsistencyLevel(cr: number): string {
  if (cr <= 0.05) return 'Excellent';
  if (cr <= 0.08) return 'Good';
  if (cr <= 0.10) return 'Acceptable';
  return 'Poor';
}

/**
 * Get consistency color for UI
 */
export function getConsistencyColor(cr: number): string {
  if (cr <= 0.05) return 'green';
  if (cr <= 0.08) return 'blue';
  if (cr <= 0.10) return 'yellow';
  return 'red';
}