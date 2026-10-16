const express = require('express');
const { Pool } = require('pg');
const os = require('os');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'campus_password',
  database: process.env.DB_NAME || 'campus_db',
  port: 5432,
});

// 初始化校務資料庫：建立選課與成績資料表
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) NOT NULL,
        student_name VARCHAR(50) NOT NULL,
        course_name VARCHAR(100) NOT NULL,
        credits INT NOT NULL,
        score INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const count = await pool.query('SELECT COUNT(*) FROM enrollments');
    if (parseInt(count.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO enrollments (student_id, student_name, course_name, credits, score) VALUES
        ('114001', '王小明', '軟體工程與微服務實務', 3, 92),
        ('114002', '林華華', '資料結構與演算法', 3, 85),
        ('114003', '陳大文', '計算機概論與容器技術', 3, 88);
      `);
    }
    console.log('校務系統 PostgreSQL 資料庫初始化完成！');
  } catch (err) {
    console.error('資料庫初始化失敗:', err);
  }
}
initDB();

// API 1：查詢 Docker 微服務節點與資料庫狀態
app.get('/api/status', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT version() as pg_version');
    res.json({
      status: 'Online',
      node_version: process.version,
      container_hostname: os.hostname(),
      pg_version: dbRes.rows[0].pg_version.split(' ')[0] + ' ' + dbRes.rows[0].pg_version.split(' ')[1]
    });
  } catch (err) {
    res.status(500).json({ status: 'Error', error: err.message });
  }
});

// API 2：取得所有學生選課與成績紀錄
app.get('/api/enrollments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM enrollments ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 3：新增學生選課與成績紀錄
app.post('/api/enrollments', async (req, res) => {
  const { student_id, student_name, course_name, credits, score } = req.body;
  if (!student_id || !student_name || !course_name) {
    return res.status(400).json({ error: '學號、姓名與課程名稱為必填' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO enrollments (student_id, student_name, course_name, credits, score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [student_id, student_name, course_name, parseInt(credits) || 3, parseInt(score) || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 4：退選 / 刪除紀錄
app.delete('/api/enrollments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM enrollments WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('校務微服務 API 已啟動於 Port 3000');
});