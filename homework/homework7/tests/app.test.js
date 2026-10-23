const request = require("supertest");
const add = require("../math");
const app = require("../app");
const {
  calculateFine,
  canBorrow,
  resetStore
} = require("../library");

describe("math.js 單元測試", () => {
  test("add(2, 3) 應該等於 5", () => {
    expect(add(2, 3)).toBe(5);
  });
});

describe("calculateFine 逾期罰金計算（單元測試）", () => {
  test("逾期 0 天或輸入負數，罰金應為 0", () => {
    expect(calculateFine(0)).toBe(0);
    expect(calculateFine(-5)).toBe(0);
  });

  test("逾期 3 天，罰金為 15 元（每天 5 元）", () => {
    expect(calculateFine(3)).toBe(15);
  });

  test("逾期 19 天尚未封頂，罰金為 95 元", () => {
    expect(calculateFine(19)).toBe(95);
  });

  test("逾期 30 天以上，罰金上限封頂 100 元", () => {
    expect(calculateFine(20)).toBe(100);
    expect(calculateFine(30)).toBe(100);
    expect(calculateFine(999)).toBe(100);
  });
});

describe("canBorrow 借閱資格檢查（單元測試）", () => {
  test("無罰金且未達借閱上限（5 本）時可以借閱", () => {
    expect(canBorrow(0, false)).toBe(true);
    expect(canBorrow(4, false)).toBe(true);
  });

  test("已達借閱上限（5 本）時不可借閱", () => {
    expect(canBorrow(5, false)).toBe(false);
  });

  test("有未繳罰金時不可借閱，即使未達上限", () => {
    expect(canBorrow(1, true)).toBe(false);
  });
});

describe("API 系統測試（Supertest）", () => {
  beforeEach(() => {
    resetStore();
  });

  test("GET /api/hello 應回傳 200 與正確的 JSON", async () => {
    const response = await request(app).get("/api/hello");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", message: "Hello World" });
  });

  test("GET /api/books 應回傳 200 與館藏書籍清單", async () => {
    const response = await request(app).get("/api/books");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.books)).toBe(true);
    expect(response.body.books[0]).toHaveProperty("title");
    expect(response.body.books[0].available).toBe(true);
  });

  test("POST /api/borrow 借閱成功應回傳 200 與成功訊息", async () => {
    const response = await request(app)
      .post("/api/borrow")
      .send({ studentId: "S1115001", title: "資料結構" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("借閱成功");
  });

  test("POST /api/borrow 重複借出同一本書應回傳 400 且訊息為已借出", async () => {
    await request(app)
      .post("/api/borrow")
      .send({ studentId: "S1115001", title: "資料結構" });

    const response = await request(app)
      .post("/api/borrow")
      .send({ studentId: "S1115002", title: "資料結構" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("已被借出");
  });

  test("POST /api/borrow 借閱不存在的書應回傳 404", async () => {
    const response = await request(app)
      .post("/api/borrow")
      .send({ studentId: "S1115001", title: "不存在的書" });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/return 歸還成功、罰金為 0，且書籍回到可借狀態", async () => {
    await request(app)
      .post("/api/borrow")
      .send({ studentId: "S1115001", title: "軟體工程" });

    const response = await request(app)
      .post("/api/return")
      .send({ studentId: "S1115001", title: "軟體工程" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("歸還成功");
    expect(response.body.fine).toBe(0);

    const books = await request(app).get("/api/books");
    const returnedBook = books.body.books.find((b) => b.title === "軟體工程");
    expect(returnedBook.available).toBe(true);
  });

  test("POST /api/return 歸還未借出的書應回傳 400", async () => {
    const response = await request(app)
      .post("/api/return")
      .send({ studentId: "S1115001", title: "網頁程式設計" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
