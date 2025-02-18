import React, { useState, FC, useMemo } from "react";
import CollapsiblePanel from "@vxengine/core/components/CollapsiblePanel";
import ParamInput from "@vxengine/components/ui/ParamInput";

import * as THREE from "three"
import { vxEntityProps, vxObjectProps } from "../types/objectStore";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@vxengine/components/shadcn/contextMenu";
import PopoverShowObjectData from "@vxengine/components/ui/Popovers/PopoverShowObjectData";
import Tree from "@vxengine/components/ui/Tree";
import Search from "@vxengine/components/ui/Search";
import { VXObjectParam } from "@vxengine/vxobject/types";
import { createParamTree, ParamTreeNode } from "../utils/createPropertyTree";
import { filterParamTree } from "../utils/filterParamTree";

export type ValidGeometries = THREE.BoxGeometry | THREE.SphereGeometry | THREE.PlaneGeometry | THREE.CylinderGeometry | THREE.TorusGeometry;
// Add any other geometry types you want to support

interface VXGeometryProps {
    vxobject: vxEntityProps
}

export const GeometryParams: FC<VXGeometryProps> = ({ vxobject }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const refObject = (vxobject.ref.current as THREE.Mesh);
    const geometry = refObject.geometry as ValidGeometries

    const propertiesTree = useMemo(() => {
        return createParamTree(geometry.parameters, "geometry")
    }, [vxobject])

    const filteredPropertiesTree = useMemo(() =>
        filterParamTree(propertiesTree, searchQuery), 
    [geometry, searchQuery])


    const renderNodeContent = (node: ParamTreeNode, { NodeTemplate }) => {
        return (
            <NodeTemplate className="hover:bg-neutral-950 hover:bg-opacity-40 px-2">
                <ContextMenu>
                    <ContextMenuTrigger className='w-full'>
                        <div className='flex flex-row w-full h-[22px]'>
                            <p className={`text-xs my-auto font-light text-neutral-400`}>
                                {node.key}
                            </p>
                            <ParamInput
                                vxObject={vxobject}
                                param={node.param}
                                className="ml-auto w-fit"
                            />
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <PopoverShowObjectData object={node} title='TreeNode Data' >
                            Show data
                        </PopoverShowObjectData>
                    </ContextMenuContent>
                </ContextMenu>
            </NodeTemplate>
        )
    }

    return (
        <CollapsiblePanel
            title={geometry.type + " Params"}
            noPadding={true}
            contentClassName="gap-2"
        >
            <div className='text-xs px-2 flex flex-row text-neutral-400'>
                {/* Search input */}
                <Search className='ml-auto' searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <div className='flex flex-col'>
                <Tree  tree={filteredPropertiesTree} renderNodeContent={renderNodeContent} />
            </div>
        </CollapsiblePanel>
    )
}