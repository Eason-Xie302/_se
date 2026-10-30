export type BillingCycle = 'monthly' | 'yearly';

export type Category = '娛樂' | '音樂' | '遊戲' | 'AI 工具' | '雲端服務' | '工作' | '其他';

export type SubscriptionStatus = 'active' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string; // 格式 YYYY-MM-DD
  category: Category;
  isFreeTrial: boolean;
  trialEndDate?: string;   // 格式 YYYY-MM-DD
  notes?: string;
  status: SubscriptionStatus;
}

export interface AlertItem {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  category: Category;
  type: 'billing_7d' | 'billing_3d' | 'billing_today' | 'trial_ending' | 'trial_ended';
  daysLeft: number;
  targetDate: string;
  price: number;
  currency: string;
  message: string;
  severity: 'high' | 'medium' | 'info';
}

export const CATEGORIES: Category[] = [
  '娛樂',
  '音樂',
  '遊戲',
  'AI 工具',
  '雲端服務',
  '工作',
  '其他',
];

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string; hex: string }> = {
  '娛樂': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', hex: '#4f46e5' },
  '音樂': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#10b981' },
  '遊戲': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', hex: '#f97316' },
  'AI 工具': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hex: '#9333ea' },
  '雲端服務': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', hex: '#0284c7' },
  '工作': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hex: '#2563eb' },
  '其他': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', hex: '#64748b' },
};