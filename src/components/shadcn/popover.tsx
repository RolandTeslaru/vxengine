"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@vxengine/utils"
import { useWindowContext } from "@vxengine/core/components/VXEngineWindow"

const Popover = PopoverPrimitive.Root

// const PopoverTrigger = PopoverPrimitive.Trigger 

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>((props, ref) => {
  const { children, className, ...rest } = props
  return (
    <PopoverPrimitive.Trigger
      className={'hover:bg-neutral-800 px-2 gap-2 py-1.5 text-xs flex font-sans-menlo rounded-md w-full hover:shadow-md shadow-black' + " " + className }
      ref={ref}
      {...rest}
    >
      {children}
    </PopoverPrimitive.Trigger>
  )
})

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", side = "bottom", sideOffset = 1, ...props }, ref) => {
  const { externalContainer } = useWindowContext();
  return (
    <PopoverPrimitive.Portal container={externalContainer}>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          `backdrop-blur-sm z-50 w-72 rounded-xl border-[1px] border-neutral-600 bg-opacity-80 bg-neutral-700 
           p-2 text-popover-foreground shadow-lg shadow-neutral-950 outline-none 
         data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
         data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 
         data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`,
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>)
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
