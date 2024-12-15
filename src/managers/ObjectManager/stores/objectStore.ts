// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { vxObjectProps, ObjectStoreStateProps } from '../types/objectStore';

export const useVXObjectStore = create<ObjectStoreStateProps>((set, get) => ({
    objects: {},
    addObject: (vxobject) => set((state) => {
        // if(state.objects[vxobject.vxkey]){
        //     // console.warn("ObjectStore: trying to add an already present object", vxobject.vxkey)
        //     return state;
        // }
        return ({
            ...state,
            objects: {
                ...state.objects,
                [vxobject.vxkey]: vxobject,
            },
        })
    }),
    removeObject: (vxkey) => set((state) => {
        if (!state.objects[vxkey]) {
            console.warn("ObjectStore: trying to remove a non-existent object",vxkey);
            return state; // No changes to state
        }
        
        const newObjects = { ...state.objects };
        delete newObjects[vxkey];
        return {
            ...state,
            objects: newObjects,
        };
    }),
}));

