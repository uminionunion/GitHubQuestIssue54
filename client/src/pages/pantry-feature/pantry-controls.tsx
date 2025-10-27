
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { HostPantryForm } from '../home/host-pantry-form';
import { Pantry } from '../home/types';

interface PantryControlsProps {
  addPantry: (pantryData: Omit<Pantry, 'id'>) => Pantry;
}

export function PantryControls({ addPantry }: PantryControlsProps) {
  const [activeView, setActiveView] = React.useState<'none' | 'host'>('none');

  const handleAddPantry = (pantryData: Omit<Pantry, 'id'>) => {
    addPantry(pantryData);
    setActiveView('none');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">PantryFinder</h2>
      <div className="space-y-4">
        <Button className="w-full" onClick={() => setActiveView('none')}>Find a Pantry</Button>
        <Button className="w-full" variant="secondary" onClick={() => setActiveView(activeView === 'host' ? 'none' : 'host')}>
          Host a Pantry
        </Button>

        {activeView === 'host' && (
          <div className="mt-4 border-t pt-4">
            <HostPantryForm onSubmit={handleAddPantry} isDialog={false} />
          </div>
        )}
      </div>
    </div>
  );
}
