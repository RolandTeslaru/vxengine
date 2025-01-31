import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@vxengine/utils"


export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      `peer inline-flex h-[19px] w-[34px] shrink-0 cursor-pointer items-center rounded-full  transition-colors border border-neutral-700
       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background 
       disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500 data-[state=unchecked]:bg-neutral-800`,
      className
    )}
    {...props}
    ref={ref}
    style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)"}}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        `pointer-events-none block h-[15px] w-[15px] rounded-full bg-neutral-400 shadow-lg ring-0 transition-transform 
         data-[state=checked]:translate-x-[16px] data-[state=checked]:bg-neutral-200 data-[state=unchecked]:translate-x-[1px]`
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName