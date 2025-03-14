import { trackSegmentsRef } from '@vxengine/utils/useRefStore'
import React from 'react'
import JsonView from 'react18-json-view'

const TrackSegmentData = ({ firstKeyframeKey, secondKeyframeKey }: { firstKeyframeKey: string, secondKeyframeKey: string }) => {
    const trackSegmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`

    const trackSegmentElement = trackSegmentsRef.get(trackSegmentKey)

    return (
        <div className='w-72 flex flex-col'>
            <p className='font-roboto-mono text-xs text-center text-label-primary'>Track Segment Element Data</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={extractDatasetFromObject(trackSegmentElement)} collapsed={({ depth }) => depth > 1} />
            </div>
        </div>
    )
}

export default TrackSegmentData

function extractDatasetFromObject(element) {
    if (!element || !element.dataset) return null;
    return { ...element.dataset }; // Spread the dataset into a plain object
}