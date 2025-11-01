/*
  File: /server/db.ts
  Folder: /server

  Purpose:
  This file sets up the database connection and configuration using Kysely, a type-safe SQL query builder.
  1. It defines the TypeScript interfaces for the database schema (`DatabaseSchema`), which must match the actual tables in the SQLite database (`pantries`, `politicians`, `candidates`). This is crucial for Kysely's type-safety.
  2. It initializes the SQLite database connection using `better-sqlite3`, pointing to the database file at `data/database.sqlite`.
  3. It creates and exports the `db` instance of Kysely, configured with the SQLite dialect and enabling logging for queries and errors. This `db` instance is the primary way the server interacts with the database.

  Connections:
  - `better-sqlite3`: The driver used to connect to the SQLite database file.
  - `kysely`: The query builder library.
  - `./types`: Imports the base types to build the table interfaces.
  - `server/index.ts`: Imports the `db` object to execute database queries in the API route handlers (e.g., `app.get('/api/pantries', ...)`).
  - `data/database.sqlite`: The actual SQLite database file this code connects to.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - PHP/SQL: This is equivalent to a `db_connect.php` or `config.php` file. In PHP, you would use `new PDO("sqlite:data/database.sqlite")` or `new mysqli(...)` to establish a database connection and store the connection object in a global variable or pass it around. The schema interfaces are like comments or documentation reminding the developer of the table structures.
*/

import { Kysely, SqliteDialect, Generated } from 'kysely';
import Database from 'better-sqlite3';
import { Pantry, Politician, Candidate } from './types';

// Kysely table interfaces
interface PantryTable {
  id: Generated<number>;
  name: string;
  address: string;
  notes: string | null;
  lat: number;
  lng: number;
  hours: string | null;
  type: Pantry['type'];
  repeating: Pantry['repeating'] | null;
  deleted: 0 | 1;
}

interface PoliticianTable {
  id: Generated<number>;
  name: string;
  office: Politician['office'];
  state: string;
  district: number | null;
  party: string | null;
  term_end_date: string | null;
  lat: number;
  lng: number;
  website: string | null;
}

interface CandidateTable {
  id: Generated<number>;
  name: string;
  office: Candidate['office'];
  state: string;
  district: number | null;
  party: string | null;
  lat: number;
  lng: number;
  website: string | null;
  phone: string | null;
  show_on_map: 0 | 1;
  office_type: string | null;
  country: string | null;
}

interface DatabaseSchema {
  pantries: PantryTable;
  politicians: PoliticianTable;
  candidates: CandidateTable;
}

const dataDirectory = process.env.DATA_DIRECTORY || './data';
const dbPath = `${dataDirectory}/database.sqlite`;

const sqliteDb = new Database(dbPath);
sqliteDb.pragma('journal_mode = WAL'); // Recommended for better performance

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error'], // Log all queries and errors
});
