
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { HostPantryForm } from '../home/host-pantry-form';
import { Pantry } from '../home/types';
import { FindPantryView, Category } from './find-pantry-view';
import { PantryDetailsView } from './pantry-details-view';

interface PantryControlsProps {
  addPantry: (pantryData: Omit<Pantry, 'id' | 'deleted'>) => Promise<Pantry | null>;
  activeView: 'find' | 'host' | 'details';
  setActiveView: (view: 'find' | 'host' | 'details') => void;
  selectedPantry: Pantry | null;
  selectedCategories: Category[];
  onCategoryChange: (categories: Category[]) => void;
}

export function PantryControls({ addPantry, activeView, setActiveView, selectedPantry, selectedCategories, onCategoryChange }: PantryControlsProps) {

  const handleAddPantry = async (pantryData: Omit<Pantry, 'id' | 'deleted'>) => {
    const newPantry = await addPantry(pantryData);
    if (newPantry) {
      setActiveView('find');
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'find':
        return <FindPantryView selectedCategories={selectedCategories} onCategoryChange={onCategoryChange} />;
      case 'host':
        return <HostPantryForm onSubmit={handleAddPantry} isDialog={false} />;
      case 'details':
        return selectedPantry ? <PantryDetailsView pantry={selectedPantry} /> : <p>No pantry selected.</p>;
      default:
        return <FindPantryView selectedCategories={selectedCategories} onCategoryChange={onCategoryChange} />;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">PantryFinder</h2>
      <div className="space-y-4">
        <Button className="w-full" onClick={() => setActiveView('find')}>Find a Pantry</Button>
        <Button className="w-full" variant="secondary" onClick={() => setActiveView(activeView === 'host' ? 'find' : 'host')}>
          Know-of a Pantry? Host a Pantry?
        </Button>

        <div className="mt-4 border-t pt-4">
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
}
