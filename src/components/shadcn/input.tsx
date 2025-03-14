import * as React from "react"

import { cn } from "@vxengine/utils"


export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, style, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex text-label-secondary h-fit w-fit px-2 py-1 relative rounded-md border border-primary-thin bg-secondary-opaque text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)", ...style}}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }