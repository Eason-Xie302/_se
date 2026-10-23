const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 0,
  use: {
    headless: true,
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "node server.js",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 10000,
  },
});
