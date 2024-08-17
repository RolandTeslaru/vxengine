export interface StoredObjectProps {
    id: string;
    // Add other properties as needed
    [key: string]: any;
    type: string;
    name: string;
    // FIXME
    ref: React.MutableRefObject<any>;
}

export interface ObjectStoreStateProps {
    objects: StoredObjectProps[];
    selectedObjectIds: string[];
    selectedObjects: StoredObjectProps[];
    addObject: (object: StoredObjectProps) => void;
    updateObject: (id: string, newProps: Partial<StoredObjectProps>) => void;
    selectObjects: (ids: string[]) => void;
    removeSelectedObjectUsingIds: (id_to_remove: string[]) => void;
    removeObject: (id: string) => void;
    clearObjects: () => void;
    getObjectById: (id: string) => StoredObjectProps | undefined;
    hoveredObject: StoredObjectProps | null;
    setHoveredObject: (obj: StoredObjectProps) => void;
}