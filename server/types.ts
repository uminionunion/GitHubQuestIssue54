
/*
  File: /server/types.ts
  Folder: /server

  Purpose:
  This file defines the TypeScript types for the main data models on the server side: `Pantry`, `Politician`, and `Candidate`.
  These types are used by Kysely in `db.ts` to provide type-safety for database queries.
  They mirror the structure of the database tables.

  Connections:
  - `server/db.ts`: Imports these types to define the database schema interfaces for Kysely.
  - `server/index.ts`: Imports these types for type-hinting in API route handlers.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - SQL: This file directly corresponds to the schema of the `pantries`, `politicians`, and `candidates` tables in the database.
  - PHP: In a PHP application, these might be represented as classes or simply handled as associative arrays.
*/
export type PantryType = 'food' | 'clothing' | 'resource' | 'library';
export type RepeatingType = 'one-time' | 'daily' | 'weekly' | 'weekendly' | 'monthly' | 'idk';

export interface Pantry {
  id: number;
  name: string;
  address: string;
  notes: string | null;
  lat: number;
  lng: number;
  hours: string | null;
  type: PantryType;
  repeating: RepeatingType | null;
  deleted: 0 | 1;
}

export interface Politician {
  id: number;
  name: string;
  office: 'House' | 'Senate';
  state: string;
  district: number | null;
  party: string | null;
  term_end_date: string | null;
  lat: number;
  lng: number;
  website: string | null;
}

export interface Candidate {
  id: number;
  name: string;
  office: 'House' | 'Senate';
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
