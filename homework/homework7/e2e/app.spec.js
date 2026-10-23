const { test, expect } = require("@playwright/test");

test("點擊按鈕後 #display 應變成 Clicked!", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await expect(page.locator("#display")).toHaveText("初始狀態");

  await page.click("#btn");

  await expect(page.locator("#display")).toHaveText("Clicked!");
});
