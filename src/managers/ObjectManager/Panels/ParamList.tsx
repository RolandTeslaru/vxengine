import CollapsiblePanel from '@vxengine/ui/components/CollapsiblePanel'
import React, { useMemo } from 'react'

import * as THREE from "three"
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { VXElementParam } from '@vxengine/vxobject/types'
import { TreeNodeType } from '../utils/createPropertyTree'
import ICON_MAP from './ObjectTreePanel/icons'
import Tree from '@vxengine/ui/components/Tree'
import { paramRenderer } from '@vxengine/ui/components/Tree/nodeRenderers'

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
            icon={ICON_MAP["Slider"]}
            iconClassName='text-white !text-blue-400 '
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