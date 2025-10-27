
import * as React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LandingPage } from './pages/landing/landing-page';
import { PantryDetailsPage } from './pages/pantry-details/pantry-details-page';
import { initialPantries } from './pages/home/initial-pantries';
import { Pantry } from './pages/home/types';

function App() {
  const [pantries, setPantries] = React.useState<Pantry[]>(initialPantries);

  const addPantry = (pantryData: Omit<Pantry, 'id'>) => {
    const newPantry = { ...pantryData, id: Date.now() };
    setPantries(prev => [...prev, newPantry]);
    return newPantry;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage pantries={pantries} addPantry={addPantry} />} />
        <Route path="/pantry/:id" element={<PantryDetailsPage pantries={pantries} />} />
      </Routes>
    </Router>
  );
}

export default App;
