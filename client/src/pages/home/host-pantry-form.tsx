
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
}

export function HostPantryForm({ onSubmit }: HostPantryFormProps) {
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

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Host a Pantry</DialogTitle>
        <DialogDescription>
          Fill out the details below to list a new food pantry. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lat" className="text-right">
              Latitude
            </Label>
            <Input id="lat" name="lat" type="number" step="any" placeholder="e.g. 40.7128" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lng" className="text-right">
              Longitude
            </Label>
            <Input id="lng" name="lng" type="number" step="any" placeholder="e.g. -74.0060" className="col-span-3" required />
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
    </DialogContent>
  );
}
