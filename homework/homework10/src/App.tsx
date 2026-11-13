import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  Plus,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { Subscription } from './types';
import { getInitialSampleData, generateAlerts } from './utils';
import { Dashboard } from './components/Dashboard';
import { SubscriptionList } from './components/SubscriptionList';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { NotificationCenter, SettingsView } from './components/NotificationAndSettings';
import { SubscriptionModal } from './components/SubscriptionModal';

const STORAGE_KEY = 'subcal_subscriptions_v1';

export function App() {
  // 從 LocalStorage 讀取資料，若為第一次開啟則載入預設範例資料
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load subscriptions from LocalStorage:', e);
    }
    return getInitialSampleData();
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 新增 / 編輯 Modal 狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // 當訂閱資料變動時，即時同步寫入 LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (e) {
      console.error('Failed to save subscriptions to LocalStorage:', e);
    }
  }, [subscriptions]);

  // 即時計算所有提醒
  const alerts = generateAlerts(subscriptions);

  // 新增或儲存編輯
  const handleSaveSubscription = (subData: Omit<Subscription, 'id'>, existingId?: string) => {
    if (existingId) {
      setSubscriptions((prev) =>
        prev.map((item) => (item.id === existingId ? { ...subData, id: existingId } : item))
      );
    } else {
      const newSub: Subscription = {
        ...subData,
        id: `sub-${Date.now()}`,
      };
      setSubscriptions((prev) => [newSub, ...prev]);
    }
  };

  // 刪除訂閱
  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((item) => item.id !== id));
  };

  // 切換使用中 / 已取消狀態（保留歷史紀錄）
  const handleToggleStatus = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'active' ? 'cancelled' : 'active' }
          : item
      )
    );
  };

  // 開啟新增視窗
  const handleOpenAddModal = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  // 開啟編輯視窗
  const handleOpenEditModal = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };

  const handleOpenEditById = (id: string) => {
    const target = subscriptions.find((s) => s.id === id);
    if (target) {
      handleOpenEditModal(target);
    }
  };

  const navItems = [
    { id: 'dashboard', label: '儀表板', icon: LayoutDashboard },
    { id: 'subscriptions', label: '我的訂閱', icon: CreditCard },
    { id: 'calendar', label: '訂閱日曆', icon: Calendar },
    { id: 'analytics', label: '支出統計', icon: BarChart3 },
    { id: 'notifications', label: '提醒中心', icon: Bell, badge: alerts.length },
    { id: 'settings', label: '設定', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* 桌面版左側固定導覽欄 */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white shrink-0 select-none">
        {/* 品牌 Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white">SubCal</span>
            <span className="block text-[11px] text-blue-300 font-medium">智慧訂閱管理系統</span>
          </div>
        </div>

        {/* 導覽選單 */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-white text-blue-700' : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 左下角快速新增按鈕 */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleOpenAddModal}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            快速新增訂閱
          </button>
        </div>
      </aside>

      {/* 右側主要內容區 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 手機版頂部導覽列 */}
        <header className="lg:hidden bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-base">SubCal 智慧訂閱管理</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="p-2 rounded-lg bg-blue-600 text-white"
              title="新增訂閱"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* 手機版下拉選單 */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 text-white px-4 pb-4 space-y-1 border-b border-slate-800 z-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 頁面主容器 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              subscriptions={subscriptions}
              alerts={alerts}
              onAddClick={handleOpenAddModal}
              onNavigate={setActiveTab}
              onEditSubscription={handleOpenEditModal}
            />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionList
              subscriptions={subscriptions}
              onAdd={handleOpenAddModal}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteSubscription}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              subscriptions={subscriptions}
              onEditSubscription={handleOpenEditModal}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView subscriptions={subscriptions} />}

          {activeTab === 'notifications' && (
            <NotificationCenter
              alerts={alerts}
              onEditSubscriptionById={handleOpenEditById}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              subscriptions={subscriptions}
              onImportData={(data) => setSubscriptions(data)}
              onResetSampleData={() => setSubscriptions(getInitialSampleData())}
              onClearAllData={() => setSubscriptions([])}
            />
          )}
        </main>
      </div>

      {/* 新增 / 編輯訂閱彈出視窗 */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSubscription}
        editingSubscription={editingSubscription}
      />
    </div>
  );
}

export default App;