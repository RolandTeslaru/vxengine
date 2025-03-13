import { useAnimationEngineAPI } from '@vxengine/AnimationEngine';
import { Input } from '@vxengine/components/shadcn/input';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { keyframesRef } from '@vxengine/utils/useRefStore';
import React, { useCallback, useMemo } from 'react'
import JsonView from 'react18-json-view'

const KeyframeData = ({ trackKey, keyframeKey }: { trackKey: string, keyframeKey: string }) => {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
    const currentTimeline = useAnimationEngineAPI(state => state.currentTimeline);

    // const timelineManagerAPIStatic = useTimelineManagerAPI.getState()
    // const setKeyframeValue = timelineManagerAPIStatic.setKeyframeValue
    // const setKeyframeTime = timelineManagerAPIStatic.setKeyframeTime
    // const track = useTimelineManagerAPI(state => state.tracks[trackKey]); 

    const rawKeyframe = useMemo(() => {
        const rawObj = currentTimeline.objects.find(rawObj => rawObj.vxkey === vxkey);
        const rawTrack = rawObj?.tracks.find(rawTrack => rawTrack.propertyPath === propertyPath);
        const rawKeyframe = rawTrack?.keyframes.find(rawKeyframe => rawKeyframe.keyframeKey === keyframeKey)
        return rawKeyframe
    }, [])

    const keyframeElement = keyframesRef.get(keyframeKey)

    // const customizeNode = useCallback(({ node, indexOrName, depth }) => {
    //     const key = indexOrName
    //     const value = node;
    //     // Check if the key is "time" or "value"
    //     if (key === "time" || key === "value") {
    //         const handleChange = (e) => {
    //             const newValue = parseFloat(e.target.value);
    //             if (key === "value") {
    //                 const setKeyframeValue = useTimelineManagerAPI.getState().setKeyframeValue;
    //                 setKeyframeValue(keyframeKey, trackKey, newValue, true);
    //             } else if (key === "time") {
    //                 const setKeyframeTime = useTimelineManagerAPI.getState().setKeyframeTime;
    //                 setKeyframeTime(keyframeKey, trackKey, newValue, true);
    //             }
    //         };

    //         return (
    //             <div className="flex flex-row">
    //                 <Input
    //                     type="number"
    //                     value={value}
    //                     onChange={handleChange}
    //                     className="h-fit ml-2 text-neutral-400 text-[10px] bg-neutral-800 border border-neutral-700 p-0.5 max-w-[60px]"
    //                     style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)" }}
    //                 />
    //             </div>
    //         );
    //     }

    //     // Default rendering for other keys
    //     return undefined;
    // }, [trackKey, keyframeKey]);

    const keyframe = useTimelineManagerAPI(state => state.tracks[trackKey]?.keyframes[keyframeKey]);

    return (
        <div className='w-72 flex flex-col'>
            <p className='font-roboto-mono text-xs text-center'>Editor Keyframe Data</p>
            <div className='max-h-[400px] overflow-y-scroll flex flex-col w-full text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={keyframe} collapsed={({ depth }) => depth > 1} />
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

export default KeyframeData


function extractDatasetFromObject(element) {
    if (!element || !element.dataset) return null;
    return { ...element.dataset }; // Spread the dataset into a plain object
}