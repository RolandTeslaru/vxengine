// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { vxObjectProps, ObjectStoreStateProps } from '../types/objectStore';
import { useObjectManagerAPI } from './managerStore';

export const useVXObjectStore = create<ObjectStoreStateProps>((set, get) => ({
    objects: {},
    addObject: (vxobject, props = {}) => set((state) => {
        const { addToTree, type: icon} = props
        if(addToTree === undefined || addToTree === true){
            const addToTreeFunc = useObjectManagerAPI.getState().addToTree;
            addToTreeFunc(vxobject, icon)
        }
        
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

        const removeFromTree = useObjectManagerAPI.getState().removeFromTree;
        removeFromTree(vxkey);
        
        const newObjects = { ...state.objects };
        delete newObjects[vxkey];
        return {
            ...state,
            objects: newObjects,
        };
    }),
}));

