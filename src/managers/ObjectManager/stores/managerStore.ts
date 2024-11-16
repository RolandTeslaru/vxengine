// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { ObjectEditorStoreProps } from '@vxengine/types/objectEditorStore';
import { vxObjectProps, vxObjectTypes } from '@vxengine/managers/ObjectManager/types/objectStore';
import { createWithEqualityFn } from 'zustand/traditional';
import { produce } from "immer"
import { ObjectPropertyStoreProps } from '@vxengine/types/objectPropertyStore';
import { useVXObjectStore } from './objectStore';
import { useRefStore } from '@vxengine/utils';

const selectObjects = (
    state: ObjectEditorStoreProps, 
    vxkeys: string[], 
    type?: vxObjectTypes,
    animate?: boolean
): ObjectEditorStoreProps => {
    const objects = useVXObjectStore.getState().objects

    const selectedObjects = vxkeys.map(vxkey => objects[vxkey]).filter(Boolean);

    if(animate){
        if(type === "entity"){
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

export const useObjectManagerAPI = createWithEqualityFn<ObjectEditorStoreProps>((set, get) => ({
    transformMode: "translate",
    setTransformMode: (mode: "translate" | "rotate" | "scale") => set((state) => ({
        ...state,
        transformMode: mode
    })),
    
    transformSpace: "world",
    setTransformSpace: (space: "world" | "local") => set({transformSpace: space}),

    selectedObjects: [],
    selectedObjectKeys: [],
    selectObjects: (vxkeys, type, animate) => set((state) => selectObjects(state, vxkeys, type, animate)),
    hoveredObject: undefined,
    setHoveredObject: (vxobject: vxObjectProps) => set((state) => ({
        ...state,
        hoveredObject: vxobject,
    })),
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