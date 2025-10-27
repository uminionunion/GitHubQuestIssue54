
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { TheFoodPantryFeature } from '../pantry-feature/the-food-pantry-feature';
import { Pantry } from '../home/types';

interface LandingPageProps {
  pantries: Pantry[];
  addPantry: (pantryData: Omit<Pantry, 'id'>) => Pantry;
}

export function LandingPage({ pantries, addPantry }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground flex items-center justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" variant="secondary">#13UnionSupportV001</Button>
        </DialogTrigger>
        <DialogContent className="max-w-none w-[90vw] h-[90vh] p-0 !rounded-lg overflow-hidden">
          <TheFoodPantryFeature pantries={pantries} addPantry={addPantry} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
