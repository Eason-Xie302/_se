#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, 'dist');

console.log('正在啟動 SubCal 智慧訂閱管理系統...');
execSync(`npx vite preview --outDir "${distPath}" --open`, { stdio: 'inherit' });