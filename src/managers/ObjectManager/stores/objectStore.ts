// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserqved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { vxObjectProps, ObjectStoreStateProps } from '../types/objectStore';
import { useObjectManagerAPI } from './managerStore';

export const useVXObjectStore = create<ObjectStoreStateProps>((set, get) => ({
    objects: {},
    addObject: (
        vxobject, 
        IS_DEVELOPMENT,
        props = {}, 
    ) => set((state) => {
        const { icon, modifyObjectTree} = props
        
        // Generate Object Tree 
        if(IS_DEVELOPMENT){
            if(modifyObjectTree === undefined || modifyObjectTree === true){
                const addToTreeFunc = useObjectManagerAPI.getState().addToTree;
                addToTreeFunc(vxobject, icon)
            }
        }
        
        return ({
            ...state,
            objects: {
                ...state.objects,
                [vxobject.vxkey]: vxobject,
            },
        })
    }),
    removeObject: (vxkey, IS_DEVELOPMENT, modifyObjectTree = true) => set((state) => {
        if (!state.objects[vxkey]) {
            console.warn("ObjectStore: trying to remove a non-existent object",vxkey);
            return state;
        }

        if(IS_DEVELOPMENT){
            const objectManagerAPI = useObjectManagerAPI.getState();
            // remove selected is very important
            // the vxobject is frozen by the objectMangerAPI if its selected so trinyg to remove it would crash the app
            objectManagerAPI.unselectObject(vxkey)
            if(modifyObjectTree){
                objectManagerAPI.removeFromTree(vxkey)
            }
        }
        
        const newObjects = { ...state.objects };
        delete newObjects[vxkey];
        return {
            ...state,
            objects: newObjects,
        };
    }),
}));

