import { useVXObjectStore } from '@vxengine/managers/ObjectManager';
import React from 'react'
import JsonView from 'react18-json-view';

const VxObjectData = ({vxkey}: {vxkey: string}) => {
    const vxobject = useVXObjectStore(state => state.objects[vxkey]);
    return (
        <div className='w-72 flex flex-col '>
            <p className='text-center font-roboto-mono text-xs text-label-primary'>
                vxObject Data
            </p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={vxobject} collapsed={({ depth }) => depth > 1} />
            </div>
        </div>
    )
}

export default VxObjectData
