import CollapsiblePanel from '@vxengine/components/ui/CollapsiblePanel'
import PropInput from '@vxengine/components/ui/PropInput'
import { useVXObjectStore } from '@vxengine/vxobject'
import React from 'react'

interface ParamsProps {
    vxkey: string
}

const Params: React.FC<ParamsProps> = ({ vxkey }) => {
    const vxobjectType = useVXObjectStore(state => state.objects[vxkey]?.type)
    const params = useVXObjectStore(state => state.objects[vxkey]?.params);


    return (
        <>
            {params?.length > 0 && (
                <CollapsiblePanel
                    title={"General Params"}
                >
                    <div className='flex flex-col'>
                        {params.map((param, index) => (
                            <div key={index} className='flex flex-row py-1'>
                                <p className='text-xs font-light'>{param}</p>
                                <PropInput
                                    type="number"
                                    className="ml-auto w-fit"
                                    propertyPath={param}
                                />
                            </div>
                        ))}
                    </div>

                </CollapsiblePanel>
            )}
        </>
    )
}

export default Params
