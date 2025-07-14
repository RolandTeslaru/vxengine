import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import React from 'react'
import JsonView from 'react18-json-view'
import { JsonViewProps } from 'react18-json-view';

type DataViewerWrapperProps = { children?: React.ReactNode, title: string } & JsonViewProps

const DataViewerWrapper: React.FC<DataViewerWrapperProps> = ({ children, title, ...rest }) => {
    return (
        <div className='w-72 flex flex-col'>
            <p className='font-roboto-mono text-xs font-semibold text-center text-label-primary'>{title}</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={rest.src} collapsed={({ depth }) => depth > 1} {...rest}/>
            </div>
            {children}
        </div>
    )
}

export default DataViewerWrapper
