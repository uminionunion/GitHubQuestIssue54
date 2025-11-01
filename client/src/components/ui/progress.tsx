{/*
  File: /client/src/components/ui/progress.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines a reusable `Progress` bar component. It's used to visually represent the completion status of a task or a value in a range.
  It is built on top of the Radix UI Progress primitive for accessibility.
  The component is styled with Tailwind CSS.

  Connections:
  - `@radix-ui/react-progress`: Provides the core accessible progress bar functionality.
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This component can be used to show loading states, form completion, or any other progress-based metric.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: `<div class="progress-bar"><div class="progress-indicator" style="width: 50%;"></div></div>` or using the `<progress>` element: `<progress value="50" max="100"></progress>`.
  - CSS: Styles for the outer container and the inner indicator bar.
  - JS: JavaScript would be used to dynamically update the width or value of the progress indicator.
*/}
import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
{/*
  Connections Summary:
  - line 21: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
