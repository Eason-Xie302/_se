import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { AlertItem, Subscription } from '../types';

interface NotificationCenterProps {
  alerts: AlertItem[];
  onEditSubscriptionById: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  alerts,
  onEditSubscriptionById,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [testSentMessage, setTestSentMessage] = useState('');

  // 請求瀏覽器通知權限並發送即時提醒
  const handleEnableAndSendBrowserNotification = async () => {
    if (typeof Notification === 'undefined') {
      alert('您目前的瀏覽器環境不支援桌面 Notification API。');
      return;
    }

    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);

    if (permission === 'granted') {
      const urgentText =
        alerts.length > 0
          ? alerts[0].message
          : 'SubCal 智慧提醒已啟動！當網站開啟時，我們會為您即時推播近期扣款通知。';

      new Notification('SubCal 智慧訂閱提醒', {
        body: urgentText,
      });
      setTestSentMessage('已成功透過瀏覽器 Notification API 發送桌面通知！');
      setTimeout(() => setTestSentMessage(''), 4000);
    }
  };

  const trialAlerts = alerts.filter(
    (a) => a.type === 'trial_ending' || a.type === 'trial_ended'
  );
  const billing3dAlerts = alerts.filter(
    (a) => a.type === 'billing_today' || a.type === 'billing_3d'
  );
  const billing7dAlerts = alerts.filter((a) => a.type === 'billing_7d');

  return (
    <div className="space-y-6">
      {/* 頂部狀態與瀏覽器通知授權 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-blue-600" />
            智慧提醒中心
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            系統會在開啟網站時自動掃描「扣款前 7 天」、「扣款前 3 天」與「免費試用即將結束」的訂閱項目。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={handleEnableAndSendBrowserNotification}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
          >
            <Bell className="w-4 h-4" />
            {permissionStatus === 'granted' ? '立即推播桌面提醒測試' : '啟用瀏覽器桌面通知'}
          </button>
        </div>
      </div>

      {/* 誠實告知聲明與測試回饋 */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">關於提醒機制的運作說明：</p>
          <p className="text-blue-800">
            本系統目前採用純前端 LocalStorage 與瀏覽器原生 Notification API 實作。當您打開本網站時，系統會即時計算並顯示所有近期提醒；但請注意，若完全關閉瀏覽器或分頁，在未串接後端推播伺服器的情況下不會於背景自動發送通知。建議定期開啟 SubCal 檢視最新帳單動態。
          </p>
          {testSentMessage && (
            <p className="text-emerald-700 font-bold pt-1">✓ {testSentMessage}</p>
          )}
        </div>
      </div>

      {/* 三大提醒分類區塊 */}
      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="text-base font-bold text-slate-800">太棒了！未來 7 天內沒有任何緊急扣款或試用到期項目</p>
          <p className="text-xs text-slate-400">您可以安心使用目前的訂閱服務。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. 免費試用結束提醒 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-purple-900 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              免費試用期滿提醒 ({trialAlerts.length})
            </h2>
            {trialAlerts.length === 0 ? (
              <p className="text-xs text-slate-400">目前沒有即將到期的免費試用項目。</p>
            ) : (
              <div className="space-y-3">
                {trialAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => onEditSubscriptionById(alert.subscriptionId)}
                    className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between gap-4 cursor-pointer hover:bg-purple-100/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-purple-600 text-white">
                        {alert.daysLeft < 0
                          ? '試用已過期'
                          : alert.daysLeft === 0
                          ? '今天試用結束！'
                          : `試用剩餘 ${alert.daysLeft} 天`}
                      </span>
                      <p className="text-sm font-bold text-slate-900">{alert.message}</p>
                    </div>
                    <span className="text-xs font-semibold text-purple-700 shrink-0">
                      點擊處理 →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. 扣款前 3 天內 / 當日緊急提醒 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-red-900 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              3 天內即將扣款提醒 ({billing3dAlerts.length})
            </h2>
            {billing3dAlerts.length === 0 ? (
              <p className="text-xs text-slate-400">未來 3 天內沒有即將扣款的項目。</p>
            ) : (
              <div className="space-y-3">
                {billing3dAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => onEditSubscriptionById(alert.subscriptionId)}
                    className="p-4 rounded-xl bg-red-50/70 border border-red-200 flex items-center justify-between gap-4 cursor-pointer hover:bg-red-100/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
                        {alert.daysLeft === 0 ? '今日扣款' : `倒數 ${alert.daysLeft} 天`}
                      </span>
                      <p className="text-sm font-bold text-slate-900">{alert.message}</p>
                    </div>
                    <span className="text-xs font-semibold text-red-700 shrink-0">
                      檢視訂閱 →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. 扣款前 7 天預告提醒 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              7 天內扣款預告 ({billing7dAlerts.length})
            </h2>
            {billing7dAlerts.length === 0 ? (
              <p className="text-xs text-slate-400">未來 4 ~ 7 天內沒有預告扣款項目。</p>
            ) : (
              <div className="space-y-3">
                {billing7dAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => onEditSubscriptionById(alert.subscriptionId)}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                        {alert.daysLeft} 天後扣款
                      </span>
                      <p className="text-sm font-semibold text-slate-800">{alert.message}</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 shrink-0">
                      檢視訂閱 →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== 設定頁面元件 ====================
interface SettingsViewProps {
  subscriptions: Subscription[];
  onImportData: (data: Subscription[]) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  subscriptions,
  onImportData,
  onResetSampleData,
  onClearAllData,
}) => {
  // 匯出 JSON 備份檔
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(subscriptions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subcal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 匯入 JSON 備份檔
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result));
        if (Array.isArray(parsed)) {
          onImportData(parsed);
          alert(`成功匯入 ${parsed.length} 筆訂閱紀錄！`);
        } else {
          alert('檔案格式不正確，請確認為 SubCal 匯出的 JSON 陣列格式。');
        }
      } catch {
        alert('讀取 JSON 檔案失敗，請檢查檔案是否損毀。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">系統資料與備份設定</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          您的所有訂閱資料皆安全儲存在本機瀏覽器的 LocalStorage 中，不會上傳至任何外部伺服器。
        </p>

        <div className="mt-6 space-y-4 divide-y divide-slate-100">
          {/* 匯出與匯入備份 */}
          <div className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">匯出 / 匯入訂閱資料備份 (JSON)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                更換電腦或清除瀏覽器快取前，可將資料匯出保存。
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4" /> 匯出備份檔
              </button>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-4 h-4" /> 匯入備份檔
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 還原範例資料 */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">重置為預設展示資料</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                將目前的資料重置為系統內建的 8 筆精選範例訂閱（包含 Netflix、ChatGPT、試用項目等）。
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('確定要重置為預設範例資料嗎？您目前自訂的修改將會被覆蓋。')) {
                  onResetSampleData();
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold shrink-0 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> 載入範例資料
            </button>
          </div>

          {/* 清空所有資料 */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> 清空所有訂閱資料
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                刪除 LocalStorage 中的全部紀錄，從零開始建立您個人的訂閱清單。
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('警告：確定要清空所有訂閱資料嗎？此操作無法復原！')) {
                  onClearAllData();
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold shrink-0 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> 全部清空
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};