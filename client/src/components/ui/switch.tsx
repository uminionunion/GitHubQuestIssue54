{/*
  File: /client/src/components/ui/switch.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines a reusable `Switch` component, which is a toggle control that allows users to switch between two states (on/off).
  It is built on top of the Radix UI Switch primitive for accessibility and functionality, and styled with Tailwind CSS.
  The `cn` utility is used to merge CSS classes.

  Connections:
  - `@radix-ui/react-switch`: Provides the underlying functionality and accessibility for the switch component.
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This component is designed to be imported and used in forms or settings pages where a boolean (true/false) input is needed.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: `<label class="switch"><input type="checkbox"><span class="slider"></span></label>`.
  - CSS: A stylesheet would define styles for `.switch`, `.slider`, etc., to create the visual appearance of the toggle.
  - JS: JavaScript would be used to handle the `change` event on the checkbox to update state or perform actions.
*/}
import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
{/*
  Connections Summary:
  - line 22: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
