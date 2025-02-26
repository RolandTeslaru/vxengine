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

interface Props {
    trackKey: string,
    keyframeKey: string
}

const KeyframeContextMenu: React.FC<Props> = React.memo(({ trackKey, keyframeKey }) => {
    const selectedKeyframesLength = useTimelineEditorAPI(state => state.selectedKeyframesFlatMap?.length)

    return (
        <ContextMenuContent>
            <ContextMenuSub>
                <ContextMenuSubTrigger icon={<Info size={15} />}>
                    <p>Show Data</p>
                </ContextMenuSubTrigger>
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


const KeyframeData = ({ keyframeKey, trackKey }: Props) => {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
    const currentTimeline = useAnimationEngineAPI(state => state.currentTimeline);

    const rawKeyframe = useMemo(() => {
        const rawObj = currentTimeline.objects.find(rawObj => rawObj.vxkey === vxkey);
        const rawTrack = rawObj?.tracks.find(rawTrack => rawTrack.propertyPath === propertyPath);
        const rawKeyframe = rawTrack?.keyframes.find(rawKeyframe => rawKeyframe.keyframeKey === keyframeKey)
        return rawKeyframe
    }, [])

    const keyframeElement = keyframesRef.get(keyframeKey)

    const customizeNode = useCallback(({ node, indexOrName, depth }) => {
        const key = indexOrName
        const value = node;
        // Check if the key is "time" or "value"
        if (key === "time" || key === "value") {
            const handleChange = (e) => {
                const newValue = parseFloat(e.target.value);
                if (key === "value") {
                    const setKeyframeValue = useTimelineManagerAPI.getState().setKeyframeValue;
                    setKeyframeValue(keyframeKey, trackKey, newValue, true);
                } else if (key === "time") {
                    const setKeyframeTime = useTimelineManagerAPI.getState().setKeyframeTime;
                    setKeyframeTime(keyframeKey, trackKey, newValue, true);
                }
            };

            return (
                <div className="flex flex-row">
                    <Input
                        type="number"
                        value={value}
                        onChange={handleChange}
                        className="h-fit ml-2 text-neutral-400 text-[10px] bg-neutral-800 border border-neutral-700 p-0.5 max-w-[60px]"
                        style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)" }}
                    />
                </div>
            );
        }

        // Default rendering for other keys
        return undefined;
    }, [trackKey, keyframeKey]);

    const keyframe = useTimelineManagerAPI(state => state.tracks[trackKey]?.keyframes[keyframeKey]);

    return (
        <div className='flex flex-col max-w-[300px] gap-2 px-1'>
            <p className='font-roboto-mono text-xs text-center'>Editor Keyframe Data</p>
            <div className='max-h-[400px] overflow-y-scroll flex flex-col w-full text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={keyframe} customizeNode={customizeNode} collapsed={({ depth }) => depth > 1} />
            </div>
            <p className='font-roboto-mono text-xs text-center'>Raw Keyframe</p>
            <div className='max-h-[400px] overflow-y-scroll flex flex-col w-full text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={rawKeyframe} collapsed={({ depth }) => depth > 1} />
            </div>
            <p className='font-roboto-mono text-xs text-center'>
                Keyframe Element Dataset
            </p>
            <div className='max-h-[400px] overflow-y-scroll flex flex-col w-full text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={extractDatasetFromObject(keyframeElement)} collapsed={({ depth }) => depth > 1} />
            </div>
        </div>
    )
}


function extractDatasetFromObject(element) {
    if (!element || !element.dataset) return null;
    return { ...element.dataset }; // Spread the dataset into a plain object
}