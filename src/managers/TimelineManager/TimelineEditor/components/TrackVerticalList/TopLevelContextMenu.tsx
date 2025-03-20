import React from 'react'
import { ContextMenu, ContextMenuItem } from '@vxengine/components/shadcn/contextMenu'
import { useObjectManagerAPI } from '@vxengine/managers/ObjectManager'

interface Props {
    vxkey: string
}

const TopLevelContextMenu: React.FC<Props> = ({ vxkey }) => {
    return (
        <ContextMenu>
            <ContextMenuItem
                onClick={() => useObjectManagerAPI.getState().selectObject(vxkey)}
            >
                <p>
                    Select
                </p>
            </ContextMenuItem>
        </ContextMenu>
    )
}

export default TopLevelContextMenu;