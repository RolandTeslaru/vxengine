import * as React from "react"
import { FC, ReactNode, ComponentProps } from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@vxengine/utils"
import { useUIManagerAPI } from "@vxengine/managers/UIManager/store"
import { cva } from "class-variance-authority"
import { useWindowContext } from "@vxengine/utils/useWindowContext"

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
        {children}
        {/* {disableStyling ?
          <>{children}</>
          :
          <PopoverItem icon={icon}>
            {children}
          </PopoverItem>
        } */}
      </PopoverPrimitive.Trigger>
    )
  }

const PopoverContent: FC<ComponentProps<typeof PopoverPrimitive.Content>> =
  ({ ref, className, align = "center", side = "bottom", sideOffset = 1, ...props }) => {
    const { externalContainer } = useWindowContext();
    const theme = useUIManagerAPI(state => state.theme)
    return (
      <PopoverPrimitive.Portal container={externalContainer}>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          side={side}
          sideOffset={sideOffset}
          className={cn(
            `${theme} backdrop-blur-xs z-50 w-72 rounded-xl border-[1px] border-border-popover bg-popover
           p-2 text-popover-foreground shadow-xl shadow-black/40 outline-hidden 
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

const popoverItemVaritans = cva(
  'cursor-pointer font-roboto-mono relative gap-2 px-2 py-[6px] rounded-lg flex text-xs border border-transparent ',
  {
    variants: {
      variant: {
        default: "hover:bg-blue-600 hover:border-blue-500 text-label-primary",
        destructive: "hover:bg-red-700 hover:text-white hover:border-red-600"
      }
    }
  }
)

const PopoverItem: React.FC<PopoverItemProps & { 
  variant?: "default" | "destructive" 
}> = (props) => {
  const { children, className, icon, variant = "default", ...rest } = props
  return (
    <div
      className={
        popoverItemVaritans({variant}) + " " + className
      }
      {...rest}
    >
      <div className="absolute top-1/2 -translate-y-1/2 ">
        {icon}
      </div>
      <div className={`${icon && "pl-7"} text-sm`}>
          {children}
      </div>
    </div>
  )
}

export { Popover, PopoverTrigger, PopoverItem, PopoverContent, PopoverAnchor }
