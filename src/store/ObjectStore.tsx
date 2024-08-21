import { create } from 'zustand';
import { StoredObjectProps, ObjectStoreStateProps } from '../types/objectStore';

const addObject = (state: ObjectStoreStateProps, object: StoredObjectProps): ObjectStoreStateProps => ({
  ...state,
  objects: {
    ...state.objects,
    [object.vxkey]: object,
  },
});

const selectObjects = (state: ObjectStoreStateProps, vxkeys: string[]): ObjectStoreStateProps => {
  const selectedObjects = vxkeys.map(vxkey => state.objects[vxkey]).filter(Boolean);
  return {
    ...state,
    selectedObjectKeys: vxkeys,
    selectedObjects,
  };
};

const removeSelectedObjectUsingKeys = (state: ObjectStoreStateProps, vxkeys_to_remove: string[]): ObjectStoreStateProps => {
  const selectedObjectKeys = state.selectedObjectKeys.filter(vxkey => !vxkeys_to_remove.includes(vxkey));
  return {
    ...state,
    selectedObjectKeys,
    selectedObjects: selectedObjectKeys.map(vxkey => state.objects[vxkey]),
  };
};

const removeObject = (state: ObjectStoreStateProps, vxkey: string): ObjectStoreStateProps => {
  const newObjects = { ...state.objects };
  delete newObjects[vxkey];
  return {
    ...state,
    objects: newObjects,
  };
};

const clearObjects = (state: ObjectStoreStateProps): ObjectStoreStateProps => ({
  ...state,
  objects: {},
});

const getObjectByKey = (state: ObjectStoreStateProps, vxkey: string): StoredObjectProps | undefined => {
  return state.objects[vxkey];
};

export const useVXObjectStore = create<ObjectStoreStateProps>((set, get) => ({
  objects: {},
  addObject: (object) => set((state) => addObject(state, object)),
  removeObject: (vxkey) => set((state) => removeObject(state, vxkey)),
  getObjectByKey: (vxkey) => getObjectByKey(get(), vxkey),
  selectedObjects: [],
  selectedObjectKeys: [],
  selectObjects: (vxkeys) => set((state) => selectObjects(state, vxkeys)),
  removeSelectedObjectUsingKeys: (vxkeys_to_remove) => set((state) => removeSelectedObjectUsingKeys(state, vxkeys_to_remove)),
  hoveredObject: undefined,
  setHoveredObject: (obj: StoredObjectProps) => set((state) => ({
    ...state,
    hoveredObject: obj,
  })),
}));