
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
import { Pantry } from './types';

interface HostPantryFormProps {
  onSubmit: (pantry: Omit<Pantry, 'id'>) => void;
  isDialog?: boolean;
}

export function HostPantryForm({ onSubmit, isDialog = true }: HostPantryFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const hours = formData.get('hours') as string;
    const notes = formData.get('notes') as string;
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);

    if (name && address && hours && !isNaN(lat) && !isNaN(lng)) {
      onSubmit({ name, address, notes, lat, lng, hours });
    } else {
      // Basic validation feedback
      alert('Please fill out all required fields correctly, including latitude and longitude.');
    }
  };

  const FormContent = (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Pantry Name
          </Label>
          <Input id="name" name="name" placeholder="e.g. Community Food Hub" className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="address" className="text-right">
            Address
          </Label>
          <Input id="address" name="address" placeholder="123 Main St, Anytown, USA" className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="hours" className="text-right">
            Hours
          </Label>
          <Input id="hours" name="hours" placeholder="e.g. M-F 9am-5pm" className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="lat" className="text-right pt-2">
            Latitude
          </Label>
          <div className="col-span-3">
            <Input id="lat" name="lat" type="number" step="any" placeholder="e.g. 40.7128" className="w-full" required />
            <p className="text-xs text-muted-foreground mt-1">
              this adds a marker to the map until we can find appropriate APIs. Ask an ai/aiSearch for 'lat & long of the address (of pantry) & type in here for our markers.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="lng" className="text-right pt-2">
            Longitude
          </Label>
          <div className="col-span-3">
            <Input id="lng" name="lng" type="number" step="any" placeholder="e.g. -74.0060" className="w-full" required />
            <p className="text-xs text-muted-foreground mt-1">
              this adds a marker to the map until we can find appropriate APIs. Ask an ai for lat & long of the address (of the food/clothing pantry & any mini libraries you may find along the way and/or anything else of the sort.) & type in here for our markers to be added.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="notes" className="text-right">
            Notes
          </Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="e.g. Open on weekends, bring your own bags."
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Save changes</Button>
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
    <div>
      <h3 className="text-lg font-semibold">Host a Pantry</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Fill out the details below to list a new food pantry.
      </p>
      {FormContent}
    </div>
  );
}
