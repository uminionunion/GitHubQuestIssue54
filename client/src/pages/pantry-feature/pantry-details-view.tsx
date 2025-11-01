{/*
  File: /client/src/pages/pantry-feature/pantry-details-view.tsx
  Folder: /client/src/pages/pantry-feature

  Purpose:
  This component displays the detailed information for a single pantry that has been selected from the map.
  It shows the pantry's name, address, hours, notes, and other properties. It also includes a "Vouched for?"
  section with thumbs up/down buttons, which reveals a comment box. (Note: The feedback submission is not fully implemented).

  Connections:
  - `@/components/ui/button`, `@/components/ui/textarea`, `@/components/ui/label`: Imports UI components to build the view.
  - `lucide-react`: Imports the `ThumbsUp` and `ThumbsDown` icons.
  - `../home/types`: Imports the `Pantry` type definition.
  - `client/src/pages/pantry-feature/pantry-controls.tsx`: This component is rendered by `PantryControls` when the `activeView` is 'details' and a pantry is selected.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - This would be equivalent to a `pantry-details.php?id=123` page or a section on the main page.
  - PHP/SQL: The script would take a pantry ID from the URL, query the database (`SELECT * FROM pantries WHERE id = ?`), and fetch the details for that specific pantry.
  - HTML: The fetched data would be rendered into a structured HTML layout with headings and paragraphs.
  - JS: JavaScript would handle the logic for showing the comment box when the voting buttons are clicked.
*/}
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pantry } from '../home/types';

interface PantryDetailsViewProps {
  pantry: Pantry;
}

export function PantryDetailsView({ pantry }: PantryDetailsViewProps) {
  const [showCommentBox, setShowCommentBox] = React.useState(false);

  const handleVote = () => {
    setShowCommentBox(true);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-1">{pantry.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{pantry.address}</p>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Hours of Operation</h4>
          <p className="text-sm">{pantry.hours}</p>
        </div>
        {pantry.notes && (
          <div>
            <h4 className="font-medium">Notes</h4>
            <p className="text-sm">{pantry.notes}</p>
          </div>
        )}
        <div>
            <h4 className="font-medium">Type</h4>
            <p className="text-sm capitalize">{pantry.type}</p>
        </div>
        <div>
            <h4 className="font-medium">Frequency</h4>
            <p className="text-sm capitalize">{pantry.repeating}</p>
        </div>
      </div>

      <div className="mt-6 border-t pt-4 flex-col items-start gap-4">
        <div className="flex items-center gap-4">
          <span className="font-medium text-sm">Vouched for?</span>
          <Button variant="ghost" size="icon" onClick={handleVote}>
            <ThumbsUp className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleVote}>
            <ThumbsDown className="h-5 w-5" />
          </Button>
        </div>
        {showCommentBox && (
          <div className="w-full space-y-2 mt-4">
            <Label htmlFor="comment">Leave a comment? (optional)</Label>
            <Textarea id="comment" placeholder="Share your experience..." maxLength={500} />
            <Button>Submit Feedback</Button>
          </div>
        )}
      </div>
    </div>
  );
}
{/*
  Connections Summary:
  - line 27: import { Button } from '@/components/ui/button'; -> Connects to `client/src/components/ui/button.tsx`.
  - line 29: import { Textarea } from '@/components/ui/textarea'; -> Connects to `client/src/components/ui/textarea.tsx`.
  - line 30: import { Label } from '@/components/ui/label'; -> Connects to `client/src/components/ui/label.tsx`.
  - line 31: import { Pantry } from '../home/types'; -> Connects to `client/src/pages/home/types.ts`.
*/}
