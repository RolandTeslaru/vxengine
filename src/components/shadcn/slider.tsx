import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { ComponentProps, FC } from "react"

import { cn } from "@vxengine/utils"

const Slider = ({ className,onDragStart, onDragEnd, ...props }: ComponentProps<typeof SliderPrimitive.Root>  )=> {

  const handlePointerDown = (event: any) => {
    onDragStart?.(event);
  }

  const handlePointerUp = (event: any) => {
    onDragEnd?.(event);
  }

  return (
  <SliderPrimitive.Root
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative bg-black/80 h-2.5 w-full grow overflow-hidden rounded-full">
      <SliderPrimitive.Range className="absolute h-full bg-neutral-700" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className="block h-2.5 w-2.5 rounded-full bg-white border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    />
  </SliderPrimitive.Root>
)}
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
