// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { ObjectEditorStoreProps, ObjectTreeNodeProps } from '@vxengine/types/objectEditorStore';
import { vxEffectProps, vxEntityProps, vxObjectProps, vxObjectTypes, vxVirtualEntityProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { createWithEqualityFn } from 'zustand/traditional';
import { produce } from "immer"
import { ObjectPropertyStoreProps } from '@vxengine/types/objectPropertyStore';
import { useVXObjectStore } from './objectStore';
import { useRefStore } from '@vxengine/utils';
import * as THREE from "three"
import { assert } from 'console';

const selectObjects = (
    state: ObjectEditorStoreProps,
    vxkeys: string[],
    type?: vxObjectTypes,
    animate?: boolean
): ObjectEditorStoreProps => {
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

interface TreeNodeProps {
    vxkey: string;
    name: string;
    type: vxObjectTypes;
    isGroup: boolean;
    children: TreeNodeProps[]
    parentKey: string // vxkey of the parent
}

const nodesPresent: Record<string, boolean> = {};
const intialTree: Record<string, ObjectTreeNodeProps> = {
    ["scene"]: {
        vxkey: "scene",
        name: "Scene",
        isGroup: true,
        type: "Scene",
        children: {},
        isSelectable: true
    },
    ["effects"]: {
        vxkey: "effects",
        name: "Effects",
        isGroup: true,
        type: "Effects",
        children: {},
        isSelectable: true
    },
    ["splines"]: {
        vxkey: "splines",
        name: "Splines",
        isGroup: true,
        type: "Splines",
        children: {},
        isSelectable: false
    },
    ["environment"]: {
        vxkey: "environment",
        name: "Environment",
        isGroup: true,
        type: "Environment",
        children: {},
        isSelectable: true
    },
}

export const useObjectManagerAPI = createWithEqualityFn<ObjectEditorStoreProps>((set, get) => ({
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

    tree: intialTree,
    nodesPresent: {},
    pendingChildren: {}, 
    addToTree: (vxobject, icon) => {
        const { vxkey } = vxobject
        let { parentKey } = vxobject
        const type = icon ?? vxobject.ref.current.type;
        const name = (vxobject as vxEntityProps).name ?? vxkey;

        const isGroup = type === "Group"
        
        if(nodesPresent[vxkey] === true){
            // console.warn("Tryng to add an already present node");
            return;
        } else {
            nodesPresent[vxkey] = true;
        }
        
        if(vxkey === "environmentCamera")
            parentKey="environment"
        set(
            produce((state) => {
                const newNode: ObjectTreeNodeProps = {
                    vxkey,
                    name,
                    isGroup,
                    type,
                    children: {},
                    isSelectable: true
                }

                if(parentKey === null)
                    parentKey = 'scene'

                // Check if the node has pending children to be added to itself
                if (state.pendingChildren[vxkey]) {
                    newNode.children = state.pendingChildren[vxkey];
                    delete state.pendingChildren[vxkey];
                }
                
                if (!parentKey) {
                    // Add as a root node
                    state.tree[vxkey] = newNode;
                    // console.log("Adding to tree ", vxkey)
                } else {
                    const parentNode = state.tree[parentKey];

                    if (parentNode) {
                        // Parent exists, add to its children 
                        parentNode.children[vxkey] = newNode;
                        // console.log("Adding to tree ", vxkey)
                    } else {
                        // Parent does not exist yet, store in pendingChildren
                        state.pendingChildren[parentKey] = state.pendingChildren[parentKey] || {};
                        state.pendingChildren[parentKey][vxkey] = newNode;
                        // console.log("Adding to Pending ", vxkey)
                    }
                }
            }))
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