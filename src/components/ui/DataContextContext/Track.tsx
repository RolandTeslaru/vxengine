import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import React from 'react'
import JsonView from 'react18-json-view'

export const TrackData = ({trackKey}: {trackKey: string}) => {    
    const track = useTimelineManagerAPI(state => state.tracks[trackKey]);

    return (
        <div className='w-72 flex flex-col'>
            <p className='font-roboto-mono text-xs text-center'>Track Data</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={track} collapsed={({ depth }) => depth > 1} />
            </div>
        </div>
    )
}
