import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ScreenID from '../common/ScreenID';
import EventSequenceDemo from '../demo/EventSequenceDemo';
import WorkshopVerification from '../workshop/WorkshopVerification';
import { LABEL_CHECKLIST, LabelCheckItem } from '../../constants/labelChecklist';
import { SCREEN_IDS } from '../../constants/screenIds';

interface VerificationSection {
  id: string;
  title: string;
  completed: boolean;
  items?: any[];
}

const CaptureVerificationDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('screenIds');
  const [verificationSections, setVerificationSections] = useState<VerificationSection[]>([
    { id: 'screenIds', title: '화면 ID 태깅', completed: false },
    { id: 'labelCheck', title: '타이틀/버튼 라벨 체크', completed: false },
    { id: 'eventSequence', title: '이벤트 시퀀스 검증', completed: false },
    { id: 'serverWarnings', title: '서버 미저장 경고', completed: false },
    { id: 'workshopDual', title: '워크숍 양화면 검증', completed: false }
  ]);

  const [checkedLabels, setCheckedLabels] = useState<Record<string, boolean>>({});
  const [workshopStates, setWorkshopStates] = useState({
    admin: null,
    evaluator: null
  });

  const updateSectionStatus = (sectionId: string, completed: boolean) => {
    setVerificationSections(prev => 
      prev.map(section => 
        section.id === sectionId ? { ...section, completed } : section
      )
    );
  };

  const toggleLabelCheck = (itemKey: string) => {
    setCheckedLabels(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const renderScreenIdSection = () => (
    <Card title="화면 ID 태깅 검증">
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">✅ 구현 완료</h4>
          <p className="text-sm text-green-700">
            모든 캡처 대상 화면에 우하단 화면 ID 태그가 추가되었습니다.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(SCREEN_IDS).map(([category, screens]) => (
            <div key={category} className="bg-gray-50 border border-gray-200 rounded p-3">
              <h5 className="font-medium text-gray-900 mb-2">{category}</h5>
              <div className="space-y-1">
                {Object.entries(screens as Record<string, string>).map(([key, id]) => (
                  <div key={key} className="text-xs font-mono text-gray-600">
                    {id}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={() => updateSectionStatus('screenIds', true)}
          variant="primary"
        >
          화면 ID 검증 완료
        </Button>
      </div>
    </Card>
  );

  const renderLabelCheckSection = () => {
    const checkedCount = Object.values(checkedLabels).filter(Boolean).length;
    const totalCount = LABEL_CHECKLIST.length;
    
    return (
      <Card title="타이틀/버튼 라벨 일치성 체크">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 검증 진행</h4>
            <p className="text-sm text-blue-700">
              진행: {checkedCount} / {totalCount} ({((checkedCount / totalCount) * 100).toFixed(1)}%)
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(checkedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {LABEL_CHECKLIST.map((item, index) => {
              const itemKey = `${item.screenId}-${item.element}`;
              const isChecked = checkedLabels[itemKey] || false;
              
              return (
                <div 
                  key={index}
                  className={`border rounded-lg p-3 ${
                    isChecked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.screenId}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.category === 'title' ? 'bg-blue-100 text-blue-800' :
                          item.category === 'button' ? 'bg-green-100 text-green-800' :
                          item.category === 'badge' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      <h5 className="font-medium">{item.element}</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>예상 텍스트:</strong> "{item.expectedText}"
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        <strong>위치:</strong> {item.location}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleLabelCheck(itemKey)}
                      className="ml-4 mt-1 h-4 w-4 text-green-600 rounded"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <Button 
            onClick={() => updateSectionStatus('labelCheck', checkedCount === totalCount)}
            disabled={checkedCount !== totalCount}
            variant={checkedCount === totalCount ? 'primary' : 'secondary'}
          >
            라벨 체크 {checkedCount === totalCount ? '완료' : `진행중 (${checkedCount}/${totalCount})`}
          </Button>
        </div>
      </Card>
    );
  };

  const renderEventSequenceSection = () => (
    <div className="space-y-4">
      <EventSequenceDemo 
        scenario="sensitivity"
        onComplete={() => console.log('민감도 분석 시나리오 완료')}
      />
      <EventSequenceDemo 
        scenario="pairwise"
        onComplete={() => console.log('쌍대비교 시나리오 완료')}
      />
      <EventSequenceDemo 
        scenario="directInput"
        onComplete={() => console.log('직접입력 시나리오 완료')}
      />
      <Button 
        onClick={() => updateSectionStatus('eventSequence', true)}
        variant="primary"
      >
        이벤트 시퀀스 검증 완료
      </Button>
    </div>
  );

  const renderServerWarningsSection = () => (
    <Card title="서버 미저장 경고 검증">
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">⚠️ 구현 사항</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 상단 주의 배지 상시 노출 (아이콘 포함)</li>
            <li>• Excel 저장/캡처 안내 동시 배치</li>
            <li>• 표준화된 메시지 사용</li>
            <li>• 시각적 경고 강화</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded p-3">
            <h5 className="font-medium mb-2">적용 화면</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 민감도 분석 (ADMIN-STEP3-SENS)</li>
              <li>• 그룹별 가중치 도출 (ADMIN-STEP3-WEIGHTS)</li>
              <li>• 평가결과 확인 (ADMIN-STEP3-RESULTS)</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded p-3">
            <h5 className="font-medium mb-2">경고 요소</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• ⚠️ 아이콘 + 메시지</li>
              <li>• 📊 Excel 저장 버튼</li>
              <li>• 📷 캡처 버튼</li>
              <li>• 색상 코딩 (황색/적색)</li>
            </ul>
          </div>
        </div>

        <Button 
          onClick={() => updateSectionStatus('serverWarnings', true)}
          variant="primary"
        >
          서버 미저장 경고 검증 완료
        </Button>
      </div>
    </Card>
  );

  const renderWorkshopSection = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">🔄 워크숍 양화면 검증</h4>
        <p className="text-sm text-purple-700">
          관리자와 평가자 화면을 나란히 배치하여 실시간 동기화와 제어를 확인합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WorkshopVerification 
          mode="admin"
          onStateChange={(state) => setWorkshopStates(prev => ({ ...prev, admin: state }))}
        />
        <WorkshopVerification 
          mode="evaluator"
          onStateChange={(state) => setWorkshopStates(prev => ({ ...prev, evaluator: state }))}
        />
      </div>

      <EventSequenceDemo 
        scenario="workshop"
        onComplete={() => console.log('워크숍 시나리오 완료')}
      />

      <Button 
        onClick={() => updateSectionStatus('workshopDual', true)}
        variant="primary"
      >
        워크숍 양화면 검증 완료
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'screenIds':
        return renderScreenIdSection();
      case 'labelCheck':
        return renderLabelCheckSection();
      case 'eventSequence':
        return renderEventSequenceSection();
      case 'serverWarnings':
        return renderServerWarningsSection();
      case 'workshopDual':
        return renderWorkshopSection();
      default:
        return null;
    }
  };

  const completedSections = verificationSections.filter(s => s.completed).length;
  const totalSections = verificationSections.length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ScreenID id="VERIFICATION-DASHBOARD" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          캡처 1:1 매핑 검증 대시보드
        </h1>
        <p className="text-gray-600">
          실무용 캡처 화면 검증 및 이벤트 시퀀스 테스트
        </p>
        
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              전체 진행률: {completedSections} / {totalSections}
            </span>
            <span className="text-blue-700">
              {((completedSections / totalSections) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedSections / totalSections) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 space-y-2">
          {verificationSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                activeSection === section.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  section.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {section.completed ? '✓' : '○'}
                </span>
                <span className="font-medium">{section.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CaptureVerificationDashboard;