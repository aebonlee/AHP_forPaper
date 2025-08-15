import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface ProjectCreationProps {
  onProjectCreated: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ProjectCreation: React.FC<ProjectCreationProps> = ({ 
  onProjectCreated, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '프로젝트명을 입력해주세요.';
    } else if (formData.title.length < 2) {
      newErrors.title = '프로젝트명은 2자 이상이어야 합니다.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '프로젝트 설명을 입력해주세요.';
    } else if (formData.description.length < 10) {
      newErrors.description = '설명은 10자 이상 입력해주세요.';
    }

    if (!formData.objective.trim()) {
      newErrors.objective = '프로젝트 목표를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // TODO: Implement actual API call
      console.log('Creating project with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onProjectCreated();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          단계 1 — 프로젝트 추가
        </h1>
        <p className="text-gray-600">
          새로운 AHP 의사결정 분석 프로젝트를 생성합니다.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="title"
            label="프로젝트명"
            placeholder="프로젝트 이름을 입력하세요"
            value={formData.title}
            onChange={(value) => handleInputChange('title', value)}
            error={errors.title}
            required
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <Input
            id="objective"
            label="프로젝트 목표"
            placeholder="이 프로젝트로 달성하고자 하는 목표를 입력하세요"
            value={formData.objective}
            onChange={(value) => handleInputChange('objective', value)}
            error={errors.objective}
            required
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 프로젝트 생성 후 진행 단계</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. 기준 계층구조 설계 (2-1단계)</li>
              <li>2. 대안 정의 및 관리 (2-2단계)</li>
              <li>3. 평가자 배정 (2-3단계)</li>
              <li>4. 모델 구축 완료 (2-4단계)</li>
            </ol>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              프로젝트 추가
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          프로젝트 추가 성공 시 단계 2로 자동 이동됩니다.
        </p>
      </div>
    </div>
  );
};

export default ProjectCreation;