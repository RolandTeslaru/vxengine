import React from 'react'
import { ContextMenuContent } from '@vxengine/components/shadcn/contextMenu'
import { ALERT_MakePropertyStatic, ALERT_ResetProperty } from '@vxengine/components/ui/PopupAlerts'

interface Props {
    vxkey: string,
    propertyPath: string
}


const FinalPropertyContextMenu: React.FC<Props> = ({ vxkey, propertyPath }) => {
    return (
        <ContextMenuContent className='flex flex-col'>
            <ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />
            <ALERT_ResetProperty vxkey={vxkey} propertyPath={propertyPath}/>
        </ContextMenuContent>
    )
}

export default FinalPropertyContextMenu
