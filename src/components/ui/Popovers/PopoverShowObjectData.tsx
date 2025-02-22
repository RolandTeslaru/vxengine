import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover'
import JsonView from 'react18-json-view'
import { Info } from '../icons'

interface Props {
    object: any
    title: string
    side?: "left" | "right" | "top" | "bottom"
    align?: "center" | "end" | "start"
    children: React.ReactNode
    contentClassName?: string
    triggerClassName?: string
}

const PopoverShowObjectData: React.FC<Props> = (props) => {
    const { children, triggerClassName } = props
    return (
        <Popover>
            <PopoverTrigger className={triggerClassName} icon={<Info size={15} />}>
                {children}
            </PopoverTrigger>
            <Content {...props} />
        </Popover>
    )
}

const Content: React.FC<Props> = (props) => {
    const { contentClassName, object, title, side = "right", align} = props;
    return (
        <PopoverContent className={contentClassName} side={side} align={align}>
            <p className='text-center font-sans-menlo text-xs'>
                {title}
            </p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={object} collapsed={({ depth }) => depth > 1} />
            </div>
        </PopoverContent>
    )
}

export default PopoverShowObjectData
