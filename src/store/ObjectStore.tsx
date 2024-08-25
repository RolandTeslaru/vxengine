import { create } from 'zustand';
import { StoredObjectProps, ObjectStoreStateProps } from '../types/objectStore';

const addObject = (state: ObjectStoreStateProps, object: StoredObjectProps): ObjectStoreStateProps => ({
  ...state,
  objects: {
    ...state.objects,
    [object.vxkey]: object,
  },
});




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
}));