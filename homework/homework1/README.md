# 習題 1：MyCurl - 輕量級命令列 HTTP 請求工具

## 一、專案簡介
本專案為模仿 Linux/網路開發常用工具 `curl` 所實作的命令列程式（CLI Tool）。使用 Node.js 原生環境開發，無須安裝額外第三方套件即可在終端機發送各種 HTTP 請求、自訂標頭與儲存回應結果。

## 二、支援功能
1. **多種 HTTP 方法 (`-X`)**：支援 `GET`、`POST`、`PUT`、`DELETE` 等請求方法。
2. **自訂 Request Header (`-H`)**：可附加 `Content-Type`、`Authorization` 等標頭資訊。
3. **傳送資料載荷 (`-d`)**：支援傳送 JSON 或表單字串 Body，並自動切換為 `POST` 模式。
4. **檢視回應標頭 (`-i`)**：可輸出伺服器狀態碼（Status Code）、耗時與完整 Response Headers。
5. **輸出寫入檔案 (`-o`)**：可將抓取到的網頁 HTML 或 API JSON 直接存成本地檔案。

## 三、執行與測試方式
在 `homework1` 目錄下開啟終端機執行：

```bash
# 1. 發送基本 GET 請求並顯示 Response Header
node mycurl.js -i [https://jsonplaceholder.typicode.com/todos/1](https://jsonplaceholder.typicode.com/todos/1)

# 2. 發送 POST 請求傳送 JSON 資料
node mycurl.js -X POST -d "{\"title\":\"homework1\",\"userId\":1}" [https://jsonplaceholder.typicode.com/posts](https://jsonplaceholder.typicode.com/posts)

# 3. 將回應結果下載儲存為檔案
node mycurl.js -o todo.json [https://jsonplaceholder.typicode.com/todos/1](https://jsonplaceholder.typicode.com/todos/1)