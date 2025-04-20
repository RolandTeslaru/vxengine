import React from 'react'
import { useTimelineEditorAPI } from './store'
import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from '@vxengine/components/shadcn/menubar'
import { pushDialogStatic } from '@vxengine/managers/UIManager/store'
import DIALOG_addTrackToTree from '../Dialogs/addTrackToTree'

const TimelineEditorSubMenu = () => {
  return (
    <MenubarSub>
        <MenubarSubTrigger>Timeline Editor API</MenubarSubTrigger>
        <MenubarSubContent>
            <MenubarItem onClick={() => pushDialogStatic({ content: <DIALOG_addTrackToTree />, type: "normal"})}>Add Track to Tree</MenubarItem>
        </MenubarSubContent>
    </MenubarSub>
  )
}

export default TimelineEditorSubMenu
