const express = require("express");
const path = require("path");
const lib = require("./library");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/hello", (req, res) => {
  res.json({ status: "ok", message: "Hello World" });
});

app.get("/api/books", (req, res) => {
  res.json({ success: true, books: lib.getBooks() });
});

app.post("/api/borrow", (req, res) => {
  const { studentId, title } = req.body || {};
  if (!studentId || !title) {
    return res.status(400).json({ success: false, message: "請提供書名與學號" });
  }
  const result = lib.borrowBook(studentId, title);
  if (!result.ok) {
    return res.status(result.code).json({ success: false, message: result.message });
  }
  res.json({ success: true, message: result.message });
});

app.post("/api/return", (req, res) => {
  const { studentId, title } = req.body || {};
  if (!studentId || !title) {
    return res.status(400).json({ success: false, message: "請提供書名與學號" });
  }
  const result = lib.returnBook(studentId, title);
  if (!result.ok) {
    return res.status(result.code).json({ success: false, message: result.message });
  }
  res.json({ success: true, message: result.message, fine: result.fine });
});

module.exports = app;
