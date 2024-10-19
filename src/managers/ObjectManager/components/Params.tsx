import CollapsiblePanel from '@vxengine/components/ui/CollapsiblePanel'
import PropInput from '@vxengine/components/ui/PropInput'
import { useVXObjectStore } from '@vxengine/vxobject'
import React from 'react'
import { useObjectManagerAPI } from '..'

import * as THREE from "three"

const Params = () => {
    const vxkey = useObjectManagerAPI(state => state.selectedObjects[0]?.vxkey)
    const threeObjectType = useObjectManagerAPI(state => (state.selectedObjects[0]?.ref.current as THREE.Object3D)?.type)
    const params = useVXObjectStore(state => state.objects[vxkey]?.params);

    return (
        <>
            {params?.length > 0 && (
                <CollapsiblePanel
                    title={threeObjectType ? threeObjectType : "Object Params"}
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
