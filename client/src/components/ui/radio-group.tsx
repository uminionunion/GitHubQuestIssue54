{/*
  File: /client/src/components/ui/radio-group.tsx
  Folder: /client/src/components/ui

  Purpose:
  This file defines components for a `RadioGroup`, which allows a user to select one option from a set.
  It is built on top of the Radix UI Radio Group primitive for accessibility and state management.
  It exports `RadioGroup` and `RadioGroupItem` components, styled with Tailwind CSS. The `Circle` icon from `lucide-react` is used for the selected state indicator.

  Connections:
  - `@radix-ui/react-radio-group`: Provides the core functionality for the radio group.
  - `lucide-react`: Provides the `Circle` icon.
  - `@/lib/utils`: Imports the `cn` utility function for merging Tailwind CSS classes.
  - This component is used in forms where a single choice from multiple options is required.

  PHP/HTML/CSS/JS/SQL Equivalent:
  - HTML: A series of `<input type="radio">` elements, each with a corresponding `<label>`. All radio inputs for a single group must share the same `name` attribute.
  - CSS: Styles for the radio buttons and labels, including their appearance for checked and unchecked states.
  - JS: JavaScript to handle the `change` event on the radio group to get the selected value.
*/}
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
{/*
  Connections Summary:
  - line 26: import { cn } from "@/lib/utils"; -> Connects to `client/src/lib/utils.ts`.
*/}
