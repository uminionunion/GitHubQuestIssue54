/*
  File: /client/src/pages/home/types.ts
  Folder: /client/src/pages/home

  Purpose:
  This file defines the TypeScript types and interfaces for the main data models of the application: `Pantry`, `Politician`, and `Candidate`.
  By centralizing these type definitions, we ensure that data structures are consistent across the entire client-side application, from API fetching
  in `App.tsx` to rendering in components like `PantryMap` and `PantryDetailsView`. This improves code quality and reduces bugs.

  Connections:
  - This file is a central type definition file and is imported by many other components and pages, including:
    - `client/src/App.tsx`
    - `client/src/pages/landing/landing-page.tsx`
    - `client/src/pages/pantry-feature/the-food-pantry-feature.tsx`
    - `client/src/pages/pantry-feature/pantry-controls.tsx`
    - `client/src/pages/pantry-feature/pantry-details-view.tsx`
    - `client/src/pages/pantry-feature/find-pantry-view.tsx`
    - `client/src/pages/pantry-feature/running-for-office-form.tsx`
    - `client/src/pages/home/map.tsx`
    - `client/src/pages/home/host-pantry-form.tsx`
    - `client/src/pages/home/marker-icons.ts`

  PHP/HTML/CSS/JS/SQL Equivalent:
  - SQL: This file directly corresponds to the schema of the `pantries`, `politicians`, and `candidates` tables in the database. The properties of each interface match the columns of the respective table.
  - PHP: In a PHP application, these might be represented as classes (e.g., `class Pantry { ... }`) or simply handled as associative arrays.
  - JS: In plain JavaScript, these types would not be formally defined, which is a major advantage of using TypeScript. Developers would have to rely on documentation or memory to know the shape of data objects.
*/
export type PantryType = 'food' | 'clothing' | 'resource' | 'library';
export type RepeatingType = 'one-time' | 'daily' | 'weekly' | 'weekendly' | 'monthly' | 'idk';

export interface Pantry {
  id: number;
  name: string;
  address: string;
  notes: string;
  lat: number;
  lng: number;
  hours: string;
  type: PantryType;
  repeating: RepeatingType;
  deleted: 0 | 1;
}

export interface Politician {
  id: number;
  name: string;
  office: 'House' | 'Senate';
  state: string;
  district: number | null;
  party: string;
  term_end_date: string;
  lat: number;
  lng: number;
  website?: string;
}

export interface Candidate {
  id: number;
  name: string;
  office: 'House' | 'Senate';
  state: string;
  district: number | null;
  party: string;
  lat: number;
  lng: number;
  website?: string;
  phone?: string;
  show_on_map?: 0 | 1;
  office_type?: string;
  country?: string;
}
/*
  Connections Summary:
  - This file defines data shapes and is imported by most of the application's components and pages.
*/
