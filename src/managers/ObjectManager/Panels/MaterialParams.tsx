import React, { useCallback, useEffect, useMemo, useState } from 'react'
import * as THREE from "three"
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel';
import ParamInput from '@vxengine/components/ui/ParamInput';
import Search from '@vxengine/components/ui/Search';
import { vxElementProps, vxObjectProps } from '../types/objectStore';
import Tree from '@vxengine/components/ui/Tree';
import { ScrollArea } from '@vxengine/components/shadcn/scrollArea';
import { createParamTree, createParamTreeLevel, createParamTreeLevelWithFunction, getValueType, ParamTreeNodeDataType, TreeNodeType } from '../utils/createPropertyTree';
import { filterParamTree } from '../utils/filterParamTree';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import JsonView from 'react18-json-view';
import { VXElementParam } from '@vxengine/vxobject/types';


interface MaterialParamNodeProps extends TreeNodeType {
    data: {
        param: VXElementParam
        vxobject: vxObjectProps
        type: "number" | "color"
    }
}


const MaterialParams = ({ vxobject }: { vxobject: vxObjectProps }) => {
    const refObject = (vxobject.ref.current as THREE.Mesh)
    const material = refObject.material;

    const propertiesTree = useMemo(() => {
        return createParamTreeLevelWithFunction(material, "material", "", (key, currentPath, value) => ({
            param: {
                propertyPath: currentPath,
                type: getValueType(value),
            },
            vxobject
        }))
    }, [vxobject])


    const [searchQuery, setSearchQuery] = useState("");

    const filteredPropertiesTree = useMemo(() =>
        filterParamTree(propertiesTree, searchQuery), [material, searchQuery])


    const createNodeDataFn = (key: string, currentPath: string, value: any) => ({
        param: {
            propertyPath: currentPath,
            type: getValueType(value),
        },
        vxobject
    })

    return (
        <CollapsiblePanel
            title={(material as any).type}
            defaultOpen={true}
            noPadding={true}
            contentClassName='pb-0! gap-2 min-h-0'
        >
            <div className='text-xs px-2 flex flex-row text-neutral-400'>
                {/* Search input */}
                <Search className='ml-auto' searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <ScrollArea className='h-96' scrollbarPosition='right'>
                <Tree
                    tree={filteredPropertiesTree as Record<string, ParamTreeNodeDataType>}
                    renderNodeContent={renderNodeContent}
                    createNodeDataFn={createNodeDataFn}
                />
            </ScrollArea>
        </CollapsiblePanel>
    )
}

export default MaterialParams





const renderNodeContent = (node: MaterialParamNodeProps, { NodeTemplate }) => {
    return (
        <NodeTemplate className="hover:bg-neutral-950/40 px-2">
            <div className='flex flex-row w-full h-[22px]'>
                <p className={`text-xs my-auto font-light text-neutral-400`}>
                    {node.key}
                </p>
                {node?.data?.param &&
                    <ParamInput
                        vxkey={node.data.vxobject.vxkey}
                        vxRefObj={node.data.vxobject.ref}
                        param={node.data.param}
                        className="ml-auto w-fit"
                    />
                }
            </div>
        </NodeTemplate>

    )
}



const ParamNodeContextMenu = ({ node, vxobject }) => {
    return (
        <ContextMenuContent className='gap-1 text-xs'>
            <p className='font-roboto-mono'>Node Object</p>
            <JsonView className='bg-neutral-900' src={node} collapsed={({ depth }) => depth > 1} />
        </ContextMenuContent>
    )
}