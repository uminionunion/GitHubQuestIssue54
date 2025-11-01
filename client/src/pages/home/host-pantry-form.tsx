{/*
  File: /client/src/pages/home/host-pantry-form.tsx
  Folder: /client/src/pages/home

  Purpose:
  This component provides a form for users to submit a new pantry. It includes fields for name, address, hours, type, and other details.
  It features a "magic wand" button that uses a geocoding API to automatically find the latitude and longitude from a given address, simplifying the process for the user.
  The form can be rendered either inside a dialog or as a standalone view.

  Connections:
  - `@/components/ui/*`: Imports various UI components like `Button`, `Input`, `Label`, `Textarea`, `RadioGroup` to build the form.
  - `./types`: Imports `Pantry`, `PantryType`, `RepeatingType` type definitions.
  - `lucide-react`: Imports the `Wand2` icon for the geocoding button.
  - `server/index.ts`: The geocoding lookup (`handleGeoLookup`, line 49) makes a GET request to the `/api/geocode` endpoint. The form submission (`handleSubmit`, line 70) calls the `onSubmit` prop, which traces back to `addPantry` in `App.tsx` and makes a POST request to `/api/pantries`.
  - `client/src/pages/pantry-feature/pantry-controls.tsx`: This form is rendered by `PantryControls` when the active view is 'host'.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - PHP/SQL: This would be a `pantry.php` file. On GET, it displays the form. On POST, it validates data, inserts it into the `pantries` table, and shows a success message. The geocoding part would involve a server-side cURL request to an external geocoding service.
  - HTML: A `<form>` with all the necessary input fields.
  - JS: JavaScript for client-side validation and for making an AJAX call to the server's geocoding endpoint.
*/}
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pantry, PantryType, RepeatingType } from './types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wand2 } from 'lucide-react';

interface HostPantryFormProps {
  onSubmit: (pantry: Omit<Pantry, 'id' | 'deleted'>) => void;
  isDialog?: boolean;
}

const pantryTypes: { id: PantryType; label: string }[] = [
    { id: 'food', label: 'Food Pantry?' },
    { id: 'clothing', label: 'Clothing Pantry?' },
    { id: 'resource', label: 'Resource' },
    { id: 'library', label: 'Mini-Library/Billboard?' },
];

const repeatingTypes: { id: RepeatingType; label: string }[] = [
    { id: 'one-time', label: 'One-Time' },
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'weekendly', label: 'Weekendly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'idk', label: 'IDK' },
];

export function HostPantryForm({ onSubmit, isDialog = true }: HostPantryFormProps) {
  const [addressForLookup, setAddressForLookup] = React.useState('');
  const [lat, setLat] = React.useState('');
  const [lng, setLng] = React.useState('');
  const [isLookingUp, setIsLookingUp] = React.useState(false);

  const handleGeoLookup = async () => {
    if (!addressForLookup) {
      alert('Please enter an address to look up.');
      return;
    }
    setIsLookingUp(true);
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(addressForLookup)}`);
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      const { lat, lng } = await response.json();
      setLat(lat.toString());
      setLng(lng.toString());
    } catch (error) {
      console.error(error);
      alert('Could not find coordinates for the address. Please enter them manually.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const hours = formData.get('hours') as string;
    const notes = formData.get('notes') as string;
    const type = formData.get('type') as PantryType;
    const repeating = formData.get('repeating') as RepeatingType;
    const latVal = parseFloat(lat);
    const lngVal = parseFloat(lng);

    if (name && addressForLookup && hours && type && repeating && !isNaN(latVal) && !isNaN(lngVal)) {
      onSubmit({ name, address: addressForLookup, notes, lat: latVal, lng: lngVal, hours, type, repeating });
    } else {
      alert('Please fill out all required fields correctly.');
    }
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="grid gap-4 py-4 overflow-y-auto pr-2 flex-grow">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Pantry Name
          </Label>
          <Input id="name" name="name" placeholder="e.g. Community Food Hub" className="col-span-3" required />
        </div>
        
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="address-lookup" className="text-right pt-2">
            Address
          </Label>
          <div className="col-span-3">
            <div className="flex gap-2">
              <Input 
                id="address-lookup" 
                name="address"
                value={addressForLookup}
                onChange={(e) => setAddressForLookup(e.target.value)}
                placeholder="Type address here..."
                required
              />
              <Button type="button" onClick={handleGeoLookup} disabled={isLookingUp} size="icon">
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              (BETA) Have AI find lat & long. Type address and click the magic wand.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="lat" className="text-right pt-2">
            Latitude
          </Label>
          <div className="col-span-3">
            <Input id="lat" name="lat" type="number" step="any" placeholder="e.g. 40.7128" className="w-full" value={lat} onChange={e => setLat(e.target.value)} required />
             <p className="text-xs text-muted-foreground mt-1">
              Latitude & longitude are used to add markers to the map.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="lng" className="text-right pt-2">
            Longitude
          </Label>
          <div className="col-span-3">
            <Input id="lng" name="lng" type="number" step="any" placeholder="e.g. -74.0060" className="w-full" value={lng} onChange={e => setLng(e.target.value)} required />
            <p className="text-xs text-muted-foreground mt-1">
              Latitude & longitude are used to add markers to the map.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="hours" className="text-right">
            Hours
          </Label>
          <Input id="hours" name="hours" placeholder="e.g. M-F 9am-5pm" className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Type</Label>
            <RadioGroup name="type" className="col-span-3 grid grid-cols-2 gap-2" required>
                {pantryTypes.map(type => (
                    <div key={type.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.id} id={`type-${type.id}`} />
                        <Label htmlFor={`type-${type.id}`}>{type.label}</Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="notes" className="text-right">
            Notes
          </Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="e.g. Website, Open on weekends, bring your own bags."
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Repeating?</Label>
            <RadioGroup name="repeating" className="col-span-3 grid grid-cols-3 gap-2" required>
                {repeatingTypes.map(type => (
                    <div key={type.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.id} id={`repeating-${type.id}`} />
                        <Label htmlFor={`repeating-${type.id}`}>{type.label}</Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
      </div>
      
      <DialogFooter className="flex-row justify-between items-center flex-shrink-0">
        <a href="https://uminion.com/product/sister-union-13-2024-poster/" target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
          Get a Poster- Help UnionSupport#13 Do More
        </a>
        <Button type="submit">Submit</Button>
      </DialogFooter>
    </form>
  );

  if (isDialog) {
    return (
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Host a Pantry</DialogTitle>
          <DialogDescription>
            Fill out the details below to list a new food pantry. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <h3 className="text-lg font-semibold">Host a Pantry</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Fill out the details below to list a new food pantry.
        </p>
      </div>
      {FormContent}
    </div>
  );
}
{/*
  Connections Summary:
  - line 49: fetch(`/api/geocode...`) -> Connects to GET `/api/geocode` endpoint in `server/index.ts`.
  - line 81: `onSubmit` call -> Connects through props to `addPantry` in `App.tsx`, which sends a POST to `/api/pantries`.
  - UI components from `@/components/ui/*` are used throughout.
*/}
