import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import PropInput from '@vxengine/components/ui/PropInput'
import React from 'react'
import { useObjectManagerAPI } from '..'

import * as THREE from "three"
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { VXObjectParam } from '@vxengine/vxobject/types'

interface Props {
    vxobject: vxObjectProps
}

const ParamList: React.FC<Props> = ({ vxobject }) => {
    if (!vxobject) return

    const refObject = vxobject?.ref?.current as THREE.Object3D;
    if (!refObject) return;

    const threeObjectType = refObject.type

    const params = vxobject.params ?? {}

    if (Object.entries(params).length === 0) return

    const ParamRenderer = (props: { param: VXObjectParam, index: number, paramKey: string}) => {
        const { paramKey, param } = props;
        return (
            <div className={`flex ${param.type === "slider" ? "flex-col": "flex-row"} py-1`}>
                <p className='text-xs font-light text-neutral-400'>{paramKey}</p>
                <PropInput 
                    param={param}
                    vxObject={vxobject}
                    className="ml-auto w-fit"
                    propertyPath={param?.overwritePropertyPath ?? paramKey}
                />
            </div>
        )
    }

    return (
        <CollapsiblePanel
            title={threeObjectType ? threeObjectType : "Object Params"}
        >
            <div className='flex flex-col'>
                {Object.entries(params).map(([paramKey, param], index) => <ParamRenderer param={param} index={index} key={paramKey} paramKey={paramKey} />)}
            </div>

        </CollapsiblePanel>
    )
}

export default ParamList
