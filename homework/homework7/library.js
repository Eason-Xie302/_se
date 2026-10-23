const FINE_PER_DAY = 5;
const MAX_FINE = 100;
const MAX_BORROW_COUNT = 5;
const LOAN_PERIOD_DAYS = 30;

const books = [
  { title: "資料結構", available: true, borrowedBy: null, borrowedAt: null },
  { title: "軟體工程", available: true, borrowedBy: null, borrowedAt: null },
  { title: "作業系統概論", available: true, borrowedBy: null, borrowedAt: null },
  { title: "網頁程式設計", available: true, borrowedBy: null, borrowedAt: null },
  { title: "演算法導論", available: true, borrowedBy: null, borrowedAt: null },
  { title: "人工智慧概論", available: true, borrowedBy: null, borrowedAt: null }
];

const unpaidFines = new Map();

function calculateFine(daysOverdue) {
  if (daysOverdue <= 0) return 0;
  return Math.min(daysOverdue * FINE_PER_DAY, MAX_FINE);
}

function canBorrow(currentCount, hasUnpaidFine) {
  if (hasUnpaidFine) return false;
  return currentCount < MAX_BORROW_COUNT;
}

function countActiveLoans(studentId) {
  return books.filter((b) => !b.available && b.borrowedBy === studentId).length;
}

function getUnpaidFine(studentId) {
  return unpaidFines.get(studentId) || 0;
}

function getBooks() {
  return books.map(({ title, available, borrowedBy, borrowedAt }) => ({
    title,
    available,
    borrowedBy,
    borrowedAt
  }));
}

function borrowBook(studentId, title) {
  const book = books.find((b) => b.title === title);
  if (!book) return { ok: false, code: 404, message: "館藏中找不到此書" };
  if (!book.available) return { ok: false, code: 400, message: "此書已被借出" };
  if (!canBorrow(countActiveLoans(studentId), getUnpaidFine(studentId) > 0)) {
    return { ok: false, code: 400, message: "借閱資格不符：有未繳罰金或已達借閱上限" };
  }
  book.available = false;
  book.borrowedBy = studentId;
  book.borrowedAt = Date.now();
  return { ok: true, message: "借閱成功！請於 30 天內歸還" };
}

function returnBook(studentId, title) {
  const book = books.find((b) => b.title === title);
  if (!book) return { ok: false, code: 404, message: "館藏中找不到此書" };
  if (book.available || book.borrowedBy !== studentId) {
    return { ok: false, code: 400, message: "查無此學生的借閱紀錄" };
  }
  const borrowedAt = book.borrowedAt;
  book.available = true;
  book.borrowedBy = null;
  book.borrowedAt = null;
  const days = Math.floor((Date.now() - borrowedAt) / 86400000);
  const daysOverdue = Math.max(0, days - LOAN_PERIOD_DAYS);
  const fine = calculateFine(daysOverdue);
  if (fine > 0) {
    unpaidFines.set(studentId, getUnpaidFine(studentId) + fine);
  }
  return { ok: true, message: "歸還成功", daysOverdue, fine };
}

function resetStore() {
  books.forEach((b) => {
    b.available = true;
    b.borrowedBy = null;
    b.borrowedAt = null;
  });
  unpaidFines.clear();
}

module.exports = {
  calculateFine,
  canBorrow,
  getBooks,
  borrowBook,
  returnBook,
  getUnpaidFine,
  resetStore
};
