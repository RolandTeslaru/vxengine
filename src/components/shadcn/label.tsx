import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@vxengine/utils/shadcn"


const labelVariants = cva(
  "text-xs font-sans-menlo text-neutral-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "",
        secondary: " !font-sans-menlo !text-neutral-400 "
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Label = ({ className, variant, ...props }): React.ComponentProps<typeof LabelPrimitive.Root> => (
  <LabelPrimitive.Root
    className={cn(labelVariants({ variant }), className)}
    {...props}
  />
)
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
