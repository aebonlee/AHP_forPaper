import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import GroupWeightAnalysis from './GroupWeightAnalysis';
import SensitivityAnalysis from './SensitivityAnalysis';

interface EvaluationResultsProps {
  projectId: string;
  projectTitle: string;
  onBack: () => void;
  onComplete: () => void;
}

const EvaluationResults: React.FC<EvaluationResultsProps> = ({ 
  projectId, 
  projectTitle, 
  onBack,
  onComplete 
}) => {
  const [activeFeature, setActiveFeature] = useState<'weights' | 'sensitivity'>('weights');

  const features = [
    {
      id: 'weights',
      label: '그룹별 가중치 도출',
      icon: '⚖️',
      description: '평가자별 가중치 조정 및 통합 결과 산출'
    },
    {
      id: 'sensitivity',
      label: '민감도 분석',
      icon: '📊',
      description: '기준 변경에 따른 결과 변화 분석'
    }
  ];

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'weights':
        return <GroupWeightAnalysis projectId={projectId} />;
      case 'sensitivity':
        return <SensitivityAnalysis projectId={projectId} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              단계 3 — 평가결과 확인
            </h1>
            <p className="text-gray-600">
              프로젝트: <span className="font-medium">{projectTitle}</span>
            </p>
          </div>
          <Button variant="secondary" onClick={onBack}>
            이전 단계로
          </Button>
        </div>

        {/* Feature Navigation */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex space-x-4">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id as typeof activeFeature)}
                className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeFeature === feature.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-3">{feature.icon}</span>
                <div className="text-left">
                  <div>{feature.label}</div>
                  <div className="text-xs opacity-75">{feature.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-yellow-900 mb-2">💾 중요 안내</h4>
          <p className="text-sm text-yellow-700">
            표시된 평가결과는 DB에 저장되지 않으니 Excel 저장 단추로 저장하시기 바랍니다.
          </p>
        </div>
      </div>

      {/* Current Feature Content */}
      <div>
        {renderFeatureContent()}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          현재 기능: <strong>{features.find(f => f.id === activeFeature)?.label}</strong>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary">
            결과 저장
          </Button>
          <Button variant="primary" onClick={onComplete}>
            다음 단계로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationResults;