import { Subscription, AlertItem } from './types';

// 嚴格以本地時間解析 YYYY-MM-DD，避免 UTC 時區導致日期少一天
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// 格式化為本地 YYYY-MM-DD
export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 取得今日零點的本地 Date
export function getTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// 取得距離今天的剩餘天數 (正數=未來, 0=今天, 負數=已過期)
export function getDaysFromToday(dateStr: string): number {
  const today = getTodayLocal();
  const target = parseLocalDate(dateStr);
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// 取得從今天算起偏移 N 天的日期字串 (用於動態產生範例資料)
export function getOffsetDateStr(offsetDays: number): string {
  const d = getTodayLocal();
  d.setDate(d.getDate() + offsetDays);
  return formatDateStr(d);
}

// 若訂閱的下次扣款日已經過去，自動往後推算到未來最近的一次扣款日
export function getEffectiveNextBillingDate(sub: Subscription): string {
  if (sub.status === 'cancelled') return sub.nextBillingDate;
  const today = getTodayLocal();
  const nextDate = parseLocalDate(sub.nextBillingDate);
  if (nextDate >= today) return sub.nextBillingDate;

  const updated = new Date(nextDate);
  while (updated < today) {
    if (sub.billingCycle === 'monthly') {
      updated.setMonth(updated.getMonth() + 1);
    } else {
      updated.setFullYear(updated.getFullYear() + 1);
    }
  }
  return formatDateStr(updated);
}

// 判斷某個訂閱在指定的「年、月 (0-11)」中，會在哪幾號扣款
export function getBillingDaysInMonth(sub: Subscription, year: number, month: number): number[] {
  if (sub.status !== 'active') return [];

  const anchor = parseLocalDate(sub.nextBillingDate);
  const anchorYear = anchor.getFullYear();
  const anchorMonth = anchor.getMonth();
  const anchorDay = anchor.getDate();

  // 取得該月份的總天數 (處理 28/29/30/31 號月底邊界)
  const daysInTargetMonth = new Date(year, month + 1, 0).getDate();
  const effectiveDay = Math.min(anchorDay, daysInTargetMonth);

  if (sub.billingCycle === 'monthly') {
    // 若目標年月早於基準設定年月太多，仍視為每月固定扣款日展示於月曆
    return [effectiveDay];
  } else {
    // 年繳：只有月份相符時才會在當月扣款
    if (month === anchorMonth && year >= anchorYear - 1) {
      return [effectiveDay];
    }
    return [];
  }
}

// 計算每月等值支出 (月繳直接算，年繳除以 12)
export function getMonthlyEquivalent(sub: Subscription): number {
  if (sub.status !== 'active') return 0;
  return sub.billingCycle === 'monthly' ? sub.price : Math.round((sub.price / 12) * 100) / 100;
}

// 計算全年預估支出 (每月等值支出 * 12)
export function getYearlyEquivalent(sub: Subscription): number {
  if (sub.status !== 'active') return 0;
  return sub.billingCycle === 'yearly' ? sub.price : sub.price * 12;
}

// 格式化金額顯示
export function formatCurrency(amount: number, currency = 'TWD'): string {
  const rounded = Math.round(amount);
  return `${currency} $${rounded.toLocaleString('zh-TW')}`;
}

// 產生系統所有智慧提醒 (7天內扣款、3天內扣款、免費試用即將到期/已到期)
export function generateAlerts(subscriptions: Subscription[]): AlertItem[] {
  const alerts: AlertItem[] = [];

  subscriptions
    .filter((s) => s.status === 'active')
    .forEach((sub) => {
      // 1. 檢查免費試用狀態
      if (sub.isFreeTrial && sub.trialEndDate) {
        const trialDays = getDaysFromToday(sub.trialEndDate);
        if (trialDays < 0) {
          alerts.push({
            id: `trial-ended-${sub.id}`,
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            category: sub.category,
            type: 'trial_ended',
            daysLeft: trialDays,
            targetDate: sub.trialEndDate,
            price: sub.price,
            currency: sub.currency,
            message: `「${sub.name}」免費試用已於 ${sub.trialEndDate} 結束！請確認是否已轉為正式付費或需要取消。`,
            severity: 'high',
          });
        } else if (trialDays === 0) {
          alerts.push({
            id: `trial-today-${sub.id}`,
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            category: sub.category,
            type: 'trial_ended',
            daysLeft: 0,
            targetDate: sub.trialEndDate,
            price: sub.price,
            currency: sub.currency,
            message: `緊急！「${sub.name}」的免費試用將在今天（${sub.trialEndDate}）結束！`,
            severity: 'high',
          });
        } else if (trialDays <= 7) {
          alerts.push({
            id: `trial-soon-${sub.id}`,
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            category: sub.category,
            type: 'trial_ending',
            daysLeft: trialDays,
            targetDate: sub.trialEndDate,
            price: sub.price,
            currency: sub.currency,
            message: `「${sub.name}」免費試用還有 ${trialDays} 天結束（${sub.trialEndDate}），結束後將扣款 ${formatCurrency(sub.price, sub.currency)}。`,
            severity: trialDays <= 3 ? 'high' : 'medium',
          });
        }
      }

      // 2. 檢查一般扣款日 (7天內與3天內)
      const effectiveDate = getEffectiveNextBillingDate(sub);
      const billingDays = getDaysFromToday(effectiveDate);

      if (billingDays === 0) {
        alerts.push({
          id: `bill-today-${sub.id}`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          category: sub.category,
          type: 'billing_today',
          daysLeft: 0,
          targetDate: effectiveDate,
          price: sub.price,
          currency: sub.currency,
          message: `今日扣款提醒：「${sub.name}」預計於今天扣款 ${formatCurrency(sub.price, sub.currency)}。`,
          severity: 'high',
        });
      } else if (billingDays > 0 && billingDays <= 3) {
        alerts.push({
          id: `bill-3d-${sub.id}`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          category: sub.category,
          type: 'billing_3d',
          daysLeft: billingDays,
          targetDate: effectiveDate,
          price: sub.price,
          currency: sub.currency,
          message: `3天內扣款提醒：「${sub.name}」將於 ${billingDays} 天後（${effectiveDate}）扣款 ${formatCurrency(sub.price, sub.currency)}。`,
          severity: 'high',
        });
      } else if (billingDays > 3 && billingDays <= 7) {
        alerts.push({
          id: `bill-7d-${sub.id}`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          category: sub.category,
          type: 'billing_7d',
          daysLeft: billingDays,
          targetDate: effectiveDate,
          price: sub.price,
          currency: sub.currency,
          message: `7天內扣款提醒：「${sub.name}」將於 ${billingDays} 天後（${effectiveDate}）扣款 ${formatCurrency(sub.price, sub.currency)}。`,
          severity: 'info',
        });
      }
    });

  return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
}

// 預設範例資料 (動態對齊使用者開啟網頁當下的日期，確保馬上有提醒與圖表可看)
export function getInitialSampleData(): Subscription[] {
  return [
    {
      id: 'sub-1',
      name: 'Netflix 標準方案',
      price: 380,
      currency: 'TWD',
      billingCycle: 'monthly',
      nextBillingDate: getOffsetDateStr(2), // 2天後扣款 (觸發3天內提醒)
      category: '娛樂',
      isFreeTrial: false,
      notes: '與家人共用帳號，每月自動從信用卡扣款',
      status: 'active',
    },
    {
      id: 'sub-2',
      name: 'ChatGPT Plus',
      price: 650,
      currency: 'TWD',
      billingCycle: 'monthly',
      nextBillingDate: getOffsetDateStr(6), // 6天後扣款 (觸發7天內提醒)
      category: 'AI 工具',
      isFreeTrial: false,
      notes: '寫程式與日常專案開發主力工具',
      status: 'active',
    },
    {
      id: 'sub-3',
      name: 'Spotify Premium 學生方案',
      price: 89,
      currency: 'TWD',
      billingCycle: 'monthly',
      nextBillingDate: getOffsetDateStr(12),
      category: '音樂',
      isFreeTrial: false,
      notes: '大學生優惠方案',
      status: 'active',
    },
    {
      id: 'sub-4',
      name: 'Claude Pro (試用體驗)',
      price: 650,
      currency: 'TWD',
      billingCycle: 'monthly',
      nextBillingDate: getOffsetDateStr(3),
      category: 'AI 工具',
      isFreeTrial: true,
      trialEndDate: getOffsetDateStr(3), // 3天後試用結束 (觸發免費試用提醒)
      notes: '測試程式碼重構能力，記得評估是否續訂',
      status: 'active',
    },
    {
      id: 'sub-5',
      name: 'PC Game Pass',
      price: 299,
      currency: 'TWD',
      billingCycle: 'monthly',
      nextBillingDate: getOffsetDateStr(18),
      category: '遊戲',
      isFreeTrial: false,
      notes: '週末與室友連線玩遊戲用',
      status: 'active',
    },
    {
      id: 'sub-6',
      name: 'Google One 200GB 雲端空間',
      price: 900,
      currency: 'TWD',
      billingCycle: 'yearly',
      nextBillingDate: getOffsetDateStr(25),
      category: '雲端服務',
      isFreeTrial: false,
      notes: '年繳方案平均每月只要 75 元，備份相簿與報告',
      status: 'active',
    },
    {
      id: 'sub-7',
      name: 'YouTube Premium 個人方案',
      price: 199,
      currency: 'TWD',
      billingCycle: 'monthly',
      nextBillingDate: getOffsetDateStr(0),
      category: '娛樂',
      isFreeTrial: true,
      trialEndDate: getOffsetDateStr(0), // 今天試用期滿
      notes: '免費一個月試用今天到期！',
      status: 'active',
    },
    {
      id: 'sub-8',
      name: 'Adobe Creative Cloud',
      price: 640,
      currency: 'TWD',
      billingCycle: 'monthly',
      nextBillingDate: getOffsetDateStr(-15),
      category: '工作',
      isFreeTrial: false,
      notes: '上學期課程結束後已取消訂閱，保留歷史紀錄',
      status: 'cancelled',
    },
  ];
}