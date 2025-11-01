{/*
  File: /client/src/pages/pantry-feature/the-food-pantry-feature.tsx
  Folder: /client/src/pages/pantry-feature

  Purpose:
  This is the main component for the entire "PantryFinder" feature that lives inside the modal.
  It sets up the three-column layout (Navigation, Map, Controls). It manages the state for the currently active view
  (find, host, details, etc.), the selected filters, and the data fetched from the API (politicians, candidates).
  It passes down data and state management functions to its child components.

  Connections:
  - `../home/map`: Renders the `PantryMap` component in the middle column.
  - `./pantry-controls`: Renders the `PantryControls` component in the right column.
  - `../home/types`: Imports `Pantry`, `Politician`, `Candidate` type definitions.
  - `./find-pantry-view`: Imports `Category` and `OfficeType` types for state management.
  - `@/components/ui/button`: Uses the `Button` component for the left-side navigation.
  - `client/src/pages/landing/landing-page.tsx`: This component is rendered by `LandingPage` inside a `Dialog`.
  - `server/index.ts`: Fetches politician data from the `/api/politicians` endpoint (line 30).

  PHP/HTML/CSS/JS/SQL Equivalent:
  - This component acts as the main controller for the entire single-page feature.
  - HTML: A container `div` with three child `div`s for the columns.
  - CSS: Flexbox or CSS Grid to create the three-column layout.
  - JS: A large part of the application's client-side logic would live here. It would initialize the map, handle clicks on the navigation buttons to show/hide different views in the right column, and manage the filtering logic that updates the map markers.
*/}
import * as React from 'react';
import { PantryMap } from '../home/map';
import { PantryControls } from './pantry-controls';
import { Candidate, Pantry, Politician } from '../home/types';
import { Category, OfficeType } from './find-pantry-view';
import { Button } from '@/components/ui/button';

interface TheFoodPantryFeatureProps {
  pantries: Pantry[];
  addPantry: (pantryData: Omit<Pantry, 'id' | 'deleted'>) => Promise<Pantry | null>;
  initialCandidates: Candidate[];
  addCandidate: (candidateData: Omit<Candidate, 'id' | 'lat' | 'lng'>) => Promise<Candidate | null>;
}

export function TheFoodPantryFeature({ pantries, addPantry, initialCandidates, addCandidate }: TheFoodPantryFeatureProps) {
  const [activeView, setActiveView] = React.useState<'find' | 'host' | 'details' | 'running'>('find');
  const [selectedPantry, setSelectedPantry] = React.useState<Pantry | null>(null);
  const [politicians, setPoliticians] = React.useState<Politician[]>([]);
  const [candidates, setCandidates] = React.useState<Candidate[]>(initialCandidates);
  
  const [selectedCategories, setSelectedCategories] = React.useState<Category[]>(['food', 'clothing', 'resource', 'library']);
  const [selectedPoliticianOfficeTypes, setSelectedPoliticianOfficeTypes] = React.useState<OfficeType[]>(['House', 'Senate']);
  const [selectedCandidateOfficeTypes, setSelectedCandidateOfficeTypes] = React.useState<OfficeType[]>(['House', 'Senate']);

  React.useEffect(() => {
    setCandidates(initialCandidates);
  }, [initialCandidates]);

  React.useEffect(() => {
    fetch('/api/politicians')
      .then(res => res.json())
      .then(data => setPoliticians(data))
      .catch(console.error);
  }, []);

  const handleViewDetails = (pantry: Pantry) => {
    setSelectedPantry(pantry);
    setActiveView('details');
  };

  const handleAddCandidate = async (candidateData: Omit<Candidate, 'id' | 'lat' | 'lng'>) => {
    const newCandidate = await addCandidate(candidateData);
    if (newCandidate) {
      setCandidates(prev => [...prev, newCandidate]);
      setActiveView('find');
    }
    return newCandidate;
  };

  const filteredPantries = pantries.filter(p => selectedCategories.includes(p.type));
  
  const filteredPoliticians = selectedCategories.includes('politicians') 
    ? politicians.filter(p => selectedPoliticianOfficeTypes.includes(p.office))
    : [];

  const filteredCandidates = selectedCategories.includes('candidates')
    ? candidates.filter(c => c.show_on_map && selectedCandidateOfficeTypes.includes(c.office))
    : [];

  return (
    <div className="flex h-full w-full bg-background">
      {/* Left Column - Navigation */}
      <div className="w-1/4 h-full border-r p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">PantryFinder</h2>
        <div className="space-y-4">
          <Button className="w-full" onClick={() => setActiveView('find')}>Find a Pantry</Button>
          <Button className="w-full" variant="secondary" onClick={() => setActiveView(activeView === 'host' ? 'find' : 'host')}>
            Know-of a Pantry? Host a Pantry?
          </Button>
          <Button className="w-full golden-button" onClick={() => setActiveView(activeView === 'running' ? 'find' : 'running')}>
            Running for Office?
          </Button>
        </div>
      </div>

      {/* Middle Column - Map */}
      <div className="w-1/2 h-full">
        <PantryMap 
          pantries={filteredPantries} 
          politicians={filteredPoliticians}
          candidates={filteredCandidates}
          onViewDetails={handleViewDetails} 
        />
      </div>

      {/* Right Column - Controls/Content */}
      <div className="w-1/4 h-full border-l overflow-y-auto">
        <PantryControls 
          addPantry={addPantry} 
          addCandidate={handleAddCandidate}
          activeView={activeView}
          setActiveView={setActiveView}
          selectedPantry={selectedPantry}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          selectedPoliticianOfficeTypes={selectedPoliticianOfficeTypes}
          onPoliticianOfficeTypeChange={setSelectedPoliticianOfficeTypes}
          selectedCandidateOfficeTypes={selectedCandidateOfficeTypes}
          onCandidateOfficeTypeChange={setSelectedCandidateOfficeTypes}
        />
      </div>
    </div>
  );
}
{/*
  Connections Summary:
  - line 28: import { PantryMap } from '../home/map'; -> Connects to `client/src/pages/home/map.tsx`.
  - line 29: import { PantryControls } from './pantry-controls'; -> Connects to `client/src/pages/pantry-feature/pantry-controls.tsx`.
  - line 30: import { Candidate, Pantry, Politician } from '../home/types'; -> Connects to `client/src/pages/home/types.ts`.
  - line 31: import { Category, OfficeType } from './find-pantry-view'; -> Connects to `client/src/pages/pantry-feature/find-pantry-view.tsx`.
  - line 32: import { Button } from '@/components/ui/button'; -> Connects to `client/src/components/ui/button.tsx`.
  - line 50: fetch('/api/politicians') -> Connects to GET `/api/politicians` endpoint in `server/index.ts`.
  - line 100: Renders `<PantryMap />`.
  - line 109: Renders `<PantryControls />`.
*/}
