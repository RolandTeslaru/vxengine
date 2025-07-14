import { ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@vxengine/ui/foundations'
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager'

import React, { useCallback, useMemo } from 'react'
import { handleCopyKeyframes, selectAllKeyframesAfter, selectAllKeyframesBefore, selectAllKeyframesOnTrack } from './utils'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store'
import { ArrowLeft, ArrowRight, Info, Maximize2, X } from '@vxengine/ui/icons'
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing'

interface Props {
    trackKey: string,
    keyframeKey: string
}

const KeyframeContextMenu: React.FC<Props> = React.memo(({ trackKey, keyframeKey }) => {
    const selectedKeyframesLength = useTimelineEditorAPI(state => state.selectedKeyframesFlatMap?.length)

    return (
        <ContextMenuContent>
            {/* <ContextMenuSub>
                <ContextMenuSubTrigger>Show Data</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <KeyframeData trackKey={trackKey} keyframeKey={keyframeKey} />
                </ContextMenuSubContent>
            </ContextMenuSub> */}

            <ContextMenuSub>
                <ContextMenuSubTrigger>
                    Select...
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <ContextMenuItem icon={<ArrowRight size={15} />} onClick={() => selectAllKeyframesAfter(trackKey, keyframeKey)}>
                        <p className='text-xs'>After</p>
                    </ContextMenuItem>
                    <ContextMenuItem icon={<Maximize2 size={15} className='rotate-45' />} className='gap-2' onClick={() => selectAllKeyframesOnTrack(trackKey)}>
                        <p className='text-xs'>All on Track</p>
                    </ContextMenuItem>
                    <ContextMenuItem icon={<ArrowLeft size={15} />} className='gap-2' onClick={() => selectAllKeyframesBefore(trackKey, keyframeKey)}>
                        <p className='text-xs'>Before</p>
                    </ContextMenuItem>
                </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuItem onClick={handleCopyKeyframes}>
                {selectedKeyframesLength < 2
                    ? <>Copy Keyframe</>
                    : <>Copy Keyframes</>
                }
            </ContextMenuItem>

            <ContextMenuItem
                onClick={handleRemoveSelectedKeyframes}
                variant='destructive'
            >
                {selectedKeyframesLength < 2
                    ? <>Delete Keyframe</>
                    : <>Delete Keyframes</>
                }
            </ContextMenuItem>
        </ContextMenuContent>
    )
})

const handleRemoveSelectedKeyframes = () => {
    const selectedKeyframesFlatMap = useTimelineEditorAPI.getState().selectedKeyframesFlatMap
    const removeKeyframe = useTimelineManagerAPI.getState().removeKeyframe

    selectedKeyframesFlatMap.forEach(kf => {
        const {vxkey, propertyPath} = extractDataFromTrackKey(kf.trackKey)
        removeKeyframe({
            keyframeKey: kf.keyframeKey,
            vxkey,
            propertyPath,
            reRender: true
        })
    })
}

export default KeyframeContextMenu
