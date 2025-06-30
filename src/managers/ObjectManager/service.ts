import { vxengine } from "@vxengine/singleton";
import { useObjectManagerAPI } from "./stores/managerStore";
import { useVXObjectStore } from "./stores/objectStore";
import { useObjectSettingsAPI, ObjectSettingsStoreProps } from "./stores/settingsStore";
import { vxObjectProps } from "./types/objectStore";

class _ObjectManagerService {
    
    private constructor() {}
    
    private static _instance: _ObjectManagerService

    public static getInstance(): _ObjectManagerService {
        if(!_ObjectManagerService._instance)
            _ObjectManagerService._instance = new _ObjectManagerService();

        return _ObjectManagerService._instance;
    }



    public get objectStoreState() { return useVXObjectStore.getState() }
    public get objectManagerState() { return useObjectManagerAPI.getState() }
    public get objectSettingsState(): ObjectSettingsStoreProps { return useObjectSettingsAPI.getState() }

    public addObjectToStore(vxobject: vxObjectProps) {
        useVXObjectStore.setState(state => ({
            ...state,
            objects: {
                ...state.objects,
                [vxobject.vxkey]: vxobject,
            },
        }))
    }

    public removeObjectFromStore(vxkey, modifyObjectTree = true) {
        useVXObjectStore.setState(state => {
            if (!state.objects[vxkey]) {
                console.warn("ObjectStore: trying to remove a non-existent object", vxkey);
                return state;
            }

            if (vxengine.isDevelopment) {
                const objectManagerAPI = useObjectManagerAPI.getState();
                // remove selected is very important
                // the vxobject is frozen by the objectMangerAPI if its selected so trinyg to remove it would crash the app
                objectManagerAPI.unselectObject(vxkey)
                if (modifyObjectTree) {
                    objectManagerAPI.removeFromTree(vxkey)
                }
            }

            const newObjects = { ...state.objects };
            delete newObjects[vxkey];
            return {
                ...state,
                objects: newObjects,
            };
        })
    }

}

export const ObjectManagerService = _ObjectManagerService.getInstance();