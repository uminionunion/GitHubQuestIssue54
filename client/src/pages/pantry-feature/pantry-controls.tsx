{/*
  File: /client/src/pages/pantry-feature/pantry-controls.tsx
  Folder: /client/src/pages/pantry-feature

  Purpose:
  This component acts as the main content area for the right-hand panel in the modal. It's a controller that determines which view to display based on the `activeView` state
  (e.g., 'find' for filtering, 'host' for the submission form, 'details' for pantry info). It renders the appropriate sub-component for the current view.

  Connections:
  - `../home/host-pantry-form`: Renders this component when `activeView` is 'host'.
  - `../home/types`: Imports `Candidate` and `Pantry` type definitions.
  - `./find-pantry-view`: Renders this component when `activeView` is 'find'.
  - `./pantry-details-view`: Renders this component when `activeView` is 'details'.
  - `./running-for-office-form`: Renders this component when `activeView` is 'running'.
  - `client/src/pages/pantry-feature/the-food-pantry-feature.tsx`: This component is rendered by `TheFoodPantryFeature` and receives state and functions as props to manage the active view and data submissions.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - JS: This would be a JavaScript function or module that handles dynamic content switching. It would show/hide different `div` sections of the page based on user interaction (e.g., clicking a tab). This is often called "view routing" or content swapping.
  - PHP: In a multi-page approach, this would be handled by different PHP files (e.g., `find.php`, `host.php`). In a single-page PHP app, it might use a `?view=...` query parameter to decide which block of HTML to generate.
*/}
import * as React from 'react';
import { HostPantryForm } from '../home/host-pantry-form';
import { Candidate, Pantry } from '../home/types';
import { FindPantryView, Category, OfficeType } from './find-pantry-view';
import { PantryDetailsView } from './pantry-details-view';
import { RunningForOfficeForm } from './running-for-office-form';

type ActiveView = 'find' | 'host' | 'details' | 'running';

interface PantryControlsProps {
  addPantry: (pantryData: Omit<Pantry, 'id' | 'deleted'>) => Promise<Pantry | null>;
  addCandidate: (candidateData: Omit<Candidate, 'id' | 'lat' | 'lng'>) => Promise<Candidate | null>;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedPantry: Pantry | null;
  selectedCategories: Category[];
  onCategoryChange: (categories: Category[]) => void;
  selectedPoliticianOfficeTypes: OfficeType[];
  onPoliticianOfficeTypeChange: (types: OfficeType[]) => void;
  selectedCandidateOfficeTypes: OfficeType[];
  onCandidateOfficeTypeChange: (types: OfficeType[]) => void;
}

export function PantryControls({ 
  addPantry, 
  addCandidate,
  activeView, 
  setActiveView, 
  selectedPantry, 
  selectedCategories, 
  onCategoryChange,
  selectedPoliticianOfficeTypes,
  onPoliticianOfficeTypeChange,
  selectedCandidateOfficeTypes,
  onCandidateOfficeTypeChange,
}: PantryControlsProps) {

  const handleAddPantry = async (pantryData: Omit<Pantry, 'id' | 'deleted'>) => {
    const newPantry = await addPantry(pantryData);
    if (newPantry) {
      setActiveView('find');
    }
  };

  const handleAddCandidate = async (candidateData: Omit<Candidate, 'id' | 'lat' | 'lng'>) => {
    const newCandidate = await addCandidate(candidateData);
    if (newCandidate) {
      setActiveView('find');
    }
    return newCandidate;
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'find':
        return <FindPantryView 
          selectedCategories={selectedCategories} 
          onCategoryChange={onCategoryChange}
          selectedPoliticianOfficeTypes={selectedPoliticianOfficeTypes}
          onPoliticianOfficeTypeChange={onPoliticianOfficeTypeChange}
          selectedCandidateOfficeTypes={selectedCandidateOfficeTypes}
          onCandidateOfficeTypeChange={onCandidateOfficeTypeChange}
        />;
      case 'host':
        return <HostPantryForm onSubmit={handleAddPantry} isDialog={false} />;
      case 'running':
        return <RunningForOfficeForm onSubmit={handleAddCandidate} />;
      case 'details':
        return selectedPantry ? <PantryDetailsView pantry={selectedPantry} /> : <p>No pantry selected.</p>;
      default:
        return <FindPantryView 
          selectedCategories={selectedCategories} 
          onCategoryChange={onCategoryChange} 
          selectedPoliticianOfficeTypes={selectedPoliticianOfficeTypes}
          onPoliticianOfficeTypeChange={onPoliticianOfficeTypeChange}
          selectedCandidateOfficeTypes={selectedCandidateOfficeTypes}
          onCandidateOfficeTypeChange={onCandidateOfficeTypeChange}
        />;
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex-grow overflow-y-auto">
        {renderActiveView()}
      </div>
    </div>
  );
}
{/*
  Connections Summary:
  - line 29: import { HostPantryForm } from '../home/host-pantry-form.tsx'; -> Connects to `client/src/pages/home/host-pantry-form.tsx`.
  - line 30: import { Candidate, Pantry } from '../home/types'; -> Connects to `client/src/pages/home/types.ts`.
  - line 31: import { FindPantryView, ... } from './find-pantry-view'; -> Connects to `client/src/pages/pantry-feature/find-pantry-view.tsx`.
  - line 32: import { PantryDetailsView } from './pantry-details-view'; -> Connects to `client/src/pages/pantry-feature/pantry-details-view.tsx`.
  - line 33: import { RunningForOfficeForm } from './running-for-office-form'; -> Connects to `client/src/pages/pantry-feature/running-for-office-form.tsx`.
  - line 88: Renders `<FindPantryView />`.
  - line 96: Renders `<HostPantryForm />`.
  - line 98: Renders `<RunningForOfficeForm />`.
  - line 100: Renders `<PantryDetailsView />`.
*/}
