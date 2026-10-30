import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { Subscription, CATEGORY_COLORS } from '../types';
import { getBillingDaysInMonth, formatCurrency, getTodayLocal } from '../utils';

interface CalendarViewProps {
  subscriptions: Subscription[];
  onEditSubscription: (sub: Subscription) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  subscriptions,
  onEditSubscription,
}) => {
  const today = getTodayLocal();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0 - 11
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  // 切換上個月 / 下個月
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(1);
  };

  const handleJumpToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  // 計算當月總天數與第一天是星期幾 (0=週日)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // 建立每日扣款項目的 Map: day (1..31) -> Subscription[]
  const daySubscriptionsMap: Record<number, Subscription[]> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    daySubscriptionsMap[d] = [];
  }

  let monthlyActualTotal = 0;
  activeSubs.forEach((sub) => {
    const days = getBillingDaysInMonth(sub, currentYear, currentMonth);
    days.forEach((d) => {
      if (daySubscriptionsMap[d]) {
        daySubscriptionsMap[d].push(sub);
        monthlyActualTotal += sub.price;
      }
    });
  });

  const selectedDaySubs = daySubscriptionsMap[selectedDay] || [];
  const selectedDayTotal = selectedDaySubs.reduce((sum, s) => sum + s.price, 0);

  const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

  return (
    <div className="space-y-6">
      {/* 頂部月份切換與當月預計扣款總額 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            訂閱扣款日曆
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            點擊月曆上的任一日期，即可在右側檢視當天的預計扣款明細。
          </p>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className="text-right">
            <p className="text-xs text-slate-500">本月預計實際扣款總額</p>
            <p className="text-xl font-extrabold text-blue-700">
              {formatCurrency(monthlyActualTotal)}
            </p>
          </div>

          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-700 transition-all"
              title="上一個月"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-sm text-slate-900 min-w-[105px] text-center">
              {currentYear} 年 {currentMonth + 1} 月
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-700 transition-all"
              title="下一個月"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleJumpToday}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            回到今天
          </button>
        </div>
      </div>

      {/* 主體：左月曆 (佔2欄) + 右側當日明細 (佔1欄) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 月曆網格 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
          {/* 星期標題 */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {weekDays.map((day, idx) => (
              <div
                key={day}
                className={`text-xs font-bold py-2 ${
                  idx === 0 || idx === 6 ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* 前置空白格 */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-xl bg-slate-50/50" />
            ))}

            {/* 實際日期 1 ~ daysInMonth */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const subsOnDay = daySubscriptionsMap[dayNum] || [];
              const isToday =
                currentYear === today.getFullYear() &&
                currentMonth === today.getMonth() &&
                dayNum === today.getDate();
              const isSelected = dayNum === selectedDay;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-all overflow-hidden ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30'
                      : isToday
                      ? 'border-blue-400 bg-blue-50/10'
                      : 'border-slate-200/70 hover:border-blue-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : isSelected
                          ? 'text-blue-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {subsOnDay.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {subsOnDay.length}筆
                      </span>
                    )}
                  </div>

                  {/* 顯示當天扣款服務標籤 (最多顯示2筆，超過顯示 +N) */}
                  <div className="space-y-1 w-full overflow-hidden">
                    {subsOnDay.slice(0, 2).map((sub) => {
                      const color = CATEGORY_COLORS[sub.category];
                      return (
                        <div
                          key={sub.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate ${color.bg} ${color.text}`}
                        >
                          {sub.name}
                        </div>
                      );
                    })}
                    {subsOnDay.length > 2 && (
                      <div className="text-[10px] font-bold text-blue-600 pl-1">
                        +{subsOnDay.length - 2} 項更多
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 右側：點擊日期的扣款項目明細 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                當日扣款明細
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {currentYear} 年 {currentMonth + 1} 月 {selectedDay} 日
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                共 {selectedDaySubs.length} 項服務預計在此日扣款
              </p>
            </div>

            {selectedDaySubs.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-sm font-medium text-slate-400">這天沒有任何扣款項目</p>
                <p className="text-xs text-slate-400">您可以點擊其他標有色塊的日期查看</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 my-4">
                {selectedDaySubs.map((sub) => {
                  const color = CATEGORY_COLORS[sub.category];
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onEditSubscription(sub)}
                      className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-3 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 truncate">{sub.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${color.bg} ${color.text}`}
                            >
                              {sub.category}
                            </span>
                            <span className="text-xs text-slate-400">
                              {sub.billingCycle === 'monthly' ? '月繳' : '年繳'}
                            </span>
                            {sub.isFreeTrial && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-purple-600">
                                <Sparkles className="w-2.5 h-2.5" /> 試用
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-sm text-slate-900">
                          {formatCurrency(sub.price, sub.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">當日預計扣款小計</span>
            <span className="text-lg font-extrabold text-blue-700">
              {formatCurrency(selectedDayTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};