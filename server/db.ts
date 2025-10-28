
import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import { Pantry } from './types';

interface DatabaseSchema {
  pantries: PantryTable;
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
}

const dialect = new SqliteDialect({
  database: new Database('./data/database.sqlite'),
});

export const db = new Kysely<DatabaseSchema>({
  dialect,
  log: ['query', 'error'],
});
