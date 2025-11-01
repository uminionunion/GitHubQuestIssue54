{/*
  File: /client/src/components/ui/button.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines a highly reusable and customizable `Button` component.
  It uses `class-variance-authority` (cva) to create different variants (e.g., `default`, `destructive`, `outline`) and sizes (e.g., `sm`, `lg`).
  This allows for consistent button styling across the application while being flexible.
  The `asChild` prop allows the button to wrap another component and pass the styles to it.

  Connections:
  - `@radix-ui/react-slot`: Used for the `asChild` prop functionality.
  - `class-variance-authority`: The core library for defining the button's variants and sizes.
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This is a fundamental UI component used throughout the entire application.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: `<button class="button button-primary button-large">Click Me</button>`.
  - CSS: A stylesheet with classes like `.button`, `.button-primary`, `.button-large` to define the base styles and variations.
  - JS: JavaScript would be used to attach `click` event listeners to the buttons to trigger actions.
*/}
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
{/*
  Connections Summary:
  - line 29: import { cn } from '@/lib/utils'; -> Connects to `client/src/lib/utils.ts`.
*/}
