const { test, expect } = require("@playwright/test");

const BASE = "http://localhost:3000";

test("輸入學號借書後，書籍狀態應變為已借出並顯示成功訊息", async ({ page }) => {
  await page.request.post(`${BASE}/api/return`, {
    data: { studentId: "S1115001", title: "資料結構" }
  });

  await page.goto(BASE);

  await page.fill("#studentId", "S1115001");
  await page.click('.borrow-btn[data-title="資料結構"]');

  await expect(page.locator("#statusMsg")).toContainText("借閱成功");

  const row = page.locator("tr", { hasText: "資料結構" });
  await expect(row.locator(".book-status")).toHaveText("已借出");
});

test("罰金試算小工具應正確計算罰金（逾期 10 天 = 50 元）", async ({ page }) => {
  await page.goto(BASE);

  await page.fill("#overdueDays", "10");
  await page.click("#calcBtn");

  await expect(page.locator("#fineResult")).toContainText("50");
});
