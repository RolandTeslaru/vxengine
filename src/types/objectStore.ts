export interface StoredObjectProps {
    type: string;
    name: string;
    // FIXME Three js Object ref
    ref: React.MutableRefObject<any>;
    vxkey: string
}

export interface ObjectStoreStateProps {
    objects: Record<string, StoredObjectProps>
    addObject: (object: StoredObjectProps) => void;
    removeObject: (vxkey: string) => void;
}