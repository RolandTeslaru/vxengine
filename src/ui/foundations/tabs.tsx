"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { ComponentProps, FC, useEffect, useRef, useState } from "react"

import { cn } from "@vxengine/utils"
import classNames from "classnames"


function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}


const TabsList = ({ className, children, ...props }: ComponentProps<typeof TabsPrimitive.List>) => {
  const indicatorRef = useRef<null | HTMLDivElement>(null);
  const listRef = useRef<null | HTMLDivElement>(null)

  const onTabsTriggerClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target = e.currentTarget as HTMLElement  
    console.log("New Target", target)
    if (indicatorRef.current) {
      indicatorRef.current.style.width = `${target.clientWidth}px`
      indicatorRef.current.style.height = `${target.clientHeight + 2}px`
      indicatorRef.current.style.left = `${target.offsetLeft + 2}px`
    }
  }

  const childrenWithCallback = React.Children.map(children, (child) => {
    if (React.isValidElement(child))
      return React.cloneElement(child, {
        // @ts-expect-error
        _tabsListOnClickCallback: onTabsTriggerClick
      })
  })

  useEffect(() => {
    const activeTab = listRef.current.querySelector('[data-state="active"]') as HTMLElement
    if (activeTab && indicatorRef.current) {
      indicatorRef.current.style.width = `${activeTab.clientWidth}px`
      indicatorRef.current.style.height = `${activeTab.clientHeight + 2}px`
      indicatorRef.current.style.left = `${activeTab.offsetLeft + 2}px`
    }
  }, [])

  return (
    <div className="relative">
      <TabsPrimitive.List
        ref={listRef}
        className={cn(
          "inline-flex h-auto items-center justify-center rounded-3xl bg-tertiary-opaque border border-secondary-opaque text-muted-foreground relative",
          className
        )}
        {...props}
      >
        {childrenWithCallback}
      </TabsPrimitive.List>
      {/* Animated indicator */}
      <div
        ref={indicatorRef}
        className="absolute top-[1px] z-[0] bg-primary-opaque border border-neutral-600 rounded-full transition-all duration-300 ease-out"
      />
    </div>
  )
}
TabsList.displayName = TabsPrimitive.List.displayName

function TabsTrigger({
  className,
  onClick,
  _tabsListOnClickCallback,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & { _tabsListOnClickCallback?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void }) {

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    _tabsListOnClickCallback(e)
    onClick(e);
  }

  return (
    <TabsPrimitive.Trigger
      className={cn(
        `inline-flex items-center z-10 justify-center whitespace-nowrap rounded-2xl px-3 py-[3px] text-xs font-roboto-mono !text-label-primary font-medium ring-offset-background transition-all 
        border border-transparent cursor-pointer
       focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
      `,
        className
      )}
      onClick={handleOnClick}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
}


export { Tabs, TabsList, TabsTrigger, TabsContent }




