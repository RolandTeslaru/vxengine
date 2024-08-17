import { create } from 'zustand';
import { StoredObjectProps, ObjectStoreStateProps } from '../types/objectStore';

const addObject = (state: ObjectStoreStateProps, object: StoredObjectProps): ObjectStoreStateProps => ({
  ...state,
  objects: [...state.objects, object],
});

const updateObject = (state: ObjectStoreStateProps, id: string, newProps: Partial<StoredObjectProps>): ObjectStoreStateProps => ({
  ...state,
  objects: state.objects.map((obj) => (obj.id === id ? { ...obj, ...newProps } : obj)),
});

const selectObjects = (state: ObjectStoreStateProps, ids: string[]): ObjectStoreStateProps => {
  // Check if the new selection is different from the current selection
  const isSelectionChanged = ids.length !== state.selectedObjectIds.length ||
    ids.some((id, index) => id !== state.selectedObjectIds[index]);

  if (!isSelectionChanged) {
    return state;
  }

  const objectsToBeAdded = state.objects.filter((obj) => ids.includes(obj.id))

  return {
    ...state,
    selectedObjectIds: ids,
    selectedObjects: objectsToBeAdded
  };
};

const removeSelectedObjectUsingIds = (state: ObjectStoreStateProps, ids_to_remove: string[]): ObjectStoreStateProps => {
  let filteredSelectedObjects = [];
  state.selectedObjectIds.forEach(objId => {
    if(!ids_to_remove.includes(objId)){
      filteredSelectedObjects.push(objId);
    }
  });

  return {
   ...state,
    selectedObjectIds: filteredSelectedObjects,
  };
}

const removeObject = (state: ObjectStoreStateProps, id: string): ObjectStoreStateProps => ({
  ...state,
  objects: state.objects.filter((obj) => obj.id !== id),
});

const clearObjects = (state: ObjectStoreStateProps): ObjectStoreStateProps => ({
  ...state,
  objects: [],
});

const getObjectById = (state: ObjectStoreStateProps, id: string): StoredObjectProps | undefined => {
  return state.objects.find((obj) => obj.id === id);
};

export const useVXObjectStore = create<ObjectStoreStateProps>((set, get) => ({
  objects: [],
  updateObject: (id, newProps) => set((state) => updateObject(state, id, newProps)),
  addObject: (object) => set((state) => addObject(state, object)),
  removeObject: (id) => set((state) => removeObject(state, id)),
  clearObjects: () => set((state) => clearObjects(state)),
  getObjectById: (id) => getObjectById(get(), id),
  selectedObjects: [],
  selectedObjectIds: [],
  selectObjects: (ids) => set((state) => selectObjects(state, ids)),
  removeSelectedObjectUsingIds: (id_to_remove) => set((state) => removeSelectedObjectUsingIds(state, id_to_remove)),
  hoveredObject: undefined,
  setHoveredObject: (obj: StoredObjectProps) => set((state) => ({
    ...state,
    hoveredObject: obj,
  })),
}));
