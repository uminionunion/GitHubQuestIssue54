
import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import { Pantry, Politician, Candidate } from './types';

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

const dialect = new SqliteDialect({
  database: new Database('./data/database.sqlite'),
});

export const db = new Kysely<DatabaseSchema>({
  dialect,
  log: ['query', 'error'],
});
