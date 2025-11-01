{/*
  File: /client/src/components/ui/checkbox.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines a reusable `Checkbox` component. It's a form control that allows users to select one or more options.
  It is built on top of the Radix UI Checkbox primitive, which ensures it is accessible and handles its state (checked, unchecked, indeterminate).
  The component is styled with Tailwind CSS, and the `Check` icon from `lucide-react` is used as the indicator.

  Connections:
  - `@radix-ui/react-checkbox`: Provides the core checkbox functionality and accessibility.
  - `lucide-react`: Provides the `Check` icon that appears when the checkbox is selected.
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This component is used in forms and filter controls throughout the application.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: `<input type="checkbox" id="my-checkbox" name="my-checkbox">`.
  - CSS: Styles to customize the appearance of the checkbox, as native checkboxes are hard to style consistently. Often involves hiding the default input and styling a pseudo-element or another element.
  - JS: JavaScript to check the `checked` property and handle `change` events.
*/}
import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
{/*
  Connections Summary:
  - line 24: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
