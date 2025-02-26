import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { FC, ReactNode, ComponentProps } from "react"

import { cn } from "@vxengine/utils"
import { buttonVariants } from "./button"
import { useWindowContext } from "@vxengine/core/components/VXEngineWindow"
import classNames from "classnames"
import { DialogType } from "@vxengine/managers/UIManager/store"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName



type AlertDialogContentProps = typeof AlertDialogPrimitive.Content & {
  darkenBackground?: boolean;
  blockTransparency?: boolean
  showTriangle?: boolean
  type: DialogType
}

function AlertDialogContent({ 
  className, style, children, darkenBackground = true, 
  blockTransparency = false, showTriangle = true, type, ...props 
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  darkenBackground?: boolean;
  blockTransparency?: boolean;
  showTriangle?: boolean;
  type: DialogType;
}): JSX.Element  {

  const { externalContainer } = useWindowContext();

  return (
    <AlertDialogPortal container={externalContainer}>
      {darkenBackground === true && <AlertDialogOverlay />}
      <AlertDialogPrimitive.Content
        className={cn(
          `fixed left-[50%]  top-[50%] z-50 w-auto duration-200
           data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 
           data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 
           data-[state=open]:slide-in-from-top-[48%]
           ${blockTransparency ? "bg-neutral-900" : " backdrop-blur-lg bg-neutral-900/80 "}
           flex border border-neutral-700/80 rounded-3xl overflow-hidden
           `,
        )}
        
        style={{
          ...style,
          boxShadow: "0px -10px 30px black",    
        }}
        {...props}
      >
            {showTriangle && ( type === "alert" || type === "danger" ) &&
            <div className={` h-full p-10`}>
                <svg className={`animate-ping absolute ${type === "alert" && "fill-yellow-400"} ${type === "danger" && "fill-red-600"}`} width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
                <svg className={`${type === "alert" && "fill-yellow-400"} ${type === "danger" && "fill-red-600"}`} width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </div>
            }
            <div className={ classNames(` py-5 pr-5`, className)}>
              {children}
            </div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
}
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left ",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = ({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Title>) => (
  <AlertDialogPrimitive.Title
    className={cn("text-lg  text-neutral-200 font-semibold font-roboto-mono", className)}
    {...props}
  />
)
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = ({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Description>) => (
  <AlertDialogPrimitive.Description
    className={cn("text-sm text-neutral-400 max-w-[500px] font-inter", className)}
    {...props}
  />
)
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName


type AlertDialogActionType = {
  type?: 'error' | 'warning' | 'default'; // Define the allowed types
}

// @ts-expect-error
const AlertDialogAction = ({ className, type = 'default', ...props }: ComponentProps<typeof AlertDialogPrimitive.Action> & {type?: 'error' | 'warning' | 'default'; }) => {
  return (
    <AlertDialogPrimitive.Action
      className={cn(
        buttonVariants({ variant: type }), // Map type to the correct variant
        className
      )}
      {...props}
    />
  );
}

AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;



const AlertDialogCancel = ({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Cancel> )=> (
  <AlertDialogPrimitive.Cancel
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0 font-roboto-mono",
      className
    )}
    {...props}
  />
)
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
