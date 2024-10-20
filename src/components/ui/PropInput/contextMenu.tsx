import { ContextMenuContent } from '@vxengine/components/shadcn/contextMenu'
import React from 'react'
import { ALERT_MakePropertyStatic, ALERT_ResetProperty } from '../PopupAlerts'

interface Props {
    vxkey: string,
    propertyPath: string
}

const PropInputContextMenu:React.FC<Props> = ({vxkey, propertyPath}) => {
    return (
        <ContextMenuContent className='flex flex-col'>
            <ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />
            <ALERT_ResetProperty vxkey={vxkey} propertyPath={propertyPath} />
        </ContextMenuContent>
    )
}

export default PropInputContextMenu