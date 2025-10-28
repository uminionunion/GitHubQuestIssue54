
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PantryType } from '../home/types';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { countries } from './countries-data';

export type Category = PantryType | 'candidates' | 'politicians';

const categoryTypes: { id: Category; label: string }[] = [
    { id: 'food', label: 'Food Pantry?' },
    { id: 'clothing', label: 'Clothing Pantry?' },
    { id: 'resource', label: 'Resource' },
    { id: 'library', label: 'Mini-Library/Billboard?' },
    { id: 'candidates', label: 'Candidates Running for Office' },
    { id: 'politicians', label: 'Politicians who let the WH Fall still in office.' },
];

const topCountries = ['Canada', 'Mexico', 'USA'];
const sortedCountryList = [
  ...topCountries,
  ...Object.keys(countries).filter(c => !topCountries.includes(c)).sort()
];

interface FindPantryViewProps {
  selectedCategories: Category[];
  onCategoryChange: (categories: Category[]) => void;
}

export function FindPantryView({ selectedCategories, onCategoryChange }: FindPantryViewProps) {
  const [selectedCountry, setSelectedCountry] = React.useState<string | null>(null);
  const [selectedState, setSelectedState] = React.useState<string | null>(null);

  const handleCategoryChange = (categoryId: Category, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter(c => c !== categoryId);
    onCategoryChange(newCategories);
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedState(null); // Reset state selection when country changes
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
  };

  const states = selectedCountry ? countries[selectedCountry] : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Find a Pantry</h3>
        <Button>Search</Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Select countries and states/provinces to filter the map.
      </p>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Category</h4>
          <div className="grid grid-cols-2 gap-2">
            {categoryTypes.map(type => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`filter-type-${type.id}`} 
                  checked={selectedCategories.includes(type.id)}
                  onCheckedChange={(checked) => handleCategoryChange(type.id, !!checked)}
                />
                <Label htmlFor={`filter-type-${type.id}`}>{type.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Country</h4>
          <div className="max-h-48 overflow-y-auto space-y-2 p-2 border rounded-md">
            <RadioGroup value={selectedCountry || ''} onValueChange={handleCountryChange}>
              {sortedCountryList.map(country => (
                <div key={country} className="flex items-center space-x-2">
                  <RadioGroupItem value={country} id={`country-${country}`} />
                  <Label htmlFor={`country-${country}`}>{country}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {states && states.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">{selectedCountry} States/Provinces</h4>
            <div className="max-h-48 overflow-y-auto space-y-2 p-2 border rounded-md">
              <RadioGroup value={selectedState || ''} onValueChange={handleStateChange}>
                {states.map(state => (
                  <div key={state} className="flex items-center space-x-2">
                    <RadioGroupItem value={state} id={`state-${state}`} />
                    <Label htmlFor={`state-${state}`}>{state}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
