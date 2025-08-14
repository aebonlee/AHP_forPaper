import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { directEvaluationAPI, apiHelpers } from '../../services/apiService';

interface DirectInputValue {
  alternativeId: string;
  alternativeName: string;
  value: number;
  processedValue?: number;
  normalizedWeight?: number;
}

interface DirectInputEvaluationProps {
  projectId: string;
  criterionId: string;
  criterionName: string;
  alternatives: Array<{ id: string; name: string; description?: string }>;
  onComplete?: (values: DirectInputValue[]) => void;
  onCancel?: () => void;
}

const DirectInputEvaluation: React.FC<DirectInputEvaluationProps> = ({
  projectId,
  criterionId,
  criterionName,
  alternatives,
  onComplete,
  onCancel
}) => {
  const [values, setValues] = useState<DirectInputValue[]>([]);
  const [isBenefitCriterion, setIsBenefitCriterion] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://ahp-forpaper.onrender.com';

  useEffect(() => {
    // 초기값 설정
    setValues(
      alternatives.map(alt => ({
        alternativeId: alt.id,
        alternativeName: alt.name,
        value: 1,
        processedValue: 1,
        normalizedWeight: 1 / alternatives.length
      }))
    );
  }, [alternatives]);

  useEffect(() => {
    // 값이 변경될 때마다 정규화 계산
    calculateNormalizedWeights();
  }, [values, isBenefitCriterion]);

  const updateValue = (alternativeId: string, newValue: number) => {
    if (newValue <= 0) {
      alert('값은 0보다 커야 합니다.');
      return;
    }

    setValues(prevValues => 
      prevValues.map(v => 
        v.alternativeId === alternativeId 
          ? { ...v, value: newValue } 
          : v
      )
    );
  };

  const calculateNormalizedWeights = () => {
    setValues(prevValues => {
      // 1단계: 비용형인 경우 역수 처리
      const processedValues = prevValues.map(v => ({
        ...v,
        processedValue: isBenefitCriterion ? v.value : (v.value > 0 ? 1 / v.value : 0)
      }));

      // 2단계: 정규화 (합이 1이 되도록)
      const sum = processedValues.reduce((acc, v) => acc + v.processedValue, 0);
      
      if (sum === 0) {
        return processedValues.map(v => ({ ...v, normalizedWeight: 0 }));
      }

      return processedValues.map(v => ({
        ...v,
        normalizedWeight: v.processedValue / sum
      }));
    });
  };

  const validateInputs = (): boolean => {
    if (values.some(v => v.value <= 0)) {
      alert('모든 값은 0보다 커야 합니다.');
      return false;
    }

    if (values.every(v => v.value === values[0].value)) {
      alert('모든 대안의 값이 동일합니다. 차별화된 값을 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleComplete = async () => {
    if (!validateInputs()) return;

    try {
      setSaving(true);
      
      // API 호출로 직접입력 데이터 저장
      const savePromises = values.map(value => 
        directEvaluationAPI.save({
          project_id: parseInt(projectId),
          target_key: apiHelpers.generateTargetKey('alternative', value.alternativeId, criterionId),
          value: value.value,
          is_benefit: isBenefitCriterion
        })
      );

      const results = await Promise.all(savePromises);
      
      // 모든 저장이 성공했는지 확인
      const hasErrors = results.some(result => result.error);
      
      if (hasErrors) {
        const errorMessages = results
          .filter(result => result.error)
          .map(result => result.error)
          .join(', ');
        alert(`일부 저장에 실패했습니다: ${errorMessages}`);
        return;
      }

      alert('직접입력 평가가 성공적으로 저장되었습니다.');
      
      if (onComplete) {
        onComplete(values);
      }
    } catch (error) {
      console.error('Failed to save direct input values:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const resetValues = () => {
    setValues(values.map(v => ({ ...v, value: 1 })));
  };

  const setEqualValues = () => {
    const equalValue = 1;
    setValues(values.map(v => ({ ...v, value: equalValue })));
  };

  // 정렬된 결과 (우선순위별)
  const sortedResults = [...values].sort((a, b) => (b.normalizedWeight || 0) - (a.normalizedWeight || 0));

  return (
    <Card title={`직접입력 평가: ${criterionName}`}>
      <div className="space-y-6">
        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-800 mb-2">📊 정량 데이터 입력</h5>
          <p className="text-blue-700 text-sm">
            각 대안에 대한 정량적 값을 입력하세요. 시스템이 자동으로 가중치를 계산합니다.
          </p>
        </div>

        {/* 평가 유형 선택 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium mb-3">평가 유형 선택</h5>
          <div className="space-y-3">
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={isBenefitCriterion}
                  onChange={() => setIsBenefitCriterion(true)}
                  className="mr-2"
                />
                <span className="text-green-700 font-medium">편익형 (값이 클수록 좋음)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={!isBenefitCriterion}
                  onChange={() => setIsBenefitCriterion(false)}
                  className="mr-2"
                />
                <span className="text-red-700 font-medium">비용형 (값이 작을수록 좋음)</span>
              </label>
            </div>
            
            <div className={`text-sm p-3 rounded ${
              isBenefitCriterion 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {isBenefitCriterion 
                ? "💡 편익형 예시: 성과, 품질, 만족도, 수익성, 효율성 등" 
                : "💡 비용형 예시: 가격, 소요시간, 위험도, 복잡성 등 (자동으로 역수 처리됩니다)"
              }
            </div>
          </div>
        </div>

        {/* 값 입력 섹션 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h5 className="font-medium">대안별 값 입력</h5>
            <div className="flex space-x-2">
              <button
                onClick={resetValues}
                className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                초기화
              </button>
              <button
                onClick={setEqualValues}
                className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                동일값 설정
              </button>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`text-sm px-3 py-1 rounded ${
                  previewMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {previewMode ? '입력 모드' : '미리보기'}
              </button>
            </div>
          </div>

          {!previewMode ? (
            <div className="space-y-3">
              {values.map((value, index) => (
                <div key={value.alternativeId} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h6 className="font-medium">{value.alternativeName}</h6>
                      {alternatives[index]?.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {alternatives[index].description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-end">
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={value.value}
                          onChange={(e) => updateValue(value.alternativeId, parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                          placeholder="값 입력"
                        />
                        <span className="text-xs text-gray-500 mt-1">
                          {isBenefitCriterion ? '원시값' : '원시값 (역수 처리됨)'}
                        </span>
                      </div>
                      <div className="text-right w-20">
                        <div className="text-sm font-medium text-blue-600">
                          {((value.normalizedWeight || 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">가중치</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 미리보기 모드
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-800 mb-3">📊 정규화 결과 미리보기</h5>
              <div className="space-y-3">
                {sortedResults.map((result, index) => (
                  <div key={result.alternativeId} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-medium">{result.alternativeName}</span>
                        <div className="text-xs text-gray-500">
                          입력값: {result.value.toFixed(3)} 
                          {!isBenefitCriterion && ` → 처리값: ${(result.processedValue || 0).toFixed(3)}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-700">
                        {((result.normalizedWeight || 0) * 100).toFixed(1)}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${((result.normalizedWeight || 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-white rounded border">
                <h6 className="font-medium mb-2">계산 과정</h6>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>1. {isBenefitCriterion ? '편익형: 입력값 그대로 사용' : '비용형: 입력값의 역수 계산'}</p>
                  <p>2. 정규화: 각 처리값을 전체 합으로 나누어 가중치 산출</p>
                  <p>3. 검증: 모든 가중치의 합 = {values.reduce((sum, v) => sum + (v.normalizedWeight || 0), 0).toFixed(3)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              취소
            </button>
          )}
          <button
            onClick={handleComplete}
            disabled={saving || !validateInputs()}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '저장 중...' : '평가 완료'}
          </button>
        </div>

        {/* 도움말 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h6 className="font-medium mb-2">💡 직접입력 평가 가이드</h6>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>편익형:</strong> 값이 클수록 좋은 기준 (예: 성능, 품질, 만족도)</p>
            <p>• <strong>비용형:</strong> 값이 작을수록 좋은 기준 (예: 비용, 시간, 위험도)</p>
            <p>• 시스템이 자동으로 상대적 중요도를 계산하여 가중치로 변환합니다</p>
            <p>• 모든 대안에 의미 있는 차이가 있는 값을 입력해주세요</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DirectInputEvaluation;