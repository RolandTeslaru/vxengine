import { ContextMenuContent, ContextMenuItem } from '@vxengine/components/shadcn/contextMenu'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager'
import React from 'react'

interface Props {
    trackKey: string,
    keyframeKey: string
}

const KeyframeContextMenu:React.FC<Props> = ({trackKey, keyframeKey}) => {
    const removeKeyframe = useTimelineEditorAPI(state => state.removeKeyframe)
    
    return (
        <ContextMenuContent>
            <ContextMenuItem>
                <p className=''>
                    Show Handles
                </p>
            </ContextMenuItem>
            <ContextMenuItem
                onClick={() => {
                    removeKeyframe({
                        trackKey,
                        keyframeKey,
                        reRender: true
                    })
                }}
            >
                <p className=' text-red-600'>
                    Delete Keyframe
                </p>
            </ContextMenuItem>
        </ContextMenuContent>
    )
}

export default KeyframeContextMenu
