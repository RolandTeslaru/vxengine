import { useAnimationEngineAPI } from '@vxengine/AnimationEngine';
import { Input } from '@vxengine/components/shadcn/input';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import { useTimelineEditorContext } from '@vxengine/managers/TimelineManager/TimelineEditor/context';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import React, { useCallback, useMemo } from 'react'
import JsonView from 'react18-json-view'

const KeyframeData = ({ trackKey, keyframeKey }: { trackKey: string, keyframeKey: string }) => {

    const { keyframesMap, trackSegmentsMap } = useTimelineEditorContext();

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
                    setKeyframeTime(keyframeKey, trackKey, newValue, keyframesMap, trackSegmentsMap, true);
                }
            };

            return (
                <div className="flex flex-row">
                    <Input
                        type="number"
                        step={0.1}
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
    }, [trackKey, keyframeKey, keyframesMap]);

    const keyframe = useTimelineManagerAPI(state => state.tracks[trackKey]?.keyframes[keyframeKey]);

    return (
        <div className='w-72 flex flex-col gap-1'>
            <p className='font-roboto-mono text-xs text-center text-label-secondary'>Editor Keyframe Data</p>
            <div className='max-h-[400px] overflow-y-scroll flex flex-col w-full text-xs bg-neutral-900 p-1 rounded-lg shadow-lg'>
                <JsonView  customizeNode={customizeNode}  src={keyframe} collapsed={({ depth }) => depth > 1} />
            </div>
            {/* <p className='font-roboto-mono text-xs text-center text-label-secondary'>Raw Keyframe</p>
            <div className='max-h-[400px] overflow-y-scroll flex flex-col w-full text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={rawKeyframe} collapsed={({ depth }) => depth > 1} />
            </div>
            <p className='font-roboto-mono text-xs text-center text-label-secondary'>
                Keyframe Element Dataset
            </p>
            <div className='max-h-[400px] overflow-y-scroll flex flex-col w-full text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={extractDatasetFromObject(keyframeElement)}collapsed={({ depth }) => depth > 1} />
            </div> */}
        </div>
    )
}

export default KeyframeData


function extractDatasetFromObject(element) {
    if (!element || !element.dataset) return null;
    return { ...element.dataset }; // Spread the dataset into a plain object
}