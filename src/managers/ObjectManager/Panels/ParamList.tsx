import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import ParamInput from '@vxengine/components/ui/ParamInput'
import React, { useMemo, useCallback } from 'react'
import { useObjectManagerAPI } from '..'

import * as THREE from "three"
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { VXElementParam } from '@vxengine/vxobject/types'
import Tree from '@vxengine/components/ui/Tree'
import { TreeNodeType } from '../utils/createPropertyTree'
import JsonView from 'react18-json-view'
import { paramRenderer } from '@vxengine/components/ui/Tree/nodeRenderers'

interface Props {
    vxobject: vxObjectProps
}

interface ParamNodeProps extends TreeNodeType {
    data: {
        param: VXElementParam
        vxobject: vxObjectProps
    },
}

const excludeParamKeys = [
    "position.x", "position.y", "position.z",
    "rotation.x", "rotation.y", "rotation.z",
    "rotationDegrees.x", "rotationDegrees.y", "rotationDegrees.z",
    "scale.x", "scale.y", "scale.z",
]


const ParamList: React.FC<Props> = ({ vxobject }) => {
    const refObject = vxobject?.ref?.current as THREE.Object3D;

    const [tree, treeLength] = useMemo(() => {
        const tree: Record<string, ParamNodeProps> = {}
        const params = vxobject?.params ?? []
        params.forEach((param) => {
            if (!excludeParamKeys.includes(param.propertyPath))
                
                tree[param.propertyPath] = {
                    key: param.title ?? param.propertyPath,
                    children: {},
                    data: {
                        param, 
                        vxobject
                    },
                    refObject,
                    currentPath: param.propertyPath
                }
        })
        return [tree, Object.keys(tree).length];
    }, [vxobject, refObject])

    if(!refObject) return null

    if(treeLength === 0) return null
    return (
        <CollapsiblePanel
            title={vxobject.name ? `${vxobject.name} Params` : "Object Params"}
            noPadding={true}
        >
            <div className='flex flex-col'>
                <Tree
                    tree={tree}
                    renderNodeContent={paramRenderer}
                />
            </div>

        </CollapsiblePanel>
    )
}

// Export a memoized version of ParamList
export default React.memo(ParamList)