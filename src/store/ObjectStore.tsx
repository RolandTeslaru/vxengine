import { create } from 'zustand';
import { StoredObjectProps, ObjectStoreStateProps } from '../types/objectStore';
import { shallow } from 'zustand/shallow';
import { produce } from "immer"

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

export const useVXObjectStore = create<ObjectStoreStateProps>((set, get) => ({
  objects: {},
  addObject: (object) => set((state) => addObject(state, object)),
  removeObject: (vxkey) => set((state) => removeObject(state, vxkey))
}));