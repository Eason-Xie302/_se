# Homework7 — Express 網站應用與三種測試實作

## 一、專案說明與架構

本專案以 Node.js + Express 建立一個簡單的網站應用，並完成三個層級的測試：

| 測試類型 | 工具 | 測試內容 | 所在位置 |
| --- | --- | --- | --- |
| 單元測試 | Jest | 驗證 `add(2, 3)` 回傳 5 | `tests/app.test.js` |
| API 系統測試 | Supertest | 驗證 `GET /api/hello` 回傳 200 與正確 JSON | `tests/app.test.js` |
| E2E 測試 | Playwright（無頭 Chromium） | 打開首頁、點擊 `#btn`、驗證 `#display` 變成 "Clicked!" | `e2e/app.spec.js` |

### 專案結構

```
homework7/
├── app.js               # Express 應用本體（只匯出 app，不 listen）
├── server.js            # 啟動伺服器（node server.js，port 3000）
├── math.js              # 匯出 add(a, b) 函式
├── public/
│   └── index.html       # 靜態首頁（#btn 按鈕 + #display 文字切換）
├── tests/               # Jest 測試資料夾（單元測試 + API 系統測試）
│   └── app.test.js
├── e2e/                 # Playwright E2E 測試資料夾
│   └── app.spec.js
├── playwright.config.js # Playwright 設定（testDir、headless、webServer）
└── package.json         # scripts 與 jest 設定（testMatch 限定 tests 資料夾）
```

### 架構設計重點

1. **app.js 與 server.js 分離**：`app.js` 只建立並匯出 Express 應用（靜態檔案服務指向 `public/`、提供 `GET /api/hello` 回傳 `{ status: "ok", message: "Hello World" }`），讓 Supertest 可以直接對 `app` 發送請求，不需要真的開 port；真正啟動伺服器的程式碼放在 `server.js`。

2. **前後端完整互動**：`public/index.html` 內含 `<button id="btn">點我</button>` 與 `<div id="display">初始狀態</div>`，點擊按鈕後由前端 JS 將 `#display` 文字改為 "Clicked!"，E2E 測試即模擬這個使用者行為。

3. **三種測試分層**：
   - **單元測試**：不啟動伺服器，純粹測 `math.js` 的運算邏輯。
   - **系統測試**：用 `supertest(app)` 在記憶體內驗證 Express 路由的 HTTP 行為（狀態碼與 JSON 內容）。
   - **E2E 測試**：Playwright 以無頭 Chromium 啟動完整瀏覽器環境，走真實的「開頁面 → 操作 DOM → 驗證畫面結果」流程，最貼近使用者實際體驗。

4. **測試指令互不衝突**：`package.json` 中的 `jest` 設定以 `testMatch: ["**/tests/**/*.test.js"]` 限制 Jest 只跑 `tests/` 資料夾（否則 Jest 預設規則會誤抓 `e2e/*.spec.js`）；`playwright.config.js` 則以 `testDir: "./e2e"` 指定 E2E 測試位置。

## 二、執行方式

### 1. 安裝套件

# 安裝專案所有相依套件（含 express, jest, supertest, @playwright/test@1.50.1）
npm install

# 下載 Playwright 無頭瀏覽器核心
npx playwright install chromium

### 2. 啟動伺服器

```bash
node server.js
# Server is running on http://localhost:3000
```

瀏覽器打開 `http://localhost:3000`，點擊「點我」按鈕，`#display` 會顯示 "Clicked!"。

### 3. 執行測試

```bash
# Jest 單元測試 + Supertest API 系統測試
npm test

# Playwright E2E 測試
npm run test:e2e
```

### 4. 測試通過結果

**npm test（Jest）**：

```
> homework7@1.0.0 test
> jest

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        10.181 s
Ran all test suites.
```

**npm run test:e2e（Playwright）**：

```
> homework7@1.0.0 test:e2e
> playwright test

Running 1 test using 1 worker

  ✓  1 e2e/app.spec.js:3:1 › 點擊按鈕後 #display 應變成 Clicked! (543ms)

  1 passed (15.2s)
```

## 三、OpenCode 開發對話紀錄

以下為本次開發 Session 中，使用者輸入給 OpenCode（AI 編程助理）的完整 Prompt 指令，以及 OpenCode 回覆的執行摘要、Todo 清單與測試結果。

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

依規格建立專案檔案（math.js、app.js、server.js、public/index.html、tests/app.test.js），安裝相依套件（express、jest、supertest），並將 package.json 的 "test" script 設定為 "jest"，隨後執行 npm test 驗證。

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

OpenCode 摘要：「完成，兩個測試都通過（2 passed）。」

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
> homework7@1.0.0 test:e2e
> playwright test

Running 1 test using 1 worker

  ✓  1 e2e/app.spec.js:3:1 › 點擊按鈕後 #display 應變成 Clicked! (543ms)

  1 passed (15.2s)

# npm test（Jest，複驗仍正常且只跑 tests 資料夾）
> homework7@1.0.0 test
> jest

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        10.181 s
Ran all test suites.
```

OpenCode 摘要：「全部完成，E2E 測試通過（1 passed），Jest 的 2 個測試也正常。因系統是 Node 18，改安裝相容的 @playwright/test@1.50.1；package.json 新增 jest testMatch 限定只跑 tests 資料夾，並新增 test:e2e script。」

---

