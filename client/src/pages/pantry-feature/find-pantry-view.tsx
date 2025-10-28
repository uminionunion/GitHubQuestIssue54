
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PantryType } from '../home/types';

const northAmericanCountries = {
  'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan'],
  'Mexico': ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico City', 'Mexico State', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'],
  'USA': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
  'Antigua and Barbuda': [],
  'Bahamas': [],
  'Barbados': [],
  'Belize': [],
  'Costa Rica': [],
  'Cuba': [],
  'Dominica': [],
  'Dominican Republic': [],
  'El Salvador': [],
  'Grenada': [],
  'Guatemala': [],
  'Haiti': [],
  'Honduras': [],
  'Jamaica': [],
  'Nicaragua': [],
  'Panama': [],
  'Saint Kitts and Nevis': [],
  'Saint Lucia': [],
  'Saint Vincent and the Grenadines': [],
  'Trinidad and Tobago': [],
};

const sortedOtherCountries = Object.keys(northAmericanCountries)
  .filter(c => !['Canada', 'Mexico', 'USA'].includes(c))
  .sort();

const countryOrder = ['Canada', 'Mexico', 'USA', ...sortedOtherCountries];

const pantryTypes: { id: PantryType; label: string }[] = [
    { id: 'food', label: 'Food Pantry?' },
    { id: 'clothing', label: 'Clothing Pantry?' },
    { id: 'resource', label: 'Resource' },
    { id: 'library', label: 'Mini-Library/Billboard?' },
];

export function FindPantryView() {
  const [selectedCountries, setSelectedCountries] = React.useState<string[]>([]);

  const handleCountryChange = (country: string, checked: boolean) => {
    setSelectedCountries(prev =>
      checked ? [...prev, country] : prev.filter(c => c !== country)
    );
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Find a Pantry</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select countries and states/provinces to filter the map.
      </p>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Category</h4>
          <div className="grid grid-cols-2 gap-2">
            {pantryTypes.map(type => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox id={`filter-type-${type.id}`} />
                <Label htmlFor={`filter-type-${type.id}`}>{type.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Country</h4>
          <div className="max-h-48 overflow-y-auto space-y-2 p-2 border rounded-md">
            {countryOrder.map(country => (
              <div key={country} className="flex items-center space-x-2">
                <Checkbox
                  id={`country-${country}`}
                  onCheckedChange={(checked) => handleCountryChange(country, !!checked)}
                />
                <Label htmlFor={`country-${country}`}>{country}</Label>
              </div>
            ))}
          </div>
        </div>

        {selectedCountries.map(country => {
          const states = northAmericanCountries[country];
          if (!states || states.length === 0) return null;
          return (
            <div key={country}>
              <h4 className="font-medium mb-2">{country} States/Provinces</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 p-2 border rounded-md">
                {states.map(state => (
                  <div key={state} className="flex items-center space-x-2">
                    <Checkbox id={`state-${state}`} />
                    <Label htmlFor={`state-${state}`}>{state}</Label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
