{/*
  File: /client/src/components/ui/popover.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines a set of components for creating a `Popover`, which is a floating content container that appears when a trigger element is clicked.
  It is built on top of the Radix UI Popover primitive, which manages state, positioning, and accessibility.
  The components (`Popover`, `PopoverTrigger`, `PopoverContent`) are styled with Tailwind CSS.

  Connections:
  - `@radix-ui/react-popover`: Provides the core popover functionality.
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This component is used when you need to display additional information or controls without navigating away from the current view.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: A button to trigger the popover and a hidden `div` for the content.
  - CSS: Styles to position the content `div` absolutely, control its visibility (`display: none`/`block`), and style its appearance.
  - JS: A click event listener on the button to toggle the visibility of the content `div` and handle closing it when clicking outside.
*/}
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
{/*
  Connections Summary:
  - line 24: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
