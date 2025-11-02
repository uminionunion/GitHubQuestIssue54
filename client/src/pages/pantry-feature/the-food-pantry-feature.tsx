import * as React from 'react';
import { PantryMap } from '../home/map';
import { PantryControls } from './pantry-controls';
import { Candidate, Pantry, Politician } from '../home/types';
import { Category } from './find-pantry-view';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TheFoodPantryFeatureProps {
  pantries: Pantry[];
  addPantry: (pantryData: Omit<Pantry, 'id' | 'deleted'>) => Promise<Pantry | null>;
}

export function TheFoodPantryFeature({ pantries, addPantry }: TheFoodPantryFeatureProps) {
  const [activeView, setActiveView] = React.useState<'find' | 'host' | 'details' | 'running'>('find');
  const [selectedPantry, setSelectedPantry] = React.useState<Pantry | null>(null);
  const [politicians, setPoliticians] = React.useState<Politician[]>([]);
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<Category[]>(['food', 'clothing', 'resource', 'library']);
  const [filterOptions, setFilterOptions] = React.useState({
    showPoliticianSenate: false,
    showPoliticianHouse: false,
    showCandidateSenate: false,
    showCandidateHouse: false,
  });

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

  const filteredPantries = pantries.filter(p => selectedCategories.includes(p.type));
  
  const filteredPoliticians = selectedCategories.includes('politicians') 
    ? politicians.filter(p => {
        if (filterOptions.showPoliticianSenate && p.office === 'Senate') return true;
        if (filterOptions.showPoliticianHouse && p.office === 'House') return true;
        // If no sub-filters are checked, show all politicians
        if (!filterOptions.showPoliticianSenate && !filterOptions.showPoliticianHouse) return true;
        return false;
      })
    : [];

  const filteredCandidates = selectedCategories.includes('candidates') 
    ? candidates.filter(c => {
        if (filterOptions.showCandidateSenate && c.office === 'Senate') return true;
        if (filterOptions.showCandidateHouse && c.office === 'House') return true;
        // If no sub-filters are checked, show all candidates
        if (!filterOptions.showCandidateSenate && !filterOptions.showCandidateHouse) return true;
        return false;
      })
    : [];

  return (
    <div className="flex h-full w-full bg-background">
      <div className="w-3/12 h-full border-r overflow-y-auto p-4 flex flex-col gap-4">
        <Button className="w-full justify-center text-center" onClick={() => setActiveView('find')} variant={activeView === 'find' ? 'default' : 'secondary'}>
          Find a Pantry
        </Button>
        <Button className="w-full justify-center text-center whitespace-normal h-auto" onClick={() => setActiveView('host')} variant="secondary">
          Know-of a Pantry? Host a Pantry?
        </Button>
        <Button 
          className={cn(
            "w-full justify-center text-center",
            "bg-yellow-400 hover:bg-yellow-500 text-black"
          )}
          onClick={() => setActiveView('running')}
        >
          Running for Office?
        </Button>
      </div>
      <div className="w-5/12 h-full">
        <PantryMap 
          pantries={filteredPantries} 
          politicians={filteredPoliticians}
          candidates={filteredCandidates}
          onViewDetails={handleViewDetails} 
        />
      </div>
      <div className="w-4/12 h-full border-l overflow-y-auto">
        <PantryControls 
          addPantry={addPantry} 
          activeView={activeView}
          setActiveView={setActiveView}
          selectedPantry={selectedPantry}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          filterOptions={filterOptions}
          setFilterOptions={setFilterOptions}
        />
      </div>
    </div>
  );
}
