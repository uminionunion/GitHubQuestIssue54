
import * as React from 'react';
import { Button } from '@/components/ui/button';
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
      <h2 className="text-2xl font-bold mb-4 flex-shrink-0">PantryFinder</h2>
      <div className="space-y-4 flex-shrink-0">
        <Button className="w-full" onClick={() => setActiveView('find')}>Find a Pantry</Button>
        <Button className="w-full" variant="secondary" onClick={() => setActiveView(activeView === 'host' ? 'find' : 'host')}>
          Know-of a Pantry? Host a Pantry?
        </Button>
        <Button className="w-full golden-button" onClick={() => setActiveView(activeView === 'running' ? 'find' : 'running')}>
          Running for Office?
        </Button>
      </div>

      <div className="mt-4 border-t pt-4 flex-grow overflow-y-auto">
        {renderActiveView()}
      </div>
    </div>
  );
}
