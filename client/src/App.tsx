{/*
  File: /client/src/App.tsx
  Folder: /client/src

  Purpose:
  This is the root component of the React application. It manages the main application state,
  including the lists of pantries and candidates. It contains the logic for fetching initial data
  from the backend API and functions for adding new pantries and candidates. This component
  renders the `LandingPage` and passes down the data and functions as props.

  Connections:
  - `client/src/pages/landing/landing-page.tsx`: The `App` component renders `LandingPage` (line 68) and passes `pantries`, `addPantry`, `candidates`, and `addCandidate` as props.
  - `client/src/pages/home/types.ts`: Imports the `Pantry` and `Candidate` type definitions.
  - `server/index.ts`: This component makes API calls to endpoints defined in the server file:
    - `fetch('/api/pantries')` (GET, line 15) connects to `app.get('/api/pantries', ...)` on the server.
    - `fetch('/api/candidates')` (GET, line 20) connects to `app.get('/api/candidates', ...)` on the server.
    - `fetch('/api/pantries', ...)` (POST, line 26) connects to `app.post('/api/pantries', ...)` on the server.
    - `fetch('/api/candidates', ...)` (POST, line 44) connects to `app.post('/api/candidates', ...)` on the server.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - PHP/SQL: This file's logic is equivalent to a PHP script that fetches initial data from a MySQL database (using SQL `SELECT` queries) when the page loads. It would also handle POST requests to insert new data into the database (using SQL `INSERT` queries).
  - JS: The state management (`pantries`, `candidates`) and API fetching logic would be handled with vanilla JavaScript, perhaps using `fetch()` within a main `init()` function and functions like `addPantry()` that make POST requests.
  - HTML: The PHP script would render the initial HTML structure, embedding the fetched data directly or as a JSON object for the JavaScript to use.
*/}
import * as React from 'react';
import { LandingPage } from './pages/landing/landing-page';
import { Candidate, Pantry } from './pages/home/types';

function App() {
  const [pantries, setPantries] = React.useState<Pantry[]>([]);
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);

  React.useEffect(() => {
    fetch('/api/pantries')
      .then(res => res.json())
      .then(data => setPantries(data.filter(p => p.deleted === 0)))
      .catch(console.error);
    
    fetch('/api/candidates')
      .then(res => res.json())
      .then(data => setCandidates(data))
      .catch(console.error);
  }, []);

  const addPantry = async (pantryData: Omit<Pantry, 'id' | 'deleted'>) => {
    try {
      const response = await fetch('/api/pantries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pantryData),
      });
      if (!response.ok) {
        throw new Error('Failed to add pantry');
      }
      const newPantry = await response.json();
      setPantries(prev => [...prev, newPantry]);
      return newPantry;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'lat' | 'lng'>) => {
    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData),
      });
      if (!response.ok) {
        throw new Error('Failed to add candidate');
      }
      const newCandidate = await response.json();
      if (newCandidate.show_on_map) {
        setCandidates(prev => [...prev, newCandidate]);
      }
      return newCandidate;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  return (
    <LandingPage 
      pantries={pantries} 
      addPantry={addPantry} 
      candidates={candidates}
      addCandidate={addCandidate}
    />
  );
}

export default App;
{/*
  Connections Summary:
  - line 35: import { LandingPage } from './pages/landing/landing-page.tsx'; -> Connects to `client/src/pages/landing/landing-page.tsx`.
  - line 36: import { Candidate, Pantry } from './pages/home/types'; -> Connects to `client/src/pages/home/types.ts`.
  - line 41: fetch('/api/pantries') -> Connects to GET `/api/pantries` endpoint in `server/index.ts`.
  - line 46: fetch('/api/candidates') -> Connects to GET `/api/candidates` endpoint in `server/index.ts`.
  - line 53: fetch('/api/pantries', { method: 'POST' ... }) -> Connects to POST `/api/pantries` endpoint in `server/index.ts`.
  - line 71: fetch('/api/candidates', { method: 'POST' ... }) -> Connects to POST `/api/candidates` endpoint in `server/index.ts`.
  - line 89: Renders `<LandingPage />`.
*/}
