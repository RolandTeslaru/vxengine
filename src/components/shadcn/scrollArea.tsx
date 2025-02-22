import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { ComponentProps } from "react"
import { cn } from "@vxengine/utils"
import classNames from "classnames"


interface ScrollAreaProps{
  scrollbarPosition?: "left" | "right"
  scrollbarClassName?: string
  scrollBarThumbClassName?: string
}

const ScrollArea = ({
  className,
  scrollbarPosition = "right" as "right" | "left",
  scrollbarClassName,
  scrollBarThumbClassName,
  children,
  onScroll,
  ref,
  ...props
}: ComponentProps<typeof ScrollAreaPrimitive.Root> & ScrollAreaProps) => (
  <ScrollAreaPrimitive.Root
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport onScroll={onScroll} ref={ref} className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar position={scrollbarPosition} className={scrollbarClassName} />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
)
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName


function ScrollBar({
  className,
  orientation = "vertical",
  position = "right",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & {position: "right" | "left"}) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" &&
        `h-full w-2 border-l border-l-transparent p-[1px] ${position === "left" ? "left-0 " : "right-0"
        }`,
        orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className={classNames("relative flex-1 rounded-full bg-neutral-500")} />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>

  )
}
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
