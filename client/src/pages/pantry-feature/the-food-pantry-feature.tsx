
import * as React from 'react';
import { PantryMap } from '../home/map';
import { PantryControls } from './pantry-controls';
import { Pantry } from '../home/types';

interface TheFoodPantryFeatureProps {
  pantries: Pantry[];
  addPantry: (pantryData: Omit<Pantry, 'id'>) => Pantry;
}

export function TheFoodPantryFeature({ pantries, addPantry }: TheFoodPantryFeatureProps) {
  return (
    <div className="flex h-full w-full bg-background">
      <div className="w-2/3 h-full">
        <PantryMap pantries={pantries} />
      </div>
      <div className="w-1/3 h-full border-l overflow-y-auto">
        <PantryControls addPantry={addPantry} />
      </div>
    </div>
  );
}
