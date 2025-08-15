import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface Alternative {
  id: string;
  name: string;
  description?: string;
  order: number;
}

interface AlternativeManagementProps {
  projectId: string;
  onComplete: () => void;
}

const AlternativeManagement: React.FC<AlternativeManagementProps> = ({ projectId, onComplete }) => {
  const [alternatives, setAlternatives] = useState<Alternative[]>([
    { id: '1', name: '대안 A', description: '기존 시스템 개선', order: 1 },
    { id: '2', name: '대안 B', description: '새로운 시스템 도입', order: 2 },
    { id: '3', name: '대안 C', description: '외부 서비스 활용', order: 3 }
  ]);

  const [newAlternative, setNewAlternative] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAlternative, setEditingAlternative] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAlternative = (name: string, excludeId?: string): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '대안명을 입력해주세요.';
    } else if (name.length < 2) {
      newErrors.name = '대안명은 2자 이상이어야 합니다.';
    } else {
      // Check for duplicate names
      const isDuplicate = alternatives.some(alt => 
        alt.name.toLowerCase() === name.toLowerCase() && alt.id !== excludeId
      );
      if (isDuplicate) {
        newErrors.name = '동일한 대안명이 이미 존재합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAlternative = () => {
    if (!validateAlternative(newAlternative.name)) {
      return;
    }

    const newId = Date.now().toString();
    const maxOrder = Math.max(...alternatives.map(alt => alt.order), 0);
    
    const alternative: Alternative = {
      id: newId,
      name: newAlternative.name,
      description: newAlternative.description,
      order: maxOrder + 1
    };

    setAlternatives(prev => [...prev, alternative]);
    setNewAlternative({ name: '', description: '' });
    setErrors({});
  };

  const handleEditAlternative = (id: string) => {
    const alternative = alternatives.find(alt => alt.id === id);
    if (alternative) {
      setEditingId(id);
      setEditingAlternative({ name: alternative.name, description: alternative.description || '' });
    }
  };

  const handleSaveEdit = () => {
    if (!editingId || !validateAlternative(editingAlternative.name, editingId)) {
      return;
    }

    setAlternatives(prev => prev.map(alt => 
      alt.id === editingId 
        ? { ...alt, name: editingAlternative.name, description: editingAlternative.description }
        : alt
    ));

    setEditingId(null);
    setEditingAlternative({ name: '', description: '' });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingAlternative({ name: '', description: '' });
    setErrors({});
  };

  const handleDeleteAlternative = (id: string) => {
    setAlternatives(prev => {
      const filtered = prev.filter(alt => alt.id !== id);
      // Reorder remaining alternatives
      return filtered.map((alt, index) => ({ ...alt, order: index + 1 }));
    });
  };

  const handleMoveUp = (id: string) => {
    const index = alternatives.findIndex(alt => alt.id === id);
    if (index > 0) {
      const newAlternatives = [...alternatives];
      [newAlternatives[index], newAlternatives[index - 1]] = [newAlternatives[index - 1], newAlternatives[index]];
      
      // Update order values
      newAlternatives.forEach((alt, idx) => {
        alt.order = idx + 1;
      });
      
      setAlternatives(newAlternatives);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = alternatives.findIndex(alt => alt.id === id);
    if (index < alternatives.length - 1) {
      const newAlternatives = [...alternatives];
      [newAlternatives[index], newAlternatives[index + 1]] = [newAlternatives[index + 1], newAlternatives[index]];
      
      // Update order values
      newAlternatives.forEach((alt, idx) => {
        alt.order = idx + 1;
      });
      
      setAlternatives(newAlternatives);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="2-2단계 — 대안추가">
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">📝 대안 관리 가이드</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 비교 평가할 모든 대안을 추가하세요</li>
              <li>• 대안명은 중복될 수 없습니다</li>
              <li>• 순서 조정을 통해 평가 순서를 결정할 수 있습니다</li>
              <li>• 최소 2개 이상의 대안이 필요합니다</li>
            </ul>
          </div>

          {/* Current Alternatives List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">📋 등록된 대안 목록</h4>
            {alternatives.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 추가된 대안이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {alternatives
                  .sort((a, b) => a.order - b.order)
                  .map((alternative, index) => (
                    <div
                      key={alternative.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                    >
                      <div className="flex items-center flex-1">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mr-4">
                          {alternative.order}
                        </div>
                        
                        {editingId === alternative.id ? (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              id={`edit-name-${alternative.id}`}
                              label=""
                              placeholder="대안명을 입력하세요"
                              value={editingAlternative.name}
                              onChange={(value) => setEditingAlternative(prev => ({ ...prev, name: value }))}
                              error={errors.name}
                            />
                            <Input
                              id={`edit-desc-${alternative.id}`}
                              label=""
                              placeholder="대안 설명 (선택)"
                              value={editingAlternative.description}
                              onChange={(value) => setEditingAlternative(prev => ({ ...prev, description: value }))}
                            />
                          </div>
                        ) : (
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{alternative.name}</h5>
                            {alternative.description && (
                              <p className="text-sm text-gray-600">{alternative.description}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {editingId === alternative.id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              저장
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleMoveUp(alternative.id)}
                              disabled={index === 0}
                              className={`text-sm ${index === 0 ? 'text-gray-300' : 'text-blue-600 hover:text-blue-800'}`}
                              title="위로 이동"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => handleMoveDown(alternative.id)}
                              disabled={index === alternatives.length - 1}
                              className={`text-sm ${index === alternatives.length - 1 ? 'text-gray-300' : 'text-blue-600 hover:text-blue-800'}`}
                              title="아래로 이동"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => handleEditAlternative(alternative.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="편집"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteAlternative(alternative.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Add New Alternative */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">➕ 새 대안 추가</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                id="alternativeName"
                label="대안명"
                placeholder="대안명을 입력하세요"
                value={newAlternative.name}
                onChange={(value) => setNewAlternative(prev => ({ ...prev, name: value }))}
                error={errors.name}
                required
              />

              <Input
                id="alternativeDescription"
                label="대안 설명 (선택)"
                placeholder="대안에 대한 설명"
                value={newAlternative.description}
                onChange={(value) => setNewAlternative(prev => ({ ...prev, description: value }))}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddAlternative} variant="primary">
                대안 추가
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-medium text-gray-900">대안 요약</h5>
                <p className="text-sm text-gray-600">총 {alternatives.length}개 대안 등록됨</p>
              </div>
              <div className="text-sm text-gray-600">
                평가 순서: {alternatives.map(alt => alt.name).join(' → ')}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-600">
              {alternatives.length < 2 && (
                <span className="text-orange-600">⚠️ 최소 2개 이상의 대안이 필요합니다.</span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary">
                저장
              </Button>
              <Button
                variant="primary"
                onClick={onComplete}
                disabled={alternatives.length < 2}
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

export default AlternativeManagement;