import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from "three"
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel';
import ParamInput from '@vxengine/components/ui/ParamInput';
import Search from '@vxengine/components/ui/Search';
import { vxElementProps, vxObjectProps } from '../types/objectStore';
import Tree from '@vxengine/components/ui/Tree';
import { ScrollArea } from '@vxengine/components/shadcn/scrollArea';
import { createParamTree, createParamTreeLevel, ParamTreeNodeDataType } from '../utils/createPropertyTree';
import { filterParamTree } from '../utils/filterParamTree';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import JsonView from 'react18-json-view';

const MaterialParams = ({ vxobject }: { vxobject: vxObjectProps }) => {
    const refObject = (vxobject.ref.current as THREE.Mesh)
    const material = refObject.material;

    const propertiesTree = useMemo(() => {
        return createParamTreeLevel(material, "material")
    }, [vxobject])

    const [searchQuery, setSearchQuery] = useState("");

    const filteredPropertiesTree = useMemo(() =>
        filterParamTree(propertiesTree, searchQuery), [material, searchQuery])

    const renderNodeContent = (node: ParamTreeNodeDataType, { NodeTemplate }) => {
        return (
            <ContextMenu>
                <ContextMenuTrigger>
                    <NodeTemplate className="hover:bg-neutral-950/40 px-2">
                        <div className='flex flex-row w-full h-[22px]'>
                            <p className={`text-xs my-auto font-light text-neutral-400`}>
                                {node.key}
                            </p>
                            {node.param &&
                                <ParamInput
                                    vxkey={vxobject.vxkey}
                                    vxRefObj={vxobject.ref}
                                    param={node.param}
                                    className="ml-auto w-fit"
                                />
                            }
                        </div>
                    </NodeTemplate>
                </ContextMenuTrigger>
                <ParamNodeContextMenu node={node} vxobject={vxobject} />
            </ContextMenu>
        )
    }

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
                    createBranch={createParamTreeLevel}
                />
            </ScrollArea>
        </CollapsiblePanel>
    )
}

export default MaterialParams




const ParamNodeContextMenu = ({ node, vxobject }) => {
    return (
        <ContextMenuContent className='gap-1 text-xs'>
            <p className='font-roboto-mono'>Node Object</p>
            <JsonView className='bg-neutral-900' src={node} collapsed={({ depth }) => depth > 1} />

            <p className='font-roboto-mono'>Vxobject Object</p>
            <JsonView className='bg-neutral-900' src={vxobject} collapsed={({ depth }) => depth > 1} />


        </ContextMenuContent>
    )
}