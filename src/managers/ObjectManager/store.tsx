import { useVXObjectStore } from 'vxengine/store';
import { ObjectEditorStoreProps } from 'vxengine/types/objectEditorStore';
import { StoredObjectProps } from 'vxengine/types/objectStore';
import { createWithEqualityFn } from 'zustand/traditional';

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