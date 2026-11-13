# SubCal 智慧訂閱管理系統 (npm CLI 套件版)

SubCal 是一套專為個人設計的現代化「智慧訂閱管理系統」，協助使用者集中管理各類串流影音、雲端軟體與工具的定期扣款項目，透過視覺化圖表與日曆掌握每月開銷，避免忘記取消免費試用或重複扣款。

本套件將 SubCal 封裝為 Node.js CLI 工具並發布於公開套件庫 npm，使用者無須手動下載原始碼編譯，即可透過單行指令在本地端快速啟動服務。

## 相關連結

- **npm 套件頁面**：https://www.npmjs.com/package/@easonxie/subcal
- **Cloudflare 線上展示**：https://subcal.easonxie302.workers.dev

## 快速啟動 (Quick Start)

確保電腦已安裝 [Node.js](https://nodejs.org/)，無須事先安裝套件，直接在終端機執行以下指令即可在本地端啟動並自動開啟瀏覽器：

```bash
npx @easonxie/subcal
```

若希望全域安裝至系統中重複使用：

```bash
npm install -g @easonxie/subcal
subcal
```

## 主要功能

1. **總覽儀表板 (Dashboard)**：即時統計每月／每年總花費、活躍訂閱數量與近期即將扣款項目。
2. **訂閱項目管理 (Subscriptions)**：支援新增、編輯、刪除與分類篩選訂閱服務，並自動換算月費與年費。
3. **扣款日曆檢視 (Calendar)**：以月曆形式直觀呈現每日扣款排程。
4. **到期與試用提醒 (Notifications & Free Trials)**：追蹤免費試用期與即將到期的帳單，防止超額扣款。
5. **消費數據分析 (Analytics)**：使用 Recharts 繪製各類別支出佔比與費用趨勢圖表。

## 技術架構

- **前端框架**：React 19 + TypeScript + Vite
- **介面設計**：Tailwind CSS + Lucide React Icons
- **資料視覺化**：Recharts
- **資料儲存**：瀏覽器 LocalStorage（純前端無狀態架構，保障個人財務隱私）
- **套件封裝與發布**：Node.js ESM CLI (`bin.js`) + npm Registry