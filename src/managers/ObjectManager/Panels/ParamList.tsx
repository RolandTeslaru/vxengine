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

    const threeObjectType = refObject?.type

    const params = vxobject?.params ?? []

    const tree = useMemo(() => {
        const tree: Record<string, ParamNodeProps> = {}
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
        return tree;
    // Only depend on params and necessary vxobject properties, not the entire vxobject
    }, [params, vxobject.vxkey, refObject])

    if (Object.entries(tree).length === 0) return null
    if(!refObject) return null


    return (
        <CollapsiblePanel
            title={threeObjectType ? threeObjectType : "Object Params"}
            noPadding={true}
        >
            <div className='flex flex-col'>
                <Tree
                    tree={tree}
                    renderNodeContent={renderNodeContent}
                />
            </div>

        </CollapsiblePanel>
    )
}

// Export a memoized version of ParamList
export default React.memo(ParamList)



const renderNodeContent = (node: ParamNodeProps, { NodeTemplate }) => {
    return (
        <NodeTemplate className="hover:bg-neutral-950/40 px-2">
            <div className={`flex ${node?.data?.param?.type !== "slider" ? "flex-row" : "flex-col"} w-full min-h-[22px]`}>
                {node?.data?.param?.type !== "slider" &&
                    <p className={`text-xs w-auto mr-auto my-auto font-light text-label-quaternary`}>
                        {node.key}
                    </p>
                }
                {node?.data?.param && (
                    <ParamInput
                        vxkey={node.data.vxobject.vxkey}
                        vxRefObj={node.data.vxobject.ref}
                        param={node.data.param}
                        className=""
                    />
                )}
            </div>
        </NodeTemplate>
    )
}