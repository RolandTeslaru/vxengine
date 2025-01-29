import React from 'react'
import { ContextMenu, ContextMenuItem } from '@vxengine/components/shadcn/contextMenu'
import { useObjectManagerAPI } from '@vxengine/managers/ObjectManager'

interface Props {
    vxkey: string
}

const TopLevelContextMenu: React.FC<Props> = ({ vxkey }) => {
    const selectObjects = useObjectManagerAPI(state => state.selectObjects)
    return (
        <ContextMenu>
            <ContextMenuItem
                onClick={() => selectObjects([vxkey])}
            >
                <p>
                    Select
                </p>
            </ContextMenuItem>
        </ContextMenu>
    )
}

export default TopLevelContextMenu;