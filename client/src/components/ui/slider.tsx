{/*
  File: /client/src/components/ui/slider.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines a reusable `Slider` component, allowing users to select a value from a range.
  It is built on top of the Radix UI Slider primitive, which handles the complex logic and accessibility for a slider control.
  The component is styled with Tailwind CSS to match the application's theme.

  Connections:
  - `@radix-ui/react-slider`: Provides the core functionality and accessibility for the slider.
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This component can be used in forms or settings where a ranged numerical input is required.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: `<input type="range" min="0" max="100" value="50" class="slider">`.
  - CSS: A stylesheet would be needed to style the track and thumb of the slider across different browsers.
  - JS: JavaScript would handle the `input` or `change` event to get the slider's current value.
*/}
import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
{/*
  Connections Summary:
  - line 22: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
