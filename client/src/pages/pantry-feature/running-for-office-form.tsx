{/*
  File: /client/src/pages/pantry-feature/running-for-office-form.tsx
  Folder: /client/src/pages/pantry-feature

  Purpose:
  This component provides a form for users to submit information about a political candidate. It includes fields for name, location (country/state),
  office type, and optional contact info. Upon successful submission, it displays a "thank you" message with a link to the relevant Ballotpedia page for ballot access information.

  Connections:
  - `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/checkbox`, `@/components/ui/select`: Imports various UI components to build the form.
  - `../home/types`: Imports the `Candidate` type definition.
  - `./countries-data`: Imports the `countries` object to populate the country and state dropdowns.
  - `client/src/pages/pantry-feature/pantry-controls.tsx`: This component is rendered by `PantryControls` when the `activeView` is 'running'. The `onSubmit` function it receives is used to send the data to the backend.
  - The `onSubmit` prop connects to the `addCandidate` function in `App.tsx`, which in turn makes a POST request to the `/api/candidates` endpoint in `server/index.ts`.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - PHP/SQL: This would be a `candidate.php` file. On GET, it would display the HTML form. On POST, it would validate the submitted data, geocode the location (by calling an external API), insert the new candidate into the `candidates` table in the database, and then display a success message.
  - HTML: A `<form method="POST" action="candidate.php">` with all the necessary input fields, selects, and checkboxes.
  - JS: Client-side validation and potentially dynamic population of the 'state' dropdown based on the selected 'country'.
*/}
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Candidate } from '../home/types';
import { countries } from './countries-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type OfficeCheckbox = 'House' | 'Senate' | 'Head of State/Gov' | 'State House' | 'State Senate' | 'Other';

const officeCheckboxes: OfficeCheckbox[] = ['House', 'Senate', 'Head of State/Gov', 'State House', 'State Senate', 'Other'];

interface RunningForOfficeFormProps {
  onSubmit: (candidate: Omit<Candidate, 'id' | 'lat' | 'lng'>) => Promise<Candidate | null>;
}

export function RunningForOfficeForm({ onSubmit }: RunningForOfficeFormProps) {
  const [selectedCountry, setSelectedCountry] = React.useState('');
  const [selectedState, setSelectedState] = React.useState('');
  const [selectedOffices, setSelectedOffices] = React.useState<OfficeCheckbox[]>([]);
  const [showOnMap, setShowOnMap] = React.useState(true);
  const [submissionResult, setSubmissionResult] = React.useState<{ state: string; country: string } | null>(null);

  const handleOfficeChange = (office: OfficeCheckbox, checked: boolean) => {
    setSelectedOffices(prev => 
      checked ? [...prev, office] : prev.filter(o => o !== office)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const website = formData.get('website') as string;
    const phone = formData.get('phone') as string;

    if (name && selectedCountry && selectedState && selectedOffices.length > 0) {
      const candidateData: Omit<Candidate, 'id' | 'lat' | 'lng'> = {
        name,
        country: selectedCountry,
        state: selectedState,
        office: selectedOffices.includes('Senate') ? 'Senate' : 'House', // Simplified for DB
        office_type: selectedOffices.join(', '),
        website,
        phone,
        show_on_map: showOnMap ? 1 : 0,
        district: null, // Not collected in this form
        party: '', // Not collected
      };
      const result = await onSubmit(candidateData);
      if (result) {
        setSubmissionResult({ state: selectedState, country: selectedCountry });
      }
    } else {
      alert('Please fill out all required fields.');
    }
  };

  const getBallotAccessLink = () => {
    if (!submissionResult) return null;
    const { state, country } = submissionResult;
    if (country === 'USA') {
      return `https://ballotpedia.org/Ballot_access_for_major_and_minor_party_candidates_in_${state.replace(/ /g, '_')}`;
    }
    // Add other countries' logic here if needed
    return `https://en.wikipedia.org/wiki/Ballot_access#${country.replace(/ /g, '_')}`;
  };

  if (submissionResult) {
    const link = getBallotAccessLink();
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold mb-4">Thank you for your submission!</h3>
        <p className="mb-4">Here is a link to learn more about ballot access requirements for your area:</p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
          {link}
        </a>
        <Button onClick={() => setSubmissionResult(null)} className="mt-6">Submit another</Button>
      </div>
    );
  }

  const states = selectedCountry ? countries[selectedCountry] || [] : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <h3 className="text-lg font-semibold golden-text">Running for Office?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Let us know who you are and what you're running for.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 flex-grow">
        <div>
          <Label htmlFor="name">Name?</Label>
          <Input id="name" name="name" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Country?</Label>
            <Select onValueChange={setSelectedCountry} value={selectedCountry}>
              <SelectTrigger id="country"><SelectValue placeholder="Select Country" /></SelectTrigger>
              <SelectContent>
                {Object.keys(countries).sort().map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="state">State/Province?</Label>
            <Select onValueChange={setSelectedState} value={selectedState} disabled={!selectedCountry}>
              <SelectTrigger id="state"><SelectValue placeholder="Select State/Province" /></SelectTrigger>
              <SelectContent>
                {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Office?</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {officeCheckboxes.map(office => (
              <div key={office} className="flex items-center space-x-2">
                <Checkbox 
                  id={`office-${office}`} 
                  onCheckedChange={(checked) => handleOfficeChange(office, !!checked)}
                />
                <Label htmlFor={`office-${office}`}>{office}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="website">Website? (Optional)</Label>
          <Input id="website" name="website" />
        </div>

        <div>
          <Label htmlFor="phone">Phone? (Optional)</Label>
          <Input id="phone" name="phone" />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-on-map" 
            checked={showOnMap} 
            onCheckedChange={(checked) => setShowOnMap(!!checked)}
          />
          <Label htmlFor="show-on-map">Show me on the map</Label>
        </div>

        <Button type="submit" className="w-full golden-button">Submit</Button>
      </form>
    </div>
  );
}
{/*
  Connections Summary:
  - line 26: import { Button } from '@/components/ui/button'; -> Connects to `client/src/components/ui/button.tsx`.
  - line 27: import { Input } from '@/components/ui/input'; -> Connects to `client/src/components/ui/input.tsx`.
  - line 28: import { Label } from '@/components/ui/label'; -> Connects to `client/src/components/ui/label.tsx`.
  - line 29: import { Checkbox } from '@/components/ui/checkbox'; -> Connects to `client/src/components/ui/checkbox.tsx`.
  - line 30: import { Candidate } from '../home/types'; -> Connects to `client/src/pages/home/types.ts`.
  - line 31: import { countries } from './countries-data'; -> Connects to `client/src/pages/pantry-feature/countries-data.ts`.
  - line 32: import { Select, ... } from '@/components/ui/select'; -> Connects to `client/src/components/ui/select.tsx`.
  - line 61: The `onSubmit` call connects through props to `addCandidate` in `App.tsx`, which sends a POST to `/api/candidates`.
*/}
