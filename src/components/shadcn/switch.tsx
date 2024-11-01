"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@vxengine/utils"


const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      `peer inline-flex h-4 w-9 shrink-0 cursor-pointer items-center rounded-full  transition-colors
       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background 
       disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-800`,
      className
    )}
    {...props}
    ref={ref}
    style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)"}}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        `pointer-events-none block h-3 w-3 rounded-full bg-black shadow-lg ring-0 transition-transform 
         data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-1`
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }