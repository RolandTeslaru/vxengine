import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import PropInput from '@vxengine/components/ui/PropInput'
import React, { useMemo } from 'react'
import { useObjectManagerAPI } from '..'

import * as THREE from "three"
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { VXObjectParam } from '@vxengine/vxobject/types'
import Tree from '@vxengine/components/ui/Tree'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu'
import PopoverShowObjectData from '@vxengine/components/ui/Popovers/PopoverShowObjectData'

interface Props {
    vxobject: vxObjectProps
}

interface PropertyTreeNode {
    key: string; // The name of the property
    propertyPath?: string; // The full property path (e.g., "parent.child.key")
    type?: "number" | "color" | "slider";
    children: Record<string, PropertyTreeNode>; // Nested children
    param: VXObjectParam
}

const ParamList: React.FC<Props> = ({ vxobject }) => {
    if (!vxobject) return

    const refObject = vxobject?.ref?.current as THREE.Object3D;
    if (!refObject) return;

    const threeObjectType = refObject.type

    const params = vxobject.params ?? {}

    const tree = useMemo(() => {
        const tree: Record<string, any> = {}
        Object.entries(vxobject.params ?? {}).forEach(([propertyPath, param]) => {
            tree[propertyPath] = {
                key: propertyPath,
                propertyPath,
                children: {},
                type: param.type,
                param
            }
        })
        return tree;
    }, [vxobject])

    if (Object.entries(params).length === 0) return

    const renderNodeContent = (node: PropertyTreeNode, { NodeTemplate }) => {
        return (<NodeTemplate className="hover:bg-neutral-950 hover:bg-opacity-40 px-2">
            <ContextMenu>
                <ContextMenuTrigger className='w-full'>
                    <div className={`flex ${node.type !== "slider" ? "flex-row" : "flex-col"} w-full min-h-[22px]`}>
                        <p className={`text-xs my-auto font-light text-neutral-400`}>
                            {node.key}
                        </p>
                        {node.propertyPath && (
                            <PropInput
                                vxObject={vxobject}
                                param={node.param}
                                className="ml-auto w-fit"
                                propertyPath={node.propertyPath}
                            />
                        )}
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <PopoverShowObjectData object={node} title='TreeNode Data' >
                        Show data
                    </PopoverShowObjectData>
                </ContextMenuContent>
            </ContextMenu>
        </NodeTemplate>)
    }

    return (
        <CollapsiblePanel
            title={threeObjectType ? threeObjectType : "Object Params"}
            noPadding={true}
        >
            <div className='flex flex-col'>
                <Tree tree={tree} renderNodeContent={renderNodeContent}/>
            </div>

        </CollapsiblePanel>
    )
}

export default ParamList
