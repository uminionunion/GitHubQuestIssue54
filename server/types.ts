
export type PantryType = 'food' | 'clothing' | 'resource' | 'library';

export interface Pantry {
  id?: number;
  name: string;
  address: string;
  notes: string;
  lat: number;
  lng: number;
  hours: string;
  type: PantryType;
}
