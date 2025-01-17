import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover';
import { useVXObjectStore } from '@vxengine/managers/ObjectManager';
import React from 'react'
import JsonView from 'react18-json-view';
import Info from '@geist-ui/icons/info'

interface Props {
    children: React.ReactNode;
    vxkey: string;
    side?: "left" | "right" | "top" | "bottom"
    align?: "center" | "end" | "start"
    triggerClassName?: string;
    contentClassName?: string;
}

const PopoverShowVXObjectData: React.FC<Props> = (props) => {
    const { children, triggerClassName } = props
    return (
        <Popover>
            <PopoverTrigger className={triggerClassName} icon={<Info size={15}/>}>
                {children}
            </PopoverTrigger>
            <Content {...props} />
        </Popover>
    )
}

const Content: React.FC<Props> = (props) => {
    const { vxkey, contentClassName, side, align } = props;
    const vxobject = useVXObjectStore(state => state.objects[vxkey]);

    return (
        <PopoverContent className={contentClassName} side={side} align={align}>
            <p className='text-center font-sans-menlo text-xs'>
                vxObject Data
            </p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={vxobject} collapsed={({ depth }) => depth > 1} />
            </div>
        </PopoverContent>
    )
}

export default PopoverShowVXObjectData
