import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import React from 'react'
import JsonView from 'react18-json-view'

export const TrackData = ({trackKey}: {trackKey: string}) => {    
    const track = useTimelineManagerAPI(state => state.tracks[trackKey]);

    return (
        <div className='flex flex-col'>
            <p className='font-roboto-mono text-xs text-center'>Track Data</p>
            <JsonView src={track} collapsed={({ depth }) => depth > 1} />
        </div>
    )
}
