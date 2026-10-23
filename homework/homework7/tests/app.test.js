const request = require("supertest");
const add = require("../math");
const app = require("../app");

describe("math.js 單元測試", () => {
  test("add(2, 3) 應該等於 5", () => {
    expect(add(2, 3)).toBe(5);
  });
});

describe("API 系統測試", () => {
  test("GET /api/hello 應回傳 200 與正確的 JSON", async () => {
    const response = await request(app).get("/api/hello");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", message: "Hello World" });
  });
});
