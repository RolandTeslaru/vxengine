import Info from '@geist-ui/icons/info';
import { Input } from '@vxengine/components/shadcn/input';
import { Popover, PopoverContent, PopoverItem, PopoverTrigger } from '@vxengine/components/shadcn/popover';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import React, { useCallback } from 'react'
import JsonView from 'react18-json-view';

interface Props {
    staticPropKey: string;
    children: React.ReactNode
    triggerClassName?: string
    contentClassName?: string
    side?: "left" | "right" | "top" | "bottom"
    align?: "center" | "end" | "start"
}


const PopoverShowStaticPropData: React.FC<Props> = (props) => {
    const { children, triggerClassName } = props;
    return (
        <Popover>
            <PopoverTrigger icon={<Info size={15}/>}>
                {children}
            </PopoverTrigger>
            <Content {...props}/>
        </Popover>
    )
}

const Content: React.FC<Props> = (props) => {
    const { staticPropKey, contentClassName, side, align } = props;

    const staticProp = useTimelineManagerAPI(state => state.staticProps[staticPropKey]);

    return (
        <PopoverContent className={contentClassName} side={side} align={align}>
            <p className='font-sans-menlo text-xs text-center mb-2'>StaticProp Data</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={staticProp} collapsed={({ depth }) => depth > 1} />
            </div>
        </PopoverContent>
    )
}

export default PopoverShowStaticPropData
