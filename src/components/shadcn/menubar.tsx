import * as React from "react"
import { FC, ReactNode, ComponentProps } from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { Circle } from "lucide-react"

import { cn } from "../../utils"

const MenubarMenu = MenubarPrimitive.Menu

const MenubarGroup = MenubarPrimitive.Group

const MenubarPortal = MenubarPrimitive.Portal

const MenubarSub = MenubarPrimitive.Sub

const MenubarRadioGroup = MenubarPrimitive.RadioGroup

const Menubar: FC<ComponentProps<typeof MenubarPrimitive.Root>> =
  ({ className, ...props }) => (
    <MenubarPrimitive.Root
      className={cn(
        "flex h-10 items-center space-x-1 rounded-md border border-none p-1 bg-none",
        className
      )}
      {...props}
    />
  )
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger: FC<ComponentProps<typeof MenubarPrimitive.Trigger>> =
  ({ className, ...props }) => (
    <MenubarPrimitive.Trigger
      className={cn(
        `flex cursor-default select-none items-center rounded-lg px-3 py-1 outline-hidden border-transparent border text-xs
         antialiased font-bold
        focus:bg-neutral-700/50 focus:text-neutral-50
        hover:bg-neutral-700/50
        hover:border-neutral-400/20
        data-[state=open]:bg-neutral-700/50
        data-[state=open]:text-neutral-50 
        data-[state=open]:border-neutral-400/20`,
        className
      )}
      {...props}
    />
  )
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

type MenubarSubTriggerProps = ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean }

const MenubarSubTrigger: FC<MenubarSubTriggerProps> = ({ className, inset, children, ...props }) => (
  <MenubarPrimitive.SubTrigger
    className={cn(
      `flex cursor-default select-none items-center rounded-lg p-2 py-1.5 text-xs font-medium outline-hidden border border-transparent
        focus:text-neutral-50
         hover:bg-blue-600 hover:border-blue-500
      data-[state=open]:bg-blue-600 data-[state=open]:text-neutral-50 data-[state=open]:border-blue-500`,
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
)
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent: FC<ComponentProps<typeof MenubarPrimitive.SubContent>> =
  ({ className, ...props }) => (
    <MenubarPrimitive.SubContent
      className={cn(
        `z-50 min-w-[12rem] backdrop-blur-xl  rounded-xl border p-1 shadow-md shadow-black/50
       data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
       data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 
       border-neutral-400/20 bg-neutral-900/80 text-neutral-50`,
        className
      )}
      {...props}
    />
  )
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent: FC<ComponentProps<typeof MenubarPrimitive.Content>> =
  ({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          `bg-neutral-900/80 border-neutral-400/20 shadow-md shadow-black/50
          z-50 min-w-[12rem] backdrop-blur-lg rounded-xl border p-1 
           data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
           data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 
            text-neutral-50
          `,
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
MenubarContent.displayName = MenubarPrimitive.Content.displayName

type MenubarItemProps = ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
}

const MenubarItem: FC<MenubarItemProps> =
  ({ className, inset, ...props }) => (
    <MenubarPrimitive.Item
      className={cn(
        `relative flex cursor-default select-none items-center rounded-lg px-2 py-1.5 text-xs outline-hidden border border-transparent
       data-disabled:pointer-events-none data-disabled:opacity-50 
       focus:bg-blue-600 focus:text-neutral-50 focus:border-blue-500
       `,
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem: FC<ComponentProps<typeof MenubarPrimitive.CheckboxItem>> =
  ({ className, children, checked, ...props }) => (
    <MenubarPrimitive.CheckboxItem
      className={cn(
        "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-neutral-100 focus:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem: FC<ComponentProps<typeof MenubarPrimitive.RadioItem>> =
  ({ className, children, ...props }) => (
    <MenubarPrimitive.RadioItem
      className={cn(
        "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-neutral-100 focus:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

type MenubarLabelProps = ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}

const MenubarLabel: FC<MenubarLabelProps> = ({ className, inset, ...props }) => (
  <MenubarPrimitive.Label
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
)
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator: FC<ComponentProps<typeof MenubarPrimitive.Separator>> =
  ({ className, ...props }) => (
    <MenubarPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-neutral-400/25", className)}
      {...props}
    />
  )
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-neutral-400",
        className
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
