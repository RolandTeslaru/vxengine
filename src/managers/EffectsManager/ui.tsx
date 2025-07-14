import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from '@vxengine/ui/foundations/menubar'
import React from 'react'

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