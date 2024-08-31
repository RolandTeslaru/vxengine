// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { vxObjectProps, ObjectStoreStateProps } from '../types/objectStore';
import { shallow } from 'zustand/shallow';
import { produce } from "immer"

const addObject = (state: ObjectStoreStateProps, vxobject: vxObjectProps): ObjectStoreStateProps => ({
  ...state,
  objects: {
    ...state.objects,
    [vxobject.vxkey]: vxobject,
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