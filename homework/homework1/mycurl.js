#!/usr/bin/env node
const fs = require('fs');

function printHelp() {
  console.log(`
MyCurl - 輕量級命令列 HTTP 請求工具 (Node.js 實作)

用法:
  node mycurl.js [選項] <URL>

支援選項:
  -X, --request <METHOD>   指定 HTTP 請求方法 (預設: GET，支援 POST, PUT, DELETE)
  -H, --header <HEADER>    加入自訂 Request Header (例如: "Content-Type: application/json")
  -d, --data <DATA>        傳送 Request Body 資料 (若未指定 -X，預設會自動切換為 POST)
  -i, --include            在輸出中一併顯示 HTTP Response 狀態碼與 Headers
  -o, --output <FILE>      將回應內容儲存至指定檔案，而非直接印在終端機
  -h, --help               顯示此說明選單

範例:
  node mycurl.js https://jsonplaceholder.typicode.com/todos/1
  node mycurl.js -i https://jsonplaceholder.typicode.com/users/1
  node mycurl.js -X POST -H "Content-Type: application/json" -d "{\\"title\\":\\"test\\"}" https://jsonplaceholder.typicode.com/posts
  node mycurl.js -o result.json https://jsonplaceholder.typicode.com/todos/1
  `);
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  let method = 'GET';
  let methodExplicit = false;
  const headers = {};
  let bodyData = null;
  let includeHeaders = false;
  let outputFile = null;
  let url = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-X' || arg === '--request') {
      method = (args[++i] || 'GET').toUpperCase();
      methodExplicit = true;
    } else if (arg === '-H' || arg === '--header') {
      const rawHeader = args[++i] || '';
      const sepIndex = rawHeader.indexOf(':');
      if (sepIndex !== -1) {
        const key = rawHeader.slice(0, sepIndex).trim();
        const val = rawHeader.slice(sepIndex + 1).trim();
        headers[key] = val;
      }
    } else if (arg === '-d' || arg === '--data') {
      bodyData = args[++i] || '';
      if (!methodExplicit) method = 'POST';
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }
    } else if (arg === '-i' || arg === '--include') {
      includeHeaders = true;
    } else if (arg === '-o' || arg === '--output') {
      outputFile = args[++i];
    } else if (!arg.startsWith('-')) {
      url = arg;
    }
  }

  if (!url) {
    console.error('錯誤：請提供目標 URL！輸入 node mycurl.js --help 查看用法。');
    process.exit(1);
  }

  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  try {
    const startTime = Date.now();
    const options = { method, headers };
    if (bodyData && method !== 'GET' && method !== 'HEAD') {
      options.body = bodyData;
    }

    const res = await fetch(url, options);
    const elapsed = Date.now() - startTime;
    const text = await res.text();

    let output = '';
    if (includeHeaders) {
      output += `HTTP/${res.status} ${res.statusText} (${elapsed}ms)\n`;
      res.headers.forEach((val, key) => {
        output += `${key}: ${val}\n`;
      });
      output += '\n';
    }
    output += text;

    if (outputFile) {
      fs.writeFileSync(outputFile, output, 'utf-8');
      console.log(`✅ 請求成功 (${res.status} ${res.statusText})，回應已儲存至檔案: ${outputFile}`);
    } else {
      console.log(output);
    }
  } catch (err) {
    console.error(`❌ 請求失敗: ${err.message}`);
    process.exit(1);
  }
}

run();