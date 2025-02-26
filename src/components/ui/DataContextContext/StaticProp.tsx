import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import React from 'react'
import JsonView from 'react18-json-view'

const StaticPropData = ({ staticPropKey }: { staticPropKey: string }) => {
    const staticProp = useTimelineManagerAPI(state => state.staticProps[staticPropKey]);
    
    return (
        <div className='flex flex-col'>
            <p className='font-roboto-mono text-xs text-center'>StaticProp Data</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={staticProp} collapsed={({ depth }) => depth > 1} />
            </div>
        </div>
    )
}

export default StaticPropData
