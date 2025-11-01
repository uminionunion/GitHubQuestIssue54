{/*
  File: /client/src/components/ui/input.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines a reusable `Input` component for single-line text entry.
  It's a styled wrapper around the standard HTML `<input>` element, ensuring a consistent look and feel with other form elements in the application.
  It uses `React.forwardRef` so that parent components can directly access the input DOM node.

  Connections:
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This is a fundamental form component used in various forms throughout the application (e.g., for names, addresses, etc.).

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: `<input type="text" class="input-styles" name="username">`.
  - CSS: A stylesheet would define the styles for `.input-styles` (e.g., height, border, padding, focus effects).
  - JS: JavaScript would be used to handle user input, validation, and to get the input's value.
*/}
import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
{/*
  Connections Summary:
  - line 20: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
