// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { useVXObjectStore } from "@vxengine/vxobject";
import { ObjectEditorStoreProps } from '@vxengine/types/objectEditorStore';
import { vxObjectProps } from '@vxengine/types/objectStore';
import { createWithEqualityFn } from 'zustand/traditional';
import { produce } from "immer"
import { ObjectPropertyStoreProps } from '@vxengine/types/objectPropertyStore';

const selectObjects = (state: ObjectEditorStoreProps, vxkeys: string[]): ObjectEditorStoreProps => {
    const objects = useVXObjectStore.getState().objects
    const selectedObjects = vxkeys.map(vxkey => objects[vxkey]).filter(Boolean);
    return {
        ...state,
        selectedObjectKeys: vxkeys,
        selectedObjects,
        selectedUtilityNode: undefined
    };
};

export const useObjectManagerAPI = createWithEqualityFn<ObjectEditorStoreProps>((set, get) => ({
    transformMode: "translate",
    setTransformMode: (mode: "translate" | "rotate" | "scale") => set((state) => ({
        ...state,
        transformMode: mode
    })),
    selectedObjects: [],
    selectedObjectKeys: [],
    selectObjects: (vxkeys) => set((state) => selectObjects(state, vxkeys)),
    hoveredObject: undefined,
    setHoveredObject: (vxobject: vxObjectProps) => set((state) => ({
        ...state,
        hoveredObject: vxobject,
    })),
    
    utilityNodes: {},

    selectedUtilityNode: undefined,
    setSelectedUtilityNode: (utilityNodeKey) => {
        set(produce((state: ObjectEditorStoreProps) => {
            state.selectedUtilityNode = state.utilityNodes[utilityNodeKey]
        }))
    },
    addUtilityNode: (node, key) => {
        set(produce((state: ObjectEditorStoreProps) => {
            state.utilityNodes[key] = node
        }))
    },
    removeUtilityNode: (key) => {
        set(produce((state: ObjectEditorStoreProps) => {
            delete state.utilityNodes[key]
        }))
    },
    utilityTransformAxis: ['X', 'Y', 'Z'],
    setUtilityTransformAxis: (axis: string[]) => set({
        utilityTransformAxis: axis
    })
}))

export const useObjectPropertyAPI = createWithEqualityFn<ObjectPropertyStoreProps>((set, get) => ({
    properties: {},
    updateProperty: (vxkey, propertyPath, value) => {
        set(
            produce((state: ObjectPropertyStoreProps) => {
                if (!state.properties[vxkey]) {
                    state.properties[vxkey] = {};
                }

                const keys = propertyPath.split('.');
                let target = state.properties[vxkey];

                for (let i = 0; i < keys.length - 1; i++) {
                    if (!target[keys[i]]) target[keys[i]] = {};
                    target = target[keys[i]];
                }

                target[keys[keys.length - 1]] = value;
            }),
            false
        );
    },
}))