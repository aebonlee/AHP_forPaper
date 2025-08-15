import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import CriteriaManagement from './CriteriaManagement';
import AlternativeManagement from './AlternativeManagement';
import EvaluatorAssignment from './EvaluatorAssignment';
import ModelFinalization from './ModelFinalization';

interface ModelBuildingProps {
  projectId: string;
  projectTitle: string;
  onModelFinalized: () => void;
  onBack: () => void;
}

const ModelBuilding: React.FC<ModelBuildingProps> = ({ 
  projectId, 
  projectTitle, 
  onModelFinalized,
  onBack 
}) => {
  const [activeStep, setActiveStep] = useState<'criteria' | 'alternatives' | 'evaluators' | 'finalize'>('criteria');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps = [
    {
      id: 'criteria',
      label: '2-1 기준추가',
      title: '2-1단계 — 기준추가',
      icon: '🎯',
      description: '계층구조와 평가기준을 설정합니다'
    },
    {
      id: 'alternatives',
      label: '2-2 대안추가',
      title: '2-2단계 — 대안추가',
      icon: '📝',
      description: '평가할 대안들을 정의합니다'
    },
    {
      id: 'evaluators',
      label: '2-3 평가자배정',
      title: '2-3단계 — 평가자 배정',
      icon: '👥',
      description: '평가에 참여할 사용자를 배정합니다'
    },
    {
      id: 'finalize',
      label: '2-4 모델구축',
      title: '2-4단계 — 모델 구축',
      icon: '🏗️',
      description: '모델을 확정하고 평가를 시작합니다'
    }
  ];

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    // Auto-advance to next step
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setActiveStep(nextStep.id as typeof activeStep);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'criteria':
        return (
          <CriteriaManagement
            projectId={projectId}
            onComplete={() => handleStepComplete('criteria')}
          />
        );
      case 'alternatives':
        return (
          <AlternativeManagement
            projectId={projectId}
            onComplete={() => handleStepComplete('alternatives')}
          />
        );
      case 'evaluators':
        return (
          <EvaluatorAssignment
            projectId={projectId}
            onComplete={() => handleStepComplete('evaluators')}
          />
        );
      case 'finalize':
        return (
          <ModelFinalization
            projectId={projectId}
            onFinalize={onModelFinalized}
            isReadyToFinalize={completedSteps.size >= 3}
          />
        );
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
              단계 2: 모델구축
            </h1>
            <p className="text-gray-600">
              프로젝트: <span className="font-medium">{projectTitle}</span>
            </p>
          </div>
          <Button variant="secondary" onClick={onBack}>
            이전 단계로
          </Button>
        </div>

        {/* Step Navigation */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id as typeof activeStep)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeStep === step.id
                    ? 'bg-blue-500 text-white'
                    : completedSteps.has(step.id)
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{step.icon}</span>
                <span>{step.label}</span>
                {completedSteps.has(step.id) && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">진행률</span>
            <span className="text-sm text-gray-600">
              {completedSteps.size} / {steps.length} 단계 완료
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      <div>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default ModelBuilding;