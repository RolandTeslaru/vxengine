import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from "three"
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel';
import PropInput from '@vxengine/components/ui/PropInput';
import Search from '@vxengine/components/ui/Search';
import { vxEntityProps, vxObjectProps } from '../types/objectStore';
import JsonView from 'react18-json-view';
import Tree from '@vxengine/components/ui/Tree';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import PopoverShowObjectData from '@vxengine/components/ui/Popovers/PopoverShowObjectData';

interface PropertyTreeNode {
    key: string; // The name of the property
    propertyPath?: string; // The full property path (e.g., "parent.child.key")
    type?: "number" | "color";
    children: Record<string, PropertyTreeNode>; // Nested children
}
type PropertyTree = Record<string, PropertyTreeNode>

const isValidValue = (value: any) =>
    typeof value === "number" || (value instanceof THREE.Color && value.isColor);

const getValueType = (value: any) => {
    if(typeof value === "number")
        return "number"
    else if(value instanceof THREE.Color || value.isColor)
        return "color"
}

function createPropertyTree(
    obj: Record<string, any>, 
    parentKey = "", 
    visited = new WeakSet(), // Keep track of visited objects
    depth = 0, 
    maxDepth = 10 // Limit the depth to prevent infinite recursion
): PropertyTree {
    // Base case: Prevent too deep recursion
    if (depth > maxDepth) return {};

    // Check for circular references
    if (visited.has(obj)) {
        // @ts-expect-error
        return { circularReference: true };
    }

    // Mark this object as visited
    visited.add(obj);

    const tree: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;

        if (isValidValue(value)) {
            // Add valid values as leaf nodes
            tree[key] = { 
                key,
                propertyPath: `material.${fullKey}`, 
                children: {},
                type: getValueType(value)
            };
        } else if (typeof value === "object" && value !== null) {
            // Recursively traverse child objects
            const children = createPropertyTree(value, fullKey, visited, depth + 1, maxDepth);
            if (Object.keys(children).length > 0) {
                tree[key] = { key, children };
            }
        }
    }

    // Remove the object from visited before returning to allow other branches to visit it
    visited.delete(obj);

    return tree;
}

const filterTree = (tree: Record<string, PropertyTreeNode>, query: string): Record<string, PropertyTreeNode> => {
    const result: Record<string, PropertyTreeNode> = {};

    Object.entries(tree).forEach(([key, node]) => {
        if(!node.key) return
        const isMatch = node.key.toLowerCase().includes(query.toLowerCase());
        const filteredChildren = filterTree(node.children, query);

        if (isMatch || Object.keys(filteredChildren).length > 0) {
            result[key] = {
                ...node,
                children: filteredChildren,
            };
        }
    });

    return result;
};

const MaterialProperties = ({ vxobject }: { vxobject: vxObjectProps }) => {
    const refObject = (vxobject.ref.current as THREE.Mesh)
    if (!refObject)
        return null;

    const material = refObject.material;
    if (!material)
        return null;

    const propertiesTree = useMemo(() => {
        return createPropertyTree(material)
    },[vxobject])
    
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPropertiesTree = useMemo(() =>
        filterTree(propertiesTree, searchQuery), [material, searchQuery])


    const renderNodeContent = (node: PropertyTreeNode, { NodeTemplate}) => {
        return (
            <NodeTemplate className="hover:bg-neutral-950 hover:bg-opacity-40 px-2">
                <ContextMenu>
                    <ContextMenuTrigger className='w-full'>
                        <div className='flex flex-row w-full h-[22px]'>
                            <p className={`text-xs my-auto font-light text-neutral-400`}>
                                {node.key}
                            </p>
                            {node.propertyPath && (
                                <PropInput
                                    vxObject={vxobject}
                                    param={{ type: node.type}}
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
            </NodeTemplate>
        )
    }

    return (
        <CollapsiblePanel
            title={(material as any).type}
            defaultOpen={true}
            noPadding={true}
            contentClassName='!pb-0'
        >
            <div className='text-xs px-2 flex flex-row text-neutral-400'>
                {/* Search input */}
                <Search className='ml-auto' searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <div className='flex flex-col mt-2 max-h-96 overflow-scroll'>
                <Tree tree={filteredPropertiesTree as Record<string, PropertyTreeNode>} renderNodeContent={renderNodeContent}/>
            </div>
        </CollapsiblePanel>
    )
}


// const MaterialPropertyNode = () => {
//     return (
        
//     )
// }

export default MaterialProperties
