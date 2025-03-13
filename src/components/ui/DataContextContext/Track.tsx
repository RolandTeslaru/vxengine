import { Input } from '@vxengine/components/shadcn/input';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import React, { useCallback } from 'react'
import JsonView from 'react18-json-view'

export const TrackData = ({ trackKey }: { trackKey: string }) => {
    const track = useTimelineManagerAPI(state => state.tracks[trackKey]);

    const customizeNode = useCallback(({ node, indexOrName, depth }) => {
        const key = indexOrName;
        const value = node;

        // if(key === )
        if (key === "time" || key === "value") {
            debugger
            const handleChange = (e) => {
                const newValue = parseFloat(e.target.value);
                if (key === "value") {
                    const setKeyframeValue = useTimelineManagerAPI.getState().setKeyframeValue;
                    // setKeyframeValue(keyframeKey, trackKey, newValue, true);
                } else if (key === "time") {
                    const setKeyframeTime = useTimelineManagerAPI.getState().setKeyframeTime;
                    // setKeyframeTime(keyframeKey, trackKey, newValue, true);
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
        return undefined;
    }, [track.vxkey, track.propertyPath])


    return (
        <div className='w-72 flex flex-col'>
            <p className='font-roboto-mono text-xs text-center'>Track Data</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={track} customizeNode={customizeNode} collapsed={({ depth }) => depth > 1} />
            </div>
        </div>
    )
}
