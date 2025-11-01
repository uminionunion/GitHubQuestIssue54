{/*
  File: /client/src/components/ui/toggle.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines a reusable `Toggle` component, which is a button that can be toggled on or off. It's similar to a checkbox but looks like a button.
  It is built on top of the Radix UI Toggle primitive for accessibility and state management.
  It uses `class-variance-authority` (cva) to define different visual variants and sizes.

  Connections:
  - `@radix-ui/react-toggle`: Provides the core toggle button functionality.
  - `class-variance-authority`: Used to define the component's variants and sizes.
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This component is useful for toolbars or settings where a simple on/off state is needed for an option.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: A `<button>` element.
  - CSS: Styles to change the button's appearance (e.g., background color) when it's in the "on" or "pressed" state.
  - JS: A click event listener to toggle a state variable and update the button's visual style accordingly.
*/}
import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-2 min-w-9',
        sm: 'h-8 px-1.5 min-w-8',
        lg: 'h-10 px-2.5 min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
{/*
  Connections Summary:
  - line 24: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
