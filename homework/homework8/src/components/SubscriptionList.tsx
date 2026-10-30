import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Ban,
  Sparkles,
} from 'lucide-react';
import { Subscription, CATEGORIES, CATEGORY_COLORS, Category } from '../types';
import {
  formatCurrency,
  getEffectiveNextBillingDate,
  getDaysFromToday,
  getMonthlyEquivalent,
} from '../utils';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onAdd: () => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onAdd,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'cancelled'>('ALL');
  const [sortBy, setSortBy] = useState<'nextDate' | 'priceDesc' | 'priceAsc' | 'name'>('nextDate');

  // 篩選與排序邏輯
  const filteredSubs = subscriptions
    .filter((sub) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.notes && sub.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || sub.category === selectedCategory;
      const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'nextDate') {
        const dateA = getEffectiveNextBillingDate(a);
        const dateB = getEffectiveNextBillingDate(b);
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'priceDesc') {
        return getMonthlyEquivalent(b) - getMonthlyEquivalent(a);
      }
      if (sortBy === 'priceAsc') {
        return getMonthlyEquivalent(a) - getMonthlyEquivalent(b);
      }
      return a.name.localeCompare(b.name, 'zh-Hant');
    });

  return (
    <div className="space-y-6">
      {/* 標題與新增按鈕 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">我的訂閱清單</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            集中管理所有定期扣款與免費試用服務，已取消的訂閱仍會保留歷史紀錄供您查閱。
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          新增訂閱
        </button>
      </div>

      {/* 搜尋、篩選與排序工具列 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* 關鍵字搜尋 */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋服務名稱或備註內容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            />
          </div>

          {/* 狀態篩選 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'active' | 'cancelled')}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-sm bg-white"
            >
              <option value="ALL">全部狀態 ({subscriptions.length})</option>
              <option value="active">
                🟢 使用中 ({subscriptions.filter((s) => s.status === 'active').length})
              </option>
              <option value="cancelled">
                ⚪ 已取消 ({subscriptions.filter((s) => s.status === 'cancelled').length})
              </option>
            </select>
          </div>

          {/* 排序方式 */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'nextDate' | 'priceDesc' | 'priceAsc' | 'name')
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-sm bg-white"
            >
              <option value="nextDate">依下次扣款日排序 (由近到遠)</option>
              <option value="priceDesc">依每月等值費用 (由高到低)</option>
              <option value="priceAsc">依每月等值費用 (由低到高)</option>
              <option value="name">依服務名稱排序</option>
            </select>
          </div>
        </div>

        {/* 分類快速切換膠囊按鈕 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部分類
          </button>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 訂閱清單表格 / 卡片 */}
      {filteredSubs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <p className="text-slate-500 font-medium">找不到符合條件的訂閱服務</p>
          <p className="text-xs text-slate-400">請嘗試調整搜尋關鍵字、分類篩選，或點擊右上角新增訂閱。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubs.map((sub) => {
            const color = CATEGORY_COLORS[sub.category];
            const isCancelled = sub.status === 'cancelled';
            const effectiveDate = getEffectiveNextBillingDate(sub);
            const daysLeft = getDaysFromToday(effectiveDate);
            const trialDaysLeft =
              sub.isFreeTrial && sub.trialEndDate ? getDaysFromToday(sub.trialEndDate) : null;

            return (
              <div
                key={sub.id}
                className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  isCancelled
                    ? 'border-slate-200 bg-slate-50/60 opacity-75'
                    : 'border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-200'
                }`}
              >
                <div>
                  {/* 卡片頂部：圖示、名稱、分類與價格 */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-base shrink-0 border ${
                          isCancelled
                            ? 'bg-slate-200 text-slate-500 border-slate-300'
                            : `${color.bg} ${color.text} ${color.border}`
                        }`}
                      >
                        {sub.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`font-bold text-base truncate ${
                              isCancelled ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {sub.name}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${color.bg} ${color.text}`}
                          >
                            {sub.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {isCancelled ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-200 text-slate-600">
                              已取消訂閱
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ● 使用中
                            </span>
                          )}

                          {sub.isFreeTrial && !isCancelled && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-700">
                              <Sparkles className="w-3 h-3" />
                              免費試用中
                              {trialDaysLeft !== null &&
                                (trialDaysLeft < 0
                                  ? ' (已期滿)'
                                  : trialDaysLeft === 0
                                  ? ' (今天到期)'
                                  : ` (剩 ${trialDaysLeft} 天)`)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 右側價格與週期 */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-extrabold text-slate-900">
                        {formatCurrency(sub.price, sub.currency)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {sub.billingCycle === 'monthly'
                          ? '每月扣款'
                          : `每年扣款 (月均 $${Math.round(sub.price / 12)})`}
                      </p>
                    </div>
                  </div>

                  {/* 日期與備註資訊 */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        {isCancelled ? '最後設定扣款日：' : '下一次扣款日期：'}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {effectiveDate}
                        {!isCancelled && (
                          <span
                            className={`ml-2 font-bold ${
                              daysLeft <= 3
                                ? 'text-red-600'
                                : daysLeft <= 7
                                ? 'text-amber-600'
                                : 'text-blue-600'
                            }`}
                          >
                            ({daysLeft === 0 ? '今天' : `${daysLeft} 天後`})
                          </span>
                        )}
                      </span>
                    </div>

                    {sub.isFreeTrial && sub.trialEndDate && (
                      <div className="flex items-center justify-between text-purple-700 font-medium">
                        <span>免費試用結束日：</span>
                        <span>{sub.trialEndDate}</span>
                      </div>
                    )}

                    {sub.notes && (
                      <p className="text-slate-500 bg-slate-50 p-2 rounded-lg mt-2 truncate" title={sub.notes}>
                        備註：{sub.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* 底部操作按鈕列 */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onToggleStatus(sub.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isCancelled
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {isCancelled ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" /> 重新啟用
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" /> 標記已取消
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onEdit(sub)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> 編輯
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`確定要永久刪除「${sub.name}」的訂閱紀錄嗎？\n(若只想保留歷史紀錄，建議點擊「標記已取消」)`)) {
                        onDelete(sub.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 刪除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};