import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionPlan, UserSubscription, SubscriptionUsage, ExtendedUser } from '../../types/subscription';

interface SubscriptionDashboardProps {
  user: ExtendedUser;
  className?: string;
}

const SubscriptionDashboard: React.FC<SubscriptionDashboardProps> = ({
  user,
  className = ''
}) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [personalAdmins, setPersonalAdmins] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'admins' | 'billing'>('overview');

  useEffect(() => {
    loadSubscriptionData();
  }, [user.id]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subData, usageData, plansData] = await Promise.all([
        subscriptionService.getCurrentSubscription(user.id),
        subscriptionService.getUsage(user.id),
        subscriptionService.getAvailablePlans().catch(() => subscriptionService.getDefaultPlans())
      ]);

      setSubscription(subData);
      setUsage(usageData);
      setPlans(plansData);

      // 총괄 관리자인 경우 개인 관리자 목록 로드
      if (user.role === 'super_admin') {
        const adminsData = await subscriptionService.getPersonalAdmins(user.id);
        setPersonalAdmins(adminsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      const result = await subscriptionService.subscribeToPlan({
        planId,
        paymentMethod: 'card'
      });
      
      if (result.success) {
        await loadSubscriptionData();
        alert('구독이 성공적으로 완료되었습니다!');
      } else {
        alert(result.error || '구독 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '구독 처리 실패');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlan = (): SubscriptionPlan | null => {
    if (!subscription) return null;
    return plans.find(p => p.id === subscription.planId) || null;
  };

  const getUsagePercentage = (current: number, limit: number): number => {
    if (limit === -1) return 0; // unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'red';
    if (percentage >= 70) return 'yellow';
    return 'green';
  };

  const formatPrice = (price: number, currency: string): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency === 'KRW' ? 'KRW' : 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <Card title="오류">
          <div className="text-red-600">{error}</div>
          <button
            onClick={loadSubscriptionData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </Card>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: '개요', icon: '📊' },
            { id: 'plans', name: '요금제', icon: '💳' },
            ...(user.role === 'super_admin' ? [{ id: 'admins', name: '관리자 관리', icon: '👥' }] : []),
            { id: 'billing', name: '결제 내역', icon: '🧾' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 개요 탭 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 현재 구독 상태 */}
          <Card title="현재 구독 상태">
            {subscription && currentPlan ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{currentPlan.name}</h3>
                    <p className="text-gray-600">{currentPlan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatPrice(currentPlan.price, currentPlan.currency)}</div>
                    <div className="text-sm text-gray-500">월간</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm text-gray-600">구독 시작일</div>
                    <div className="font-medium">{new Date(subscription.startDate).toLocaleDateString('ko-KR')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">다음 결제일</div>
                    <div className="font-medium">{new Date(subscription.endDate).toLocaleDateString('ko-KR')}</div>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded ${
                  subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                  subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  상태: {subscription.status === 'active' ? '활성' : 
                        subscription.status === 'cancelled' ? '취소됨' : '대기중'}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">구독 중인 요금제가 없습니다.</div>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  요금제 선택하기
                </button>
              </div>
            )}
          </Card>

          {/* 사용량 현황 */}
          {usage && currentPlan && (
            <Card title="사용량 현황">
              <div className="space-y-4">
                {[
                  { label: '개인 관리자', current: usage.personalAdminsCount, limit: currentPlan.limits.maxPersonalAdmins },
                  { label: '총 프로젝트', current: usage.totalProjectsCount, limit: currentPlan.limits.maxPersonalAdmins * currentPlan.limits.maxProjectsPerAdmin },
                  { label: '총 설문', current: usage.totalSurveysCount, limit: usage.totalProjectsCount * currentPlan.limits.maxSurveysPerProject },
                  { label: '저장 공간 (GB)', current: usage.storageUsed, limit: currentPlan.limits.storageLimit }
                ].map(item => {
                  const percentage = getUsagePercentage(item.current, item.limit);
                  const color = getUsageColor(percentage);
                  
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span>
                          {item.current} / {item.limit === -1 ? '무제한' : item.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-${color}-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      {percentage >= 90 && item.limit !== -1 && (
                        <div className="text-red-600 text-xs mt-1">
                          ⚠️ 한도에 근접했습니다. 업그레이드를 고려해보세요.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 요금제 탭 */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <Card title="요금제 선택">
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-6 relative ${
                    plan.isPopular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  } ${currentPlan?.id === plan.id ? 'ring-2 ring-green-500' : ''}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">인기</span>
                    </div>
                  )}
                  
                  {currentPlan?.id === plan.id && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">현재 플랜</span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{formatPrice(plan.price, plan.currency)}</span>
                      <span className="text-gray-500">/월</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map(feature => (
                      <li key={feature.id} className="flex items-center text-sm">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>
                          {feature.name}
                          {feature.limit && feature.limit > 0 && (
                            <span className="text-gray-500"> ({feature.limit}개)</span>
                          )}
                          {feature.limit === -1 && (
                            <span className="text-green-600"> (무제한)</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={currentPlan?.id === plan.id || loading}
                    className={`w-full py-2 px-4 rounded font-medium ${
                      currentPlan?.id === plan.id
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {currentPlan?.id === plan.id ? '현재 이용중' : '선택하기'}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 관리자 관리 탭 (총괄 관리자만) */}
      {activeTab === 'admins' && user.role === 'super_admin' && (
        <div className="space-y-6">
          <Card title="개인 관리자 관리">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">등록된 개인 관리자</h3>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  새 관리자 추가
                </button>
              </div>

              {personalAdmins.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">이름</th>
                        <th className="px-4 py-2 text-left">이메일</th>
                        <th className="px-4 py-2 text-left">프로젝트 수</th>
                        <th className="px-4 py-2 text-left">생성일</th>
                        <th className="px-4 py-2 text-left">상태</th>
                        <th className="px-4 py-2 text-left">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personalAdmins.map(admin => (
                        <tr key={admin.id} className="border-t">
                          <td className="px-4 py-2">{admin.first_name} {admin.last_name}</td>
                          <td className="px-4 py-2">{admin.email}</td>
                          <td className="px-4 py-2">0 / {currentPlan?.limits.maxProjectsPerAdmin || 0}</td>
                          <td className="px-4 py-2">{new Date(admin.createdAt).toLocaleDateString('ko-KR')}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {admin.isActive ? '활성' : '비활성'}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <button className="text-blue-600 hover:text-blue-800 mr-2">편집</button>
                            <button className="text-red-600 hover:text-red-800">비활성화</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  등록된 개인 관리자가 없습니다.
                </div>
              )}

              {currentPlan && (
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-sm text-blue-800">
                    💡 현재 플랜에서는 최대 {currentPlan.limits.maxPersonalAdmins === -1 ? '무제한' : currentPlan.limits.maxPersonalAdmins}명의 
                    개인 관리자를 등록할 수 있으며, 각 관리자는 {currentPlan.limits.maxProjectsPerAdmin === -1 ? '무제한' : currentPlan.limits.maxProjectsPerAdmin}개의 
                    프로젝트를 생성할 수 있습니다.
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 결제 내역 탭 */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <Card title="결제 내역">
            <div className="text-center py-8 text-gray-500">
              결제 내역을 불러오는 중...
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDashboard;