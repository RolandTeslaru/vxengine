import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import ParamInput from '@vxengine/components/ui/ParamInput'
import React, { useMemo } from 'react'
import { useObjectManagerAPI } from '..'

import * as THREE from "three"
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { VXElementParam } from '@vxengine/vxobject/types'
import Tree from '@vxengine/components/ui/Tree'

interface Props {
    vxobject: vxObjectProps
}

interface ParamTreeNode {
    key: string; // The name of the property
    children: Record<string, ParamTreeNode>; // Nested children
    param: VXElementParam
}

const excludeParamKeys = [
    "position.x", "position.y", "position.z",
    "rotation.x", "rotation.y", "rotation.z",
    "rotationDegrees.x", "rotationDegrees.y", "rotationDegrees.z",
    "scale.x", "scale.y", "scale.z",
]

const ParamList: React.FC<Props> = ({ vxobject }) => {
    const refObject = vxobject?.ref?.current as THREE.Object3D;
    if (!refObject) return;

    const threeObjectType = refObject.type

    const params = vxobject.params ?? []

    const tree = useMemo(() => {
        const tree: Record<string, ParamTreeNode> = {}
        params.forEach((param) => {
            if (!excludeParamKeys.includes(param.propertyPath))
                tree[param.propertyPath] = {
                    key: param.title ?? param.propertyPath,
                    children: {},
                    param
                }
        })
        return tree;
    }, [vxobject])

    if (Object.entries(tree).length === 0) return

    const renderNodeContent = (node: ParamTreeNode, { NodeTemplate }) => {
        return (
            <NodeTemplate className="hover:bg-neutral-950/40 px-2">
                <div className={`flex ${node?.param?.type !== "slider" ? "flex-row" : "flex-col"} w-full min-h-[22px]`}>
                    {node.param.type !== "slider" &&
                        <p className={`text-xs w-auto mr-auto my-auto font-light text-label-quaternary`}>
                            {node.key}
                        </p>
                    }
                    {node.param && (
                        <ParamInput
                            vxkey={vxobject.vxkey}
                            vxRefObj={vxobject.ref}
                            param={node.param}
                            className=""
                        />
                    )}
                </div>
            </NodeTemplate>
        )
    }

    return (
        <CollapsiblePanel
            title={threeObjectType ? threeObjectType : "Object Params"}
            noPadding={true}
        >
            <div className='flex flex-col'>
                <Tree tree={tree} renderNodeContent={renderNodeContent} />
            </div>

        </CollapsiblePanel>
    )
}

export default ParamList
