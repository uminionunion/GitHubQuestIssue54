{/*
  File: /client/src/pages/landing/landing-page.tsx
  Folder: /client/src/pages/landing

  Purpose:
  This component represents the main landing page of the application. It displays the initial view with "Find a Pantry" and other buttons,
  along with a non-interactive map preview. Its primary role is to trigger the main modal window where the core functionality of the application resides.

  Connections:
  - `@/components/ui/button`: Imports the reusable `Button` component.
  - `@/components/ui/dialog`: Imports components (`Dialog`, `DialogContent`, etc.) to create the modal window.
  - `../pantry-feature/the-food-pantry-feature`: This is the main feature component that gets rendered inside the modal. `LandingPage` passes the pantry and candidate data down to it.
  - `../home/types`: Imports the `Pantry` and `Candidate` type definitions.
  - `../home/map`: Imports the `PantryMap` component to show a preview map.
  - `client/src/App.tsx`: This component is rendered by `App.tsx` and receives data (`pantries`, `candidates`) and functions (`addPantry`, `addCandidate`) as props.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: The main body of an `index.html` page, containing the buttons and a `div` for the map preview. The modal would be a separate, hidden `div`.
  - CSS: Styles for the page layout, buttons, map preview overlay, and the modal itself (positioning, appearance).
  - JS: A script with click event listeners on the buttons and map preview to show the modal. It would also initialize the preview map.
*/}
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
      <div className="flex gap-4 mb-4">
        <Button size="lg" onClick={() => setIsModalOpen(true)}>Find a Pantry</Button>
        <Button size="lg" variant="secondary" onClick={() => setIsModalOpen(true)}>#13UnionSupportV001</Button>
      </div>

      <div 
        className="group relative w-full max-w-md h-48 rounded-lg overflow-hidden cursor-pointer shadow-lg"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="absolute inset-0">
          <PantryMap pantries={pantries} onViewDetails={() => {}} isPreview={true} />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-70 transition-all flex items-center justify-center">
          <h2 className="text-white text-xl md:text-2xl font-bold text-center p-4">
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
{/*
  Connections Summary:
  - line 26: import { Button } from '@/components/ui/button'; -> Connects to `client/src/components/ui/button.tsx`.
  - line 27: import { Dialog, DialogContent, ... } from '@/components/ui/dialog'; -> Connects to `client/src/components/ui/dialog.tsx`.
  - line 28: import { TheFoodPantryFeature } from '../pantry-feature/the-food-pantry-feature'; -> Connects to `client/src/pages/pantry-feature/the-food-pantry-feature.tsx`.
  - line 29: import { Candidate, Pantry } from '../home/types'; -> Connects to `client/src/pages/home/types.ts`.
  - line 30: import { PantryMap } from '../home/map'; -> Connects to `client/src/pages/home/map.tsx`.
  - line 51: Renders `<PantryMap />` for the preview.
  - line 62: Renders `<TheFoodPantryFeature />` inside the dialog.
*/}
