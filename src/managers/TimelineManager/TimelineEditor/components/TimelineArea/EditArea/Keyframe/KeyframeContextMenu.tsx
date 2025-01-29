import { ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@vxengine/components/shadcn/contextMenu'
import PopoverShowKeyframeData from '@vxengine/components/ui/Popovers/PopoverShowKeyframeData'
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager'
import ArrowRight from '@geist-ui/icons/arrowRight'
import ArrowLeft from "@geist-ui/icons/arrowLeft"
import Maximize2 from '@geist-ui/icons/maximize2'

import React from 'react'
import { selectAllKeyframesAfter, selectAllKeyframesBefore, selectAllKeyframesOnTrack } from './utils'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store'

interface Props {
    trackKey: string,
    keyframeKey: string
}

const KeyframeContextMenu: React.FC<Props> = React.memo(({ trackKey, keyframeKey }) => {
    const selectedKeyframesLength = useTimelineEditorAPI(state => state.selectedKeyframesFlatMap?.length)

    return (
        <ContextMenuContent>
            <PopoverShowKeyframeData side="right" trackKey={trackKey} keyframeKey={keyframeKey}>
                <p className='text-xs'>Show Data</p>
            </PopoverShowKeyframeData>

            <ContextMenuSub>
                <ContextMenuSubTrigger>
                    <p className='text-xs font-sans-menlo text-center w-full'>
                        Select...
                    </p>
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <ContextMenuItem className='gap-2' onClick={() => selectAllKeyframesAfter(trackKey, keyframeKey)}>
                        <ArrowRight size={15} />
                        <p className='text-xs'>After</p>
                    </ContextMenuItem>
                    <ContextMenuItem className='gap-2' onClick={() => selectAllKeyframesOnTrack(trackKey)}>
                        <Maximize2 size={15} className='rotate-45'/>
                        <p className='text-xs'>All on Track</p>
                    </ContextMenuItem>
                    <ContextMenuItem className='gap-2' onClick={() => selectAllKeyframesBefore(trackKey, keyframeKey)}>
                        <ArrowLeft size={15} />
                        <p className='text-xs'>Before</p>
                    </ContextMenuItem>
                </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuItem
                onClick={handleRemoveSelectedKeyframes}
            >
                <p className='font-sans-menlo text-xs text-red-600'>
                    {selectedKeyframesLength < 2
                        ? <>Delete Keyframe</>
                        : <>Delete Keyframes</>
                    }
                </p>
            </ContextMenuItem>
        </ContextMenuContent>
    )
})

const handleRemoveSelectedKeyframes = () => {
    const selectedKeyframesFlatMap = useTimelineEditorAPI.getState().selectedKeyframesFlatMap
    const removeKeyframe = useTimelineManagerAPI.getState().removeKeyframe
    
    selectedKeyframesFlatMap.forEach(kf => {
        removeKeyframe({
            keyframeKey: kf.keyframeKey,
            trackKey: kf.trackKey,
            reRender: true
        })
    })
}

export default KeyframeContextMenu

