import { useVXObjectStore } from 'vxengine/store';
import { ObjectEditorStoreProps } from 'vxengine/types/objectEditorStore';
import { StoredObjectProps } from 'vxengine/types/objectStore';
import { createWithEqualityFn } from 'zustand/traditional';
import { produce } from "immer"
import { ObjectPropertyStoreProps } from 'vxengine/types/objectPropertyStore';

const selectObjects = (state: ObjectEditorStoreProps, vxkeys: string[]): ObjectEditorStoreProps => {
    const objects = useVXObjectStore.getState().objects
    const selectedObjects = vxkeys.map(vxkey => objects[vxkey]).filter(Boolean);
    return {
        ...state,
        selectedObjectKeys: vxkeys,
        selectedObjects,
    };
};

export const useObjectManagerStore = createWithEqualityFn<ObjectEditorStoreProps>((set, get) => ({
    transformMode: "translate",
    setTransformMode: (mode: "translate" | "rotate" | "scale") => set((state) => ({
        ...state,
        transformMode: mode
    })),
    selectedObjects: [],
    selectedObjectKeys: [],
    selectObjects: (vxkeys) => set((state) => selectObjects(state, vxkeys)),
    hoveredObject: undefined,
    setHoveredObject: (obj: StoredObjectProps) => set((state) => ({
        ...state,
        hoveredObject: obj,
    })),
}))

export const useObjectPropertyStore = createWithEqualityFn<ObjectPropertyStoreProps>((set, get) => ({
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
            }), false);
    },
}))