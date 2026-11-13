import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Sparkles } from 'lucide-react';
import { Subscription, CATEGORIES, Category, BillingCycle, SubscriptionStatus } from '../types';
import { formatDateStr, getTodayLocal } from '../utils';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subData: Omit<Subscription, 'id'>, existingId?: string) => void;
  editingSubscription?: Subscription | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSubscription,
}) => {
  const todayStr = formatDateStr(getTodayLocal());

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('TWD');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState(todayStr);
  const [category, setCategory] = useState<Category>('娛樂');
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingSubscription) {
      setName(editingSubscription.name);
      setPrice(String(editingSubscription.price));
      setCurrency(editingSubscription.currency || 'TWD');
      setBillingCycle(editingSubscription.billingCycle);
      setNextBillingDate(editingSubscription.nextBillingDate);
      setCategory(editingSubscription.category);
      setIsFreeTrial(editingSubscription.isFreeTrial);
      setTrialEndDate(editingSubscription.trialEndDate || editingSubscription.nextBillingDate);
      setNotes(editingSubscription.notes || '');
      setStatus(editingSubscription.status);
    } else {
      setName('');
      setPrice('');
      setCurrency('TWD');
      setBillingCycle('monthly');
      setNextBillingDate(todayStr);
      setCategory('娛樂');
      setIsFreeTrial(false);
      setTrialEndDate(todayStr);
      setNotes('');
      setStatus('active');
    }
    setError('');
  }, [editingSubscription, isOpen, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const numPrice = Number(price);

    if (!trimmedName) {
      setError('請輸入訂閱服務名稱');
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      setError('請輸入有效的訂閱價格（不可為負數）');
      return;
    }
    if (!nextBillingDate) {
      setError('請選擇下一次扣款日期');
      return;
    }
    if (isFreeTrial && !trialEndDate) {
      setError('開啟免費試用時，請務必設定試用結束日期');
      return;
    }

    onSave(
      {
        name: trimmedName,
        price: numPrice,
        currency,
        billingCycle,
        nextBillingDate,
        category,
        isFreeTrial,
        trialEndDate: isFreeTrial ? trialEndDate : undefined,
        notes: notes.trim(),
        status,
      },
      editingSubscription?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* 頂部標題列 */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-300" />
            <h2 className="text-lg font-bold">
              {editingSubscription ? '編輯訂閱服務' : '新增訂閱服務'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表單內容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 服務名稱與分類 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                服務名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="例如：Netflix、Spotify、ChatGPT"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                訂閱分類
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 價格、幣別、週期 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                訂閱價格 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="380"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                幣別
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white"
              >
                <option value="TWD">TWD (新台幣)</option>
                <option value="USD">USD (美金)</option>
                <option value="JPY">JPY (日圓)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                付款週期
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white"
              >
                <option value="monthly">月繳 (每月扣款)</option>
                <option value="yearly">年繳 (每年扣款)</option>
              </select>
            </div>
          </div>

          {/* 下次扣款日與訂閱狀態 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                下一次扣款日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                訂閱狀態
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white"
              >
                <option value="active">🟢 使用中 (啟用計算)</option>
                <option value="cancelled">⚪ 已取消 (僅保留紀錄)</option>
              </select>
            </div>
          </div>

          {/* 免費試用切換區塊 */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-bold text-purple-950">目前為「免費試用」期間</span>
                <p className="text-xs text-purple-700 mt-0.5">
                  開啟後系統會為您追蹤試用剩餘天數，並在到期前發出醒目提醒
                </p>
              </div>
              <input
                type="checkbox"
                checked={isFreeTrial}
                onChange={(e) => setIsFreeTrial(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </label>

            {isFreeTrial && (
              <div className="pt-2 border-t border-purple-200/80">
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  免費試用結束日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={trialEndDate}
                  onChange={(e) => setTrialEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-purple-300 focus:border-purple-600 outline-none text-sm bg-white"
                />
              </div>
            )}
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              備註說明 (選填)
            </label>
            <textarea
              rows={2}
              placeholder="例如：綁定哪張信用卡、家庭方案分攤名單、取消網址等..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm resize-none"
            />
          </div>

          {/* 底部按鈕 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
            >
              {editingSubscription ? '儲存變更' : '立即新增訂閱'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};