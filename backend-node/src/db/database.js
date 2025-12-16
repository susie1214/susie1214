import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', '..', 'data', 'polychat.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('DB Error:', err);
  } else {
    console.log('✅ SQLite Database connected');
  }
});

export const initializeDB = () => {
  db.serialize(() => {
    // 사용자 테이블
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 대화 히스토리 테이블
    db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        response TEXT,
        embedding_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(user_id)
      )
    `);

    // 상담원 정보 테이블
    db.run(`
      CREATE TABLE IF NOT EXISTS advisors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        advisor_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'online',
        assigned_users INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized');
  });
};

export const getDB = () => db;

// 헬퍼 함수들
export const saveConversation = (userId, message, response, embeddingId = null) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO conversations (user_id, message, response, embedding_id)
       VALUES (?, ?, ?, ?)`,
      [userId, message, response, embeddingId],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

export const getConversationHistory = (userId, limit = 20) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM conversations 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};
