// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { ObjectManagerStoreProps, ObjectTreeNodeProps } from '@vxengine/types/objectEditorStore';
import { vxEffectProps, vxEntityProps, vxObjectProps, vxObjectTypes, vxVirtualEntityProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { createWithEqualityFn } from 'zustand/traditional';
import { produce } from "immer"
import { ObjectPropertyStoreProps } from '@vxengine/types/objectPropertyStore';
import { useVXObjectStore } from './objectStore';
import { useRefStore } from '@vxengine/utils';
import * as THREE from "three"
import { assert } from 'console';

const selectObjects = (
    state: ObjectManagerStoreProps,
    vxkeys: string[],
    type?: vxObjectTypes,
    animate?: boolean
): ObjectManagerStoreProps => {
    const objects = useVXObjectStore.getState().objects

    const selectedObjects = vxkeys.map(vxkey => objects[vxkey]).filter(Boolean);

    if (animate) {
        if (type === "entity") {
            const entityListRef = useRefStore.getState().entityListRef

            const entitiesList = Object.fromEntries(
                Object.entries(objects)
                    .filter(([key, vxObj]) => vxObj.type === "entity")
            )
            const entitiesKeysArray = Object.keys(entitiesList)
            const firstVxkeyIndex = vxkeys.length > 0
                ? entitiesKeysArray.indexOf(vxkeys[0])
                : -1;

            entityListRef.current.scrollToIndex({
                index: firstVxkeyIndex,
                align: "center",
                behavior: "smooth"
            });
        }
    }

    return {
        ...state,
        selectedObjectKeys: vxkeys,
        selectedObjects,
    };
};

const nodesPresent: Record<string, boolean> = {};
// This is only here so that the order is correct
const initialTree: Record<string, ObjectTreeNodeProps> = {
    ["scene"]: {
        vxkey: "scene",
        name: "Scene",
        type: "Scene",
        children: {},
        isSelectable: true
    },
    ["splines"]: {
        vxkey: "splines",
        name: "Splines",
        type: "Splines",
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

    selectedObjects: [],
    selectedObjectKeys: [],
    selectObjects: (vxkeys, type, animate) => set((state) => selectObjects(state, vxkeys, type, animate)),
    hoveredObject: undefined,
    setHoveredObject: (vxobject: vxObjectProps) => set((state) => ({
        ...state,
        hoveredObject: vxobject,
    })),

    tree: initialTree,
    nodesPresent: {},
    pendingChildren: {},
    addToTree: (vxobject, icon) => {
        const { vxkey } = vxobject
        let { parentKey } = vxobject

        const type = icon ?? vxobject.ref.current.type;
        const name = (vxobject as vxEntityProps).name ?? vxkey;

        if (nodesPresent[vxkey] === true) {
            // console.warn("Tryng to add an already present node");
            return;
        } else {
            nodesPresent[vxkey] = true;
        }

        if (parentKey === null)
            parentKey = 'scene'

        set(
            produce((state) => {
                const newNode: ObjectTreeNodeProps = {
                    vxkey,
                    name,
                    type,
                    children: {},
                    isSelectable: true
                }

                // Check if the node has pending children to be added to itself
                if (state.pendingChildren[vxkey]) {
                    newNode.children = state.pendingChildren[vxkey];
                    delete state.pendingChildren[vxkey];
                }

                // If its global then we dont need to check for parents
                if (parentKey === "global") {
                    state.tree[vxkey] = newNode;
                    return;
                }

                // Resolve pending children

                // Recursively find the parent node in the tree
                const findParentNode = (key, tree) => {
                    for (const nodeKey in tree) {
                        const node = tree[nodeKey];
                        if (nodeKey === key) return node;
                        const foundInChild = findParentNode(key, node.children);
                        if (foundInChild) return foundInChild;
                    }
                    return null;
                };

                const parentNode = findParentNode(parentKey, state.tree);

                if (parentNode) {
                    // Parent exists, add to its children
                    parentNode.children[vxkey] = newNode;
                    // console.log("Adding to tree ", vxkey);
                } else {
                    // Parent does not exist yet, store in pendingChildren
                    state.pendingChildren[parentKey] = state.pendingChildren[parentKey] || {};
                    state.pendingChildren[parentKey][vxkey] = newNode;
                    // console.log("Adding to Pending ", vxkey);
                }
            }))
    },
    removeFromTree: (vxkey) => {
        set(
            produce((state) => {
                const recursiveRemove = (nodeKey, parentNode: ObjectTreeNodeProps) => {
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

                    // Mark the node as no longer present
                    delete nodesPresent[nodeKey];
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

}))

export const useObjectPropertyAPI = createWithEqualityFn<ObjectPropertyStoreProps>((set, get) => ({
    properties: {},
    updateProperty: (vxkey, propertyPath, value) => {
        set(
            produce((state) => {
                const key = `${vxkey}.${propertyPath}`;
                state.properties[key] = value;
            })
        );
    },
    getProperty: (vxkey, propertyPath) => {
        const state = get();
        const key = `${vxkey}.${propertyPath}`;
        return state.properties[key];
    },
    deleteProperty: (vxkey, propertyPath) => {
        set(
            produce((state) => {
                const key = `${vxkey}.${propertyPath}`;
                delete state.properties[key];
            })
        );
    },
}))