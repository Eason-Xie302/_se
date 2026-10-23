# Homework7 — NQU 圖書館借閱與逾期罰金管理系統

以 Node.js + Express 打造的圖書館借閱與逾期罰金管理系统（資料儲存於記憶體），並配齊三種層級的自動化測試：Jest 單元測試、Supertest API 系統測試、Playwright E2E 無頭瀏覽器測試。

## 一、專案說明與架構

### 功能介紹

- **館藏查詢**：首頁自動載入書籍清單與借閱狀態（可借 / 已借出）。
- **學生借閱**：輸入學號後點擊「借閱」按鈕即可借書（上限 5 本；有未繳罰金或書已被借出則拒絕），畫面即時更新書籍狀態並顯示成功 / 失敗訊息。
- **書籍歸還**：`POST /api/return` 歸還書籍並自動依逾期天數計算罰金（超過借期 30 天起算，每天 5 元，上限 100 元），累積至該學生的未繳罰金。
- **逾期罰金試算小工具**：首頁側欄可輸入逾期天數立即試算罰金。

### 商業規則（library.js）

| 規則 | 說明 |
| --- | --- |
| `calculateFine(daysOverdue)` | 逾期每天罰 5 元（`daysOverdue <= 0` 為 0 元），罰金累積上限 100 元 |
| `canBorrow(currentCount, hasUnpaidFine)` | 在借數量達上限 5 本或有未繳罰金 → 不可借；否則可借 |
| 借期 | 30 天（`LOAN_PERIOD_DAYS`），逾期從第 31 天開始計罰 |

### 專案結構

```
homework7/
├── library.js             # 核心業務邏輯：罰金計算、借閱資格、館藏資料操作
├── app.js                 # Express 應用本體（只匯出 app，不 listen）
├── server.js              # 啟動伺服器（node server.js，port 3000）
├── math.js                # 簡版示範函式 add(a, b)（歷史留存）
├── public/
│   └── index.html         # 前端介面：書目列表、學號借書、狀態訊息、罰金試算
├── tests/                 # Jest 測試資料夾（單元測試 + API 系統測試）
│   └── app.test.js
├── e2e/                   # Playwright E2E 測試資料夾
│   └── app.spec.js
├── playwright.config.js   # Playwright 設定（testDir、headless、webServer）
└── package.json           # scripts 與 jest 設定（testMatch 限定 tests 資料夾）
```

### 架構設計重點

1. **分層拆分**：`library.js` 只放純粹的業務規則與記憶體資料操作（供 Jest 單元測試）；`app.js` 負責把資料操作接到 HTTP 路由（供 Supertest 系統測試）；`public/index.html` 負責使用者介面（供 Playwright E2E 測試）；真正監聽 port 的程式碼獨立於 `server.js`。
2. **API 一覽**：
   - `GET /api/books` — 回傳館藏清單與借閱狀態
   - `POST /api/borrow` — 傳入 `{ studentId, title }` 借書；書不存在回 404、已借出或資格不符回 400
   - `POST /api/return` — 傳入 `{ studentId, title }` 還書，回傳逾期天數與罰金；查無紀錄回 400
   - `GET /api/hello` — 健康檢查（回 `{ status: "ok", message: "Hello World" }`）
3. **三種測試各司其職**：
   - **單元測試**：不啟動伺服器，測 `calculateFine` 的邊界值（0 天、3 天、19 天未封頂、30 天以上封頂）與 `canBorrow` 的借閱規則。
   - **系統測試**：用 `supertest(app)` 直接對 Express app 發 HTTP 請求，測查書、成功借書、重複借書被拒（400）、借不存在的書（404）、還書後罰金為 0 且書籍可借、還未借出的書（400），並在前置條件 `beforeEach` 中 `resetStore()` 重置記憶體狀態。
   - **E2E 測試**：Playwright 以無頭 Chromium 開啟真實網頁，輸入學號 → 點借閱 → 驗證 `#statusMsg` 顯示成功訊息且該書狀態變「已借出」；另測罰金試算小工具；測試前先呼叫還書 API 清還借閱狀態以確保可重複執行。
4. **指令互不衝突**：`package.json` 中的 `jest.testMatch` 限定只跑 `tests/` 資料夾；`playwright.config.js` 以 `testDir: "./e2e"` 指定 E2E 位置，並在 `webServer` 自動啟動/重用 `node server.js`。

## 二、快速開始

### 1. 安裝套件

```bash
npm install                      # 安裝 express、jest、supertest、@playwright/test
npx playwright install chromium  # 下載 Playwright 瀏覽器核心
```

> 本專案使用 `@playwright/test@1.50.1`（因環境為 Node v18，最新版需 Node 20+）。
> 若系統缺少 Chromium 相依套件，需再加執行 `sudo npx playwright install-deps` 或 `sudo apt-get install libnss3 libnspr4`。

### 2. 啟動伺服器

```bash
node server.js
# Server is running on http://localhost:3000
```

瀏覽器打開 `http://localhost:3000`：輸入學號即可借書、書單狀態即時更新，側欄可用罰金試算小工具。

### 3. 執行測試

| 指令 | 測試類型 | 測試內容 | 最新結果 |
| --- | --- | --- | --- |
| `npm test` | Jest 單元測試 + Supertest 系統測試 | 罰金計算邊界值、借閱規則、書籍查詢/借書/還書 API | **15 passed**（Test Suites: 1 passed） |
| `npm run test:e2e` | Playwright E2E（無頭 Chromium） | 學號借書流程驗證 + 罰金試算小工具 | **2 passed** |

### 4. 測試通過結果

**npm test（Jest：15 個測試全過）**：

```
> homework7@1.0.0 test
> jest

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        8.851 s
Ran all test suites.
```

**npm run test:e2e（Playwright：2 個測試全過）**：

```
> homework7@1.0.0 test:e2e
> playwright test

Running 2 tests using 1 worker

  ✓  1 e2e/app.spec.js:5:1 › 輸入學號借書後，書籍狀態應變為已借出並顯示成功訊息 (1.2s)
  ✓  2 e2e/app.spec.js:21:1 › 罰金試算小工具應正確計算罰金（逾期 10 天 = 50 元） (194ms)

  2 passed (15.7s)
```

## 三、OpenCode 開發對話紀錄

以下完整記錄本專案開發過程中，使用者輸入給 OpenCode（AI 編程助理）的各段 Prompt 指令，以及 OpenCode 回覆的執行摘要、Todo 清單與測試結果。

---

### Prompt 1（使用者輸入）：建立 Express 專案與單元測試、API 系統測試

> 請在當前目錄用 Node.js 建立一個 Express 網站專案，並完成單元測試與 API 系統測試：
>
> 1. 執行 `npm init -y`，並安裝 express、jest、supertest。
> 2. 建立 `math.js`：寫一個 `add(a, b)` 函式並匯出。
> 3. 建立 `app.js`：提供靜態檔案服務（指向 public 資料夾）；寫一個 API `GET /api/hello`，回傳 JSON `{ status: "ok", message: "Hello World" }`；匯出 app（不要在 app.js 裡直接 app.listen，把啟動伺服器的程式碼分開寫在 server.js 裡，方便 supertest 測試）。
> 4. 建立 `public/index.html`：裡面放一個 `<button id="btn">點我</button>` 和 `<div id="display">初始狀態</div>`，點擊按鈕後用 JS 把 `#display` 的文字改成 "Clicked!"。
> 5. 建立 `tests/app.test.js`，裡面包含兩個測試：單元測試：測試 `add(2, 3)` 是否等於 5；系統測試：用 `supertest(app)` 測試 `GET /api/hello` 狀態碼為 200 且回傳正確的 JSON。
> 6. 修改 package.json 的 `"test"` script 為 `"jest"`，並幫我執行 `npm test` 確認兩個測試都通過。

**OpenCode 回覆（執行摘要）**：

檢查目錄時發現大部分檔案（math.js、app.js、server.js、public/index.html、tests/app.test.js）已存在且內容符合規格，相依套件（express、jest、supertest）亦已安裝完成，因此僅修改 package.json（將 `"test"` script 由預設錯誤訊息改為 `"jest"`），隨後執行 `npm test` 驗證。

Todo 清單（6 項全部完成 ✓）：

- [✓] npm init -y 並安裝 express、jest、supertest
- [✓] 建立 math.js（add 函式）
- [✓] 建立 app.js 與 server.js
- [✓] 建立 public/index.html（點擊按鈕改文字）
- [✓] 建立 tests/app.test.js（單元測試 + 系統測試）
- [✓] 修改 package.json test script 並執行 npm test

測試結果：

```
> homework7@1.0.0 test
> jest

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        14.78 s
Ran all test suites.
```

OpenCode 摘要：「完成，兩個測試都通過（2 passed）。變更項目僅 package.json 的 `"test": "jest"`，其餘檔案先前已就緒且符合規格。」

---

### Prompt 2（使用者輸入）：E2E 測試（使用 Playwright 無頭瀏覽器）

> 接下來請幫我完成第 3 項「E2E 測試（使用 Playwright 無頭瀏覽器）」：
>
> 1. 安裝 @playwright/test，並執行 `npx playwright install chromium` 下載瀏覽器核心。
> 2. 建立 `e2e/app.spec.js`：測試打開首頁 http://localhost:3000，點擊 `#btn` 按鈕後，驗證 `#display` 的文字是否變成 "Clicked!"。
> 3. 建立 `playwright.config.js`：設定 `testDir: './e2e'`（避免跟 tests 資料夾裡的 Jest 測試衝突）；設定 `use: { headless: true }`；設定 `webServer` 自動執行 `node server.js` 並監聽 http://localhost:3000。
> 4. 在 package.json 的 scripts 裡確認 `"test": "jest"` 只跑 tests 資料夾，並新增 `"test:e2e": "playwright test"`。
> 5. 請幫我執行 `npm run test:e2e` 確認 E2E 測試通過。

**OpenCode 回覆（執行摘要）**：

1. 安裝 @playwright/test 最新版時出現警告：最新版（1.64.1）需要 Node 20+，但系統為 Node v18.19.1（且無其他版本可切換）。經測試後改安裝相容 Node 18 的 `@playwright/test@1.50.1`，成功安裝並確認版本可執行。

2. 執行 `npx playwright install chromium`，成功下載 Chromium 133.0.6943.16（build v1155）、Chromium Headless Shell 與 FFMPEG 核心至 `~/.cache/ms-playwright/`，但出現警告：系統缺少瀏覽器執行所需套件（libnss3、libnspr4）。

3. 建立 `e2e/app.spec.js`：打開 `http://localhost:3000`，先驗證 `#display` 為「初始狀態」，點擊 `#btn` 後驗證文字變成 "Clicked!"。

4. 建立 `playwright.config.js`：`testDir: "./e2e"`、`use: { headless: true, baseURL: "http://localhost:3000" }`、`webServer` 自動執行 `node server.js` 並監聽 `http://localhost:3000`（`reuseExistingServer: true`，手動已開啟伺服器時可直接重用）。

5. 修改 package.json：新增 `"jest"` 設定 `testMatch: ["**/tests/**/*.test.js"]`（否則 Jest 預設規則會誤抓 `e2e/*.spec.js`），並新增 `"test:e2e": "playwright test"` script。

Todo 清單：

- [✓] 安裝 @playwright/test 並下載 chromium
- [✓] 建立 e2e/app.spec.js
- [✓] 建立 playwright.config.js（testDir/headless/webServer）
- [✓] 確認 test script 只跑 tests 資料夾並新增 test:e2e
- [ ] 執行 npm run test:e2e 驗證通過（受阻）

執行 `npm run test:e2e` 時因缺少系統套件而失敗：

```
Error: browserType.launch:
║ Host system is missing dependencies to run browsers. ║
║ Please install them with the following command:      ║
║                                                      ║
║     sudo npx playwright install-deps                 ║
║                                                      ║
║ Alternatively, use apt:                              ║
║     sudo apt-get install libnss3 libnspr4            ║

1 failed
```

OpenCode 摘要：「測試本身執行正常，但 WSL 系統缺少啟動 Chromium 需要的套件（libnss3、libnspr4），安裝這些需要 sudo 密碼，自動化環境中無法輸入。請使用者手動執行 `sudo npx playwright install-deps`。」

---

### Prompt 3（使用者輸入）：重新執行 E2E 測試（重述 Prompt 2 的指令內容）

> 接下來請幫我完成第 3 項「E2E 測試（使用 Playwright 無頭瀏覽器）」（同 Prompt 2 內容，要求執行 npm run test:e2e 確認通過）。

**OpenCode 回覆（執行摘要）**：

使用者已在終端機自行安裝完系統相依套件（sudo npx playwright install-deps），各檔案與設定先前已建立完成，因此直接執行驗證。

最終 Todo 清單（5 項全部完成 ✓）：

- [✓] 安裝 @playwright/test 並下載 chromium
- [✓] 建立 e2e/app.spec.js
- [✓] 建立 playwright.config.js（testDir/headless/webServer）
- [✓] 確認 test script 只跑 tests 資料夾並新增 test:e2e
- [✓] 執行 npm run test:e2e 驗證通過

測試結果：

```
# npm run test:e2e（Playwright）
  ✓  1 e2e/app.spec.js:3:1 › 點擊按鈕後 #display 應變成 Clicked! (543ms)
  1 passed (15.2s)

# npm test（Jest，複驗仍正常且只跑 tests 資料夾）
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

OpenCode 摘要：「全部完成，E2E 測試通過（1 passed），Jest 的 2 個測試也正常。因系統是 Node 18，改安裝相容的 @playwright/test@1.50.1；package.json 新增 jest testMatch 限定只跑 tests 資料夾，並新增 test:e2e script。」

---

### Prompt 4（使用者輸入）：升級為 NQU 圖書館借閱與逾期罰金管理系統

> 請幫我把目前的陽春網站升級成一個完整的「NQU 圖書館借閱與逾期罰金管理系統」（維持使用 Node.js + Express，資料存在記憶體或 JSON 即可），並同步更新三種測試與 README.md：
>
> 1. 核心業務邏輯 (library.js — 供單元測試)：實作計算逾期罰金函式 calculateFine(daysOverdue)（例如逾期每天罰 5 元，超過 30 天上限 100 元）與借閱資格檢查 canBorrow(currentCount, hasUnpaidFine)。
> 2. 後端 Web API (app.js — 供 Supertest 系統測試)：`GET /api/books` 取得館藏書籍清單與借閱狀態；`POST /api/borrow` 傳入書名與學號進行借書（若已借出或資格不符則回傳 400）；`POST /api/return` 歸還書籍並計算罰金。
> 3. 前端網頁 (public/index.html — 供 Playwright E2E 測試)：做出漂亮的介面：顯示書籍列表、一個輸入框（輸入學號 #studentId）、借閱按鈕與狀態訊息區塊 #statusMsg，以及一個罰金試算小工具。
> 4. 完整三種測試（確保全部綠燈通過）：單元測試 (tests/app.test.js)：測試罰金計算邊界值與借閱規則函式（至少 4 個 test cases）；系統測試：用 supertest 測試查詢書籍、成功借書、重複借書被拒、還書 API（至少 4 個 test cases）；E2E 測試 (e2e/app.spec.js)：用 Playwright 打開網頁，輸入學號點擊借書，驗證畫面上的書籍狀態變成「已借出」且顯示成功訊息。
> 5. 跑完 npm test 與 npm run test:e2e 確認全部通過後，幫我重新更新 README.md（包含新系統的功能介紹、快速開始、測試指令表格、以及我們包含這次升級的完整 OpenCode 對話紀錄）。

**OpenCode 回覆（執行摘要）**：

1. **library.js（新增）**：匯出 `calculateFine(daysOverdue)`（逾期每天 5 元，`<= 0` 為 0，封頂 100 元）與 `canBorrow(currentCount, hasUnpaidFine)`（達上限 5 本或有未繳罰金不可借）；並內建記憶體館藏（6 本書的 books 陣列與未繳罰金 Map），提供 `getBooks` / `borrowBook` / `returnBook`（還書時依借閱時間計算逾期天數與罰金、累積未繳罰金）與測試用 `resetStore()`。

2. **app.js（改寫）**：加上 `express.json()`；新增 `GET /api/books`、`POST /api/borrow`（書不存在 404、已借出/資格不符/欄位缺失 400）、`POST /api/return`（回傳歸還訊息與罰金，查無紀錄 400）；保留 `GET /api/hello` 健康檢查。

3. **public/index.html（改寫）**：全新 UI——漸層書店風 header、書目卡片表格（書名 + 狀態徽章「可借/已借出」+ 借閱按鈕 `.borrow-btn[data-title]`）、學號輸入框 `#studentId`、狀態訊息區 `#statusMsg`（成功綠色/失敗紅色）、側欄罰金試算小工具（`#overdueDays`、`#calcBtn`、`#fineResult`）。

4. **tests/app.test.js（改寫，共 9 個測試）**：
   - 單元測試：`add(2,3)=5`、`calculateFine` 邊界 4 案例（0 天/負數、3 天=15、19 天未封頂=95、30 天以上封頂 100）、`canBorrow` 3 案例（可借、達上限、有罰金）。
   - 系統測試：`/api/hello` 200、查書 200、借書成功 200、重複借書 400 已借出、借不存在書 404、還書成功罰金 0 且書回可借、還未借出的書 400；beforeEach 以 `resetStore()` 重置狀態。

5. **e2e/app.spec.js（改寫，共 2 個測試）**：測 1 先用 API 還書清狀態，開首頁、填 `#studentId`、點「資料結構」借閱鈕、驗證 `#statusMsg` 含「借閱成功」且該列 `.book-status` 變「已借出」；測 2 填逾期 10 天後點 `#calcBtn`，驗證 `#fineResult` 顯示 50 元。

Todo 清單（7 項全部完成 ✓）：

- [✓] 建立 library.js（calculateFine/canBorrow/資料操作）
- [✓] 改寫 app.js（books/borrow/return API）
- [✓] 改寫 public/index.html（新介面＋罰金試算）
- [✓] 更新 tests/app.test.js（單元≥4＋系統≥4）
- [✓] 更新 e2e/app.spec.js（借書流程＋試算）
- [✓] 執行 npm test 與 npm run test:e2e 確認全過
- [✓] 更新 README.md（新功能＋最新對話紀錄）

測試結果：

```
# npm test（Jest：單元測試 + Supertest 系統測試，首次執行發現 1 個斷言字串錯誤並已修正）
Test Suites: 1 failed, 1 total   →   修正後：
Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        8.851 s
Ran all test suites.

# npm run test:e2e（Playwright）
Running 2 tests using 1 worker
  ✓  1 e2e/app.spec.js:5:1 › 輸入學號借書後，書籍狀態應變為已借出並顯示成功訊息 (1.2s)
  ✓  2 e2e/app.spec.js:21:1 › 罰金試算小工具應正確計算罰金（逾期 10 天 = 50 元） (194ms)
  2 passed (15.7s)
```

OpenCode 摘要：「15 個 Jest 測試全過、2 個 E2E 測試全過。E2E 測試前先呼叫還書 API 清理借閱狀態以確保可重複執行；Jest 首次執行時因斷言字串與 API 訊息不一致（已借出 vs 已被借出）失敗 1 題，修正後全數綠燈。」

---

