import React, { useState, FC, useMemo } from "react";
import CollapsiblePanel from "@vxengine/core/components/CollapsiblePanel";
import ParamInput from "@vxengine/components/ui/ParamInput";

import * as THREE from "three"
import { vxElementProps, vxObjectProps } from "../types/objectStore";
import Tree from "@vxengine/components/ui/Tree";
import Search from "@vxengine/components/ui/Search";
import { createParamTree, createParamTreeLevelWithFunction, getValueType, ParamTreeNodeDataType, TreeNodeType } from "../utils/createPropertyTree";
import { filterParamTree } from "../utils/filterParamTree";
import { VXElementParam } from "@vxengine/vxobject/types";
import { createBranch } from "@vxengine/components/ui/Tree/utils";
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


export const GeometryParams: FC<VXGeometryProps> = ({ vxobject }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const refObject = (vxobject.ref.current as THREE.Mesh);
    const geometry = refObject.geometry as ValidGeometries

    const propertiesTree = useMemo(() => {
        return createBranch(geometry.parameters, "geometry", "", (key, currentPath, value) => {
            return {
                param: {
                    propertyPath: currentPath,
                    type: getValueType(value),
                },
                vxobject
            }
        })
    }, [vxobject])

    const filteredPropertiesTree = useMemo(() =>
        filterParamTree(propertiesTree, searchQuery),
        [geometry, searchQuery])


    const createNodeDataFn = (key: string, currentPath: string, value: any) => ({
        param: {
            propertyPath: currentPath,
            type: getValueType(value),
        },
        vxobject
    })

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
                    renderNodeContent={renderNodeContent} 
                    createNodeDataFn={createNodeDataFn} 
                />
            </div>
        </CollapsiblePanel>
    )
}


const renderNodeContent = (node: GeometryParamNodeProps, { NodeTemplate }) => {
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