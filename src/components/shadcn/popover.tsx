import * as React from "react"
import { FC, ReactNode, ComponentProps } from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@vxengine/utils"
import { useWindowContext } from "@vxengine/core/components/VXEngineWindow"

const Popover = PopoverPrimitive.Root

// const PopoverTrigger = PopoverPrimitive.Trigger 

const PopoverAnchor = PopoverPrimitive.Anchor

type PopoverTriggerProps = ComponentProps<typeof PopoverPrimitive.Trigger> & {
  disableStyling?: boolean
  icon?: ReactNode
}

const PopoverTrigger: FC<PopoverTriggerProps> =
  ({ ref, children, className, icon, disableStyling, ...rest }) => {
    return (
      <PopoverPrimitive.Trigger
        className={`w-full ${className}`}
        ref={ref}
        {...rest}
      >
        {disableStyling ?
          <>{children}</>
          :
          <PopoverItem icon={icon}>
            {children}
          </PopoverItem>
        }
      </PopoverPrimitive.Trigger>
    )
  }

const PopoverContent: FC<ComponentProps<typeof PopoverPrimitive.Content>> =
  ({ ref, className, align = "center", side = "bottom", sideOffset = 1, ...props }) => {
    const { externalContainer } = useWindowContext();
    return (
      <PopoverPrimitive.Portal container={externalContainer}>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          side={side}
          sideOffset={sideOffset}
          className={cn(
            `backdrop-blur-xs z-50 w-72 rounded-xl border-[1px] border-neutral-600 bg-neutral-700/80
           p-2 text-popover-foreground shadow-lg shadow-neutral-950 outline-hidden 
         data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
         data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 
         data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`,
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Portal>)
  }
PopoverContent.displayName = PopoverPrimitive.Content.displayName

interface PopoverItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode; // Ensure children are ReactNode
  icon?: React.ReactNode
}

const PopoverItem: React.FC<PopoverItemProps> = (props) => {
  const { children, className, icon, ...rest } = props
  return (
    <div
      className={`${className} cursor-pointer font-sans-menlo relative w-full gap-2 hover:bg-blue-600 border border-transparent
       hover:border-blue-500 px-2 py-[6px] rounded-md flex flex-row text-xs`}
      {...rest}
    >
      <div className="absolute top-1/2 -translate-y-1/2 ">
        {icon}
      </div>
      <div className={`${icon && "pl-5"} `}>
        {children}
      </div>
    </div>
  )
}

export { Popover, PopoverTrigger, PopoverItem, PopoverContent, PopoverAnchor }
