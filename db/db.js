import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'data', 'app.db')
let db

export async function initDB() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  db = await open({ filename: DB_PATH, driver: sqlite3.Database })
  await db.exec(`
    CREATE TABLE IF NOT EXISTS managers (
      manager_id TEXT PRIMARY KEY,
      is_active INTEGER DEFAULT 1
    );
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      full_name TEXT NOT NULL,
      mob_num TEXT NOT NULL,
      pan_num TEXT NOT NULL,
      manager_id TEXT,
      created_at TEXT,
      updated_at TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (manager_id) REFERENCES managers(manager_id)
    );
  `)
  const sample = [
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222'
  ]
  for (const m of sample) {
    const r = await db.get('SELECT manager_id FROM managers WHERE manager_id = ?', m)
    if (!r) await db.run('INSERT INTO managers (manager_id, is_active) VALUES (?, 1)', m)
  }
  return db
}

export function getDB() {
  if (!db) throw new Error('Database not initialized. Call initDB() first.')
  return db
}
