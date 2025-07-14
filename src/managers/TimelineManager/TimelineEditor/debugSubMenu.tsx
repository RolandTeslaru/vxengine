import React from 'react'
import { pushDialogStatic } from '@vxengine/managers/UIManager/store'
import DIALOG_addTrackToTree from '../Dialogs/addTrackToTree'
import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from '@vxengine/ui/foundations/menubar'

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
