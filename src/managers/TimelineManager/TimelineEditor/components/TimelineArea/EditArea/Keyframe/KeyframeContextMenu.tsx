import { ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@vxengine/components/shadcn/contextMenu'
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager'

import React, { useCallback, useMemo } from 'react'
import { selectAllKeyframesAfter, selectAllKeyframesBefore, selectAllKeyframesOnTrack } from './utils'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store'
import { ArrowLeft, ArrowRight, Info, Maximize2 } from '@vxengine/components/ui/icons'
import JsonView from 'react18-json-view'
import { Input } from '@vxengine/components/shadcn/input'
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing'
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine'
import { keyframesRef } from '@vxengine/utils/useRefStore'
import KeyframeData from '@vxengine/components/ui/DataContextContext/Keyframe'

interface Props {
    trackKey: string,
    keyframeKey: string
}

const KeyframeContextMenu: React.FC<Props> = React.memo(({ trackKey, keyframeKey }) => {
    const selectedKeyframesLength = useTimelineEditorAPI(state => state.selectedKeyframesFlatMap?.length)

    return (
        <ContextMenuContent>
            <ContextMenuSub>
                <ContextMenuSubTrigger icon={<Info size={15} />}>Show Data</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <KeyframeData trackKey={trackKey} keyframeKey={keyframeKey}/>
                </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
                <ContextMenuSubTrigger>
                    <p className='text-xs font-roboto-mono w-full'>
                        Select...
                    </p>
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <ContextMenuItem className='gap-2' onClick={() => selectAllKeyframesAfter(trackKey, keyframeKey)}>
                        <ArrowRight size={15} />
                        <p className='text-xs'>After</p>
                    </ContextMenuItem>
                    <ContextMenuItem className='gap-2' onClick={() => selectAllKeyframesOnTrack(trackKey)}>
                        <Maximize2 size={15} className='rotate-45' />
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
                <p className=' text-xs font-roboto-mono font-medium text-red-500'>
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