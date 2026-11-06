# 第 9 週作業：Cloudflare 網站應用部署 — SubCal 智慧訂閱管理系統

## 線上展示與程式碼連結

* **Cloudflare 線上部署網址**：[https://subcal.easonxie302.workers.dev](https://subcal.easonxie302.workers.dev)
* **專案原始碼目錄**：[homework8 (SubCal 完整原始碼)](https://github.com/Eason-Xie302/_se/tree/main/homework/homework8)

---

## 專案簡介

**SubCal** 是一套專為個人設計的現代化「智慧訂閱管理系統」，協助使用者集中管理各類串流影音、雲端軟體與工具的定期扣款項目，透過視覺化圖表與日曆掌握每月開銷，避免忘記取消免費試用或重複扣款。

### 主要功能
1. **總覽儀表板 (Dashboard)**：即時統計每月／每年總花費、活躍訂閱數量與近期即將扣款項目。
2. **訂閱項目管理 (Subscriptions)**：支援新增、編輯、刪除與分類篩選訂閱服務，並自動換算月費與年費。
3. **扣款日曆檢視 (Calendar)**：以月曆形式直觀呈現每日扣款排程。
4. **到期與試用提醒 (Notifications & Free Trials)**：追蹤免費試用期與即將到期的帳單，防止超額扣款。
5. **消費數據分析 (Analytics)**：使用 Recharts 繪製各類別支出佔比與費用趨勢圖表。

---

## 技術架構

* **前端框架**：React 18 + TypeScript + Vite
* **介面設計**：Tailwind CSS + Lucide React Icons
* **資料視覺化**：Recharts
* **資料儲存**：瀏覽器 LocalStorage（純前端無狀態架構，保障個人財務隱私）
* **雲端部署平台**：Cloudflare Workers (Static Assets 全球邊緣部署)

---

## Cloudflare 部署流程紀錄

本專案透過 Cloudflare 的 `Wrangler` CLI 工具將前端編譯後的靜態資源直接部署至 Cloudflare 全球邊緣網路：

### 1. 建立 `wrangler.toml` 設定檔
於專案根目錄建立 `wrangler.toml`，指定專案名稱與打包輸出目錄 `./dist`：

```toml
name = "subcal"
compatibility_date = "2026-11-01"

[assets]
directory = "./dist"