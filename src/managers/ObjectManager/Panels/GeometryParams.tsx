import React, { useState, FC, useMemo } from "react";
import CollapsiblePanel from "@vxengine/core/components/CollapsiblePanel";
import ParamInput from "@vxengine/components/ui/ParamInput";

import * as THREE from "three"
import { vxElementProps, vxObjectProps } from "../types/objectStore";
import Tree from "@vxengine/components/ui/Tree";
import Search from "@vxengine/components/ui/Search";
import { getValueType, ParamTreeNodeDataType, TreeNodeType } from "../utils/createPropertyTree";
import { filterParamTree } from "../utils/filterParamTree";
import { VXElementParam } from "@vxengine/vxobject/types";
import { createBranch, createTree } from "@vxengine/components/ui/Tree/utils";
import { CreateNodeDataFnType } from "@vxengine/components/ui/Tree/types"
    ;
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@vxengine/components/shadcn/contextMenu";
import JsonView from "react18-json-view";
import { InfoPopover } from "./helpers";
import { paramRenderer } from "@vxengine/components/ui/Tree/nodeRenderers";
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
            title={geometry.type + " Params"}
            noPadding={true}
            contentClassName="gap-2"
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