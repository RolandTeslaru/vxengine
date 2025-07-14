import React, { useState, FC, useMemo } from "react";
import CollapsiblePanel from "@vxengine/ui/components/CollapsiblePanel";

import * as THREE from "three"
import { vxElementProps, vxObjectProps } from "../types/objectStore";
import Tree from "@vxengine/ui/components/Tree";
import Search from "@vxengine/ui/components/Search";
import { getValueType, TreeNodeType } from "../utils/createPropertyTree";
import { filterParamTree } from "../utils/filterParamTree";
import { VXElementParam } from "@vxengine/vxobject/types";
import { createTree } from "@vxengine/ui/components/Tree/utils";
import { CreateNodeDataFnType } from "@vxengine/ui/components/Tree/types"
import { paramRenderer } from "@vxengine/ui/components/Tree/nodeRenderers";

export type ValidGeometries = THREE.BoxGeometry | THREE.SphereGeometry | THREE.PlaneGeometry | THREE.CylinderGeometry | THREE.TorusGeometry;
// Add any other geometry types you want to support

interface VXGeometryProps {
    vxobject: vxElementProps
}

interface GeometryParamNodeProps extends TreeNodeType {
    data: {
        param: VXElementParam
        vxobject: vxObjectProps
    }
}

export const GeometryParams: FC<VXGeometryProps> = React.memo(({ vxobject }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const refObject = (vxobject.ref.current as THREE.Mesh);
    const geometry = refObject.geometry as ValidGeometries

    // Calculate createNodeDataFn directly
    const createNodeDataFn: CreateNodeDataFnType = ({ key, currentPath, value }) => ({
        param: {
            propertyPath: currentPath,
            type: getValueType(value),
            title: key,
        },
        vxobject
    });

    // Calculate propertiesTree directly
    const propertiesTree = createTree(geometry.parameters, "geometry", "", createNodeDataFn);

    // Calculate filteredPropertiesTree directly
    const filteredPropertiesTree = filterParamTree(propertiesTree, searchQuery);

    return (
        <CollapsiblePanel
            title={geometry.type}
            noPadding={true}
            contentClassName="gap-2"
            icon={<svg className=" stroke-green-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M3 17m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M17 17m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M6.5 17.1l5 -9.1" /><path d="M17.5 17.1l-5 -9.1" /><path d="M7 19l10 0" /></svg>}
        >
            <div className='text-xs px-2 flex flex-row'>
                {/* Search input */}
                <Search className='ml-auto' searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <div className='flex flex-col'>
                <Tree
                    tree={filteredPropertiesTree}
                    renderNodeContent={paramRenderer}
                    createNodeDataFn={createNodeDataFn}
                />
            </div>
        </CollapsiblePanel>
    )
})