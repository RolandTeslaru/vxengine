import CollapsiblePanel from '@vxengine/components/ui/CollapsiblePanel'
import PropInput from '@vxengine/components/ui/PropInput'
import React from 'react'
import { useObjectManagerAPI } from '..'

import * as THREE from "three"
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'

interface Props {
    vxobject: vxObjectProps
}

const Params: React.FC<Props> = ({ vxobject }) => {
    if (!vxobject) return

    const refObject = vxobject.ref.current as THREE.Object3D;
    if (!refObject) return;

    const threeObjectType = refObject.type

    const params = vxobject.params
    if(!params) return
    if (params.length === 0) return

    const ParamRenderer = ({ param, index }) => {
        return (
            <div key={index} className='flex flex-row py-1'>
                <p className='text-xs font-light'>{param}</p>
                <PropInput 
                    type="number"
                    className="ml-auto w-fit"
                    propertyPath={param}
                />
            </div>
        )
    }

    return (
        <CollapsiblePanel
            title={threeObjectType ? threeObjectType : "Object Params"}
        >
            <div className='flex flex-col'>
                {params.map(
                    (param, index) => <ParamRenderer param={param} index={index} key={index}/>
                )}
            </div>

        </CollapsiblePanel>
    )
}

export default Params
