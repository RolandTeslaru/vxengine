import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover'
import { Info } from '@vxengine/components/ui/icons'
import React from 'react'
import JsonView from 'react18-json-view';

export const InfoPopover = ({object}: {object: Record<string, any>}) => {
    return (
        <Popover>
            <PopoverTrigger className='!w-fit'>
                <Info className='w-4 h-4' />
            </PopoverTrigger>
            <PopoverContent side='left' align='start' className='p-1 pt-0'>
                    <p className='text-xs font-medium text-center font-roboto-mono'>Object</p>
                <div className='max-h-[400px] overflow-y-auto rounded-lg'>
                    <JsonView className='bg-neutral-900 text-xs' src={object} collapsed={({ depth }) => depth > 1} />
                </div>
            </PopoverContent>
        </Popover>
    )
}