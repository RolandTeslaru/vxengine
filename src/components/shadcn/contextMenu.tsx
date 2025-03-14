import * as React from "react"
import { FC, ComponentProps } from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { cn } from "@vxengine/utils"
import { useWindowContext } from "@vxengine/core/components/VXEngineWindow"
import { useUIManagerAPI } from "@vxengine/managers/UIManager/store"
import classNames from "classnames"


function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  )
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  )
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}


const ContextMenuSubTrigger = ({ className, inset, children, icon, ...props }: ComponentProps<typeof ContextMenuPrimitive.Trigger> & { inset?: boolean, icon?: React.ReactNode }) => {
  return (
  // @ts-expect-error
  <ContextMenuPrimitive.SubTrigger
    className={classNames(
      `text-xs font-roboto-mono antialiased font-semibold relative flex text-label-primary
      hover:bg-blue-600 border border-transparent hover:border-blue-500 gap-1
        rounded-lg cursor-default select-none items-center px-2 py-1.5 outline-hidden focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground`,
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {icon}
    {children}
    <svg className="ml-auto h-4 w-4" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
  </ContextMenuPrimitive.SubTrigger>
)}
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName




const ContextMenuSubContent = ({ className, children, ...props }: ComponentProps<typeof ContextMenuPrimitive.SubContent>) => {
  const { externalContainer } = useWindowContext();

  const theme = useUIManagerAPI(state => state.theme)

  return (
    <ContextMenuPrimitive.Portal container={externalContainer}>
      <ContextMenuPrimitive.SubContent
        className={classNames(
          `${theme} z-[60] min-w-[8rem] backdrop-blur-xs rounded-xl border border-neutral-600 bg-neutral-700/80 p-1 text-popover-foreground shadow-lg shadow-black/30
        data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
        data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 
        data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`,
          className
        )}
        {...props}
      >
        {children}
      </ContextMenuPrimitive.SubContent>
    </ContextMenuPrimitive.Portal>
  )
}
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  const { externalContainer } = useWindowContext();

  const theme = useUIManagerAPI(state => state.theme)

  return (
    <ContextMenuPrimitive.Portal container={externalContainer}>
      <ContextMenuPrimitive.Content
        className={classNames(
          `${theme} z-50 min-w-[8rem] overflow-y-auto overflow-visible backdrop-blur-xs rounded-xl border border-neutral-600 bg-neutral-700/80 p-1 text-popover-foreground shadow-lg shadow-black/60
         data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
         data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`,
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

type ContextMenuItemProps = typeof ContextMenuPrimitive.Item & {
  inset?: boolean;
  preventClose?: boolean;
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  preventClose = false,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
  preventClose?: boolean
}) {
  return (
    <ContextMenuPrimitive.Item
      className={cn(
        `relative flex 
           antialiased font-medium
          hover:bg-blue-600 hover:border-blue-500 hover:shadow-md hover:shadow-black/20 gap-2 font-roboto-mono text-xs
            border border-transparent 
           rounded-lg cursor-default select-none items-center px-2 py-1.5 outline-hidden 
           focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-5 ${preventClose && "pointer-events-none!"}`,
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const ContextMenuCheckboxItem = ({ className, children, checked, ...props }): ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> => (
  <ContextMenuPrimitive.CheckboxItem
    className={cn(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <svg className="h-4 w-4" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
)

const ContextMenuRadioItem = ({ className, children, ...props }): ComponentProps<typeof ContextMenuPrimitive.RadioItem> => (
  // @ts-expect-error
  <ContextMenuPrimitive.RadioItem
    className={cn(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <svg className="h-4 w-4 fill-current" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.875 7.5C9.875 8.81168 8.81168 9.875 7.5 9.875C6.18832 9.875 5.125 8.81168 5.125 7.5C5.125 6.18832 6.18832 5.125 7.5 5.125C8.81168 5.125 9.875 6.18832 9.875 7.5Z" fill="currentColor"></path></svg>
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
)
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName


type ContextMenuLabelProps = typeof ContextMenuPrimitive.Label & {
  inset?: boolean
}

const ContextMenuLabel = ({ className, inset, ...props }): ComponentProps<ContextMenuLabelProps> => (
  <ContextMenuPrimitive.Label
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  />
)
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = ({ className, ...props }): ComponentProps<typeof ContextMenuPrimitive.Separator> => (
  <ContextMenuPrimitive.Separator
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
)
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
