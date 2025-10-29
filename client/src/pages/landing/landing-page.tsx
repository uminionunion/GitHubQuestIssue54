
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TheFoodPantryFeature } from '../pantry-feature/the-food-pantry-feature';
import { Candidate, Pantry } from '../home/types';
import { PantryMap } from '../home/map';

interface LandingPageProps {
  pantries: Pantry[];
  addPantry: (pantryData: Omit<Pantry, 'id' | 'deleted'>) => Promise<Pantry | null>;
  candidates: Candidate[];
  addCandidate: (candidateData: Omit<Candidate, 'id' | 'lat' | 'lng'>) => Promise<Candidate | null>;
}

export function LandingPage({ pantries, addPantry, candidates, addCandidate }: LandingPageProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground flex flex-col items-center justify-center p-4">
      <div className="flex gap-2 mb-2">
        <Button size="sm" onClick={() => setIsModalOpen(true)}>Find a Pantry</Button>
        <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(true)}>#13UnionSupportV001</Button>
      </div>

      <div 
        className="group relative w-full max-w-xs h-24 rounded-lg overflow-hidden cursor-pointer shadow-lg"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="absolute inset-0">
          <PantryMap pantries={pantries} onViewDetails={() => {}} isPreview={true} />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-70 transition-all flex items-center justify-center">
          <h2 className="text-white text-base md:text-lg font-bold text-center p-2">
            Find a Food/Clothing/Resource Pantry/Hub & More:
          </h2>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-none w-[90vw] h-[90vh] p-0 !rounded-lg overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Pantry Finder Feature</DialogTitle>
          </DialogHeader>
          <TheFoodPantryFeature 
            pantries={pantries} 
            addPantry={addPantry}
            initialCandidates={candidates}
            addCandidate={addCandidate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
