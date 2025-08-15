import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import HierarchyTreeVisualization from '../common/HierarchyTreeVisualization';
import { DEMO_CRITERIA, DEMO_SUB_CRITERIA } from '../../data/demoData';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  level: number;
  children?: Criterion[];
  weight?: number;
}

interface CriteriaManagementProps {
  projectId: string;
  onComplete: () => void;
}

const CriteriaManagement: React.FC<CriteriaManagementProps> = ({ projectId, onComplete }) => {
  // DEMO_CRITERIA와 DEMO_SUB_CRITERIA를 조합하여 완전한 계층구조 생성
  const [criteria, setCriteria] = useState<Criterion[]>([]);

  useEffect(() => {
    // 데모 데이터를 컴포넌트 형식으로 변환
    const combinedCriteria = [
      ...DEMO_CRITERIA.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        parent_id: c.parent_id,
        level: c.level,
        weight: c.weight
      })),
      ...DEMO_SUB_CRITERIA.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        parent_id: c.parent_id,
        level: c.level,
        weight: c.weight
      }))
    ];
    setCriteria(combinedCriteria);
  }, [projectId]);

  const [evaluationMethod, setEvaluationMethod] = useState<'pairwise' | 'direct'>('pairwise');
  const [newCriterion, setNewCriterion] = useState({ name: '', description: '', parentId: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCriterion = (name: string): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '기준명을 입력해주세요.';
    } else if (name.length < 2) {
      newErrors.name = '기준명은 2자 이상이어야 합니다.';
    } else {
      // Check for duplicate names
      const allCriteria = getAllCriteria(criteria);
      if (allCriteria.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        newErrors.name = '동일한 기준명이 이미 존재합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAllCriteria = (criteriaList: Criterion[]): Criterion[] => {
    const all: Criterion[] = [];
    const traverse = (items: Criterion[]) => {
      items.forEach(item => {
        all.push(item);
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(criteriaList);
    return all;
  };

  const handleAddCriterion = () => {
    if (!validateCriterion(newCriterion.name)) {
      return;
    }

    const newId = Date.now().toString();
    const level = newCriterion.parentId ? 2 : 1;
    
    const criterion: Criterion = {
      id: newId,
      name: newCriterion.name,
      description: newCriterion.description,
      parent_id: newCriterion.parentId || null,
      level
    };

    if (newCriterion.parentId) {
      // Add as child
      setCriteria(prev => prev.map(c => {
        if (c.id === newCriterion.parentId) {
          return {
            ...c,
            children: [...(c.children || []), criterion]
          };
        }
        return c;
      }));
    } else {
      // Add as top-level criterion
      setCriteria(prev => [...prev, criterion]);
    }

    setNewCriterion({ name: '', description: '', parentId: '' });
    setErrors({});
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteCriterion = (id: string) => {
    setCriteria(prev => {
      const filter = (items: Criterion[]): Criterion[] => {
        return items.filter(item => {
          if (item.id === id) return false;
          if (item.children) {
            item.children = filter(item.children);
          }
          return true;
        });
      };
      return filter(prev);
    });
  };


  const getTopLevelCriteria = () => criteria.filter(c => c.level === 1);

  return (
    <div className="space-y-6">
      <Card title="2-1단계 — 기준추가">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 기준 추가 가이드</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 상위 기준을 먼저 정의한 후 하위 기준을 추가하세요</li>
              <li>• 기준명은 중복될 수 없습니다</li>
              <li>• 평가방법을 선택하여 비교 방식을 결정하세요</li>
            </ul>
          </div>

          {/* Evaluation Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              평가방법 선택
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pairwise"
                  checked={evaluationMethod === 'pairwise'}
                  onChange={(e) => setEvaluationMethod(e.target.value as 'pairwise')}
                  className="mr-2"
                />
                <span className="text-sm">쌍대비교</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="direct"
                  checked={evaluationMethod === 'direct'}
                  onChange={(e) => setEvaluationMethod(e.target.value as 'direct')}
                  className="mr-2"
                />
                <span className="text-sm">직접입력</span>
              </label>
            </div>
          </div>

          {/* Current Criteria Tree Visualization */}
          <div>
            <HierarchyTreeVisualization
              nodes={criteria}
              title="AI 개발 활용 방안 기준 계층구조"
              showWeights={true}
              interactive={true}
              onNodeClick={(node) => {
                console.log('선택된 기준:', node);
                // 추후 편집 모드 구현 가능
              }}
            />
          </div>

          {/* Add New Criterion */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">➕ 새 기준 추가</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상위 기준
                </label>
                <select
                  value={newCriterion.parentId}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">최상위 기준</option>
                  {getTopLevelCriteria().map(criterion => (
                    <option key={criterion.id} value={criterion.id}>
                      {criterion.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                id="criterionName"
                label="기준명"
                placeholder="기준명을 입력하세요"
                value={newCriterion.name}
                onChange={(value) => setNewCriterion(prev => ({ ...prev, name: value }))}
                error={errors.name}
                required
              />

              <Input
                id="criterionDescription"
                label="기준 설명 (선택)"
                placeholder="기준에 대한 설명"
                value={newCriterion.description}
                onChange={(value) => setNewCriterion(prev => ({ ...prev, description: value }))}
              />
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handleAddCriterion} variant="primary">
                기준 추가
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-600">
              총 {getAllCriteria(criteria).length}개 기준 | 평가방법: {evaluationMethod === 'pairwise' ? '쌍대비교' : '직접입력'}
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary">
                저장
              </Button>
              <Button
                variant="primary"
                onClick={onComplete}
                disabled={criteria.length === 0}
              >
                다음 단계로
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CriteriaManagement;