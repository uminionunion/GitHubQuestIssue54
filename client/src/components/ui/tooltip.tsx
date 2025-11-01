{/*
  File: /client/src/components/ui/tooltip.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines components for creating a `Tooltip`, a small pop-up that displays information when a user hovers over an element.
  It is built on top of the Radix UI Tooltip primitive, which handles the timing, positioning, and accessibility.
  The components (`Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`) are styled with Tailwind CSS.

  Connections:
  - `@radix-ui/react-tooltip`: Provides the core tooltip functionality.
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - The `TooltipProvider` should be wrapped around the part of the app that uses tooltips.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: An element with a `data-tooltip` attribute, and a hidden element for the tooltip content.
  - CSS: Styles to position the tooltip content, control its visibility on hover, and style its appearance.
  - JS: JavaScript to handle `mouseover` and `mouseout` events to show and hide the tooltip, often with a delay.
*/}
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
{/*
  Connections Summary:
  - line 21: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
