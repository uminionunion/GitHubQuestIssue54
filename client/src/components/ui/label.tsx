{/*
  File: /client/src/components/ui/label.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines a reusable `Label` component. It's used to label form elements like inputs, checkboxes, etc.
  It is built on top of the Radix UI Label primitive for enhanced accessibility, automatically associating the label with its corresponding input.
  It uses `class-variance-authority` to define different visual variants, although only one default variant is defined here.

  Connections:
  - `@radix-ui/react-label`: Provides the core accessible label functionality.
  - `class-variance-authority`: A library for creating flexible and reusable component variants with Tailwind CSS.
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This component is intended to be used in any form across the application.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: `<label for="inputId">Label Text</label>`. The `for` attribute is key for accessibility.
  - CSS: A stylesheet would define the font size, weight, and color for the label.
*/}
import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
{/*
  Connections Summary:
  - line 24: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
