# Docker 學習紀錄與微服務校務管理系統

本專案為學習 Docker 與容器編排技術之實作紀錄，透過 `Dockerfile` 與 `docker-compose.yml` 建置一個三層式微服務架構的**「校務選課與學籍成績管理系統」**。

---

## 一、 Docker 學習筆記

1. **Image (映像檔) 與 Dockerfile**：
   * `Image` 是包含程式執行環境的唯讀模板。
   * 我們透過撰寫 `backend/Dockerfile`，以 `node:20-alpine` 為基底，自動安裝 Express 與 PostgreSQL 驅動套件，將校務系統後端打包成獨立映像檔。
2. **Container (容器) 與虛擬網路**：
   * 容器是映像檔的執行實例。在微服務架構中，我們將前端網頁、後端 API、資料庫拆分為三個獨立容器，並透過 Docker 虛擬網路 (`campus_net`) 讓它們能直接以服務名稱（如 `http://backend:3000`、`db:5432`）互相通訊，且不對外暴露資料庫 Port，確保校務資料安全。
3. **Volume (資料卷持久化)**：
   * 容器銷毀後內部資料會重置。我們為 PostgreSQL 掛載了 `pgdata` Volume，確保學生選課與成績資料在容器重啟後依然永久保存。

---

## 二、 微服務系統架構說明

系統包含以下三個核心微服務容器：

1. **Nginx (`campus_nginx`) — Web Server & Reverse Proxy**：
   * 對外監聽 `8080` Port，提供校務管理系統前端介面 (`index.html`)。
   * 設定反向代理規則：當收到 `/api/*` 請求時，自動轉發給內部網路的 Node.js 微服務 (`http://backend:3000/api/`)。
2. **Node.js (`campus_node_api`) — 後端開發與執行環境**：
   * 負責校務商業邏輯，提供：
     * `GET /api/status`：回傳容器節點 ID 與資料庫狀態。
     * `GET /api/enrollments`：讀取所有學生選課與成績清單。
     * `POST /api/enrollments`：新增學生加選與成績紀錄。
     * `DELETE /api/enrollments/:id`：辦理退選刪除紀錄。
3. **PostgreSQL (`campus_postgres`) — 關聯式資料庫**：
   * 儲存 `enrollments` 資料表（包含學號、姓名、課程名稱、學分數、學期成績）。
   * 具備 `healthcheck` 健康檢查機制，確保資料庫就緒後才啟動後端 API。

---

## 三、 啟動方式與操作步驟

1. **建置並啟動所有微服務容器**：
   ```bash
   docker compose up -d --build
   ```
2. **查看容器運行狀態**：
   ```bash
   docker compose ps
   ```
3. **開啟校務系統 Web 介面**：
   於瀏覽器開啟 `http://localhost:8080`，即可查看微服務節點狀態，並進行學生加選、成績登錄與退選操作。