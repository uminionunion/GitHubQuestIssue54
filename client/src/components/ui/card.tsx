{/*
  File: /client/src/components/ui/card.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines a set of reusable UI components for creating "card" elements, which are common containers for content.
  It uses the `cn` utility for conditional class names and `React.forwardRef` to allow parent components to get a reference to the underlying DOM element.
  It exports multiple components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`.

  Connections:
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This component is a general-purpose UI building block and can be imported and used by any other component in the application that needs to display content in a card format.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: This would be a set of `<div>` elements with specific classes. For example, `<div class="card"><div class="card-header">...</div></div>`.
  - CSS: A stylesheet would define the styles for `.card`, `.card-header`, etc., to control layout, borders, padding, and shadows.
  - JS: If the card had interactive elements, JavaScript would be used to handle events.
*/}
import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border bg-card text-card-foreground shadow',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
{/*
  Connections Summary:
  - line 21: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
