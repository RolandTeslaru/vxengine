// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { vxObjectProps, ObjectStoreStateProps } from '../types/objectStore';

export const useVXObjectStore = create<ObjectStoreStateProps>((set, get) => ({
  objects: {},
  addObject: (vxobject) => set((state) => ({
      ...state,
      objects: {
          ...state.objects,
          [vxobject.vxkey]: vxobject,
      },
  })),
  removeObject: (vxkey) => set((state) => {
      const newObjects = { ...state.objects };
      delete newObjects[vxkey];
      return {
          ...state,
          objects: newObjects,
      };
  }),
}));

