{/*
  File: /client/src/components/ui/textarea.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines a reusable `Textarea` component for multi-line text input.
  It's a styled wrapper around the standard HTML `<textarea>` element, providing consistent styling with the rest of the application's UI components.
  It uses `React.forwardRef` to allow parent components to access the underlying textarea element.

  Connections:
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This component is designed to be used in forms where users need to enter larger blocks of text.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: `<textarea class="textarea-styles" name="comment"></textarea>`.
  - CSS: A stylesheet would define the styles for `.textarea-styles` (e.g., border, padding, background, focus states).
  - JS: JavaScript would be used to get or set the value of the textarea and handle input events.
*/}
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
{/*
  Connections Summary:
  - line 21: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
