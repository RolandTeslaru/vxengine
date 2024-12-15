import React from 'react'
import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from '@vxengine/components/shadcn/menubar'

export const EffectsManagerSubMenu = () => {
  return (
    <MenubarSub>
      <MenubarSubTrigger>Effects Manager API</MenubarSubTrigger>
      <MenubarSubContent>
        <MenubarItem>set Sellected Effect</MenubarItem>
      </MenubarSubContent>
    </MenubarSub>
  )
}