import React from 'react'
import { ContextMenuContent, ContextMenuItem } from '@vxengine/components/shadcn/contextMenu'
import { ALERT_MakePropertyStatic, ALERT_ResetProperty } from '@vxengine/components/ui/DialogAlerts/Alert'
import { MenubarItem } from '@vxengine/components/shadcn/menubar'
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store'

interface Props {
    vxkey: string,
    propertyPath: string
}


const FinalPropertyContextMenu: React.FC<Props> = ({ vxkey, propertyPath }) => {
    const pushDialog = useUIManagerAPI(state => state.pushDialog)
    return (
        <ContextMenuContent className='flex flex-col'>
            <ContextMenuItem 
                onClick={() => pushDialog(<ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />, "alert")}
            >
                <p className=' text-red-600'>
                    Make Property Static
                </p>
            </ContextMenuItem>
            <ContextMenuItem 
                onClick={() => pushDialog(<ALERT_ResetProperty vxkey={vxkey} propertyPath={propertyPath} />, "alert")}
            >
                <p className=' text-red-600'>
                    Remove Property
                </p>
            </ContextMenuItem>
        </ContextMenuContent>
    )
}

export default FinalPropertyContextMenu
