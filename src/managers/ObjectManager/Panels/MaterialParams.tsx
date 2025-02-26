import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from "three"
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel';
import ParamInput from '@vxengine/components/ui/ParamInput';
import Search from '@vxengine/components/ui/Search';
import { vxElementProps, vxObjectProps } from '../types/objectStore';
import Tree from '@vxengine/components/ui/Tree';
import { ScrollArea } from '@vxengine/components/shadcn/scrollArea';
import { createParamTree, ParamTreeNode } from '../utils/createPropertyTree';
import { filterParamTree } from '../utils/filterParamTree';

const MaterialParams = ({ vxobject }: { vxobject: vxObjectProps }) => {
    const refObject = (vxobject.ref.current as THREE.Mesh)
    const material = refObject.material;

    const propertiesTree = useMemo(() => {
        return createParamTree(material, "material")
    }, [vxobject])

    const [searchQuery, setSearchQuery] = useState("");

    const filteredPropertiesTree = useMemo(() =>
        filterParamTree(propertiesTree, searchQuery), [material, searchQuery])

    const renderNodeContent = (node: ParamTreeNode, { NodeTemplate }) => {
        return (
            <NodeTemplate className="hover:bg-neutral-950/40 px-2">
                <div className='flex flex-row w-full h-[22px]'>
                    <p className={`text-xs my-auto font-light text-neutral-400`}>
                        {node.key}
                    </p>
                    {node.param &&
                        <ParamInput
                            vxObject={vxobject}
                            param={node.param}
                            className="ml-auto w-fit"
                        />
                    }
                </div>
            </NodeTemplate>
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
                <Tree tree={filteredPropertiesTree as Record<string, ParamTreeNode>} renderNodeContent={renderNodeContent} />
            </ScrollArea>
        </CollapsiblePanel>
    )
}


// const MaterialPropertyNode = () => {
//     return (

//     )
// }

export default MaterialParams
