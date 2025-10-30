
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
