import React from 'react'
import { ContextMenuContent, ContextMenuItem } from '@vxengine/components/shadcn/contextMenu'
import { ALERT_MakePropertyStatic, ALERT_ResetProperty } from '@vxengine/components/ui/DialogAlerts/Alert'
import { MenubarItem } from '@vxengine/components/shadcn/menubar'
import { pushDialogStatic } from '@vxengine/managers/UIManager/store'

interface Props {
    vxkey: string,
    propertyPath: string
}


const FinalPropertyContextMenu: React.FC<Props> = ({ vxkey, propertyPath }) => {
    return (
        <ContextMenuContent className='flex flex-col'>
            <ContextMenuItem 
                onClick={() => pushDialogStatic({content: <ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />, type: "alert"})}
                variant="destructive"
            >
                Make Property Static
            </ContextMenuItem>
            <ContextMenuItem 
                onClick={() => pushDialogStatic({content: <ALERT_ResetProperty vxkey={vxkey} propertyPath={propertyPath} />, type: "alert"})}
                variant="destructive"
            >
                Erase Property
            </ContextMenuItem>
        </ContextMenuContent>
    )
}

export default FinalPropertyContextMenu
