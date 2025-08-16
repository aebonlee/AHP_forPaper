import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface Workshop {
  id: string;
  title: string;
  description: string;
  facilitator: string;
  participants: string[];
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  projectId: string;
  sessions: WorkshopSession[];
  consensusLevel: number;
  totalParticipants: number;
  completedEvaluations: number;
}

interface WorkshopSession {
  id: string;
  title: string;
  description: string;
  duration: number; // 분
  activities: SessionActivity[];
  status: 'pending' | 'active' | 'completed';
  scheduledTime?: string;
}

interface SessionActivity {
  id: string;
  type: 'presentation' | 'discussion' | 'evaluation' | 'consensus';
  title: string;
  duration: number;
  materials?: string[];
  instructions: string;
}

interface WorkshopManagerProps {
  className?: string;
}

const WorkshopManager: React.FC<WorkshopManagerProps> = ({ className = '' }) => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'planning' | 'facilitation' | 'results'>('overview');
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkshops();
  }, []);

  const loadWorkshops = async () => {
    setLoading(true);
    // 실제로는 API 호출
    const sampleWorkshops: Workshop[] = [
      {
        id: 'w1',
        title: '신기술 도입 우선순위 결정',
        description: 'AI, IoT, 블록체인 등 신기술 도입 우선순위를 결정하는 워크숍',
        facilitator: '김기술팀장',
        participants: ['이개발자', '박분석가', '최연구원', '정매니저'],
        status: 'active',
        startDate: new Date().toISOString(),
        projectId: 'p1',
        sessions: [
          {
            id: 's1',
            title: '문제 정의 및 계층 구조 설계',
            description: '의사결정 문제를 명확히 정의하고 AHP 계층구조를 설계합니다',
            duration: 90,
            status: 'completed',
            activities: [
              {
                id: 'a1',
                type: 'presentation',
                title: '문제 상황 설명',
                duration: 20,
                instructions: '현재 신기술 도입 필요성과 제약사항을 설명합니다'
              },
              {
                id: 'a2',
                type: 'discussion',
                title: '평가 기준 도출',
                duration: 40,
                instructions: '브레인스토밍을 통해 기술 평가 기준을 도출합니다'
              },
              {
                id: 'a3',
                type: 'evaluation',
                title: '계층구조 검토',
                duration: 30,
                instructions: '설계된 계층구조의 타당성을 검토합니다'
              }
            ]
          },
          {
            id: 's2',
            title: '개별 평가 실시',
            description: '각 참가자가 독립적으로 쌍대비교 평가를 수행합니다',
            duration: 120,
            status: 'active',
            activities: [
              {
                id: 'a4',
                type: 'evaluation',
                title: '기준별 쌍대비교',
                duration: 60,
                instructions: '각 평가 기준의 상대적 중요도를 평가합니다'
              },
              {
                id: 'a5',
                type: 'evaluation',
                title: '대안별 쌍대비교',
                duration: 60,
                instructions: '각 기준별로 대안들을 쌍대비교 평가합니다'
              }
            ]
          },
          {
            id: 's3',
            title: '결과 통합 및 합의',
            description: '개별 평가 결과를 통합하고 최종 합의를 도출합니다',
            duration: 90,
            status: 'pending',
            activities: [
              {
                id: 'a6',
                type: 'presentation',
                title: '개별 결과 발표',
                duration: 30,
                instructions: '각자의 평가 결과와 근거를 발표합니다'
              },
              {
                id: 'a7',
                type: 'discussion',
                title: '차이점 논의',
                duration: 30,
                instructions: '평가 결과의 차이점을 분석하고 논의합니다'
              },
              {
                id: 'a8',
                type: 'consensus',
                title: '최종 합의',
                duration: 30,
                instructions: '그룹 AHP를 통해 최종 합의안을 도출합니다'
              }
            ]
          }
        ],
        consensusLevel: 0.78,
        totalParticipants: 4,
        completedEvaluations: 3
      },
      {
        id: 'w2',
        title: '마케팅 전략 선택',
        description: '2024년 주요 마케팅 전략을 선택하는 의사결정 워크숍',
        facilitator: '박마케팅본부장',
        participants: ['김기획자', '이분석가', '최실행자'],
        status: 'planning',
        startDate: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
        projectId: 'p2',
        sessions: [],
        consensusLevel: 0,
        totalParticipants: 3,
        completedEvaluations: 0
      }
    ];
    
    setWorkshops(sampleWorkshops);
    if (sampleWorkshops.length > 0) {
      setSelectedWorkshop(sampleWorkshops[0]);
    }
    setLoading(false);
  };

  const getStatusColor = (status: Workshop['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: Workshop['status']) => {
    switch (status) {
      case 'planning': return '계획중';
      case 'active': return '진행중';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return '알 수 없음';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 워크숍 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="총 워크숍">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{workshops.length}</div>
            <div className="text-sm text-gray-600">개</div>
          </div>
        </Card>
        <Card title="진행중">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {workshops.filter(w => w.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">개</div>
          </div>
        </Card>
        <Card title="평균 합의도">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {(workshops.reduce((acc, w) => acc + w.consensusLevel, 0) / workshops.length * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">일관성</div>
          </div>
        </Card>
        <Card title="총 참가자">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {workshops.reduce((acc, w) => acc + w.totalParticipants, 0)}
            </div>
            <div className="text-sm text-gray-600">명</div>
          </div>
        </Card>
      </div>

      {/* 워크숍 목록 */}
      <Card title="워크숍 목록">
        <div className="space-y-4">
          {workshops.map(workshop => (
            <div key={workshop.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                 onClick={() => setSelectedWorkshop(workshop)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium">{workshop.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(workshop.status)}`}>
                      {getStatusName(workshop.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{workshop.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>진행자: {workshop.facilitator}</span>
                    <span>참가자: {workshop.totalParticipants}명</span>
                    <span>시작일: {new Date(workshop.startDate).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-2">
                    진행률: {workshop.status === 'active' ? 
                      Math.round((workshop.completedEvaluations / workshop.totalParticipants) * 100) : 0}%
                  </div>
                  {workshop.status === 'active' && (
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(workshop.completedEvaluations / workshop.totalParticipants) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderPlanning = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">워크숍 계획</h2>
        <Button variant="primary" onClick={() => alert('워크숍 생성 기능 구현 예정')}>
          새 워크숍 생성
        </Button>
      </div>

      <Card title="워크숍 템플릿">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: '기술 선택 워크숍',
              description: '새로운 기술 도입을 위한 의사결정',
              duration: '4시간',
              participants: '3-8명',
              sessions: 3
            },
            {
              name: '전략 수립 워크숍',
              description: '조직의 전략적 방향 설정',
              duration: '6시간',
              participants: '5-12명',
              sessions: 4
            },
            {
              name: '자원 배분 워크숍',
              description: '한정된 자원의 효율적 배분',
              duration: '3시간',
              participants: '3-6명',
              sessions: 2
            }
          ].map((template, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">{template.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>소요시간:</span>
                  <span>{template.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>참가자:</span>
                  <span>{template.participants}</span>
                </div>
                <div className="flex justify-between">
                  <span>세션수:</span>
                  <span>{template.sessions}개</span>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4">
                템플릿 사용
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderFacilitation = () => (
    <div className="space-y-6">
      {selectedWorkshop && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{selectedWorkshop.title} - 진행 관리</h2>
            <div className="flex space-x-2">
              <Button variant="secondary">세션 일시정지</Button>
              <Button variant="primary">다음 세션</Button>
            </div>
          </div>

          {/* 현재 세션 정보 */}
          <Card title="현재 세션">
            {selectedWorkshop.sessions.map(session => (
              <div key={session.id} className={`border rounded p-4 mb-4 ${
                session.status === 'active' ? 'border-blue-500 bg-blue-50' : ''
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{session.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{session.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span>소요시간: {session.duration}분</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        session.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status === 'completed' ? '완료' :
                         session.status === 'active' ? '진행중' : '대기'}
                      </span>
                    </div>
                  </div>
                  {session.status === 'active' && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">15:30</div>
                      <div className="text-sm text-gray-600">남은 시간</div>
                    </div>
                  )}
                </div>

                {/* 활동 목록 */}
                <div className="mt-4 space-y-2">
                  {session.activities.map(activity => (
                    <div key={activity.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.type === 'presentation' ? 'bg-blue-500' :
                        activity.type === 'discussion' ? 'bg-green-500' :
                        activity.type === 'evaluation' ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{activity.title}</div>
                        <div className="text-xs text-gray-600">{activity.instructions}</div>
                      </div>
                      <div className="text-sm text-gray-500">{activity.duration}분</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          {/* 참가자 현황 */}
          <Card title="참가자 현황">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedWorkshop.participants.map((participant, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                      {participant.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{participant}</div>
                      <div className="text-xs text-gray-600">
                        평가 진행률: {Math.floor(Math.random() * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-green-500 h-1 rounded-full" 
                        style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">워크숍 결과</h2>
      
      {selectedWorkshop && (
        <>
          {/* 합의도 분석 */}
          <Card title="그룹 합의도 분석">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(selectedWorkshop.consensusLevel * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">전체 합의도</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">0.08</div>
                <div className="text-sm text-gray-600">평균 CR</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">92%</div>
                <div className="text-sm text-gray-600">참여율</div>
              </div>
            </div>
          </Card>

          {/* 최종 순위 */}
          <Card title="최종 의사결정 결과">
            <div className="space-y-3">
              {[
                { name: 'AI/머신러닝', score: 0.421, rank: 1 },
                { name: '클라우드 컴퓨팅', score: 0.298, rank: 2 },
                { name: 'IoT', score: 0.186, rank: 3 },
                { name: '블록체인', score: 0.095, rank: 4 }
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      item.rank === 1 ? 'bg-yellow-500' :
                      item.rank === 2 ? 'bg-gray-400' :
                      item.rank === 3 ? 'bg-orange-600' : 'bg-gray-600'
                    }`}>
                      {item.rank}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.score * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{(item.score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: '워크숍 개요', icon: '📊' },
            { id: 'planning', name: '계획 수립', icon: '📋' },
            { id: 'facilitation', name: '진행 관리', icon: '🎯' },
            { id: 'results', name: '결과 분석', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'planning' && renderPlanning()}
      {activeTab === 'facilitation' && renderFacilitation()}
      {activeTab === 'results' && renderResults()}
    </div>
  );
};

export default WorkshopManager;