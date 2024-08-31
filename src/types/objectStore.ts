export interface vxObjectProps {
    type: string;
    name: string;
    // FIXME Three js Object ref
    ref: React.MutableRefObject<any>;
    vxkey: string
}

export interface ObjectStoreStateProps {
    objects: Record<string, vxObjectProps>
    addObject: (object: vxObjectProps) => void;
    removeObject: (vxkey: string) => void;
}