import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import ParamInput from '@vxengine/components/ui/ParamInput'
import React, { useMemo } from 'react'
import { useObjectManagerAPI } from '..'

import * as THREE from "three"
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { VXElementParam } from '@vxengine/vxobject/types'
import Tree from '@vxengine/components/ui/Tree'
import { createParamTreeLevel, ParamTreeNodeDataType } from '../utils/createPropertyTree'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu'
import JsonView from 'react18-json-view'

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
        const tree: Record<string, ParamTreeNodeDataType> = {}
        params.forEach((param) => {
            if (!excludeParamKeys.includes(param.propertyPath))
                tree[param.propertyPath] = {
                    key: param.title ?? param.propertyPath,
                    children: {},
                    param,
                    rawObject: refObject
                }
        })
        return tree;
    }, [vxobject])

    if (Object.entries(tree).length === 0) return

    const renderNodeContent = (node: ParamTreeNodeDataType, { NodeTemplate }) => {
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
                <Tree
                    tree={tree}
                    renderNodeContent={renderNodeContent}
                    createBranch={createParamTreeLevel}
                />
            </div>

        </CollapsiblePanel>
    )
}

export default ParamList



const ParamNodeContextMenu = ({ node, vxobject }) => {
    return (
        <ContextMenuContent className='gap-1 text-xs'>
            <p className='font-roboto-mono'>Node Object</p>
            <JsonView className='bg-neutral-900' src={node} />

            <p className='text-xs font-roboto-mono'>Vxobject Object</p>
            <JsonView className='bg-neutral-900' src={vxobject} />


        </ContextMenuContent>
    )
}