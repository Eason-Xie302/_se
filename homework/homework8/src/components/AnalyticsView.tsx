import React from 'react';
import { PieChart, BarChart3, Award, Calculator } from 'lucide-react';
import { Subscription, CATEGORIES, CATEGORY_COLORS } from '../types';
import {
  getMonthlyEquivalent,
  getYearlyEquivalent,
  formatCurrency,
  getBillingDaysInMonth,
  getTodayLocal,
} from '../utils';

interface AnalyticsViewProps {
  subscriptions: Subscription[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ subscriptions }) => {
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  const monthlyEquivalentTotal = activeSubs.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
  const yearlyEquivalentTotal = activeSubs.reduce((sum, s) => sum + getYearlyEquivalent(s), 0);

  // 1. 各分類支出比例
  const categoryBreakdown = CATEGORIES.map((cat) => {
    const subsInCat = activeSubs.filter((s) => s.category === cat);
    const monthlyAmount = subsInCat.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
    const yearlyAmount = subsInCat.reduce((sum, s) => sum + getYearlyEquivalent(s), 0);
    const percentage =
      monthlyEquivalentTotal > 0 ? Math.round((monthlyAmount / monthlyEquivalentTotal) * 100) : 0;
    return {
      category: cat,
      count: subsInCat.length,
      monthlyAmount,
      yearlyAmount,
      percentage,
      color: CATEGORY_COLORS[cat].hex,
    };
  })
    .filter((c) => c.monthlyAmount > 0)
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount);

  // 2. 花費最高的訂閱服務排行 (依每月等值費用排序)
  const topRankingSubs = [...activeSubs]
    .map((s) => ({
      ...s,
      monthlyEq: getMonthlyEquivalent(s),
      yearlyEq: getYearlyEquivalent(s),
    }))
    .sort((a, b) => b.monthlyEq - a.monthlyEq);

  // 3. 未來 12 個月實際現金流支出長條圖 (反映年繳在特定月份造成的支出峰值)
  const today = getTodayLocal();
  const monthlyCashflow = Array.from({ length: 12 }).map((_, idx) => {
    const d = new Date(today.getFullYear(), today.getMonth() + idx, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    let actualTotal = 0;
    activeSubs.forEach((sub) => {
      const days = getBillingDaysInMonth(sub, y, m);
      if (days.length > 0) {
        actualTotal += sub.price * days.length;
      }
    });
    return {
      label: `${m + 1}月`,
      fullLabel: `${y}/${String(m + 1).padStart(2, '0')}`,
      amount: actualTotal,
    };
  });

  const maxCashflow = Math.max(...monthlyCashflow.map((m) => m.amount), 100);

  // 建立圓餅圖 conic-gradient 字串
  let currentAngle = 0;
  const conicSegments = categoryBreakdown.map((item) => {
    const start = currentAngle;
    const deg = (item.monthlyAmount / (monthlyEquivalentTotal || 1)) * 360;
    currentAngle += deg;
    return `${item.color} ${start}deg ${currentAngle}deg`;
  });
  const conicGradient =
    conicSegments.length > 0 ? `conic-gradient(${conicSegments.join(', ')})` : 'none';

  return (
    <div className="space-y-6">
      {/* 頂部統計總覽與換算邏輯說明 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">每月等值訂閱支出</p>
          <p className="text-3xl font-extrabold text-blue-700 mt-2">
            {formatCurrency(monthlyEquivalentTotal)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            包含所有月繳金額 + (年繳金額 ÷ 12 個月)
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">全年預估訂閱總支出</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {formatCurrency(yearlyEquivalentTotal)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            以每月等值支出 × 12 個月精準推算
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold">
            <Calculator className="w-4 h-4" />
            智慧攤提計算說明
          </div>
          <p className="text-xs text-slate-200 leading-relaxed mt-2">
            系統自動將「年繳方案」除以 12 換算為每月等值支出（例如年繳 $1,200 換算為月均 $100），讓您的月度財務結構分析更真實準確。
          </p>
        </div>
      </div>

      {/* 中段：左側「各分類支出比例圓餅圖」，右側「花費最高服務排行榜」 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 各訂閱分類支出比例 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">各訂閱分類支出比例</h2>
              <p className="text-xs text-slate-500">以每月等值支出計算各領域花費佔比</p>
            </div>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">尚無啟用中的訂閱資料</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* 甜甜圈圓餅圖 */}
              <div className="relative w-44 h-44 rounded-full shrink-0 flex items-center justify-center shadow-inner" style={{ background: conicGradient }}>
                <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center text-center p-2 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-medium">月均總計</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {formatCurrency(monthlyEquivalentTotal)}
                  </span>
                </div>
              </div>

              {/* 分類明細列表 */}
              <div className="flex-1 w-full space-y-3">
                {categoryBreakdown.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-xs border-b border-slate-100 pb-2 last:border-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-bold text-slate-800">{item.category}</span>
                      <span className="text-slate-400">({item.count} 項)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.monthlyAmount)}/月
                      </span>
                      <span className="ml-2 inline-block w-10 text-right font-semibold text-blue-600">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 花費最高的訂閱服務排行 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">花費最高的訂閱服務排行</h2>
              <p className="text-xs text-slate-500">檢視最主要的定期支出來源，評估是否需要降級或取消</p>
            </div>
          </div>

          {topRankingSubs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">尚無排行資料</div>
          ) : (
            <div className="space-y-3.5">
              {topRankingSubs.slice(0, 6).map((sub, idx) => {
                const ratio =
                  monthlyEquivalentTotal > 0
                    ? Math.round((sub.monthlyEq / monthlyEquivalentTotal) * 100)
                    : 0;
                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-900'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 truncate">{sub.name}</span>
                        <span className="text-slate-400 shrink-0">({sub.category})</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-slate-900">
                          {formatCurrency(sub.monthlyEq)}
                        </span>
                        <span className="text-slate-400"> /月 (年計 {formatCurrency(sub.yearlyEq)})</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(ratio, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 底部：未來 12 個月實際扣款變化長條圖 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">未來 12 個月每月實際扣款變化圖</h2>
              <p className="text-xs text-slate-500">
                結合月繳固定支出與年繳到期月份，預先掌握哪幾個月會有較高的帳單峰值
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end h-52 pt-8 pb-2 px-2 border-b border-slate-200">
          {monthlyCashflow.map((item) => {
            const heightPercent = Math.round((item.amount / maxCashflow) * 100);
            return (
              <div
                key={item.fullLabel}
                className="flex flex-col items-center justify-end h-full group"
              >
                <span className="text-[10px] font-bold text-slate-600 mb-1 opacity-80 group-hover:opacity-100 group-hover:text-blue-700">
                  ${Math.round(item.amount)}
                </span>
                <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-blue-700 to-blue-400 group-hover:from-indigo-600 group-hover:to-blue-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max(heightPercent, 6)}%` }}
                    title={`${item.fullLabel}: ${formatCurrency(item.amount)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-12 gap-2 sm:gap-3 pt-2 text-center">
          {monthlyCashflow.map((item) => (
            <div key={item.fullLabel} className="text-xs font-semibold text-slate-600">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};