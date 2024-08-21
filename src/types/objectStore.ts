export interface StoredObjectProps {
    type: string;
    name: string;
    // FIXME Three js Object ref
    ref: React.MutableRefObject<any>;
    vxkey: string
}

export interface ObjectStoreStateProps {
    objects: Record<string, StoredObjectProps>
    selectedObjectKeys: string[];
    selectedObjects: StoredObjectProps[];
    addObject: (object: StoredObjectProps) => void;
    selectObjects: (vxkeys: string[]) => void;
    removeSelectedObjectUsingKeys: (vxkeys_to_remove: string[]) => void;
    removeObject: (vxkey: string) => void;
    hoveredObject: StoredObjectProps | null;
    setHoveredObject: (obj: StoredObjectProps) => void;
}