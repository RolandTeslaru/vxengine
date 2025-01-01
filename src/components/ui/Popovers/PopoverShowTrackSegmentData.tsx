import Info from '@geist-ui/icons/info';
import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover';
import { trackSegmentsRef } from '@vxengine/utils/useRefStore';
import React, { useCallback } from 'react'
import JsonView from 'react18-json-view';

interface Props {
    firstKeyframeKey: string;
    secondKeyframeKey: string
    children: React.ReactNode
    triggerClassName?: string
    contentClassName?: string
    side?: "left" | "right" | "top" | "bottom"
    align?: "center" | "end" | "start"
}


const PopoverShowTrackSegmentData: React.FC<Props> = (props) => {
    const { children, triggerClassName } = props;
    return (
        <Popover>
            <PopoverTrigger className={triggerClassName}>
                <Info size={15}/>
                {children}
            </PopoverTrigger>
            <Content {...props}/>
        </Popover>
    )
}

const Content: React.FC<Props> = (props) => {
    const { firstKeyframeKey, secondKeyframeKey, contentClassName, side, align } = props;
    const trackSegmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`

    const trackSegmentElement = trackSegmentsRef.get(trackSegmentKey)

    return (
        <PopoverContent className={contentClassName} side={side} align={align}>
            <p className='font-sans-menlo text-xs text-center mb-2'>Track Segment Element Data</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={extractDatasetFromObject(trackSegmentElement)} collapsed={({ depth }) => depth > 1} />
            </div>
        </PopoverContent>
    )
}

export default PopoverShowTrackSegmentData

function extractDatasetFromObject(element) {
    if (!element || !element.dataset) return null;
    return { ...element.dataset }; // Spread the dataset into a plain object
  }