import React from 'react';
import {
  CreditCard,
  TrendingUp,
  CalendarClock,
  Sparkles,
  BellRing,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Subscription, CATEGORIES, CATEGORY_COLORS, AlertItem } from '../types';
import {
  getMonthlyEquivalent,
  getYearlyEquivalent,
  formatCurrency,
  getEffectiveNextBillingDate,
  getDaysFromToday,
} from '../utils';

interface DashboardProps {
  subscriptions: Subscription[];
  alerts: AlertItem[];
  onAddClick: () => void;
  onNavigate: (tab: string) => void;
  onEditSubscription: (sub: Subscription) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  subscriptions,
  alerts,
  onAddClick,
  onNavigate,
  onEditSubscription,
}) => {
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  // 計算月支出與年預估支出
  const monthlyTotal = activeSubs.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
  const yearlyTotal = activeSubs.reduce((sum, s) => sum + getYearlyEquivalent(s), 0);

  // 最近即將扣款的訂閱 (取前 5 筆)
  const upcomingBillings = [...activeSubs]
    .map((s) => {
      const nextDate = getEffectiveNextBillingDate(s);
      return { ...s, effectiveDate: nextDate, daysLeft: getDaysFromToday(nextDate) };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  // 免費試用中的服務
  const activeTrials = activeSubs
    .filter((s) => s.isFreeTrial && s.trialEndDate)
    .map((s) => ({
      ...s,
      trialDaysLeft: getDaysFromToday(s.trialEndDate!),
    }))
    .sort((a, b) => a.trialDaysLeft - b.trialDaysLeft);

  // 各分類當月等值支出統計
  const categoryStats = CATEGORIES.map((cat) => {
    const amount = activeSubs
      .filter((s) => s.category === cat)
      .reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
    const percentage = monthlyTotal > 0 ? Math.round((amount / monthlyTotal) * 100) : 0;
    return { category: cat, amount, percentage };
  })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      {/* 頂部歡迎與快速操作橫幅 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> SubCal 智慧訂閱管理中心
          </span>
          <h1 className="text-2xl font-bold tracking-tight">掌握每一筆定期支出，不再被悄悄扣款</h1>
          <p className="text-slate-300 text-sm mt-1">
            目前共有 <span className="text-white font-semibold">{activeSubs.length}</span> 個啟用中的服務，系統正為您即時監控扣款與試用期限。
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          新增訂閱服務
        </button>
      </div>

      {/* 關鍵指標 4 張卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">目前啟用訂閱</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{activeSubs.length} <span className="text-sm font-normal text-slate-500">項</span></p>
            <p className="text-xs text-slate-500 mt-2">
              另有 {subscriptions.length - activeSubs.length} 項已取消紀錄
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">每月預估總支出</p>
            <p className="text-2xl font-extrabold text-blue-700 mt-2">{formatCurrency(monthlyTotal)}</p>
            <p className="text-xs text-slate-500 mt-2">年繳項目已自動換算為月均額</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">全年預估總支出</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatCurrency(yearlyTotal)}</p>
            <p className="text-xs text-slate-500 mt-2">以目前啟用項目推估 12 個月</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <CalendarClock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">免費試用追蹤中</p>
            <p className="text-3xl font-extrabold text-purple-700 mt-2">{activeTrials.length} <span className="text-sm font-normal text-slate-500">項</span></p>
            <p className="text-xs text-purple-600 font-medium mt-2">
              {alerts.length > 0 ? `有 ${alerts.length} 則近期提醒需注意` : '目前無緊急到期項目'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <BellRing className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 近期智慧提醒橫幅 (若有提醒才顯示) */}
      {alerts.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold text-amber-950">近期重要提醒（扣款與試用期滿通知）</h2>
            </div>
            <button
              onClick={() => onNavigate('notifications')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              查看全部 ({alerts.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 bg-white ${
                  alert.severity === 'high'
                    ? 'border-red-200 text-red-900'
                    : 'border-amber-200 text-slate-800'
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-xs shrink-0 mt-0.5 ${
                    alert.severity === 'high'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {alert.daysLeft < 0
                    ? '已過期'
                    : alert.daysLeft === 0
                    ? '今天到期'
                    : `剩 ${alert.daysLeft} 天`}
                </span>
                <span className="leading-relaxed">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 主內容雙欄：左側「最近即將扣款 + 免費試用專區」，右側「當月訂閱支出結構圖表」 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側佔 2 欄 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 最近即將扣款的訂閱 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">最近即將扣款的訂閱</h2>
                <p className="text-xs text-slate-500">依照下一次扣款日期由近到遠排序</p>
              </div>
              <button
                onClick={() => onNavigate('subscriptions')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                管理所有訂閱 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingBillings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                目前沒有啟用中的訂閱項目，點擊右上角新增您的第一筆訂閱吧！
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingBillings.map((sub) => {
                  const color = CATEGORY_COLORS[sub.category];
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onEditSubscription(sub)}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${color.bg} ${color.text} border ${color.border}`}
                        >
                          {sub.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-sm truncate">{sub.name}</p>
                            <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${color.bg} ${color.text}`}>
                              {sub.category}
                            </span>
                            {sub.isFreeTrial && (
                              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-purple-100 text-purple-700">
                                免費試用
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            下次扣款日：{sub.effectiveDate}（{sub.billingCycle === 'monthly' ? '月繳' : '年繳'}）
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900 text-sm">
                          {formatCurrency(sub.price, sub.currency)}
                        </p>
                        <span
                          className={`inline-block text-xs font-semibold mt-0.5 ${
                            sub.daysLeft <= 3
                              ? 'text-red-600'
                              : sub.daysLeft <= 7
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {sub.daysLeft === 0 ? '今天扣款' : `${sub.daysLeft} 天後`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 近期免費試用即將結束的服務 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">近期免費試用追蹤</h2>
                  <p className="text-xs text-slate-500">避免試用期滿忘記取消而被自動收取正價費用</p>
                </div>
              </div>
            </div>

            {activeTrials.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl text-slate-500 text-sm">
                目前沒有標記為「免費試用」的服務。
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeTrials.map((trial) => {
                  const isUrgent = trial.trialDaysLeft <= 3;
                  return (
                    <div
                      key={trial.id}
                      onClick={() => onEditSubscription(trial)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                        isUrgent
                          ? 'bg-red-50/50 border-red-200'
                          : 'bg-purple-50/40 border-purple-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{trial.name}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            trial.trialDaysLeft < 0
                              ? 'bg-red-600 text-white'
                              : trial.trialDaysLeft === 0
                              ? 'bg-orange-600 text-white animate-pulse'
                              : isUrgent
                              ? 'bg-red-100 text-red-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {trial.trialDaysLeft < 0
                            ? `已超期 ${Math.abs(trial.trialDaysLeft)} 天`
                            : trial.trialDaysLeft === 0
                            ? '今天試用到期！'
                            : `剩餘 ${trial.trialDaysLeft} 天`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2">
                        試用結束日：<span className="font-semibold">{trial.trialEndDate}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        轉正後價格：{formatCurrency(trial.price, trial.currency)} /{' '}
                        {trial.billingCycle === 'monthly' ? '月' : '年'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 右側：當月訂閱支出結構圖表 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">當月訂閱支出圖表</h2>
                <p className="text-xs text-slate-500">各分類每月等值花費佔比</p>
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                詳細報表
              </button>
            </div>

            {categoryStats.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">尚無支出資料</div>
            ) : (
              <>
                {/* 視覺化分段比例橫條圖 */}
                <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex gap-0.5 p-0.5 mb-6">
                  {categoryStats.map((stat) => (
                    <div
                      key={stat.category}
                      style={{
                        width: `${Math.max(stat.percentage, 4)}%`,
                        backgroundColor: CATEGORY_COLORS[stat.category].hex,
                      }}
                      className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                      title={`${stat.category}: ${formatCurrency(stat.amount)} (${stat.percentage}%)`}
                    />
                  ))}
                </div>

                {/* 各分類長條明細 */}
                <div className="space-y-4">
                  {categoryStats.map((stat) => {
                    const color = CATEGORY_COLORS[stat.category];
                    return (
                      <div key={stat.category} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-semibold text-slate-700">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: color.hex }}
                            />
                            {stat.category}
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(stat.amount)}{' '}
                            <span className="text-slate-400 font-normal">({stat.percentage}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${stat.percentage}%`,
                              backgroundColor: color.hex,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>每月平均總計</span>
            <span className="text-base font-extrabold text-blue-700">{formatCurrency(monthlyTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};