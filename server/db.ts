import fs from 'fs';
import path from 'path';
import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import type { Pantry, Politician, Candidate } from './types';

interface DatabaseSchema {
  pantries: PantryTable;
  politicians: PoliticianTable;
  candidates: CandidateTable;
}

interface PantryTable {
  id: number;
  name: string;
  address: string;
  notes: string;
  lat: number;
  lng: number;
  hours: string;
  type: 'food' | 'clothing' | 'resource' | 'library';
  repeating: 'one-time' | 'daily' | 'weekly' | 'weekendly' | 'monthly' | 'idk';
  deleted: 0 | 1;
}

interface PoliticianTable {
  id: number;
  name: string;
  office: 'House' | 'Senate';
  state: string;
  district: number | null;
  party: string;
  term_end_date: string;
  lat: number;
  lng: number;
}

interface CandidateTable {
  id: number;
  name: string;
  office: 'House' | 'Senate';
  state: string;
  district: number | null;
  party: string;
  lat: number;
  lng: number;
}

/**
 * Resolve data directory and ensure it exists.
 * Uses DATA_DIRECTORY env var if set, otherwise defaults to ./data (relative to process cwd)
 */
const DATA_DIRECTORY = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIRECTORY)) {
  fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
}

/**
 * Database file path
 */
const DB_FILE = path.join(DATA_DIRECTORY, 'database.sqlite');

/**
 * Create or open the sqlite database and construct Kysely instance.
 * Keeping the Database constructor here so the database file is created on first run.
 */
const dialect = new SqliteDialect({
  database: new Database(DB_FILE),
});

export const db = new Kysely<DatabaseSchema>({
  dialect,
  log: ['query', 'error'],
});
