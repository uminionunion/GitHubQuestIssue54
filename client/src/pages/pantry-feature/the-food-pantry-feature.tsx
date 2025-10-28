
import * as React from 'react';
import { PantryMap } from '../home/map';
import { PantryControls } from './pantry-controls';
import { Candidate, Pantry, Politician } from '../home/types';

interface TheFoodPantryFeatureProps {
  pantries: Pantry[];
  addPantry: (pantryData: Omit<Pantry, 'id'>) => Promise<Pantry | null>;
}

export function TheFoodPantryFeature({ pantries, addPantry }: TheFoodPantryFeatureProps) {
  const [activeView, setActiveView] = React.useState<'find' | 'host' | 'details'>('find');
  const [selectedPantry, setSelectedPantry] = React.useState<Pantry | null>(null);
  const [politicians, setPoliticians] = React.useState<Politician[]>([]);
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);

  React.useEffect(() => {
    fetch('/api/politicians')
      .then(res => res.json())
      .then(data => setPoliticians(data))
      .catch(console.error);
    
    fetch('/api/candidates')
      .then(res => res.json())
      .then(data => setCandidates(data))
      .catch(console.error);
  }, []);

  const handleViewDetails = (pantry: Pantry) => {
    setSelectedPantry(pantry);
    setActiveView('details');
  };

  return (
    <div className="flex h-full w-full bg-background">
      <div className="w-2/3 h-full">
        <PantryMap 
          pantries={pantries} 
          politicians={politicians}
          candidates={candidates}
          onViewDetails={handleViewDetails} 
        />
      </div>
      <div className="w-1/3 h-full border-l overflow-y-auto">
        <PantryControls 
          addPantry={addPantry} 
          activeView={activeView}
          setActiveView={setActiveView}
          selectedPantry={selectedPantry}
        />
      </div>
    </div>
  );
}
