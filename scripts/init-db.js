// scripts/init-db.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = process.env.DATA_DIRECTORY || '/app/data';
const dbPath = path.join(dataDir, 'database.sqlite');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let db;
try {
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS pantries (
      id INTEGER PRIMARY KEY,
      name TEXT,
      address TEXT,
      notes TEXT,
      lat REAL,
      lng REAL,
      hours TEXT,
      type TEXT,
      repeating TEXT,
      deleted INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS politicians (
      id INTEGER PRIMARY KEY,
      name TEXT,
      office TEXT,
      state TEXT,
      district INTEGER,
      party TEXT,
      term_end_date TEXT,
      lat REAL,
      lng REAL
    );
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY,
      name TEXT,
      office TEXT,
      state TEXT,
      district INTEGER,
      party TEXT,
      lat REAL,
      lng REAL
    );
  `);
  console.log('DB initialized at', dbPath);
} catch (err) {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
} finally {
  if (db) db.close();
}
