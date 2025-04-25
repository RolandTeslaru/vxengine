import React, { useCallback, useEffect, useMemo, useState } from 'react'
import * as THREE from "three"
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel';
import Search from '@vxengine/components/ui/Search';
import { vxObjectProps } from '../../types/objectStore';
import Tree from '@vxengine/components/ui/Tree';
import { ScrollArea } from '@vxengine/components/shadcn/scrollArea';
import { getValueType, ParamTreeNodeDataType } from '../../utils/createPropertyTree';
import { filterParamTree } from '../../utils/filterParamTree';
import { createTree } from '@vxengine/components/ui/Tree/utils';
import { CreateNodeDataFnType } from '@vxengine/components/ui/Tree/types';
import { paramRenderer } from '@vxengine/components/ui/Tree/nodeRenderers';


const MaterialTreePanel = ({ vxobject }: { vxobject: vxObjectProps }) => {
    return (
        <CollapsiblePanel
            key={vxobject.vxkey}
            title={(vxobject.ref.current.material as any).type}
            defaultOpen={false}
            noPadding={true}
            contentClassName='pb-0! gap-2 min-h-0'
        >
            <Content vxobject={vxobject} />
        </CollapsiblePanel>
    )
}

export default MaterialTreePanel


const Content = ({ vxobject }: { vxobject: vxObjectProps }) => {
    const refObject = (vxobject.ref.current as THREE.Mesh)
    const material = refObject.material;

    const [propertiesTree, createNodeDataFn] = useMemo(() => {
        const __createNodeDataFn: CreateNodeDataFnType = ({ key, currentPath, value }) => ({
            param: {
                propertyPath: currentPath,
                type: getValueType(value),
            },
            vxobject
        })


        return [
            createTree(material, "material", "", __createNodeDataFn),
            __createNodeDataFn
        ]
    }, [vxobject])

    const [searchQuery, setSearchQuery] = useState("");

    const filteredPropertiesTree = useMemo(() =>
        filterParamTree(propertiesTree, searchQuery), [material, searchQuery])

    return (
        <>

            <div className='text-xs px-2 flex flex-row text-neutral-400'>
                {/* Search input */}
                <Search className='ml-auto' searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <ScrollArea className='h-96' scrollbarPosition='right'>
                <Tree
                    tree={filteredPropertiesTree as Record<string, ParamTreeNodeDataType>}
                    renderNodeContent={paramRenderer}
                    createNodeDataFn={createNodeDataFn}
                />
            </ScrollArea>
        </>
    )
}
