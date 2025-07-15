// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { ObjectManagerStoreProps, ObjectTreeNodeProps } from '@vxengine/types/objectEditorStore';
import { vxEffectProps, vxElementProps, vxObjectProps, vxObjectTypes, vxVirtualEntityProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { create } from 'zustand';
import { produce } from "immer"
import { ObjectPropertyStoreProps } from '@vxengine/types/objectPropertyStore';
import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { ObjectManagerService } from '../service';

const nodesPresent: Record<string, boolean> = {};
// This is only here so that the order is correct
const initialObjectTree: Record<string, ObjectTreeNodeProps> = {
    "scene": {
        key: "scene",
        name: "Scene",
        type: "Scene",
        children: {},
        isSelectable: true
    },
    "splines": {
        key: "splines",
        name: "Splines",
        type: "Splines",
        children: {},
        isSelectable: false
    },
    "html": {
        key: "html",
        name: "HTML",
        type: "HTML",
        children: {},
        isSelectable: false
    },
    "materials": {
        key: "materials",
        name: "Materials",
        type: "Materials",
        children: {},
        isSelectable: false
    },
    "environment": {
        key: "environment",
        name: "Environment",
        type: "Environment",
        children: {},
        isSelectable: false
    }
}

export const useObjectManagerAPI = createWithEqualityFn<ObjectManagerStoreProps>((set, get) => ({
    transformMode: "translate",
    setTransformMode: (mode: "translate" | "rotate" | "scale") => set((state) => ({
        ...state,
        transformMode: mode
    })),

    transformSpace: "world",
    setTransformSpace: (space: "world" | "local") => set({ transformSpace: space }),

    selectedObjectKeys: [],
    selectObject: (vxkey) => {
        set((state) => ({
            ...state,
            selectedObjectKeys: [vxkey, ...state.selectedObjectKeys]
        }))
        return get();
    }
    ,
    unselectObject: (vxkey) => {
        if(get().selectedObjectKeys.includes(vxkey))
            set((state) => ({
                ...state,
                selectedObjectKeys: state.selectedObjectKeys.filter(_key => _key !== vxkey)
            }))
        return get();
    },
    clearSelectedObjects: () => {
        set({ selectedObjectKeys: [] })
        return get()
    },
    hoveredObject: undefined,
    setHoveredObject: (vxobject: vxObjectProps) => set((state) => ({
        ...state,
        hoveredObject: vxobject,
    })),

    tree: initialObjectTree,
    flatObjectTreeRecord: initialObjectTree,
    pendingChildren: {},
    addToTree: (vxobject) => {
        const { vxkey } = vxobject
        const { parentKeys } = vxobject

        const type = 
            vxobject.icon ||
            vxobject.ref?.current?.type ||
            vxobject.ref?.current?.geometry?.type ||
            "default";

        const name = (vxobject as vxElementProps).name ?? vxkey;

        if (parentKeys.size === 0)
            parentKeys.add('scene')

        set(
            produce((state: ObjectManagerStoreProps) => {
                const newNode: ObjectTreeNodeProps = {
                    key: vxkey,
                    name,
                    type,
                    children: {},
                    isSelectable: true
                }

                // Check if the node has pending children to be added to itself
                if (state.pendingChildren[vxkey]) {
                    // @ts-expect-error
                    newNode.children = state.pendingChildren[vxkey];
                    delete state.pendingChildren[vxkey];
                }

                // If its global then we dont need to check for parents
                if (parentKeys.has("global")) {
                    state.tree[vxkey] = newNode;
                    return;
                }

                const findParentNode = (key, tree) => {
                    for (const nodeKey in tree) {
                        const node = tree[nodeKey];
                        if (nodeKey === key) return node;
                        const foundInChild = findParentNode(key, node.children);
                        if (foundInChild) return foundInChild;
                    }
                    return null;
                };

                parentKeys.forEach(_parentKey => {
                    const parentNode = findParentNode(_parentKey, state.tree);
                    if(parentNode){
                        parentNode.children[vxkey] = newNode;
                    } else {
                        // @ts-expect-error
                        state.pendingChildren[_parentKey] = state.pendingChildren[_parentKey] || {};
                        state.pendingChildren[_parentKey][vxkey] = newNode;
                    }
                })
                // Resolve pending children

                // Recursively find the parent node in the tree
                
            }))
    },
    reattachTreeNode: (vxkey: string) => {
        const vxobject = ObjectManagerService.objectStoreState.objects[vxkey];
        if(!vxobject)
            console.error(`useObjectManagerAPI: Could not execute rebuildTreeNode because no vxobject with the vxkey "${vxkey}" was found in the store.`);

        get().removeFromTree(vxkey);
        get().addToTree(vxobject)
    },
    removeFromTree: (vxkey) => {
        set(
            produce((state) => {
                const recursiveRemove = (nodeKey: string, parentNode: ObjectTreeNodeProps) => {
                    // If the node has children, recursively remove them
                    const nodeToRemove = parentNode ? parentNode.children[nodeKey] : state.tree[nodeKey];
                    if (!nodeToRemove) return;

                    Object.keys(nodeToRemove.children).forEach((childKey) => {
                        recursiveRemove(childKey, nodeToRemove);
                    });

                    // Remove the node itself
                    if (parentNode) {
                        delete parentNode.children[nodeKey];
                    } else {
                        delete state.tree[nodeKey];
                    }

                    // Clean up pending children if they exist
                    if (state.pendingChildren[nodeKey]) {
                        delete state.pendingChildren[nodeKey];
                    }
                };

                // Find the node and its parent
                const findParent = (key, tree) => {
                    for (const nodeKey in tree) {
                        const node = tree[nodeKey];
                        if (node.children[key]) {
                            return node;
                        }
                        const childParent = findParent(key, node.children);
                        if (childParent) return childParent;
                    }
                    return null;
                };

                const parent = findParent(vxkey, state.tree);
                recursiveRemove(vxkey, parent);
            })
        );
    }

}), shallow)

export const useObjectPropertyAPI = create<ObjectPropertyStoreProps>((set, get) => ({
    properties: {},
    deleteProperty: (vxkey, propertyPath) => {
        const key = `${vxkey}.${propertyPath}`;
        set(produce((state: ObjectPropertyStoreProps) => {
            delete state.properties[key]
        }))
    }
}))

export const getProperty = (vxkey: string, propertyPath: string) => {
    const state = useObjectPropertyAPI.getState()
    const key = `${vxkey}.${propertyPath}`;
    return state.properties[key];
}
export const updateProperty = (vxkey: string, propertyPath: string, value: any) => {
    useObjectPropertyAPI.setState(
        produce((state: ObjectPropertyStoreProps) => {
            const key = `${vxkey}.${propertyPath}`;
            state.properties[key] = value;
        })
    )
}

export type BatchPropertyUpdateType = {
    vxkey: string, propertyPath:string, value: any
}[]

export const batchUpdateProperties = (batchedProps: BatchPropertyUpdateType) => {
    useObjectPropertyAPI.setState(produce((state: ObjectPropertyStoreProps) => {
        batchedProps.forEach(prop => {
            const generalKey = `${prop.vxkey}.${prop.propertyPath}`;
            state.properties[generalKey] = prop.value;
        })
    }))
}